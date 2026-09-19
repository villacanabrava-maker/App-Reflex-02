-- ============================================================================
-- MIGRATION 0038: PRODUCTION READINESS HARDENING
-- Projeto: App Reflex 02
-- Objetivo: fechar trust boundaries antes de qualquer deploy Vercel.
-- ============================================================================

-- 1. Snapshots e relatórios periciais só podem ser persistidos pelo backend
--    administrativo. Usuários autenticados continuam podendo ler os próprios
--    registros via RLS, mas não podem fabricar snapshots/laudos.
REVOKE EXECUTE ON FUNCTION reflexoes.persistir_dossie_snapshot(
  UUID, UUID, UUID, TEXT, TEXT, INTEGER, INTEGER, TEXT, JSONB, BOOLEAN
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION reflexoes.persistir_dossie_snapshot(
  UUID, UUID, UUID, TEXT, TEXT, INTEGER, INTEGER, TEXT, JSONB, BOOLEAN
) TO service_role;

REVOKE EXECUTE ON FUNCTION auditoria.registrar_relatorio_auditoria_v3_1(
  UUID, UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, JSONB,
  NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, JSONB
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION auditoria.registrar_relatorio_auditoria_v3_1(
  UUID, UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, JSONB,
  NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, JSONB
) TO service_role;

-- 2. Retrieval cognitivo é uma operação de backend. Evita expor uma função
--    SECURITY DEFINER genérica diretamente ao cliente autenticado.
REVOKE EXECUTE ON FUNCTION public.buscar_multi_sinal_v3_1(
  UUID, TEXT, extensions.vector, UUID[], INTEGER, NUMERIC, BOOLEAN, BOOLEAN
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.buscar_multi_sinal_v3_1(
  UUID, TEXT, extensions.vector, UUID[], INTEGER, NUMERIC, BOOLEAN, BOOLEAN
) TO service_role;

-- 3. Fixar search_path em funções apontadas pelo Database Linter.
ALTER FUNCTION cerebro_autoral.trg_fn_memory_events_immutable()
  SET search_path = pg_catalog, cerebro_autoral;

ALTER FUNCTION cerebro_autoral.validar_transicao_epistemica(
  cerebro_autoral.estado_epistemologico,
  cerebro_autoral.estado_epistemologico,
  cerebro_autoral.tipo_ator
) SET search_path = pg_catalog, cerebro_autoral;

ALTER FUNCTION reflexoes.impedir_mutacao_dossie_snapshot()
  SET search_path = pg_catalog, reflexoes;

ALTER FUNCTION auditoria.impedir_mutacao_relatorio_auditoria_v31()
  SET search_path = pg_catalog, auditoria;

ALTER FUNCTION public.buscar_multi_sinal_v3_1(
  UUID, TEXT, extensions.vector, UUID[], INTEGER, NUMERIC, BOOLEAN, BOOLEAN
) SET search_path = pg_catalog, public, aplicacao, processamento, cerebro_autoral, taxonomia, biblioteca, extensions;

ALTER FUNCTION public.curar_conceito_skos_humano(UUID, TEXT, TEXT, UUID)
  SET search_path = pg_catalog, public, aplicacao, taxonomia, auth;

ALTER FUNCTION public.curar_vinculo_claim_conceito_humano(UUID, TEXT)
  SET search_path = pg_catalog, public, aplicacao, taxonomia, auth;

ALTER FUNCTION public.propor_conceito_skos_sistema(
  UUID, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, JSONB
) SET search_path = pg_catalog, public, aplicacao, taxonomia;

ALTER FUNCTION public.propor_vinculo_claim_conceito_sistema(
  UUID, UUID, UUID, TEXT, NUMERIC, JSONB
) SET search_path = pg_catalog, public, aplicacao, taxonomia, cerebro_autoral;

-- 4. O cliente autenticado pode ler seu Cérebro, mas não criar/confirmar
--    diretamente características ou regras por CRUD genérico.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON TABLE cerebro_autoral.caracteristicas FROM authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON TABLE cerebro_autoral.regras FROM authenticated;

DROP POLICY IF EXISTS "Usuário gerencia características do cérebro"
  ON cerebro_autoral.caracteristicas;
DROP POLICY IF EXISTS "caracteristicas_select_owner"
  ON cerebro_autoral.caracteristicas;
CREATE POLICY "caracteristicas_select_owner"
  ON cerebro_autoral.caracteristicas
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = usuario_id);

DROP POLICY IF EXISTS "Usuário gerencia regras do cérebro"
  ON cerebro_autoral.regras;
DROP POLICY IF EXISTS "regras_select_owner"
  ON cerebro_autoral.regras;
CREATE POLICY "regras_select_owner"
  ON cerebro_autoral.regras
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = usuario_id);

-- 5. Registro no ledger canônico do próprio aplicativo.
INSERT INTO public._migrations (nome, executado_em)
SELECT '0038_production_readiness_hardening.sql', clock_timestamp()
WHERE NOT EXISTS (
  SELECT 1 FROM public._migrations
  WHERE nome = '0038_production_readiness_hardening.sql'
);

NOTIFY pgrst, 'reload schema';
