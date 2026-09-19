-- ============================================================================
-- MIGRATION 0036: RETRIEVAL MULTI-SINAL V3.1 E SNAPSHOTS DE DOSSIÊ (WAVE 4)
-- Projeto: Cérebro Autoral / Memória Reflexiva (App Reflex 02)
-- Idioma canônico: Português do Brasil
-- Padrão: EXPAND-FIRST / SECURITY DEFINER HARDENED / RRF FUSION
-- ============================================================================

-- 1. TABELA DE SNAPSHOTS IMUTÁVEIS DE DOSSIÊ (WORKING MEMORY PERSISTÍVEL)
CREATE TABLE IF NOT EXISTS reflexoes.dossies_snapshots (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entrada_id UUID REFERENCES reflexoes.entradas(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    intent TEXT NOT NULL,
    target_token_budget INTEGER NOT NULL,
    actual_tokens_total INTEGER NOT NULL,
    snapshot_hash TEXT NOT NULL,
    dossie_json JSONB NOT NULL,
    abstained BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_dossie_snapshot_tenant UNIQUE (id, usuario_id)
);

COMMENT ON TABLE reflexoes.dossies_snapshots IS 'Snapshots reproduzíveis da Memória Operacional (Dossiê V3.1) gerados para reflexões.';

-- RLS para snapshots de dossiê
ALTER TABLE reflexoes.dossies_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dossies_snapshots_select_owner" ON reflexoes.dossies_snapshots;
CREATE POLICY "dossies_snapshots_select_owner" ON reflexoes.dossies_snapshots
    FOR SELECT TO authenticated
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "dossies_snapshots_insert_owner" ON reflexoes.dossies_snapshots;
CREATE POLICY "dossies_snapshots_insert_owner" ON reflexoes.dossies_snapshots
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "dossies_snapshots_service_role" ON reflexoes.dossies_snapshots;
CREATE POLICY "dossies_snapshots_service_role" ON reflexoes.dossies_snapshots
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_dossies_snapshots_usuario ON reflexoes.dossies_snapshots (usuario_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_dossies_snapshots_hash ON reflexoes.dossies_snapshots (usuario_id, snapshot_hash);

-- 2. RPC DE RETRIEVAL MULTI-SINAL V3.1 (RRF, SKOS MATCH, SINAIS SEPARADOS E PROTEÇÃO DE TENANT)
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
    -- Se executado por authenticated, SEMPRE força o tenant derivado de auth.uid()
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
    -- 1. Pool Vetorial Denso
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
    -- 2. Pool Léxico (FTS Português)
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
    -- 3. Ancoragem Taxonômica SKOS
    candidatos_taxonomia AS (
        SELECT DISTINCT
            c.provenance->>'source_id' AS frag_str_id,
            true AS match_skos
        FROM cerebro_autoral.claims c
        JOIN taxonomia.claim_conceitos cc ON cc.claim_id = c.id AND cc.usuario_id = v_usuario_id
        WHERE c.usuario_id = v_usuario_id
          AND array_length(p_conceitos_ids, 1) > 0
          AND cc.conceito_id = ANY(p_conceitos_ids)
          AND cc.status IN ('confirmed', 'proposed')
    ),
    -- 4. União de Candidatos
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
        -- RRF Score: soma recíproca dos ranks + bônus de taxonomia
        ROUND(
            (
                COALESCE(1.0 / (p_rrf_k + cv.rank_denso), 0.0) +
                COALESCE(1.0 / (p_rrf_k + cl.rank_lexico), 0.0) +
                CASE WHEN ct.match_skos IS TRUE THEN 0.015 ELSE 0.0 END
            )::NUMERIC, 6
        ) AS score_rrf,
        cv.rank_denso AS dense_rank,
        cl.rank_lexico AS lexical_rank,
        COALESCE(ct.match_skos, FALSE) AS taxonomy_match,
        1.0::NUMERIC AS temporal_fit,
        'extracted'::TEXT AS epistemic_status,
        FALSE AS counterevidence_flag
    FROM candidatos_unificados cu
    JOIN processamento.fragmentos f ON f.id = cu.id
    LEFT JOIN candidatos_vetoriais cv ON cv.id = cu.id
    LEFT JOIN candidatos_lexicos cl ON cl.id = cu.id
    LEFT JOIN candidatos_taxonomia ct ON ct.frag_str_id = f.id::text
    LEFT JOIN processamento.secoes s ON s.id = f.secao_id
    JOIN processamento.documentos_processados dp ON dp.id = f.documento_processado_id
    JOIN biblioteca.versoes_obras vo ON vo.id = dp.versao_obra_id
    JOIN biblioteca.obras o ON o.id = vo.obra_id
    WHERE f.usuario_id = v_usuario_id
      AND dp.estado_publicacao = 'ativo'
      AND (NOT p_apenas_autorais OR o.natureza = 'autoral')
    ORDER BY score_rrf DESC
    LIMIT p_limite;
END;
$$;

-- 3. FACHADA EM PUBLIC E GRANTS DE EXECUÇÃO
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

REVOKE EXECUTE ON FUNCTION public.buscar_multi_sinal_v3_1(
    UUID, TEXT, extensions.vector, UUID[], INTEGER, NUMERIC, BOOLEAN, BOOLEAN
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.buscar_multi_sinal_v3_1(
    UUID, TEXT, extensions.vector, UUID[], INTEGER, NUMERIC, BOOLEAN, BOOLEAN
) TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';
