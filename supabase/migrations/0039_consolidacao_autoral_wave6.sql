-- ============================================================================
-- MIGRATION 0039: CONSOLIDACAO AUTORAL WAVE 6 — DECISAO ATOMICA E LEDGER
-- Projeto: App Reflex 02
-- Missao: MIS-0012 / Wave 6
-- Estrategia: EXPAND-FIRST, FAIL-CLOSED, HUMAN-IN-THE-LOOP
-- ============================================================================
--
-- Esta migration NAO agenda replay nem cron. Ela cria a fundacao transacional
-- para que uma decisao humana sobre propostas do Cerebro seja materializada
-- integralmente ou nao produza efeito algum.
-- ============================================================================

-- 1. Eventos explicitos do ciclo de aprendizado.
ALTER TYPE cerebro_autoral.tipo_evento
  ADD VALUE IF NOT EXISTS 'LEARNING_PROPOSAL_CONFIRMED_BY_AUTHOR';

ALTER TYPE cerebro_autoral.tipo_evento
  ADD VALUE IF NOT EXISTS 'LEARNING_PROPOSAL_REJECTED_BY_AUTHOR';

-- 2. Ledger de execucoes de consolidacao/replay.
--    Separado de processamento.execucoes porque aquela tabela exige
--    versao_obra_id e pertence ao pipeline documental.
CREATE TABLE IF NOT EXISTS cerebro_autoral.consolidacao_execucoes (
  id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gatilho TEXT NOT NULL CHECK (gatilho IN ('manual', 'scheduled')),
  estado TEXT NOT NULL DEFAULT 'iniciado'
    CHECK (estado IN ('iniciado', 'concluido', 'abstido', 'falhou')),
  configuracao_versao TEXT NOT NULL,
  watermark_inicio TIMESTAMPTZ,
  watermark_fim TIMESTAMPTZ,
  budget JSONB NOT NULL DEFAULT '{}'::jsonb,
  metricas JSONB NOT NULL DEFAULT '{}'::jsonb,
  erro_codigo TEXT,
  erro_detalhe TEXT,
  idempotency_key TEXT NOT NULL,
  iniciado_em TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  concluido_em TIMESTAMPTZ,
  CONSTRAINT uq_consolidacao_execucao_idempotencia
    UNIQUE (usuario_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_consolidacao_execucoes_usuario_tempo
  ON cerebro_autoral.consolidacao_execucoes (usuario_id, iniciado_em DESC);

COMMENT ON TABLE cerebro_autoral.consolidacao_execucoes IS
  'Ledger de execucoes da consolidacao autoral Wave 6; nao promove autoria automaticamente.';

-- 3. Vinculo idempotente entre proposta decidida e entidade materializada.
CREATE TABLE IF NOT EXISTS cerebro_autoral.proposta_materializacoes (
  id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposta_id UUID NOT NULL
    REFERENCES cerebro_autoral.propostas_atualizacao(id) ON DELETE CASCADE,
  entidade_tipo TEXT NOT NULL
    CHECK (entidade_tipo IN ('caracteristica', 'regra', 'metodologia', 'nenhuma')),
  entidade_id UUID,
  evento_id UUID,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT uq_proposta_materializacao UNIQUE (usuario_id, proposta_id),
  CONSTRAINT ck_materializacao_entidade
    CHECK (
      (entidade_tipo = 'nenhuma' AND entidade_id IS NULL)
      OR
      (entidade_tipo <> 'nenhuma' AND entidade_id IS NOT NULL)
    )
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'cerebro_autoral'
      AND table_name = 'proposta_materializacoes'
      AND constraint_name = 'fk_proposta_materializacao_evento_tenant'
  ) THEN
    ALTER TABLE cerebro_autoral.proposta_materializacoes
      ADD CONSTRAINT fk_proposta_materializacao_evento_tenant
      FOREIGN KEY (evento_id, usuario_id)
      REFERENCES cerebro_autoral.memory_events(id, usuario_id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_proposta_materializacoes_entidade
  ON cerebro_autoral.proposta_materializacoes
  (usuario_id, entidade_tipo, entidade_id);

-- 4. RLS e menor privilegio para os novos ledgers.
ALTER TABLE cerebro_autoral.consolidacao_execucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cerebro_autoral.proposta_materializacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consolidacao_execucoes_select_owner"
  ON cerebro_autoral.consolidacao_execucoes;
CREATE POLICY "consolidacao_execucoes_select_owner"
  ON cerebro_autoral.consolidacao_execucoes
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = usuario_id);

DROP POLICY IF EXISTS "proposta_materializacoes_select_owner"
  ON cerebro_autoral.proposta_materializacoes;
CREATE POLICY "proposta_materializacoes_select_owner"
  ON cerebro_autoral.proposta_materializacoes
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = usuario_id);

REVOKE ALL ON TABLE cerebro_autoral.consolidacao_execucoes
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE cerebro_autoral.proposta_materializacoes
  FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE cerebro_autoral.consolidacao_execucoes TO authenticated;
GRANT SELECT ON TABLE cerebro_autoral.proposta_materializacoes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE cerebro_autoral.consolidacao_execucoes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE cerebro_autoral.proposta_materializacoes TO service_role;

-- A materializacao deve continuar backend-only.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON TABLE cerebro_autoral.metodologias FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE cerebro_autoral.metodologias TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE cerebro_autoral.caracteristicas TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE cerebro_autoral.regras TO service_role;
GRANT SELECT, INSERT
  ON TABLE processamento.evidencias TO service_role;

-- 5. Decisao humana + materializacao + event ledger numa unica transacao.
CREATE OR REPLACE FUNCTION cerebro_autoral.decidir_proposta_atualizacao_atomica(
  p_usuario_id UUID,
  p_proposta_id UUID,
  p_decisao TEXT,
  p_notas_autor TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, cerebro_autoral, processamento, public, auth, extensions
AS $$
DECLARE
  v_proposta cerebro_autoral.propostas_atualizacao%ROWTYPE;
  v_dados JSONB;
  v_aprendizado JSONB;
  v_caracteristica JSONB;
  v_dimensao_id UUID;
  v_entidade_tipo TEXT := 'nenhuma';
  v_entidade_id UUID;
  v_evento_id UUID;
  v_existente RECORD;
  v_item JSONB;
  v_fragmento_id UUID;
  v_total_evidencias INTEGER := 0;
  v_total_obras INTEGER := 0;
  v_agora TIMESTAMPTZ := clock_timestamp();
  v_idempotency_key TEXT;
  v_event_type cerebro_autoral.tipo_evento;
  v_to_status cerebro_autoral.estado_epistemologico;
BEGIN
  -- Esta RPC recebe usuario_id apenas do backend autenticado e nao e exposta
  -- a authenticated/anon. O service_role nao pode ser personificado pelo cliente.
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Acesso negado: decisao atomica exige service_role.';
  END IF;

  IF p_usuario_id IS NULL THEN
    RAISE EXCEPTION 'usuario_id obrigatorio.';
  END IF;

  IF p_decisao NOT IN ('confirmada', 'rejeitada') THEN
    RAISE EXCEPTION 'Decisao invalida: %. Use confirmada ou rejeitada.', p_decisao;
  END IF;

  SELECT *
  INTO v_proposta
  FROM cerebro_autoral.propostas_atualizacao
  WHERE id = p_proposta_id
    AND usuario_id = p_usuario_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proposta nao encontrada para o usuario informado.';
  END IF;

  SELECT *
  INTO v_existente
  FROM cerebro_autoral.proposta_materializacoes
  WHERE usuario_id = p_usuario_id
    AND proposta_id = p_proposta_id;

  -- Retry idempotente: uma decisao ja concluida nao repete side effects.
  IF v_proposta.estado_decisao = p_decisao THEN
    RETURN jsonb_build_object(
      'success', true,
      'idempotent', true,
      'proposta_id', p_proposta_id,
      'estado', v_proposta.estado_decisao,
      'entidade_tipo', COALESCE(v_existente.entidade_tipo, 'nenhuma'),
      'entidade_id', v_existente.entidade_id,
      'evento_id', v_existente.evento_id
    );
  END IF;

  IF v_proposta.estado_decisao <> 'pendente' THEN
    RAISE EXCEPTION
      'Proposta ja decidida como %; transicao para % recusada.',
      v_proposta.estado_decisao,
      p_decisao;
  END IF;

  v_dados := COALESCE(v_proposta.dados_propostos, '{}'::jsonb);
  v_aprendizado := COALESCE(v_dados->'aprendizado', '{}'::jsonb);
  v_caracteristica := COALESCE(v_dados->'caracteristica', '{}'::jsonb);

  -- Rejeicao nunca materializa entidade cognitiva.
  IF p_decisao = 'rejeitada' THEN
    v_event_type := 'LEARNING_PROPOSAL_REJECTED_BY_AUTHOR';
    v_to_status := 'rejected';
  ELSE
    v_event_type := 'LEARNING_PROPOSAL_CONFIRMED_BY_AUTHOR';
    v_to_status := 'confirmed_authorial';

    BEGIN
      v_dimensao_id := NULLIF(v_dados #>> '{dimensao,id}', '')::UUID;
    EXCEPTION WHEN invalid_text_representation THEN
      RAISE EXCEPTION 'dimensao.id invalido na proposta.';
    END;

    IF v_dimensao_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM cerebro_autoral.dimensoes WHERE id = v_dimensao_id
    ) THEN
      RAISE EXCEPTION 'Proposta confirmada sem dimensao canonica valida.';
    END IF;

    IF v_proposta.tipo_proposta = 'nova_caracteristica' THEN
      IF COALESCE(NULLIF(v_caracteristica->>'titulo', ''), NULLIF(v_aprendizado->>'titulo', '')) IS NULL
         OR COALESCE(NULLIF(v_caracteristica->>'descricao', ''), NULLIF(v_aprendizado->>'descricao', '')) IS NULL THEN
        RAISE EXCEPTION 'nova_caracteristica sem titulo/descricao materializaveis.';
      END IF;

      IF jsonb_typeof(v_caracteristica->'evidencias') = 'array' THEN
        v_total_evidencias := jsonb_array_length(v_caracteristica->'evidencias');
      ELSIF jsonb_typeof(v_dados->'evidencias_edicao') = 'array' THEN
        v_total_evidencias := jsonb_array_length(v_dados->'evidencias_edicao');
      END IF;

      IF jsonb_typeof(v_dados #> '{corpus,obras}') = 'array' THEN
        v_total_obras := jsonb_array_length(v_dados #> '{corpus,obras}');
      END IF;

      INSERT INTO cerebro_autoral.caracteristicas (
        dimensao_id,
        usuario_id,
        titulo,
        descricao,
        formula_metodologica,
        origem,
        confianca_calculada,
        total_evidencias,
        total_contraevidencias,
        total_obras_distintas,
        estado_revisao,
        versao_cerebro_id,
        estado_proposta,
        componentes_confianca,
        metadados
      ) VALUES (
        v_dimensao_id,
        p_usuario_id,
        COALESCE(NULLIF(v_caracteristica->>'titulo', ''), v_aprendizado->>'titulo'),
        COALESCE(NULLIF(v_caracteristica->>'descricao', ''), v_aprendizado->>'descricao'),
        NULLIF(v_caracteristica->>'formula_metodologica', ''),
        'nucleo_autoral',
        v_proposta.confianca_calculada,
        v_total_evidencias,
        0,
        v_total_obras,
        'confirmada',
        v_proposta.versao_cerebro_id,
        'confirmada',
        jsonb_build_object(
          'evidencias', v_total_evidencias,
          'contraevidencias', 0,
          'obras_distintas', v_total_obras,
          'periodos_distintos', 0,
          'consistencia', v_proposta.confianca_calculada,
          'confirmacao_humana', true
        ),
        jsonb_build_object(
          'proposta_id', p_proposta_id,
          'origem', COALESCE(v_dados #>> '{origem,tipo}', 'proposta_atualizacao'),
          'confirmado_em', v_agora
        )
      )
      RETURNING id INTO v_entidade_id;

      v_entidade_tipo := 'caracteristica';

      -- Regras sugeridas por analise explicita de corpus.
      IF jsonb_typeof(v_caracteristica->'regras') = 'array' THEN
        FOR v_item IN
          SELECT value FROM jsonb_array_elements(v_caracteristica->'regras')
        LOOP
          IF NULLIF(v_item->>'enunciado', '') IS NULL
             OR (v_item->>'tipo') NOT IN (
               'prescritiva', 'proscritiva', 'preferencia', 'restricao_estilo'
             ) THEN
            RAISE EXCEPTION 'Regra candidata invalida na proposta %.', p_proposta_id;
          END IF;

          INSERT INTO cerebro_autoral.regras (
            usuario_id,
            dimensao_id,
            caracteristica_id,
            tipo_regra,
            enunciado,
            explicacao,
            peso,
            ativa,
            versao_cerebro_id
          ) VALUES (
            p_usuario_id,
            v_dimensao_id,
            v_entidade_id,
            v_item->>'tipo',
            v_item->>'enunciado',
            NULLIF(v_item->>'explicacao', ''),
            1.0,
            true,
            v_proposta.versao_cerebro_id
          );
        END LOOP;
      END IF;

      -- Uma proposta de edicao pode formular uma regra junto da caracteristica.
      IF NULLIF(v_aprendizado->>'enunciado_regra', '') IS NOT NULL THEN
        IF (v_aprendizado->>'tipo_regra') NOT IN (
          'prescritiva', 'proscritiva', 'preferencia', 'restricao_estilo'
        ) THEN
          RAISE EXCEPTION 'tipo_regra invalido na proposta de edicao.';
        END IF;

        INSERT INTO cerebro_autoral.regras (
          usuario_id,
          dimensao_id,
          caracteristica_id,
          tipo_regra,
          enunciado,
          explicacao,
          peso,
          ativa,
          versao_cerebro_id
        ) VALUES (
          p_usuario_id,
          v_dimensao_id,
          v_entidade_id,
          v_aprendizado->>'tipo_regra',
          v_aprendizado->>'enunciado_regra',
          NULLIF(v_aprendizado->>'descricao', ''),
          1.0,
          true,
          v_proposta.versao_cerebro_id
        );
      END IF;

      -- Evidencias fragmentarias so sao incorporadas se o fragmento pertence
      -- ao mesmo usuario e a uma obra autoral.
      IF jsonb_typeof(v_caracteristica->'evidencias') = 'array' THEN
        FOR v_item IN
          SELECT value FROM jsonb_array_elements(v_caracteristica->'evidencias')
        LOOP
          BEGIN
            v_fragmento_id := NULLIF(v_item->>'fragmento_id', '')::UUID;
          EXCEPTION WHEN invalid_text_representation THEN
            v_fragmento_id := NULL;
          END;

          IF v_fragmento_id IS NOT NULL
             AND EXISTS (
               SELECT 1
               FROM public.v_fragmentos_detalhados
               WHERE id = v_fragmento_id
                 AND usuario_id = p_usuario_id
                 AND obra_natureza = 'autoral'
             ) THEN
            INSERT INTO processamento.evidencias (
              usuario_id,
              fragmento_id,
              dimensao_id,
              trecho_citado,
              explicacao,
              forca_evidencia,
              estado_revisao
            ) VALUES (
              p_usuario_id,
              v_fragmento_id,
              v_dimensao_id,
              COALESCE(v_item->>'trecho_citado', ''),
              COALESCE(v_item->>'explicacao', ''),
              COALESCE(NULLIF(v_item->>'forca_evidencia', '')::NUMERIC, 0.5),
              'confirmada'
            );
          END IF;
        END LOOP;
      END IF;

    ELSIF v_proposta.tipo_proposta = 'atualizacao_regra' THEN
      IF NULLIF(v_aprendizado->>'enunciado_regra', '') IS NULL
         OR (v_aprendizado->>'tipo_regra') NOT IN (
           'prescritiva', 'proscritiva', 'preferencia', 'restricao_estilo'
         ) THEN
        RAISE EXCEPTION 'atualizacao_regra sem enunciado/tipo validos.';
      END IF;

      INSERT INTO cerebro_autoral.regras (
        usuario_id,
        dimensao_id,
        caracteristica_id,
        tipo_regra,
        enunciado,
        explicacao,
        peso,
        ativa,
        versao_cerebro_id
      ) VALUES (
        p_usuario_id,
        v_dimensao_id,
        NULL,
        v_aprendizado->>'tipo_regra',
        v_aprendizado->>'enunciado_regra',
        NULLIF(v_aprendizado->>'descricao', ''),
        1.0,
        true,
        v_proposta.versao_cerebro_id
      )
      RETURNING id INTO v_entidade_id;

      v_entidade_tipo := 'regra';

    ELSIF v_proposta.tipo_proposta = 'nova_metodologia' THEN
      IF NULLIF(v_aprendizado->>'titulo', '') IS NULL
         OR NULLIF(v_aprendizado->>'descricao', '') IS NULL THEN
        RAISE EXCEPTION 'nova_metodologia sem titulo/descricao.';
      END IF;

      INSERT INTO cerebro_autoral.metodologias (
        usuario_id,
        versao_cerebro_id,
        nome,
        descricao,
        contexto_aplicacao,
        ativa
      ) VALUES (
        p_usuario_id,
        v_proposta.versao_cerebro_id,
        v_aprendizado->>'titulo',
        v_aprendizado->>'descricao',
        NULLIF(p_notas_autor, ''),
        true
      )
      RETURNING id INTO v_entidade_id;

      v_entidade_tipo := 'metodologia';

    ELSE
      RAISE EXCEPTION
        'Tipo de proposta % ainda nao possui materializacao segura na Wave 6.',
        v_proposta.tipo_proposta;
    END IF;
  END IF;

  v_idempotency_key :=
    'learning:proposal:' || p_proposta_id::TEXT || ':' || p_decisao;

  INSERT INTO cerebro_autoral.memory_events (
    usuario_id,
    event_type,
    actor_type,
    actor_id,
    aggregate_type,
    aggregate_id,
    occurred_at,
    recorded_at,
    from_epistemic_status,
    to_epistemic_status,
    idempotency_key,
    payload,
    payload_schema_version
  ) VALUES (
    p_usuario_id,
    v_event_type,
    'HUMAN'::cerebro_autoral.tipo_ator,
    p_usuario_id::TEXT,
    'learning_proposal',
    p_proposta_id,
    v_agora,
    v_agora,
    'proposed'::cerebro_autoral.estado_epistemologico,
    v_to_status,
    v_idempotency_key,
    jsonb_build_object(
      'proposta_id', p_proposta_id,
      'tipo_proposta', v_proposta.tipo_proposta,
      'decisao', p_decisao,
      'entidade_tipo', v_entidade_tipo,
      'entidade_id', v_entidade_id,
      'notas_autor_presentes', NULLIF(BTRIM(COALESCE(p_notas_autor, '')), '') IS NOT NULL
    ),
    1
  )
  RETURNING id INTO v_evento_id;

  INSERT INTO cerebro_autoral.proposta_materializacoes (
    usuario_id,
    proposta_id,
    entidade_tipo,
    entidade_id,
    evento_id
  ) VALUES (
    p_usuario_id,
    p_proposta_id,
    v_entidade_tipo,
    v_entidade_id,
    v_evento_id
  );

  UPDATE cerebro_autoral.propostas_atualizacao
  SET estado_decisao = p_decisao,
      decidido_em = v_agora,
      notas_autor = NULLIF(BTRIM(COALESCE(p_notas_autor, '')), '')
  WHERE id = p_proposta_id
    AND usuario_id = p_usuario_id
    AND estado_decisao = 'pendente';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Concorrencia detectada ao decidir proposta; transacao abortada.';
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'idempotent', false,
    'proposta_id', p_proposta_id,
    'estado', p_decisao,
    'entidade_tipo', v_entidade_tipo,
    'entidade_id', v_entidade_id,
    'evento_id', v_evento_id
  );
END;
$$;

REVOKE ALL ON FUNCTION cerebro_autoral.decidir_proposta_atualizacao_atomica(
  UUID, UUID, TEXT, TEXT
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION cerebro_autoral.decidir_proposta_atualizacao_atomica(
  UUID, UUID, TEXT, TEXT
) TO service_role;

-- 6. Registro no ledger canônico do aplicativo.
INSERT INTO public._migrations (nome, executado_em)
SELECT '0039_consolidacao_autoral_wave6.sql', clock_timestamp()
WHERE NOT EXISTS (
  SELECT 1
  FROM public._migrations
  WHERE nome = '0039_consolidacao_autoral_wave6.sql'
);

NOTIFY pgrst, 'reload schema';
