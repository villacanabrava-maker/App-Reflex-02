-- ============================================================================
-- MIGRATION 0033: EVENT LEDGER HARDENING & CONTROLLED-APPEND-ONLY (WAVE 3 - GATE 0)
-- Projeto: Cérebro Autoral / Memória Reflexiva (App Reflex 02)
-- Idioma canônico: Português do Brasil
-- Padrão: EXPAND-FIRST (Imutável, Anti-Forgery, Anti-Cross-Tenant, State Machine)
-- ============================================================================

-- 1. REVOGAÇÃO DE INSERÇÃO DIRETA EM MEMORY_EVENTS (PROIBIÇÃO DE EVENT FORGERY)
-- Clientes authenticated NUNCA podem inserir diretamente em memory_events.
-- Apenas RPCs com SECURITY DEFINER controladas e service_role podem registrar eventos.
DROP POLICY IF EXISTS "memory_events_insert_owner" ON cerebro_autoral.memory_events;

-- 2. CONSTRAINT DE UNICIDADE COMPOSTA MULTI-TENANT EM MEMORY_EVENTS
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'uq_memory_events_id_usuario'
          AND table_schema = 'cerebro_autoral'
          AND table_name = 'memory_events'
    ) THEN
        ALTER TABLE cerebro_autoral.memory_events
            ADD CONSTRAINT uq_memory_events_id_usuario UNIQUE (id, usuario_id);
    END IF;
END $$;

-- 3. ADIÇÃO DE COLUNAS DE PARIDADE TYPESCRIPT <-> POSTGRESQL
ALTER TABLE cerebro_autoral.memory_events
    ADD COLUMN IF NOT EXISTS occurred_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    ADD COLUMN IF NOT EXISTS from_epistemic_status cerebro_autoral.estado_epistemologico NULL,
    ADD COLUMN IF NOT EXISTS to_epistemic_status cerebro_autoral.estado_epistemologico NOT NULL DEFAULT 'observed';

-- Padronização da nomenclatura da coluna de versão de schema
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'cerebro_autoral' AND table_name = 'memory_events' AND column_name = 'schema_version'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'cerebro_autoral' AND table_name = 'memory_events' AND column_name = 'payload_schema_version'
    ) THEN
        ALTER TABLE cerebro_autoral.memory_events RENAME COLUMN schema_version TO payload_schema_version;
    END IF;
END $$;

