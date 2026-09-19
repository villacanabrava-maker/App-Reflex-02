-- ============================================================================
-- MIGRATION 0034: TAXONOMIA SKOS & ANCORAGEM CONCEITUAL (WAVE 3)
-- Projeto: Cérebro Autoral / Memória Reflexiva (App Reflex 02)
-- Idioma canônico: Português do Brasil
-- Padrão: EXPAND-FIRST (Preserva legado taxonomia.*, RLS Multi-Tenant, Anti-Cross-Tenant)
-- ============================================================================

-- 1. TABELA PRINCIPAL: taxonomia.skos_conceitos
-- Representação formal de conceitos ontológicos inspirada no W3C SKOS
CREATE TABLE IF NOT EXISTS taxonomia.skos_conceitos (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pref_label TEXT NOT NULL,
    pref_label_normalizado TEXT NOT NULL,
    alt_labels TEXT[] NOT NULL DEFAULT '{}',
    idioma TEXT NOT NULL DEFAULT 'pt-BR',
    definicao TEXT,
    dominio_escopo TEXT,
    status TEXT NOT NULL CHECK (status IN ('proposed', 'active', 'merged', 'rejected', 'deprecated')) DEFAULT 'proposed',
    recorrencia_contagem INTEGER NOT NULL DEFAULT 1 CHECK (recorrencia_contagem >= 1),
    merged_into_id UUID REFERENCES taxonomia.skos_conceitos(id) ON DELETE SET NULL,
    metadados JSONB NOT NULL DEFAULT '{}'::jsonb,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    -- Invariante: Nome de conceito normalizado é único por usuário (anti-inflação)
    CONSTRAINT uq_skos_conceito_label_tenant UNIQUE (usuario_id, pref_label_normalizado),
    -- Constraint Composta para Integridade Referencial Multi-Tenant
    CONSTRAINT uq_skos_conceito_id_tenant UNIQUE (id, usuario_id)
);

COMMENT ON TABLE taxonomia.skos_conceitos IS 'Conceitos ontológicos formais estruturados conforme o modelo SKOS com suporte a aliases, normalização e status de curadoria.';

-- 2. TABELA DE RELAÇÕES ONTOLÓGICAS: taxonomia.skos_relacoes
-- Grafo hierárquico e associativo: BROADER, NARROWER e RELATED
CREATE TABLE IF NOT EXISTS taxonomia.skos_relacoes (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conceito_origem_id UUID NOT NULL,
    conceito_destino_id UUID NOT NULL,
    tipo_relacao TEXT NOT NULL CHECK (tipo_relacao IN ('BROADER', 'NARROWER', 'RELATED')),
    status TEXT NOT NULL CHECK (status IN ('proposed', 'active', 'rejected')) DEFAULT 'proposed',
    metadados JSONB NOT NULL DEFAULT '{}'::jsonb,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    -- Restrições de Auto-relação e Integridade Multi-Tenant
    CHECK (conceito_origem_id <> conceito_destino_id),
    CONSTRAINT fk_skos_relacao_origem_tenant FOREIGN KEY (conceito_origem_id, usuario_id)
        REFERENCES taxonomia.skos_conceitos(id, usuario_id) ON DELETE CASCADE,
    CONSTRAINT fk_skos_relacao_destino_tenant FOREIGN KEY (conceito_destino_id, usuario_id)
        REFERENCES taxonomia.skos_conceitos(id, usuario_id) ON DELETE CASCADE,
    CONSTRAINT uq_skos_relacao_tripla UNIQUE (usuario_id, conceito_origem_id, conceito_destino_id, tipo_relacao)
);

COMMENT ON TABLE taxonomia.skos_relacoes IS 'Relações ontológicas canônicas entre conceitos SKOS (mais amplo, mais estrito ou associativo).';

-- 3. TABELA DE ANCORAGEM: taxonomia.claim_conceitos
-- Liga proposições atômicas fáticas a nós conceituais da ontologia sem confundir com autoria
CREATE TABLE IF NOT EXISTS taxonomia.claim_conceitos (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    claim_id UUID NOT NULL,
    conceito_id UUID NOT NULL,
    tipo_vinculo TEXT NOT NULL CHECK (tipo_vinculo IN ('EXPRESSES_CONCEPT', 'DISCUSSES_CONCEPT', 'CRITICIZES_CONCEPT')) DEFAULT 'DISCUSSES_CONCEPT',
    confianca NUMERIC(4,3) NOT NULL DEFAULT 0.85 CHECK (confianca >= 0.0 AND confianca <= 1.0),
    origem TEXT NOT NULL CHECK (origem IN ('IA_SUGGESTION', 'HUMAN_CURATED')) DEFAULT 'IA_SUGGESTION',
    status TEXT NOT NULL CHECK (status IN ('proposed', 'confirmed', 'rejected')) DEFAULT 'proposed',
    metadados JSONB NOT NULL DEFAULT '{}'::jsonb,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    -- Integridade Multi-Tenant Inviolável
    CONSTRAINT fk_claim_conceito_claim_tenant FOREIGN KEY (claim_id, usuario_id)
        REFERENCES cerebro_autoral.claims(id, usuario_id) ON DELETE CASCADE,
    CONSTRAINT fk_claim_conceito_conceito_tenant FOREIGN KEY (conceito_id, usuario_id)
        REFERENCES taxonomia.skos_conceitos(id, usuario_id) ON DELETE CASCADE,
    CONSTRAINT uq_claim_conceito_par UNIQUE (usuario_id, claim_id, conceito_id, tipo_vinculo)
);

