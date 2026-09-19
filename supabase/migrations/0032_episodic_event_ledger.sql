-- ============================================================================
-- MIGRATION 0032: EPISODIC EVENT LEDGER & EPITEMIC TIMELINE (WAVE 2)
-- Projeto: Cérebro Autoral / Memória Reflexiva (App Reflex 02)
-- Idioma canônico: Português do Brasil
-- Padrão: EXPAND-FIRST (Estritamente Aditiva, Imutável, Append-Only)
-- ============================================================================

-- 1. TIPOS ENUM CANÔNICOS DA MEMÓRIA EPISÓDICA
DO $$
BEGIN
    -- Dimensão: Tipos de Eventos da Memória Episódica
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'tipo_evento' AND n.nspname = 'cerebro_autoral') THEN
        CREATE TYPE cerebro_autoral.tipo_evento AS ENUM (
            'CLAIM_CREATED',
            'CLAIM_VALIDATED',
            'CLAIM_REJECTED',
            'CLAIM_PROPOSED',
            'CLAIM_CONFIRMED_BY_AUTHOR',
            'CLAIM_REJECTED_BY_AUTHOR',
            'CLAIM_SUPERSEDED',
            'CONTRADICTION_DETECTED',
            'SOURCE_INGESTED',
            'SOURCE_REPROCESSED',
            'LEGACY_STATE_IMPORTED'
        );
    END IF;

    -- Dimensão: Tipos de Atores Responsáveis
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'tipo_ator' AND n.nspname = 'cerebro_autoral') THEN
        CREATE TYPE cerebro_autoral.tipo_ator AS ENUM (
            'HUMAN',
            'EXTRACTOR_PIPELINE',
            'NLI_VALIDATOR',
            'COGNITIVE_AGENT',
            'SYSTEM_WORKER',
            'IMPORTER'
        );
    END IF;
END $$;

-- 2. TABELA PRINCIPAL: cerebro_autoral.memory_events (Memória Episódica Append-Only)
CREATE TABLE IF NOT EXISTS cerebro_autoral.memory_events (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type cerebro_autoral.tipo_evento NOT NULL,
    actor_type cerebro_autoral.tipo_ator NOT NULL,
    actor_id TEXT NOT NULL,
    aggregate_type TEXT NOT NULL DEFAULT 'claim',
    aggregate_id UUID NOT NULL,
    correlation_id UUID NOT NULL DEFAULT extensions.gen_random_uuid(),
    causation_event_id UUID REFERENCES cerebro_autoral.memory_events(id),
    idempotency_key TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    schema_version INTEGER NOT NULL DEFAULT 1,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    -- Idempotência estrita por tenant: não permite registrar o mesmo evento duas vezes
    CONSTRAINT uq_memory_events_idempotency UNIQUE (usuario_id, idempotency_key)
);

COMMENT ON TABLE cerebro_autoral.memory_events IS 'Memória episódica append-only e imutável de todos os eventos cognitivos e transições epistemológicas do Cérebro Reflex.';

-- 3. ÍNDICES DE DESEMPENHO E AUDITORIA DA TIMELINE
CREATE INDEX IF NOT EXISTS idx_memory_events_aggregate 
    ON cerebro_autoral.memory_events (usuario_id, aggregate_type, aggregate_id, recorded_at ASC);

