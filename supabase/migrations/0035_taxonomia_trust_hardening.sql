-- ============================================================================
-- MIGRATION 0035: TAXONOMY TRUST HARDENING (GATE 0 - WAVE 4)
-- Projeto: Cérebro Autoral / Memória Reflexiva (App Reflex 02)
-- Idioma canônico: Português do Brasil
-- Padrão: EXPAND-FIRST / SAFE MIGRATION
-- ============================================================================

-- 1. ADICIONAR COLUNA search_key E INTEGRAR MULTI-TENANT EM merged_into_id
ALTER TABLE taxonomia.skos_conceitos
    ADD COLUMN IF NOT EXISTS search_key TEXT;

-- Preencher search_key existente com fallback baseado no label atual
UPDATE taxonomia.skos_conceitos
SET search_key = LOWER(TRIM(pref_label))
WHERE search_key IS NULL;

ALTER TABLE taxonomia.skos_conceitos
    ALTER COLUMN search_key SET NOT NULL;

-- Criar índice para busca tolerante em search_key
CREATE INDEX IF NOT EXISTS idx_skos_conceitos_search_key 
    ON taxonomia.skos_conceitos (usuario_id, search_key);

-- Corrigir integridade multi-tenant em merged_into_id (FK composta anti-cross-tenant)
ALTER TABLE taxonomia.skos_conceitos
    DROP CONSTRAINT IF EXISTS skos_conceitos_merged_into_id_fkey;

ALTER TABLE taxonomia.skos_conceitos
    ADD CONSTRAINT fk_skos_conceitos_merged_into_tenant 
    FOREIGN KEY (merged_into_id, usuario_id) 
    REFERENCES taxonomia.skos_conceitos(id, usuario_id) 
    ON DELETE SET NULL;

-- 2. REMOVER DEFAULT ARBITRÁRIO DE CONFIANÇA (0.85) EM claim_conceitos
-- Não transformar default legado em autoridade semântica
ALTER TABLE taxonomia.claim_conceitos
    ALTER COLUMN confianca DROP DEFAULT;

ALTER TABLE taxonomia.claim_conceitos
    ALTER COLUMN confianca DROP NOT NULL;

-- 3. HARDENING DE RLS: REVOGAR ESCRITA DIRETA DE CLIENTES GENÉRICOS
-- Clientes authenticated mantêm apenas SELECT via RLS. Inserções e edições
-- de status/curadoria devem ocorrer exclusivamente através das RPCs auditadas.
DROP POLICY IF EXISTS "skos_conceitos_insert_owner" ON taxonomia.skos_conceitos;
DROP POLICY IF EXISTS "skos_conceitos_update_owner" ON taxonomia.skos_conceitos;
DROP POLICY IF EXISTS "skos_conceitos_delete_owner" ON taxonomia.skos_conceitos;

DROP POLICY IF EXISTS "skos_relacoes_insert_owner" ON taxonomia.skos_relacoes;
DROP POLICY IF EXISTS "skos_relacoes_update_owner" ON taxonomia.skos_relacoes;
DROP POLICY IF EXISTS "skos_relacoes_delete_owner" ON taxonomia.skos_relacoes;

DROP POLICY IF EXISTS "claim_conceitos_insert_owner" ON taxonomia.claim_conceitos;
DROP POLICY IF EXISTS "claim_conceitos_update_owner" ON taxonomia.claim_conceitos;
DROP POLICY IF EXISTS "claim_conceitos_delete_owner" ON taxonomia.claim_conceitos;

-- 4. RPCS DE CURADORIA HUMANA (IDENTIDADE DERIVADA ESTRITAMENTE DE auth.uid())

