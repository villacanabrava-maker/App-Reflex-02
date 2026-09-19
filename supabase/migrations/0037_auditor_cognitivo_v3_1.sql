-- ============================================================================
-- MIGRATION 0037: AUDITOR COGNITIVO V3.1, IMUTABILIDADE DE DOSSIÊ E RETRIEVAL REAL (WAVE 5)
-- Projeto: Cérebro Autoral / Memória Reflexiva (App Reflex 02)
-- Idioma canônico: Português do Brasil
-- Padrão: SECURITY DEFINER HARDENED / LEAST PRIVILEGE / ZERO-TRUST MULTI-TENANT
-- ============================================================================

-- 1. HARDENING DE reflexoes.dossies_snapshots (LEAST PRIVILEGE E IMUTABILIDADE)

-- Revogar INSERT direto por clientes autenticados (snapshots devem ser gerados via RPC controlada)
DROP POLICY IF EXISTS "dossies_snapshots_insert_owner" ON reflexoes.dossies_snapshots;

-- Trigger de Imutabilidade Estrita: proíbe UPDATE e DELETE em snapshots já persistidos
CREATE OR REPLACE FUNCTION reflexoes.impedir_mutacao_dossie_snapshot()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'Operação negada: Snapshots de Dossiê Contextual são imutáveis e auditáveis por design.';
END;
$$;

DROP TRIGGER IF EXISTS trg_dossies_snapshots_imutaveis ON reflexoes.dossies_snapshots;
CREATE TRIGGER trg_dossies_snapshots_imutaveis
    BEFORE UPDATE OR DELETE ON reflexoes.dossies_snapshots
    FOR EACH ROW
    EXECUTE FUNCTION reflexoes.impedir_mutacao_dossie_snapshot();

