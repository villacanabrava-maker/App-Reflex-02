# Análise de Schema Drift — App Reflex 02

**Data da Análise:** 18 de setembro de 2026  
**Repositório Git:** `main`  
**Supabase Canônico:** `xenapowdtfhdwcfthfrn`  

---

## 1. O que foi Encontrado na Auditoria Inicial (Drift Detectado)

Antes da reconciliação da Missão MIS-0003, o banco de dados apresentava o seguinte drift em relação ao repositório Git:

1. **Migrations Não Executadas:**
   - As migrations `0026_motor_taxonomia_automatica.sql`, `0027_grants_propostas_atualizacao.sql`, `0028_dimensoes_canonicas_readonly.sql` e `0029_limite_upload_biblioteca_50mb.sql` existiam no repositório, mas não haviam sido executadas no banco.
2. **Tabelas Ausentes no Banco:**
   - `taxonomia.analises` (necessária para idempotência e controle do motor taxonômico).
   - `taxonomia.conceitos_reflexoes` (necessária para conectar conceitos às reflexões finais).
3. **RLS Desativado em `cerebro_autoral.dimensoes`:**
   - A tabela das 18 dimensões canônicas estava com RLS desligado (`rowsecurity: false`) e com privilégios irrestritos para `authenticated`.
4. **RLS Desativado no Schema `sistema`:**
   - `sistema.configuracoes_usuario`, `sistema.modelos_ia`, `sistema.perfis_embedding`, `sistema.prompts`, `sistema.versoes_pipeline` e `sistema.versoes_prompts` estavam com RLS desligado.
5. **Limite do Bucket de Originais:**
   - `originais-biblioteca` estava configurado com limite antigo de 500 MB em vez da política de 50 MB.

---

## 2. Ações de Reconciliação Executadas

1. **Execução das Migrations Pendentes:**
   - Migrations 0026, 0027, 0028 e 0029 foram aplicadas com sucesso.
2. **Criação e Aplicação da Migration 0030:**
   - `0030_sistema_rls_hardening.sql` foi criada para habilitar RLS em todas as tabelas de `sistema.*`, garantindo isolamento por usuário em `configuracoes_usuario` e proteção somente-leitura autenticada para os catálogos.
3. **Alinhamento dos Históricos:**
   - Registros sincronizados em `supabase_migrations.schema_migrations` e `public._migrations`.

---

## 3. Estado Atual do Drift

- **Schema Drift Remanescente:** **ZERO (0%)**.
- Todas as 30 migrations versionadas no repositório estão materializadas no banco de dados e refletidas no código de domínio da aplicação.