-- 4.1. Curadoria de Conceitos pelo Autor Humano
CREATE OR REPLACE FUNCTION aplicacao.curar_conceito_skos_humano(
    p_conceito_id UUID,
    p_acao TEXT,
    p_novo_label TEXT DEFAULT NULL,
    p_merged_into_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aplicacao, taxonomia, auth, public
AS $$
DECLARE
    v_usuario_id UUID;
    v_conceito RECORD;
    v_resultado JSONB;
BEGIN
    v_usuario_id := auth.uid();
    IF v_usuario_id IS NULL THEN
        RAISE EXCEPTION 'Acesso negado: operação de curadoria humana requer usuário autenticado.';
    END IF;

    IF p_acao NOT IN ('confirm', 'reject', 'deprecate', 'merge', 'rename') THEN
        RAISE EXCEPTION 'Ação de curadoria inválida: %', p_acao;
    END IF;

    SELECT * INTO v_conceito
    FROM taxonomia.skos_conceitos
    WHERE id = p_conceito_id AND usuario_id = v_usuario_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Conceito não encontrado ou não pertence ao usuário ativo.';
    END IF;

    IF p_acao = 'confirm' THEN
        UPDATE taxonomia.skos_conceitos
        SET status = 'active',
            atualizado_em = clock_timestamp(),
            metadados = jsonb_set(
                metadados, 
                '{curadoria}', 
                jsonb_build_object('curador', 'HUMAN', 'confirmado_em', clock_timestamp())
            )
        WHERE id = p_conceito_id;

    ELSIF p_acao = 'reject' THEN
        UPDATE taxonomia.skos_conceitos
        SET status = 'rejected',
            atualizado_em = clock_timestamp(),
            metadados = jsonb_set(
                metadados, 
                '{curadoria}', 
                jsonb_build_object('curador', 'HUMAN', 'rejeitado_em', clock_timestamp())
            )
        WHERE id = p_conceito_id;

    ELSIF p_acao = 'deprecate' THEN
        UPDATE taxonomia.skos_conceitos
        SET status = 'deprecated',
            atualizado_em = clock_timestamp()
        WHERE id = p_conceito_id;

    ELSIF p_acao = 'merge' THEN
        IF p_merged_into_id IS NULL OR p_merged_into_id = p_conceito_id THEN
            RAISE EXCEPTION 'Mesclagem inválida: conceito destino deve ser fornecido e diferente da origem.';
        END IF;

        -- Validar se o destino pertence ao mesmo usuário
        IF NOT EXISTS (
            SELECT 1 FROM taxonomia.skos_conceitos 
            WHERE id = p_merged_into_id AND usuario_id = v_usuario_id
        ) THEN
            RAISE EXCEPTION 'Integridade violada: conceito destino não pertence ao mesmo tenant.';
        END IF;

        UPDATE taxonomia.skos_conceitos
        SET status = 'merged',
            merged_into_id = p_merged_into_id,
            atualizado_em = clock_timestamp(),
            metadados = jsonb_set(
                metadados, 
                '{curadoria}', 
                jsonb_build_object('curador', 'HUMAN', 'mesclado_em', clock_timestamp(), 'destino', p_merged_into_id)
            )
        WHERE id = p_conceito_id;

    ELSIF p_acao = 'rename' THEN
        IF p_novo_label IS NULL OR TRIM(p_novo_label) = '' THEN
            RAISE EXCEPTION 'Renomeação inválida: novo rótulo não pode ser vazio.';
        END IF;

        UPDATE taxonomia.skos_conceitos
        SET pref_label = TRIM(p_novo_label),
            atualizado_em = clock_timestamp()
        WHERE id = p_conceito_id;
    END IF;

    SELECT jsonb_build_object(
        'sucesso', true,
        'conceito_id', p_conceito_id,
        'acao', p_acao,
        'status_final', (SELECT status FROM taxonomia.skos_conceitos WHERE id = p_conceito_id)
    ) INTO v_resultado;

    RETURN v_resultado;
END;
$$;

-- 4.2. Curadoria de Vínculos Claim-Conceito pelo Autor Humano
CREATE OR REPLACE FUNCTION aplicacao.curar_vinculo_claim_conceito_humano(
    p_link_id UUID,
    p_acao TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aplicacao, taxonomia, auth, public
AS $$
DECLARE
    v_usuario_id UUID;
    v_link RECORD;
    v_resultado JSONB;
BEGIN
    v_usuario_id := auth.uid();
    IF v_usuario_id IS NULL THEN
        RAISE EXCEPTION 'Acesso negado: operação requer usuário autenticado.';
    END IF;

    IF p_acao NOT IN ('confirm', 'reject') THEN
        RAISE EXCEPTION 'Ação de curadoria de vínculo inválida: %', p_acao;
    END IF;

    SELECT * INTO v_link
    FROM taxonomia.claim_conceitos
    WHERE id = p_link_id AND usuario_id = v_usuario_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Vínculo claim-conceito não encontrado para o usuário ativo.';
    END IF;

    IF p_acao = 'confirm' THEN
        UPDATE taxonomia.claim_conceitos
        SET status = 'confirmed',
            origem = 'HUMAN_CURATED',
            metadados = jsonb_set(
                metadados,
                '{curadoria}',
                jsonb_build_object('curador', 'HUMAN', 'confirmado_em', clock_timestamp())
            )
        WHERE id = p_link_id;
    ELSIF p_acao = 'reject' THEN
        UPDATE taxonomia.claim_conceitos
        SET status = 'rejected',
            metadados = jsonb_set(
                metadados,
                '{curadoria}',
                jsonb_build_object('curador', 'HUMAN', 'rejeitado_em', clock_timestamp())
            )
        WHERE id = p_link_id;
    END IF;

    SELECT jsonb_build_object(
        'sucesso', true,
        'link_id', p_link_id,
        'acao', p_acao,
        'status_final', (SELECT status FROM taxonomia.claim_conceitos WHERE id = p_link_id),
        'origem_final', (SELECT origem FROM taxonomia.claim_conceitos WHERE id = p_link_id)
    ) INTO v_resultado;

    RETURN v_resultado;
END;
$$;

-- 5. RPCS SISTÊMICAS (RESTRIÇÃO EXCLUSIVA A SERVICE_ROLE - FORÇA 'proposed' / 'IA_SUGGESTION')

-- 5.1. Proposta de Conceito por IA (Anti-Inflação: se já existe, incrementa recorrência)
CREATE OR REPLACE FUNCTION aplicacao.propor_conceito_skos_sistema(
    p_usuario_id UUID,
    p_pref_label TEXT,
    p_identity_key TEXT,
    p_search_key TEXT,
    p_alt_labels TEXT[] DEFAULT '{}',
    p_definicao TEXT DEFAULT NULL,
    p_dominio TEXT DEFAULT NULL,
    p_metadados JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aplicacao, taxonomia, public
AS $$
DECLARE
    v_existente RECORD;
    v_conceito_id UUID;
    v_recorrencia INT;
    v_foi_criado BOOLEAN;
BEGIN
    SELECT id, recorrencia_contagem, status INTO v_existente
    FROM taxonomia.skos_conceitos
    WHERE usuario_id = p_usuario_id AND pref_label_normalizado = p_identity_key
    FOR UPDATE;

    IF FOUND THEN
        UPDATE taxonomia.skos_conceitos
        SET recorrencia_contagem = recorrencia_contagem + 1,
            atualizado_em = clock_timestamp()
        WHERE id = v_existente.id;

        v_conceito_id := v_existente.id;
        v_recorrencia := v_existente.recorrencia_contagem + 1;
        v_foi_criado := false;
    ELSE
        INSERT INTO taxonomia.skos_conceitos (
            usuario_id,
            pref_label,
            pref_label_normalizado,
            search_key,
            alt_labels,
            definicao,
            dominio_escopo,
            status,
            recorrencia_contagem,
            metadados
        ) VALUES (
            p_usuario_id,
            TRIM(p_pref_label),
            p_identity_key,
            p_search_key,
            COALESCE(p_alt_labels, '{}'),
            p_definicao,
            p_dominio,
            'proposed', -- Sistema NUNCA cria como active ou confirmed
            1,
            jsonb_build_object('origem', 'IA_SUGGESTION') || COALESCE(p_metadados, '{}'::jsonb)
        )
        RETURNING id INTO v_conceito_id;

        v_recorrencia := 1;
        v_foi_criado := true;
    END IF;

    RETURN jsonb_build_object(
        'sucesso', true,
        'conceito_id', v_conceito_id,
        'criado', v_foi_criado,
        'recorrencia_contagem', v_recorrencia,
        'status', CASE WHEN v_foi_criado THEN 'proposed' ELSE v_existente.status END
    );
END;
$$;

-- 5.2. Proposta de Vínculo Claim-Conceito por IA
CREATE OR REPLACE FUNCTION aplicacao.propor_vinculo_claim_conceito_sistema(
    p_usuario_id UUID,
    p_claim_id UUID,
    p_conceito_id UUID,
    p_tipo_vinculo TEXT DEFAULT 'DISCUSSES_CONCEPT',
    p_confianca NUMERIC DEFAULT NULL,
    p_metadados JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aplicacao, taxonomia, cerebro_autoral, public
AS $$
DECLARE
    v_link_id UUID;
    v_foi_criado BOOLEAN;
BEGIN
    -- Validar que a claim e o conceito pertencem ao tenant
    IF NOT EXISTS (SELECT 1 FROM cerebro_autoral.claims WHERE id = p_claim_id AND usuario_id = p_usuario_id) THEN
        RAISE EXCEPTION 'Claim inválida para o usuário.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM taxonomia.skos_conceitos WHERE id = p_conceito_id AND usuario_id = p_usuario_id) THEN
        RAISE EXCEPTION 'Conceito inválido para o usuário.';
    END IF;

    SELECT id INTO v_link_id
    FROM taxonomia.claim_conceitos
    WHERE usuario_id = p_usuario_id 
      AND claim_id = p_claim_id 
      AND conceito_id = p_conceito_id 
      AND tipo_vinculo = p_tipo_vinculo;

    IF FOUND THEN
        v_foi_criado := false;
    ELSE
        INSERT INTO taxonomia.claim_conceitos (
            usuario_id,
            claim_id,
            conceito_id,
            tipo_vinculo,
            confianca,
            origem,
            status,
            metadados
        ) VALUES (
            p_usuario_id,
            p_claim_id,
            p_conceito_id,
            p_tipo_vinculo,
            p_confianca, -- Sem default mágico 0.85
            'IA_SUGGESTION', -- Sistema NUNCA cria como HUMAN_CURATED
            'proposed',      -- Sistema NUNCA cria como confirmed
            COALESCE(p_metadados, '{}'::jsonb)
        )
        RETURNING id INTO v_link_id;
        v_foi_criado := true;
    END IF;

    RETURN jsonb_build_object(
        'sucesso', true,
        'link_id', v_link_id,
        'criado', v_foi_criado,
        'status', 'proposed',
        'origem', 'IA_SUGGESTION'
    );
END;
$$;

-- 6. FACHADAS EM PUBLIC E PERMISSÕES DE ACESSO
CREATE OR REPLACE FUNCTION public.curar_conceito_skos_humano(
    p_conceito_id UUID,
    p_acao TEXT,
    p_novo_label TEXT DEFAULT NULL,
    p_merged_into_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN aplicacao.curar_conceito_skos_humano(p_conceito_id, p_acao, p_novo_label, p_merged_into_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.curar_vinculo_claim_conceito_humano(
    p_link_id UUID,
    p_acao TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN aplicacao.curar_vinculo_claim_conceito_humano(p_link_id, p_acao);
END;
$$;

CREATE OR REPLACE FUNCTION public.propor_conceito_skos_sistema(
    p_usuario_id UUID,
    p_pref_label TEXT,
    p_identity_key TEXT,
    p_search_key TEXT,
    p_alt_labels TEXT[] DEFAULT '{}',
    p_definicao TEXT DEFAULT NULL,
    p_dominio TEXT DEFAULT NULL,
    p_metadados JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN aplicacao.propor_conceito_skos_sistema(
        p_usuario_id, p_pref_label, p_identity_key, p_search_key, 
        p_alt_labels, p_definicao, p_dominio, p_metadados
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.propor_vinculo_claim_conceito_sistema(
    p_usuario_id UUID,
    p_claim_id UUID,
    p_conceito_id UUID,
    p_tipo_vinculo TEXT DEFAULT 'DISCUSSES_CONCEPT',
    p_confianca NUMERIC DEFAULT NULL,
    p_metadados JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN aplicacao.propor_vinculo_claim_conceito_sistema(
        p_usuario_id, p_claim_id, p_conceito_id, p_tipo_vinculo, p_confianca, p_metadados
    );
END;
$$;

-- Permissões das RPCs de Curadoria Humana
REVOKE EXECUTE ON FUNCTION public.curar_conceito_skos_humano(UUID, TEXT, TEXT, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.curar_conceito_skos_humano(UUID, TEXT, TEXT, UUID) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.curar_vinculo_claim_conceito_humano(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.curar_vinculo_claim_conceito_humano(UUID, TEXT) TO authenticated, service_role;

-- Permissões das RPCs Sistêmicas (Restritas exclusivamente a service_role)
REVOKE EXECUTE ON FUNCTION public.propor_conceito_skos_sistema(UUID, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.propor_conceito_skos_sistema(UUID, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, JSONB) TO service_role;

REVOKE EXECUTE ON FUNCTION public.propor_vinculo_claim_conceito_sistema(UUID, UUID, UUID, TEXT, NUMERIC, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.propor_vinculo_claim_conceito_sistema(UUID, UUID, UUID, TEXT, NUMERIC, JSONB) TO service_role;

NOTIFY pgrst, 'reload schema';