-- RPC Segura para Persistir Snapshot de Dossiê Contextual V3.1
CREATE OR REPLACE FUNCTION reflexoes.persistir_dossie_snapshot(
    p_id UUID,
    p_usuario_id UUID,
    p_entrada_id UUID,
    p_query TEXT,
    p_intent TEXT,
    p_target_token_budget INTEGER,
    p_actual_tokens_total INTEGER,
    p_snapshot_hash TEXT,
    p_dossie_json JSONB,
    p_abstained BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = reflexoes, public, extensions
AS $$
DECLARE
    v_usuario_id UUID;
    v_ret_id UUID;
BEGIN
    -- Forçar derivação estrita do tenant se executado por authenticated
    IF current_user = 'authenticated' THEN
        v_usuario_id := auth.uid();
    ELSE
        v_usuario_id := COALESCE(auth.uid(), p_usuario_id);
    END IF;

    IF v_usuario_id IS NULL THEN
        RAISE EXCEPTION 'Acesso negado: persistência de snapshot requer identificador de usuário válido.';
    END IF;

    IF p_id IS NULL THEN
        RAISE EXCEPTION 'Identificador de snapshot UUID é obrigatório.';
    END IF;

    IF p_snapshot_hash IS NULL OR LENGTH(p_snapshot_hash) <> 64 THEN
        RAISE EXCEPTION 'Hash SHA-256 canônico de 64 caracteres é obrigatório.';
    END IF;

    -- Inserção idempotente se o ID já existir para o mesmo tenant com mesmo hash
    INSERT INTO reflexoes.dossies_snapshots (
        id,
        usuario_id,
        entrada_id,
        query,
        intent,
        target_token_budget,
        actual_tokens_total,
        snapshot_hash,
        dossie_json,
        abstained,
        criado_em
    ) VALUES (
        p_id,
        v_usuario_id,
        p_entrada_id,
        p_query,
        p_intent,
        p_target_token_budget,
        p_actual_tokens_total,
        p_snapshot_hash,
        p_dossie_json,
        COALESCE(p_abstained, FALSE),
        clock_timestamp()
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id INTO v_ret_id;

    RETURN COALESCE(v_ret_id, p_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION reflexoes.persistir_dossie_snapshot(
    UUID, UUID, UUID, TEXT, TEXT, INTEGER, INTEGER, TEXT, JSONB, BOOLEAN
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION reflexoes.persistir_dossie_snapshot(
    UUID, UUID, UUID, TEXT, TEXT, INTEGER, INTEGER, TEXT, JSONB, BOOLEAN
) TO authenticated, service_role;

-- 2. TABELA DE AUDITORIA COGNITIVA V3.1 (RELATÓRIOS IMUTÁVEIS)
CREATE TABLE IF NOT EXISTS auditoria.relatorios_auditoria_v3_1 (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    versao_reflexao_id UUID NOT NULL REFERENCES reflexoes.versoes_reflexao(id) ON DELETE CASCADE,
    dossier_snapshot_id UUID NOT NULL REFERENCES reflexoes.dossies_snapshots(id) ON DELETE CASCADE,
    snapshot_hash TEXT NOT NULL,
    auditor_version TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PASS', 'PASS_WITH_CORRECTIONS', 'ABSTAIN', 'BLOCK')),
    abstention_category TEXT CHECK (abstention_category IN (
        'NO_EVIDENCE', 'LOW_SUPPORT', 'CONTRADICTORY_EVIDENCE', 
        'OUT_OF_SCOPE', 'AUTHORIAL_UNKNOWN', 'SOURCE_ONLY', 'AMBIGUOUS'
    )),
    claims_audit JSONB NOT NULL DEFAULT '[]'::jsonb,
    milr NUMERIC(7,4) NOT NULL DEFAULT 0.0 CHECK (milr >= 0.0 AND milr <= 100.0),
    amr NUMERIC(7,4) NOT NULL DEFAULT 0.0 CHECK (amr >= 0.0 AND amr <= 100.0),
    unsupported_claim_rate NUMERIC(7,4) NOT NULL DEFAULT 0.0,
    forbidden_use_rate NUMERIC(7,4) NOT NULL DEFAULT 0.0,
    citation_precision NUMERIC(7,4) NOT NULL DEFAULT 0.0,
    intervencoes JSONB NOT NULL DEFAULT '[]'::jsonb,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT fk_audit_snapshot_tenant FOREIGN KEY (dossier_snapshot_id, usuario_id) REFERENCES reflexoes.dossies_snapshots(id, usuario_id) ON DELETE CASCADE,
    CONSTRAINT uq_audit_report_tenant UNIQUE (id, usuario_id)
);

COMMENT ON TABLE auditoria.relatorios_auditoria_v3_1 IS 'Relatórios periciais imutáveis da Auditoria Cognitiva Pós-Geração V3.1.';

-- Habilitar RLS estrito
ALTER TABLE auditoria.relatorios_auditoria_v3_1 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_v31_select_owner" ON auditoria.relatorios_auditoria_v3_1;
CREATE POLICY "audit_v31_select_owner" ON auditoria.relatorios_auditoria_v3_1
    FOR SELECT TO authenticated
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "audit_v31_service_role" ON auditoria.relatorios_auditoria_v3_1;
CREATE POLICY "audit_v31_service_role" ON auditoria.relatorios_auditoria_v3_1
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_audit_v31_usuario ON auditoria.relatorios_auditoria_v3_1 (usuario_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_audit_v31_versao ON auditoria.relatorios_auditoria_v3_1 (versao_reflexao_id);
CREATE INDEX IF NOT EXISTS idx_audit_v31_snapshot ON auditoria.relatorios_auditoria_v3_1 (dossier_snapshot_id);

-- Trigger de Imutabilidade para relatórios de auditoria V3.1
CREATE OR REPLACE FUNCTION auditoria.impedir_mutacao_relatorio_auditoria_v31()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'Operação negada: Relatórios de auditoria cognitiva V3.1 são imutáveis por design.';
END;
$$;

DROP TRIGGER IF EXISTS trg_relatorios_auditoria_v31_imutaveis ON auditoria.relatorios_auditoria_v3_1;
CREATE TRIGGER trg_relatorios_auditoria_v31_imutaveis
    BEFORE UPDATE OR DELETE ON auditoria.relatorios_auditoria_v3_1
    FOR EACH ROW
    EXECUTE FUNCTION auditoria.impedir_mutacao_relatorio_auditoria_v31();

-- RPC Segura para Registrar Relatório de Auditoria Cognitiva V3.1
-- REGRA INVIOLÁVEL: Machine Audit NUNCA promove para 'aprovado'. Promove para 'auditado'.
CREATE OR REPLACE FUNCTION auditoria.registrar_relatorio_auditoria_v3_1(
    p_id UUID,
    p_usuario_id UUID,
    p_versao_reflexao_id UUID,
    p_dossier_snapshot_id UUID,
    p_snapshot_hash TEXT,
    p_auditor_version TEXT,
    p_status TEXT,
    p_abstention_category TEXT,
    p_claims_audit JSONB,
    p_milr NUMERIC,
    p_amr NUMERIC,
    p_unsupported_claim_rate NUMERIC,
    p_forbidden_use_rate NUMERIC,
    p_citation_precision NUMERIC,
    p_intervencoes JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auditoria, reflexoes, cerebro_autoral, public, extensions
AS $$
DECLARE
    v_usuario_id UUID;
    v_ret_id UUID;
BEGIN
    IF current_user = 'authenticated' THEN
        v_usuario_id := auth.uid();
    ELSE
        v_usuario_id := COALESCE(auth.uid(), p_usuario_id);
    END IF;

    IF v_usuario_id IS NULL THEN
        RAISE EXCEPTION 'Acesso negado: registro de auditoria requer identificador de usuário válido.';
    END IF;

    -- Validar se a versão pertence ao mesmo tenant
    IF NOT EXISTS (
        SELECT 1 FROM reflexoes.versoes_reflexao 
        WHERE id = p_versao_reflexao_id AND usuario_id = v_usuario_id
    ) THEN
        RAISE EXCEPTION 'Violação de integridade multi-tenant: versão de reflexão não pertence ao usuário.';
    END IF;

    -- Inserir relatório pericial imutável
    INSERT INTO auditoria.relatorios_auditoria_v3_1 (
        id,
        usuario_id,
        versao_reflexao_id,
        dossier_snapshot_id,
        snapshot_hash,
        auditor_version,
        status,
        abstention_category,
        claims_audit,
        milr,
        amr,
        unsupported_claim_rate,
        forbidden_use_rate,
        citation_precision,
        intervencoes,
        criado_em
    ) VALUES (
        COALESCE(p_id, extensions.gen_random_uuid()),
        v_usuario_id,
        p_versao_reflexao_id,
        p_dossier_snapshot_id,
        p_snapshot_hash,
        p_auditor_version,
        p_status,
        p_abstention_category,
        p_claims_audit,
        COALESCE(p_milr, 0.0),
        COALESCE(p_amr, 0.0),
        COALESCE(p_unsupported_claim_rate, 0.0),
        COALESCE(p_forbidden_use_rate, 0.0),
        COALESCE(p_citation_precision, 0.0),
        COALESCE(p_intervencoes, '[]'::jsonb),
        clock_timestamp()
    )
    RETURNING id INTO v_ret_id;

    -- REGRA CANÔNICA DE GATE: Machine Audit NUNCA seta 'aprovado'. Seta 'auditado'.
    UPDATE reflexoes.versoes_reflexao
    SET estado = 'auditado'
    WHERE id = p_versao_reflexao_id AND usuario_id = v_usuario_id;

    RETURN v_ret_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION auditoria.registrar_relatorio_auditoria_v3_1(
    UUID, UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, JSONB, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, JSONB
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION auditoria.registrar_relatorio_auditoria_v3_1(
    UUID, UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, JSONB, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, JSONB
) TO authenticated, service_role;

-- 3. REDESENHO DA RPC buscar_multi_sinal_v3_1 (SEM SINAIS FABRICADOS E COM REGRAS REAIS)
CREATE OR REPLACE FUNCTION aplicacao.buscar_multi_sinal_v3_1(
    p_usuario_id UUID,
    p_query TEXT,
    p_vetor extensions.vector(1536) DEFAULT NULL,
    p_conceitos_ids UUID[] DEFAULT '{}',
    p_limite INTEGER DEFAULT 10,
    p_rrf_k NUMERIC DEFAULT 60.0,
    p_apenas_autorais BOOLEAN DEFAULT FALSE,
    p_incluir_contraevidencias BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    fragmento_id UUID,
    obra_id UUID,
    obra_titulo TEXT,
    obra_natureza biblioteca.natureza_obra,
    secao_titulo TEXT,
    conteudo TEXT,
    score_rrf NUMERIC,
    dense_rank INT,
    lexical_rank INT,
    taxonomy_match BOOLEAN,
    temporal_fit NUMERIC,
    epistemic_status TEXT,
    counterevidence_flag BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aplicacao, processamento, cerebro_autoral, taxonomia, biblioteca, public, extensions
AS $$
DECLARE
    v_usuario_id UUID;
    v_tem_vetor BOOLEAN;
    v_tem_query BOOLEAN;
BEGIN
    IF current_user = 'authenticated' THEN
        v_usuario_id := auth.uid();
    ELSE
        v_usuario_id := COALESCE(auth.uid(), p_usuario_id);
    END IF;

    IF v_usuario_id IS NULL THEN
        RAISE EXCEPTION 'Acesso negado: busca multi-sinal requer identificador de usuário válido.';
    END IF;

    v_tem_vetor := (p_vetor IS NOT NULL);
    v_tem_query := (p_query IS NOT NULL AND TRIM(p_query) <> '');

    RETURN QUERY
    WITH 
    -- 1. Candidatos Vetoriais (Densa)
    candidatos_vetoriais AS (
        SELECT
            v.unidade_conhecimento_id AS id,
            (1 - (v.embedding <=> p_vetor))::NUMERIC AS sim_vetorial,
            ROW_NUMBER() OVER (ORDER BY (v.embedding <=> p_vetor) ASC)::INT AS rank_denso
        FROM processamento.vetores v
        WHERE v_tem_vetor
          AND v.usuario_id = v_usuario_id
        ORDER BY v.embedding <=> p_vetor ASC
        LIMIT (p_limite * 3)
    ),
    -- 2. Candidatos Léxicos (FTS PT-BR)
    candidatos_lexicos AS (
        SELECT
            f.id,
            ts_rank_cd(f.tsv_conteudo, plainto_tsquery('portuguese', p_query))::NUMERIC AS sim_textual,
            ROW_NUMBER() OVER (ORDER BY ts_rank_cd(f.tsv_conteudo, plainto_tsquery('portuguese', p_query)) DESC)::INT AS rank_lexico
        FROM processamento.fragmentos f
        WHERE v_tem_query
          AND f.usuario_id = v_usuario_id
          AND f.tsv_conteudo @@ plainto_tsquery('portuguese', p_query)
        ORDER BY sim_textual DESC
        LIMIT (p_limite * 3)
    ),
    -- 3. Ancoragem Taxonômica SKOS com Ponderação Proporcional (confirmed vs proposed vs rejected)
    candidatos_taxonomia AS (
        SELECT
            c.provenance->>'source_id' AS frag_str_id,
            true AS match_skos,
            -- Proposta de IA não recebe a mesma força de vínculo confirmado
            MAX(CASE 
                WHEN cc.status = 'confirmed' THEN 0.015 
                WHEN cc.status = 'proposed' THEN 0.005 
                ELSE 0.0 
            END)::NUMERIC AS bonus_taxonomia
        FROM cerebro_autoral.claims c
        JOIN taxonomia.claim_conceitos cc ON cc.claim_id = c.id AND cc.usuario_id = v_usuario_id
        WHERE c.usuario_id = v_usuario_id
          AND array_length(p_conceitos_ids, 1) > 0
          AND cc.conceito_id = ANY(p_conceitos_ids)
          AND cc.status IN ('confirmed', 'proposed') -- 'rejected' terminantemente excluído
        GROUP BY c.provenance->>'source_id'
    ),
    -- 4. Status Epistemológico Agregado dos Claims Reais
    claims_agregados AS (
        SELECT
            c.provenance->>'source_id' AS frag_str_id,
            -- Se houver claims divergentes, preserva o mais conservador
            CASE 
                WHEN bool_or(c.epistemic_status = 'superseded') THEN 'superseded'
                WHEN bool_or(c.epistemic_status = 'confirmed_authorial') THEN 'confirmed_authorial'
                WHEN bool_or(c.epistemic_status = 'extracted') THEN 'extracted'
                WHEN bool_or(c.epistemic_status = 'inferred') THEN 'inferred'
                ELSE 'observed'
            END AS status_epistemico_real,
            bool_or(COALESCE((c.metadados->>'is_contraevidencia')::boolean, false)) AS tem_contraevidencia
        FROM cerebro_autoral.claims c
        WHERE c.usuario_id = v_usuario_id
        GROUP BY c.provenance->>'source_id'
    ),
    -- 5. Candidatos Unificados
    candidatos_unificados AS (
        SELECT id FROM candidatos_vetoriais
        UNION
        SELECT id FROM candidatos_lexicos
    )
    SELECT
        f.id AS fragmento_id,
        o.id AS obra_id,
        o.titulo AS obra_titulo,
        o.natureza AS obra_natureza,
        s.titulo AS secao_titulo,
        f.conteudo,
        -- RRF com bônus ponderado real
        ROUND(
            (
                COALESCE(1.0 / (p_rrf_k + cv.rank_denso), 0.0) +
                COALESCE(1.0 / (p_rrf_k + cl.rank_lexico), 0.0) +
                COALESCE(ct.bonus_taxonomia, 0.0)
            )::NUMERIC, 6
        ) AS score_rrf,
        cv.rank_denso AS dense_rank,
        cl.rank_lexico AS lexical_rank,
        COALESCE(ct.match_skos, FALSE) AS taxonomy_match,
        -- Temporal Fit Real: calculado por recência normalizada da obra/versão
        ROUND(
            GREATEST(0.1, 1.0 - (EXTRACT(EPOCH FROM (NOW() - vo.criado_em)) / (86400 * 365 * 5)))::NUMERIC, 3
        ) AS temporal_fit,
        -- Epistemic Status Real herdado dos claims (ou observed se não houver claim)
        COALESCE(ca.status_epistemico_real, 'observed')::TEXT AS epistemic_status,
        -- Contraevidência Real (não fabricada)
        COALESCE(ca.tem_contraevidencia, FALSE) AS counterevidence_flag
    FROM candidatos_unificados cu
    JOIN processamento.fragmentos f ON f.id = cu.id
    LEFT JOIN candidatos_vetoriais cv ON cv.id = cu.id
    LEFT JOIN candidatos_lexicos cl ON cl.id = cu.id
    LEFT JOIN candidatos_taxonomia ct ON ct.frag_str_id = f.id::text
    LEFT JOIN claims_agregados ca ON ca.frag_str_id = f.id::text
    LEFT JOIN processamento.secoes s ON s.id = f.secao_id
    JOIN processamento.documentos_processados dp ON dp.id = f.documento_processado_id
    JOIN biblioteca.versoes_obras vo ON vo.id = dp.versao_obra_id
    JOIN biblioteca.obras o ON o.id = vo.obra_id
    WHERE f.usuario_id = v_usuario_id
      AND dp.estado_publicacao = 'ativo'
      AND (NOT p_apenas_autorais OR o.natureza = 'autoral')
      -- Se não for para incluir contraevidências, exclui do pool direto
      AND (p_incluir_contraevidencias OR COALESCE(ca.tem_contraevidencia, FALSE) IS FALSE)
    ORDER BY score_rrf DESC
    LIMIT p_limite;
END;
$$;

-- 4. ATUALIZAR FACHADA EM PUBLIC
CREATE OR REPLACE FUNCTION public.buscar_multi_sinal_v3_1(
    p_usuario_id UUID,
    p_query TEXT,
    p_vetor extensions.vector(1536) DEFAULT NULL,
    p_conceitos_ids UUID[] DEFAULT '{}',
    p_limite INTEGER DEFAULT 10,
    p_rrf_k NUMERIC DEFAULT 60.0,
    p_apenas_autorais BOOLEAN DEFAULT FALSE,
    p_incluir_contraevidencias BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    fragmento_id UUID,
    obra_id UUID,
    obra_titulo TEXT,
    obra_natureza biblioteca.natureza_obra,
    secao_titulo TEXT,
    conteudo TEXT,
    score_rrf NUMERIC,
    dense_rank INT,
    lexical_rank INT,
    taxonomy_match BOOLEAN,
    temporal_fit NUMERIC,
    epistemic_status TEXT,
    counterevidence_flag BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY SELECT * FROM aplicacao.buscar_multi_sinal_v3_1(
        p_usuario_id, p_query, p_vetor, p_conceitos_ids, 
        p_limite, p_rrf_k, p_apenas_autorais, p_incluir_contraevidencias
    );
END;
$$;

NOTIFY pgrst, 'reload schema';