COMMENT ON TABLE taxonomia.claim_conceitos IS 'Ponte de ancoragem semântica entre afirmações atômicas e o grafo ontológico SKOS.';

-- 4. ÍNDICES DE DESEMPENHO E CONSULTA
CREATE INDEX IF NOT EXISTS idx_skos_conceitos_usuario_norm ON taxonomia.skos_conceitos (usuario_id, pref_label_normalizado);
CREATE INDEX IF NOT EXISTS idx_skos_conceitos_status ON taxonomia.skos_conceitos (usuario_id, status);
CREATE INDEX IF NOT EXISTS idx_skos_relacoes_origem ON taxonomia.skos_relacoes (usuario_id, conceito_origem_id);
CREATE INDEX IF NOT EXISTS idx_skos_relacoes_destino ON taxonomia.skos_relacoes (usuario_id, conceito_destino_id);
CREATE INDEX IF NOT EXISTS idx_claim_conceitos_claim ON taxonomia.claim_conceitos (usuario_id, claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_conceitos_conceito ON taxonomia.claim_conceitos (usuario_id, conceito_id);

-- 5. HABILITAÇÃO COMPULSÓRIA DE ROW LEVEL SECURITY (RLS)
ALTER TABLE taxonomia.skos_conceitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxonomia.skos_relacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxonomia.claim_conceitos ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS DE ACESSO RLS (MULTI-TENANT ISOLADO)
-- skos_conceitos
DROP POLICY IF EXISTS "skos_conceitos_select_owner" ON taxonomia.skos_conceitos;
CREATE POLICY "skos_conceitos_select_owner" ON taxonomia.skos_conceitos
    FOR SELECT TO authenticated
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "skos_conceitos_insert_owner" ON taxonomia.skos_conceitos;
CREATE POLICY "skos_conceitos_insert_owner" ON taxonomia.skos_conceitos
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "skos_conceitos_update_owner" ON taxonomia.skos_conceitos;
CREATE POLICY "skos_conceitos_update_owner" ON taxonomia.skos_conceitos
    FOR UPDATE TO authenticated
    USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "skos_conceitos_delete_owner" ON taxonomia.skos_conceitos;
CREATE POLICY "skos_conceitos_delete_owner" ON taxonomia.skos_conceitos
    FOR DELETE TO authenticated
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "skos_conceitos_service_role" ON taxonomia.skos_conceitos;
CREATE POLICY "skos_conceitos_service_role" ON taxonomia.skos_conceitos
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- skos_relacoes
DROP POLICY IF EXISTS "skos_relacoes_select_owner" ON taxonomia.skos_relacoes;
CREATE POLICY "skos_relacoes_select_owner" ON taxonomia.skos_relacoes
    FOR SELECT TO authenticated
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "skos_relacoes_insert_owner" ON taxonomia.skos_relacoes;
CREATE POLICY "skos_relacoes_insert_owner" ON taxonomia.skos_relacoes
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "skos_relacoes_update_owner" ON taxonomia.skos_relacoes;
CREATE POLICY "skos_relacoes_update_owner" ON taxonomia.skos_relacoes
    FOR UPDATE TO authenticated
    USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "skos_relacoes_delete_owner" ON taxonomia.skos_relacoes;
CREATE POLICY "skos_relacoes_delete_owner" ON taxonomia.skos_relacoes
    FOR DELETE TO authenticated
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "skos_relacoes_service_role" ON taxonomia.skos_relacoes;
CREATE POLICY "skos_relacoes_service_role" ON taxonomia.skos_relacoes
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- claim_conceitos
DROP POLICY IF EXISTS "claim_conceitos_select_owner" ON taxonomia.claim_conceitos;
CREATE POLICY "claim_conceitos_select_owner" ON taxonomia.claim_conceitos
    FOR SELECT TO authenticated
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "claim_conceitos_insert_owner" ON taxonomia.claim_conceitos;
CREATE POLICY "claim_conceitos_insert_owner" ON taxonomia.claim_conceitos
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "claim_conceitos_update_owner" ON taxonomia.claim_conceitos;
CREATE POLICY "claim_conceitos_update_owner" ON taxonomia.claim_conceitos
    FOR UPDATE TO authenticated
    USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "claim_conceitos_delete_owner" ON taxonomia.claim_conceitos;
CREATE POLICY "claim_conceitos_delete_owner" ON taxonomia.claim_conceitos
    FOR DELETE TO authenticated
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "claim_conceitos_service_role" ON taxonomia.claim_conceitos;
CREATE POLICY "claim_conceitos_service_role" ON taxonomia.claim_conceitos
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- 7. GRANTS
GRANT SELECT, INSERT, UPDATE, DELETE ON taxonomia.skos_conceitos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON taxonomia.skos_relacoes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON taxonomia.claim_conceitos TO authenticated;

GRANT ALL ON taxonomia.skos_conceitos TO service_role;
GRANT ALL ON taxonomia.skos_relacoes TO service_role;
GRANT ALL ON taxonomia.claim_conceitos TO service_role;