-- 4. INTEGRIDADE REFERENCIAL ANTI-CROSS-TENANT
-- Tenant A jamais pode associar seu claim ou evento a registros pertencentes ao Tenant B
ALTER TABLE cerebro_autoral.claims DROP CONSTRAINT IF EXISTS fk_claims_origin_event;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_claims_origin_event_tenant'
          AND table_schema = 'cerebro_autoral'
          AND table_name = 'claims'
    ) THEN
        ALTER TABLE cerebro_autoral.claims
            ADD CONSTRAINT fk_claims_origin_event_tenant
            FOREIGN KEY (origin_event_id, usuario_id)
            REFERENCES cerebro_autoral.memory_events(id, usuario_id)
            ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_memory_events_causation_tenant'
          AND table_schema = 'cerebro_autoral'
          AND table_name = 'memory_events'
    ) THEN
        ALTER TABLE cerebro_autoral.memory_events
            ADD CONSTRAINT fk_memory_events_causation_tenant
            FOREIGN KEY (causation_event_id, usuario_id)
            REFERENCES cerebro_autoral.memory_events(id, usuario_id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- 5. FUNÇÃO PURA DE VALIDAÇÃO DA MÁQUINA DE ESTADOS EPISTEMOLÓGICOS (POSTGRESQL)
CREATE OR REPLACE FUNCTION cerebro_autoral.validar_transicao_epistemica(
    p_from cerebro_autoral.estado_epistemologico,
    p_to cerebro_autoral.estado_epistemologico,
    p_actor cerebro_autoral.tipo_ator
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Se for idempotente (mesmo status), é permitida
    IF p_from = p_to THEN
        RETURN TRUE;
    END IF;

    -- Invariant de Soberania Autoral: 'confirmed_authorial' EXIGE ator HUMAN
    IF p_to = 'confirmed_authorial' AND p_actor <> 'HUMAN' THEN
        RAISE EXCEPTION 'Soberania autoral violada: apenas HUMAN pode promover para confirmed_authorial. Ator: %', p_actor;
    END IF;

    -- Reversão de confirmação autoral também exige ator HUMAN
    IF p_from = 'confirmed_authorial' AND p_actor <> 'HUMAN' THEN
        RAISE EXCEPTION 'Soberania autoral violada: apenas HUMAN pode alterar uma crença confirmada do autor. Ator: %', p_actor;
    END IF;

    -- Matriz Canônica Completa de Transições Legítimas
    IF (p_from = 'observed' AND p_to = 'quoted' AND p_actor = 'EXTRACTOR_PIPELINE') THEN RETURN TRUE;
    ELSIF (p_from = 'quoted' AND p_to = 'extracted' AND p_actor = 'NLI_VALIDATOR') THEN RETURN TRUE;
    ELSIF (p_from = 'extracted' AND p_to = 'proposed' AND p_actor IN ('COGNITIVE_AGENT', 'SYSTEM_WORKER')) THEN RETURN TRUE;
    ELSIF (p_from = 'proposed' AND p_to = 'confirmed_authorial' AND p_actor = 'HUMAN') THEN RETURN TRUE;
    ELSIF (p_from = 'proposed' AND p_to = 'rejected' AND p_actor IN ('HUMAN', 'NLI_VALIDATOR', 'COGNITIVE_AGENT')) THEN RETURN TRUE;
    ELSIF (p_from = 'extracted' AND p_to = 'rejected' AND p_actor IN ('NLI_VALIDATOR', 'HUMAN')) THEN RETURN TRUE;
    ELSIF (p_from = 'confirmed_authorial' AND p_to = 'superseded' AND p_actor = 'HUMAN') THEN RETURN TRUE;
    ELSIF (p_from = 'consolidated' AND p_to = 'superseded' AND p_actor IN ('SYSTEM_WORKER', 'HUMAN')) THEN RETURN TRUE;
    ELSIF (p_from = 'extracted' AND p_to = 'consolidated' AND p_actor = 'SYSTEM_WORKER') THEN RETURN TRUE;
    ELSIF (p_from = 'rejected' AND p_to = 'proposed' AND p_actor IN ('COGNITIVE_AGENT', 'HUMAN')) THEN RETURN TRUE;
    ELSIF (p_from = 'inferred' AND p_to = 'hypothesized' AND p_actor IN ('COGNITIVE_AGENT', 'SYSTEM_WORKER')) THEN RETURN TRUE;
    ELSIF (p_from = 'hypothesized' AND p_to = 'proposed' AND p_actor IN ('COGNITIVE_AGENT', 'HUMAN')) THEN RETURN TRUE;
    ELSIF (p_from = 'observed' AND p_to = 'extracted' AND p_actor IN ('EXTRACTOR_PIPELINE', 'NLI_VALIDATOR')) THEN RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Transição epistêmica inválida ou não autorizada pela máquina de estados: % -> % por ator %', p_from, p_to, p_actor;
    END IF;
END;
$$;

-- 6. RPC HUMANA: ACESSÍVEL EXCLUSIVAMENTE POR USUÁRIOS AUTENTICADOS
-- O banco fixa internamente: actor_type = 'HUMAN' e actor_id = auth.uid()::text.
-- O cliente NÃO informa seu ator.
CREATE OR REPLACE FUNCTION cerebro_autoral.transicionar_estado_claim_humano(
    p_claim_id UUID,
    p_novo_status cerebro_autoral.estado_epistemologico,
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
    v_agora TIMESTAMPTZ := clock_timestamp();
BEGIN
    -- 1. Autenticação Obrigatória
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

    -- 3. Idempotência Imediata
    IF v_claim.epistemic_status = p_novo_status THEN
        RETURN jsonb_build_object(
            'success', true,
            'claim_id', p_claim_id,
            'status_anterior', v_claim.epistemic_status,
            'novo_status', p_novo_status,
            'idempotent', true
        );
    END IF;

    -- 4. Validação Rigorosa da Máquina de Estados (Ator fixo HUMAN)
    PERFORM cerebro_autoral.validar_transicao_epistemica(v_claim.epistemic_status, p_novo_status, 'HUMAN'::cerebro_autoral.tipo_ator);

    -- 5. Mapeamento do Tipo de Evento
    IF p_novo_status = 'confirmed_authorial' THEN
        v_event_type := 'CLAIM_CONFIRMED_BY_AUTHOR';
    ELSIF p_novo_status = 'rejected' THEN
        v_event_type := 'CLAIM_REJECTED_BY_AUTHOR';
    ELSIF p_novo_status = 'proposed' THEN
        v_event_type := 'CLAIM_PROPOSED';
    ELSIF p_novo_status = 'superseded' THEN
        v_event_type := 'CLAIM_SUPERSEDED';
    ELSE
        v_event_type := 'CLAIM_VALIDATED';
    END IF;

    -- 6. Definição Determinística de Idempotência
    v_idempotency_key := COALESCE(
        p_idempotency_key,
        'transicao:humano:' || p_claim_id || ':' || p_novo_status || ':' || encode(digest(p_justificativa, 'sha256'), 'hex')
    );

    -- 7. Gravação Transacional no Event Ledger (com colunas de paridade)
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
        causation_event_id,
        idempotency_key,
        payload,
        payload_schema_version
    ) VALUES (
        v_usuario_id,
        v_event_type,
        'HUMAN'::cerebro_autoral.tipo_ator,
        v_usuario_id::text,
        'claim',
        p_claim_id,
        v_agora,
        v_agora,
        v_claim.epistemic_status,
        p_novo_status,
        p_causation_event_id,
        v_idempotency_key,
        jsonb_build_object(
            'status_anterior', v_claim.epistemic_status,
            'novo_status', p_novo_status,
            'justificativa', p_justificativa,
            'extra', p_payload_extra
        ),
        1
    ) RETURNING id INTO v_event_id;

    -- 8. Atualização Atômica da Projeção em claims
    UPDATE cerebro_autoral.claims
    SET epistemic_status = p_novo_status,
        origin_event_id = v_event_id,
        atualizado_em = v_agora
    WHERE id = p_claim_id;

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

-- 7. RPC SISTÊMICA: RESTRITA ESTRITAMENTE AO SERVICE_ROLE (BACKEND SEGURO)
-- Bloqueia taxativamente que atores sistêmicos definam confirmed_authorial ou ajam como HUMAN.
CREATE OR REPLACE FUNCTION cerebro_autoral.transicionar_estado_claim_sistema(
    p_usuario_id UUID,
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
    v_claim RECORD;
    v_event_id UUID;
    v_event_type cerebro_autoral.tipo_evento;
    v_idempotency_key TEXT;
    v_agora TIMESTAMPTZ := clock_timestamp();
BEGIN
    -- 1. Guardrail Inviolável: Atores sistêmicos não podem confirmar crença autoral
    IF p_novo_status = 'confirmed_authorial' THEN
        RAISE EXCEPTION 'Soberania autoral violada: atores sistêmicos não podem promover para confirmed_authorial.';
    END IF;

    -- 2. Guardrail Inviolável: RPC sistêmica não pode personificar ator HUMAN
    IF p_ator_tipo = 'HUMAN' THEN
        RAISE EXCEPTION 'Acesso negado: a RPC sistêmica não pode executar em nome do ator HUMAN.';
    END IF;

    -- 3. Concorrência Segura: Bloqueio Pessimista na Linha do Claim
    SELECT * INTO v_claim
    FROM cerebro_autoral.claims
    WHERE id = p_claim_id AND usuario_id = p_usuario_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Claim % do usuário % não encontrado.', p_claim_id, p_usuario_id;
    END IF;

    -- 4. Idempotência Imediata
    IF v_claim.epistemic_status = p_novo_status THEN
        RETURN jsonb_build_object(
            'success', true,
            'claim_id', p_claim_id,
            'status_anterior', v_claim.epistemic_status,
            'novo_status', p_novo_status,
            'idempotent', true
        );
    END IF;

    -- 5. Validação Rigorosa da Máquina de Estados
    PERFORM cerebro_autoral.validar_transicao_epistemica(v_claim.epistemic_status, p_novo_status, p_ator_tipo);

    -- 6. Mapeamento do Tipo de Evento
    IF p_novo_status = 'rejected' THEN
        v_event_type := 'CLAIM_REJECTED';
    ELSIF p_novo_status = 'proposed' THEN
        v_event_type := 'CLAIM_PROPOSED';
    ELSIF p_novo_status = 'superseded' THEN
        v_event_type := 'CLAIM_SUPERSEDED';
    ELSE
        v_event_type := 'CLAIM_VALIDATED';
    END IF;

    -- 7. Definição de Idempotência
    v_idempotency_key := COALESCE(
        p_idempotency_key,
        'transicao:sistema:' || p_claim_id || ':' || p_novo_status || ':' || encode(digest(p_justificativa, 'sha256'), 'hex')
    );

    -- 8. Gravação no Event Ledger
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
        causation_event_id,
        idempotency_key,
        payload,
        payload_schema_version
    ) VALUES (
        p_usuario_id,
        v_event_type,
        p_ator_tipo,
        p_ator_id,
        'claim',
        p_claim_id,
        v_agora,
        v_agora,
        v_claim.epistemic_status,
        p_novo_status,
        p_causation_event_id,
        v_idempotency_key,
        jsonb_build_object(
            'status_anterior', v_claim.epistemic_status,
            'novo_status', p_novo_status,
            'justificativa', p_justificativa,
            'extra', p_payload_extra
        ),
        1
    ) RETURNING id INTO v_event_id;

    -- 9. Atualização Atômica da Projeção em claims
    UPDATE cerebro_autoral.claims
    SET epistemic_status = p_novo_status,
        origin_event_id = v_event_id,
        atualizado_em = v_agora
    WHERE id = p_claim_id;

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

-- 8. REDEFINIÇÃO SEGURA DO DISPATCHER transicionar_estado_claim
-- Se for chamado por um usuário autenticado via cliente Supabase, força caminho humano seguro
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
BEGIN
    -- Se o chamador for autenticado direto (cliente web/mobile), NÃO confia em p_ator_tipo
    IF auth.role() = 'authenticated' THEN
        IF p_ator_tipo <> 'HUMAN' THEN
            RAISE EXCEPTION 'Acesso negado: clientes authenticated só podem transicionar como HUMAN.';
        END IF;
        RETURN cerebro_autoral.transicionar_estado_claim_humano(
            p_claim_id,
            p_novo_status,
            p_justificativa,
            p_causation_event_id,
            p_idempotency_key,
            p_payload_extra
        );
    ELSE
        -- Chamador é service_role ou backend interno com privilégios
        RETURN cerebro_autoral.transicionar_estado_claim_sistema(
            auth.uid(),
            p_claim_id,
            p_novo_status,
            p_ator_tipo,
            p_ator_id,
            p_justificativa,
            p_causation_event_id,
            p_idempotency_key,
            p_payload_extra
        );
    END IF;
END;
$$;

-- 9. PERMISSÕES DE ACESSO E PRIVILÉGIOS (LEAST PRIVILEGE)
REVOKE ALL ON FUNCTION cerebro_autoral.transicionar_estado_claim_sistema FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION cerebro_autoral.transicionar_estado_claim_sistema TO service_role;

GRANT EXECUTE ON FUNCTION cerebro_autoral.transicionar_estado_claim_humano TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION cerebro_autoral.transicionar_estado_claim TO authenticated, service_role;

-- 10. HARDENING DE INSERT EM CLAIMS: NENHUM CLIENTE PODE FABRICAR AUTORIA
DROP POLICY IF EXISTS "claims_insert_owner" ON cerebro_autoral.claims;
CREATE POLICY "claims_insert_owner" ON cerebro_autoral.claims
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = usuario_id 
        AND epistemic_status IN ('observed', 'extracted', 'proposed')
        AND source_role <> 'HUMAN_CONFIRMED'
    );
