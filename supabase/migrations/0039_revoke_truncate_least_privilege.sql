-- ============================================================================
-- MIGRATION 0039: REVOKE TRUNCATE FROM AUTHENTICATED (LEAST PRIVILEGE)
-- Projeto: App Reflex 02
-- Objetivo: fechar uma lacuna de privilégio encontrada em auditoria completa
--   do banco (2026-09-20): TRUNCATE não é coberto por Row Level Security no
--   PostgreSQL (RLS só se aplica a SELECT/INSERT/UPDATE/DELETE). Diversas
--   tabelas concediam TRUNCATE ao papel `authenticated` como parte de um
--   GRANT ALL amplo aplicado em migrations anteriores, sem que isso fosse
--   percebido — nenhum database linter/advisor do Supabase sinaliza esse
--   caso especificamente.
--
--   Risco: hoje contido, porque a API REST (PostgREST) usada pelo app não
--   expõe um verbo de TRUNCATE. Mas é uma violação real do princípio de
--   menor privilégio deste projeto e um risco de blast-radius caso qualquer
--   RPC futura execute SQL dinâmico como `authenticated`.
--
-- Também revoga EXECUTE de `anon` em duas funções SECURITY DEFINER de
-- transição de estado de claim que já se protegem internamente
-- (auth.uid() IS NULL levanta exceção), mas não deveriam ter o GRANT em
-- primeiro lugar — defesa em profundidade, não uma correção de uma falha
-- ativa.
-- ============================================================================

-- 1. Revoga TRUNCATE de authenticated em todas as tabelas de aplicação.
--    INSERT/SELECT/UPDATE/DELETE permanecem inalterados; apenas TRUNCATE sai.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT n.nspname AS schema_name, c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'
      AND n.nspname IN (
        'auditoria', 'biblioteca', 'cerebro_autoral', 'processamento',
        'public', 'reflexoes', 'sistema', 'taxonomia'
      )
      AND has_table_privilege('authenticated', c.oid, 'TRUNCATE')
  LOOP
    EXECUTE format(
      'REVOKE TRUNCATE ON TABLE %I.%I FROM authenticated;',
      r.schema_name, r.table_name
    );
  END LOOP;
END $$;

-- 2. Higiene de privilégio: anon não deveria ter EXECUTE nas funções de
--    transição de estado de claim, mesmo que hoje sejam seguras por guarda
--    interna (auth.uid() IS NULL -> exceção; sem promoção autoral por ator
--    sistêmico).
REVOKE EXECUTE ON FUNCTION cerebro_autoral.transicionar_estado_claim(
  UUID, cerebro_autoral.estado_epistemologico, cerebro_autoral.tipo_ator,
  TEXT, TEXT, UUID, TEXT, JSONB
) FROM anon;

REVOKE EXECUTE ON FUNCTION cerebro_autoral.transicionar_estado_claim_humano(
  UUID, cerebro_autoral.estado_epistemologico, TEXT, UUID, TEXT, JSONB
) FROM anon;