CREATE INDEX IF NOT EXISTS idx_memory_events_timeline 
    ON cerebro_autoral.memory_events (usuario_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_memory_events_causation 
    ON cerebro_autoral.memory_events (causation_event_id) 
    WHERE causation_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_memory_events_correlation 
    ON cerebro_autoral.memory_events (usuario_id, correlation_id);

-- 4. TRIGGER DE IMUTABILIDADE REAL (BLOQUEIA UPDATE E DELETE)
CREATE OR REPLACE FUNCTION cerebro_autoral.trg_fn_memory_events_immutable()
RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'A memória episódica é imutável: eventos não podem ser alterados ou excluídos da tabela cerebro_autoral.memory_events.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_memory_events_immutable ON cerebro_autoral.memory_events;
CREATE TRIGGER trg_memory_events_immutable
    BEFORE UPDATE OR DELETE ON cerebro_autoral.memory_events
    FOR EACH ROW
    EXECUTE FUNCTION cerebro_autoral.trg_fn_memory_events_immutable();

-- 5. VINCULAÇÃO FK DE ORIGIN_EVENT EM CLAIMS
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_claims_origin_event'
          AND table_schema = 'cerebro_autoral'
          AND table_name = 'claims'
    ) THEN
        ALTER TABLE cerebro_autoral.claims
            ADD CONSTRAINT fk_claims_origin_event
            FOREIGN KEY (origin_event_id)
            REFERENCES cerebro_autoral.memory_events(id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- 6. HARDENING DE RLS: FECHAMENTO DE MUTAÇÃO ARBITRÁRIA POR CLIENTES
-- Removemos UPDATE e DELETE direto por clientes em claims e provenance.
-- Toda transição de estado DEVE passar pela RPC transacional controlada.
DROP POLICY IF EXISTS "claims_update_owner" ON cerebro_autoral.claims;
DROP POLICY IF EXISTS "claims_delete_owner" ON cerebro_autoral.claims;
DROP POLICY IF EXISTS "provenance_delete_owner" ON cerebro_autoral.claim_provenance;

-- Inserção de claims por clientes permitida apenas em estados iniciais seguros
DROP POLICY IF EXISTS "claims_insert_owner" ON cerebro_autoral.claims;
CREATE POLICY "claims_insert_owner" ON cerebro_autoral.claims
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = usuario_id 
        AND epistemic_status IN ('observed', 'extracted', 'proposed')
    );

