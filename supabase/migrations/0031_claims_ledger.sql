-- ============================================================================
-- MIGRATION 0031: CLAIMS LEDGER & PROVENANCE FACTUAL (WAVE 1)
-- Projeto: Cérebro Autoral / Memória Reflexiva (App Reflex 02)
-- Idioma canônico: Português do Brasil
-- Padrão: EXPAND-FIRST (Estritamente Aditiva, Sem Quebras Legadas, RLS Ativo)
-- ============================================================================

-- 1. TIPOS ENUM CANÔNICOS DA ARQUITETURA COGNITIVA V3.1
DO $$
BEGIN
    -- Dimensão 1: Ciclo de Vida Epistemológico (10 Estados Canônicos)
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'estado_epistemologico' AND n.nspname = 'cerebro_autoral') THEN
        CREATE TYPE cerebro_autoral.estado_epistemologico AS ENUM (
            'observed',
            'quoted',
            'extracted',
            'consolidated',
            'confirmed_authorial',
            'inferred',
            'hypothesized',
            'proposed',
            'rejected',
            'superseded'
        );
    END IF;

    -- Dimensão 2: Tipologia Funcional de Claims
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'tipo_claim' AND n.nspname = 'cerebro_autoral') THEN
        CREATE TYPE cerebro_autoral.tipo_claim AS ENUM (
            'SOURCE_CLAIM',
            'AUTHOR_EXPLICIT_CLAIM',
            'SUMMARY_CLAIM',
            'INFERRED_CLAIM',
            'HYPOTHESIS_CLAIM',
            'PROCEDURAL_CLAIM'
        );
    END IF;

    -- Dimensão 3: Papel de Autoria e Autoridade Factual (Nenhum claim nasce autoral por padrão)
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'papel_autoria' AND n.nspname = 'cerebro_autoral') THEN
        CREATE TYPE cerebro_autoral.papel_autoria AS ENUM (
            'AUTHOR_EXPLICIT',
            'EXTERNAL_SOURCE',
            'SYSTEM_INFERENCE',
            'HUMAN_CONFIRMED',
            'UNKNOWN'
        );
    END IF;

    -- Verificabilidade Epistêmica
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'verificabilidade' AND n.nspname = 'cerebro_autoral') THEN
        CREATE TYPE cerebro_autoral.verificabilidade AS ENUM (
            'VERIFIABLE',
            'UNVERIFIABLE',
            'AMBIGUOUS'
        );
    END IF;
END $$;

-- 2. TABELA PRINCIPAL: cerebro_autoral.claims (O Livro-Razão de Afirmações Atômicas)
CREATE TABLE IF NOT EXISTS cerebro_autoral.claims (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL CHECK (source_type IN ('obra', 'versao_obra', 'fragmento', 'reflexao', 'nota_avulsa')),
    source_id UUID NOT NULL,
    source_version INTEGER NOT NULL DEFAULT 1 CHECK (source_version >= 1),
    declaracao_atomica TEXT NOT NULL,
    sujeito TEXT,
    predicado TEXT,
    objeto TEXT,
    claim_type cerebro_autoral.tipo_claim NOT NULL DEFAULT 'SOURCE_CLAIM',
    epistemic_status cerebro_autoral.estado_epistemologico NOT NULL DEFAULT 'observed',
    source_role cerebro_autoral.papel_autoria NOT NULL DEFAULT 'UNKNOWN',
    verifiability cerebro_autoral.verificabilidade NOT NULL DEFAULT 'VERIFIABLE',
    idioma TEXT NOT NULL DEFAULT 'pt-BR',
    confianca_nli NUMERIC(4,3) CHECK (confianca_nli >= 0.0 AND confianca_nli <= 1.0),
    origin_event_id UUID NULL, -- Event-Ready: reservado para vinculação à memory_events na Wave 2
    metadados JSONB NOT NULL DEFAULT '{}'::jsonb,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Constraint Composta Obrigatória: assegura integridade referencial com a tabela de proveniência
    CONSTRAINT uq_claims_id_usuario UNIQUE (id, usuario_id)
);

