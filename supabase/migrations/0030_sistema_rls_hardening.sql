-- ==============================================================================
-- MIGRATION 0030: HARDENING DE RLS E PRIVILÉGIOS NO SCHEMA SISTEMA
-- App Reflex 02
--
-- Objetivos:
-- 1. Ativar RLS e isolamento por usuário em sistema.configuracoes_usuario.
-- 2. Ativar RLS e permitir estritamente leitura (SELECT) a authenticated nos
--    catálogos globais (modelos_ia, perfis_embedding, prompts, versoes_pipeline, versoes_prompts).
-- 3. Bloquear mutações (INSERT, UPDATE, DELETE, TRUNCATE) por clientes authenticated.
-- 4. Preservar controle total administrativo exclusivo para service_role.
-- ==============================================================================

-- 1. Isolamento estrito de configurações do usuário
ALTER TABLE sistema.configuracoes_usuario ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sistema.configuracoes_usuario FROM anon;

DROP POLICY IF EXISTS "Usuarios gerenciam suas proprias configuracoes"
  ON sistema.configuracoes_usuario;

CREATE POLICY "Usuarios gerenciam suas proprias configuracoes"
  ON sistema.configuracoes_usuario
  FOR ALL
  TO authenticated
  USING ((select auth.uid()) = usuario_id)
  WITH CHECK ((select auth.uid()) = usuario_id);

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE sistema.configuracoes_usuario
  TO authenticated;

GRANT ALL
  ON TABLE sistema.configuracoes_usuario
  TO service_role;

-- 2. Hardening dos Catálogos Globais do Sistema

-- 2.1 Modelos de IA
ALTER TABLE sistema.modelos_ia ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE sistema.modelos_ia FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE sistema.modelos_ia FROM authenticated;
GRANT SELECT ON TABLE sistema.modelos_ia TO authenticated;
GRANT ALL ON TABLE sistema.modelos_ia TO service_role;

DROP POLICY IF EXISTS "Usuarios autenticados consultam modelos de IA" ON sistema.modelos_ia;
CREATE POLICY "Usuarios autenticados consultam modelos de IA"
  ON sistema.modelos_ia
  FOR SELECT
  TO authenticated
  USING (true);

-- 2.2 Perfis de Embedding
ALTER TABLE sistema.perfis_embedding ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE sistema.perfis_embedding FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE sistema.perfis_embedding FROM authenticated;
GRANT SELECT ON TABLE sistema.perfis_embedding TO authenticated;
GRANT ALL ON TABLE sistema.perfis_embedding TO service_role;

DROP POLICY IF EXISTS "Usuarios autenticados consultam perfis de embedding" ON sistema.perfis_embedding;
CREATE POLICY "Usuarios autenticados consultam perfis de embedding"
  ON sistema.perfis_embedding
  FOR SELECT
  TO authenticated
  USING (true);

-- 2.3 Prompts
ALTER TABLE sistema.prompts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE sistema.prompts FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE sistema.prompts FROM authenticated;
GRANT SELECT ON TABLE sistema.prompts TO authenticated;
GRANT ALL ON TABLE sistema.prompts TO service_role;

DROP POLICY IF EXISTS "Usuarios autenticados consultam prompts do sistema" ON sistema.prompts;
CREATE POLICY "Usuarios autenticados consultam prompts do sistema"
  ON sistema.prompts
  FOR SELECT
  TO authenticated
  USING (true);

-- 2.4 Versões de Prompts
ALTER TABLE sistema.versoes_prompts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE sistema.versoes_prompts FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE sistema.versoes_prompts FROM authenticated;
GRANT SELECT ON TABLE sistema.versoes_prompts TO authenticated;
GRANT ALL ON TABLE sistema.versoes_prompts TO service_role;

DROP POLICY IF EXISTS "Usuarios autenticados consultam versoes de prompts" ON sistema.versoes_prompts;
CREATE POLICY "Usuarios autenticados consultam versoes de prompts"
  ON sistema.versoes_prompts
  FOR SELECT
  TO authenticated
  USING (true);

-- 2.5 Versões de Pipeline
ALTER TABLE sistema.versoes_pipeline ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE sistema.versoes_pipeline FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE sistema.versoes_pipeline FROM authenticated;
GRANT SELECT ON TABLE sistema.versoes_pipeline TO authenticated;
GRANT ALL ON TABLE sistema.versoes_pipeline TO service_role;

DROP POLICY IF EXISTS "Usuarios autenticados consultam versoes de pipeline" ON sistema.versoes_pipeline;
CREATE POLICY "Usuarios autenticados consultam versoes de pipeline"
  ON sistema.versoes_pipeline
  FOR SELECT
  TO authenticated
  USING (true);

-- Notificar PostgREST para recarregar o schema cache
NOTIFY pgrst, 'reload schema';