-- 7. HABILITAÇÃO DE RLS E POLÍTICAS NA MEMÓRIA EPISÓDICA
ALTER TABLE cerebro_autoral.memory_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "memory_events_select_owner" ON cerebro_autoral.memory_events;
CREATE POLICY "memory_events_select_owner" ON cerebro_autoral.memory_events
    FOR SELECT TO authenticated
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "memory_events_insert_owner" ON cerebro_autoral.memory_events;
CREATE POLICY "memory_events_insert_owner" ON cerebro_autoral.memory_events
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "memory_events_service_role" ON cerebro_autoral.memory_events;
CREATE POLICY "memory_events_service_role" ON cerebro_autoral.memory_events
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- 8. RPC TRANSACIONAL SEGURA COM ROW LOCKING E SOBERANIA AUTORAL
CREATE OR REPLACE FUNCTION cerebro_autoral.transicionar_estado_claim(
    p_claim_id UUID,
    p_novo_status cerebro_autoral.estado_epistemologico,
    p_ator_tipo cerebro_autoral.tipo_ator,
    p_ator_id TEXT,
    p_justificativa TEXT,
    p_causation_event_id UUID DEFAULT NULL,
    p_idempotency_key TEXT DEFAULT NULL,
    p_payload_extra JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = cerebro_autoral, extensions, public, pg_temp
AS $$
DECLARE
    v_usuario_id UUID;
    v_claim RECORD;
    v_event_id UUID;
    v_event_type cerebro_autoral.tipo_evento;
    v_idempotency_key TEXT;
BEGIN
    -- 1. Verificação de Autenticação
    v_usuario_id := auth.uid();
    IF v_usuario_id IS NULL THEN
        RAISE EXCEPTION 'Acesso negado: operação requer usuário autenticado.';
    END IF;

    -- 2. Concorrência Segura: Bloqueio Pessimista na Linha do Claim (FOR UPDATE)
    SELECT * INTO v_claim
    FROM cerebro_autoral.claims
    WHERE id = p_claim_id AND usuario_id = v_usuario_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Claim % não encontrado ou você não tem permissão para alterá-lo.', p_claim_id;
    END IF;

    -- 3. Idempotência: Se já está no estado desejado, retorna sem erro
    IF v_claim.epistemic_status = p_novo_status THEN
        RETURN jsonb_build_object(
            'success', true,
            'claim_id', p_claim_id,
            'status_anterior', v_claim.epistemic_status,
            'novo_status', p_novo_status,
            'idempotent', true
        );
    END IF;

    -- 4. Salvaguarda Inviolável de Soberania Autoral
    -- Invariant: 'confirmed_authorial' EXIGE ator HUMAN e estado prévio válido
    IF p_novo_status = 'confirmed_authorial' THEN
        IF p_ator_tipo <> 'HUMAN' THEN
            RAISE EXCEPTION 'Soberania autoral violada: apenas o HUMAN pode confirmar afirmações autorais. Ator rejeitado: %', p_ator_tipo;
        END IF;

        IF v_claim.epistemic_status = 'rejected' THEN
            RAISE EXCEPTION 'Transição ilegal: claim no estado "rejected" deve passar por nova proposta antes de ser confirmado.';
        END IF;
    END IF;

    -- Reversão de confirmação autoral também exige ação humana
    IF v_claim.epistemic_status = 'confirmed_authorial' AND p_novo_status IN ('rejected', 'superseded') THEN
        IF p_ator_tipo <> 'HUMAN' THEN
            RAISE EXCEPTION 'Soberania autoral violada: apenas o HUMAN pode revogar ou rejeitar uma crença confirmada do autor.';
        END IF;
    END IF;

    -- 5. Mapeamento do Tipo de Evento Episódico
    IF p_novo_status = 'confirmed_authorial' THEN
        v_event_type := 'CLAIM_CONFIRMED_BY_AUTHOR';
    ELSIF p_novo_status = 'rejected' THEN
        IF p_ator_tipo = 'HUMAN' THEN
            v_event_type := 'CLAIM_REJECTED_BY_AUTHOR';
        ELSE
            v_event_type := 'CLAIM_REJECTED';
        END IF;
    ELSIF p_novo_status = 'proposed' THEN
        v_event_type := 'CLAIM_PROPOSED';
    ELSIF p_novo_status = 'superseded' THEN
        v_event_type := 'CLAIM_SUPERSEDED';
    ELSIF p_novo_status = 'consolidated' THEN
        v_event_type := 'CLAIM_VALIDATED';
    ELSE
        v_event_type := 'CLAIM_VALIDATED';
    END IF;

    -- 6. Definição da Chave de Idempotência
    v_idempotency_key := COALESCE(
        p_idempotency_key, 
        'transicao:' || p_claim_id || ':' || p_novo_status || ':' || clock_timestamp()
    );

    -- 7. Gravação Transacional no Event Ledger Append-Only
    INSERT INTO cerebro_autoral.memory_events (
        usuario_id,
        event_type,
        actor_type,
        actor_id,
        aggregate_type,
        aggregate_id,
        causation_event_id,
        idempotency_key,
        payload
    ) VALUES (
        v_usuario_id,
        v_event_type,
        p_ator_tipo,
        p_ator_id,
        'claim',
        p_claim_id,
        p_causation_event_id,
        v_idempotency_key,
        jsonb_build_object(
            'status_anterior', v_claim.epistemic_status,
            'novo_status', p_novo_status,
            'justificativa', p_justificativa,
            'payload_extra', p_payload_extra
        )
    ) RETURNING id INTO v_event_id;

    -- 8. Atualização Atômica da Projeção de Estado em cerebro_autoral.claims
    UPDATE cerebro_autoral.claims
    SET epistemic_status = p_novo_status,
        atualizado_em = clock_timestamp()
    WHERE id = p_claim_id;

    -- 9. Retorno com Auditoria Completa
    RETURN jsonb_build_object(
        'success', true,
        'claim_id', p_claim_id,
        'status_anterior', v_claim.epistemic_status,
        'novo_status', p_novo_status,
        'event_id', v_event_id,
        'event_type', v_event_type,
        'idempotent', false
    );
END;
$$;

-- 9. PERMISSÕES DE EXECUÇÃO E ACESSO
GRANT EXECUTE ON FUNCTION cerebro_autoral.transicionar_estado_claim TO authenticated, service_role;
GRANT SELECT, INSERT ON cerebro_autoral.memory_events TO authenticated;
GRANT ALL ON cerebro_autoral.memory_events TO service_role;