COMMENT ON TABLE cerebro_autoral.claims IS 'Livro-razão de afirmações atômicas descontextualizadas com tipagem epistêmica e autoral estrita.';

-- 3. TABELA DE PROVENIÊNCIA: cerebro_autoral.claim_provenance (Âncora Factual Imutável)
CREATE TABLE IF NOT EXISTS cerebro_autoral.claim_provenance (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    claim_id UUID NOT NULL,
    usuario_id UUID NOT NULL,
    span_texto_original TEXT NOT NULL,
    span_start INTEGER NOT NULL CHECK (span_start >= 0),
    span_end INTEGER NOT NULL CHECK (span_end > span_start),
    content_hash TEXT NOT NULL, -- Hash SHA-256 do span normalizado
    metadados JSONB NOT NULL DEFAULT '{}'::jsonb,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Chave Estrangeira Composta Inviolável: Impede matematicamente que provenance de usuário A aponte para claim de usuário B
    CONSTRAINT fk_claim_provenance_ownership FOREIGN KEY (claim_id, usuario_id)
        REFERENCES cerebro_autoral.claims(id, usuario_id) ON DELETE CASCADE
);

COMMENT ON TABLE cerebro_autoral.claim_provenance IS 'Ponteiros de sustentação factual e integridade de span para claims atômicos.';

-- 4. ÍNDICES DE DESEMPENHO E CONSULTA
CREATE INDEX IF NOT EXISTS idx_claims_usuario_status ON cerebro_autoral.claims (usuario_id, epistemic_status);
CREATE INDEX IF NOT EXISTS idx_claims_usuario_source ON cerebro_autoral.claims (usuario_id, source_id, source_version);
CREATE INDEX IF NOT EXISTS idx_claims_usuario_role ON cerebro_autoral.claims (usuario_id, source_role);
CREATE INDEX IF NOT EXISTS idx_claims_origin_event ON cerebro_autoral.claims (origin_event_id) WHERE origin_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_provenance_hash ON cerebro_autoral.claim_provenance (content_hash);
CREATE INDEX IF NOT EXISTS idx_provenance_claim ON cerebro_autoral.claim_provenance (claim_id);

-- 5. HABILITAÇÃO COMPULSÓRIA DE ROW LEVEL SECURITY (RLS)
ALTER TABLE cerebro_autoral.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE cerebro_autoral.claim_provenance ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS DE ACESSO RLS (MULTI-TENANT ISOLADO)
-- Claims
DROP POLICY IF EXISTS "claims_select_owner" ON cerebro_autoral.claims;
CREATE POLICY "claims_select_owner" ON cerebro_autoral.claims
    FOR SELECT TO authenticated
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "claims_insert_owner" ON cerebro_autoral.claims;
CREATE POLICY "claims_insert_owner" ON cerebro_autoral.claims
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "claims_update_owner" ON cerebro_autoral.claims;
CREATE POLICY "claims_update_owner" ON cerebro_autoral.claims
    FOR UPDATE TO authenticated
    USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "claims_delete_owner" ON cerebro_autoral.claims;
CREATE POLICY "claims_delete_owner" ON cerebro_autoral.claims
    FOR DELETE TO authenticated
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "claims_service_role" ON cerebro_autoral.claims;
CREATE POLICY "claims_service_role" ON cerebro_autoral.claims
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Claim Provenance
DROP POLICY IF EXISTS "provenance_select_owner" ON cerebro_autoral.claim_provenance;
CREATE POLICY "provenance_select_owner" ON cerebro_autoral.claim_provenance
    FOR SELECT TO authenticated
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "provenance_insert_owner" ON cerebro_autoral.claim_provenance;
CREATE POLICY "provenance_insert_owner" ON cerebro_autoral.claim_provenance
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "provenance_delete_owner" ON cerebro_autoral.claim_provenance;
CREATE POLICY "provenance_delete_owner" ON cerebro_autoral.claim_provenance
    FOR DELETE TO authenticated
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "provenance_service_role" ON cerebro_autoral.claim_provenance;
CREATE POLICY "provenance_service_role" ON cerebro_autoral.claim_provenance
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);
