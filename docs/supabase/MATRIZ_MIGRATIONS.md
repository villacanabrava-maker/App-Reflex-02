# Matriz de Paridade das Migrations — App Reflex 02

**Data:** 18 de setembro de 2026  
**Projeto Supabase:** `xenapowdtfhdwcfthfrn`  
**Total de Migrations Versionadas:** 30 (0001 a 0030)  
**Total de Migrations Aplicadas no Schema:** 30  

---

## 1. Tabela Forense de Paridade (0001 → 0030)

| Migration | Git | Histórico Oficial (`schema_migrations`) | Legado (`public._migrations`) | Efeito no Schema Material | Estado Final |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `0001_fundacao.sql` | Sim | Sim (histórico) | Sim | Schemas base, pgcrypto, uuid-ossp | **APLICADA-CONFIRMADA** |
| `0002_sistema_e_taxonomia.sql` | Sim | Sim (histórico) | Sim | Tabelas sistema.* e taxonomia.* | **APLICADA-CONFIRMADA** |
| `0003_biblioteca.sql` | Sim | Sim (histórico) | Sim | Tabelas biblioteca.obras, versoes | **APLICADA-CONFIRMADA** |
| `0004_processamento.sql` | Sim | Sim (histórico) | Sim | Tabelas processamento.*, pgvector | **APLICADA-CONFIRMADA** |
| `0005_taxonomia_e_cerebro.sql` | Sim | Sim (histórico) | Sim | cerebro_autoral.caracteristicas, regras | **APLICADA-CONFIRMADA** |
| `0006_reflexoes_e_auditoria.sql` | Sim | Sim (histórico) | Sim | reflexoes.* e auditoria.* | **APLICADA-CONFIRMADA** |
| `0007_storage_politicas_e_autenticacao.sql` | Sim | Sim (histórico) | Sim | Buckets originais e fontes | **APLICADA-CONFIRMADA** |
| `0008_motor_reflexoes_metodologico.sql` | Sim | Sim (histórico) | Sim | Planos de reflexão e citações | **APLICADA-CONFIRMADA** |
| `0009_tabela_usuarios_e_correcao_auth.sql` | Sim | Sim (histórico) | Sim | Trigger de sincronização de usuários | **APLICADA-CONFIRMADA** |
| `0010_hardening_seguranca_rls.sql` | Sim | Sim (histórico) | Sim | Reforço de RLS nas tabelas centrais | **APLICADA-CONFIRMADA** |
| `0011_modelo_fontes_dois_eixos.sql` | Sim | Sim (histórico) | Sim | Dois eixos de fontes | **APLICADA-CONFIRMADA** |
| `0012_cerebro_versionamento_e_propostas.sql` | Sim | Sim (histórico) | Sim | propostas_atualizacao e versoes | **APLICADA-CONFIRMADA** |
| `0013_reflexoes_contextos_e_citacoes.sql` | Sim | Sim (histórico) | Sim | citacoes_evidencias e contextos | **APLICADA-CONFIRMADA** |
| `0014_auditoria_execucoes_ia.sql` | Sim | Sim (histórico) | Sim | Tabela auditoria.execucoes_ia | **APLICADA-CONFIRMADA** |
| `0015_incorporacao_reingestao_storage.sql` | Sim | Sim (histórico) | Sim | Políticas TUS e reingestão | **APLICADA-CONFIRMADA** |
| `0016_reparar_view_reflexoes_resumo.sql` | Sim | `20260918030216` | Reconciliado | View v_reflexoes_resumo reparada | **APLICADA-CONFIRMADA** |
| `0017_hardening_views_rpcs.sql` | Sim | `20260918032221` | Reconciliado | security_invoker em todas as views | **APLICADA-CONFIRMADA** |
| `0018_otimizar_politicas_rls.sql` | Sim | `20260918032447` | Reconciliado | Subselect (select auth.uid()) otimizado | **APLICADA-CONFIRMADA** |
| `0019_indices_processamento.sql` | Sim | `20260918032726` | Reconciliado | Índices idx_fragmentos_* ativos | **APLICADA-CONFIRMADA** |
| `0020_corrigir_resumo_cerebro.sql` | Sim | `20260918055223` | Reconciliado | View v_cerebro_resumo corrigida | **APLICADA-CONFIRMADA** |
| `0021_fontes_reflexao.sql` | Sim | `20260918060110` | Reconciliado | Tabela reflexoes.fontes_entrada ativa | **APLICADA-CONFIRMADA** |
| `0022_origem_biblioteca_reflexoes.sql` | Sim | `20260918060919` | Reconciliado | Constraint entradas com biblioteca | **APLICADA-CONFIRMADA** |
| `0023_fontes_obras_audio.sql` | Sim | `20260918063203` | Reconciliado | Tabela biblioteca.fontes_obras ativa | **APLICADA-CONFIRMADA** |
| `0024_versionamento_edicao_autoral_reflexoes.sql` | Sim | `20260918070602` | Reconciliado | Colunas origem_versao e versao_base | **APLICADA-CONFIRMADA** |
| `0025_taxonomia_isolamento_rls.sql` | Sim | `20260918142220` | Reconciliado | usuario_id em taxonomia.conceitos | **APLICADA-CONFIRMADA** |
| `0026_motor_taxonomia_automatica.sql` | Sim | `20260918150026` | Reconciliado | analises, conceitos_reflexoes, views | **APLICADA-CONFIRMADA** |
| `0027_grants_propostas_atualizacao.sql` | Sim | `20260918150027` | Reconciliado | Grants service_role em propostas | **APLICADA-CONFIRMADA** |
| `0028_dimensoes_canonicas_readonly.sql` | Sim | `20260918150028` | Reconciliado | RLS ativo em dimensoes (read-only) | **APLICADA-CONFIRMADA** |
| `0029_limite_upload_biblioteca_50mb.sql` | Sim | `20260918150029` | Reconciliado | Bucket limit 50MB (52428800 bytes) | **APLICADA-CONFIRMADA** |
| `0030_sistema_rls_hardening.sql` | Sim | `20260918150030` | Reconciliado | RLS total em sistema.* com policies | **APLICADA-CONFIRMADA** |

---

## 2. Diagnóstico da Discrepância Histórica Inicial

- **Causa da divergência prévia:** As migrations 0001 a 0015 foram originalmente registradas apenas na tabela de controle da aplicação `public._migrations`. As migrations 0016 a 0025 foram aplicadas posteriormente através do Supabase CLI (que registra em `supabase_migrations.schema_migrations`). As migrations 0026 a 0029 haviam sido versionadas no Git, porém não tinham sido executadas no Supabase novo.
- **Resolução Implementada:** Nesta missão, as migrations pendentes 0026 a 0029 e a nova 0030 foram aplicadas materialmente no banco com sucesso e ambos os históricos (`supabase_migrations.schema_migrations` e `public._migrations`) foram reconciliados, garantindo 100% de paridade.
