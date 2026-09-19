---
name: reflex-supabase-safe-change
description: >-
  Metodologia segura para criação e aplicação de migrations no Supabase/PostgreSQL.
  Enfatiza idempotência, integridade de RLS, triggers de imutabilidade e PostgREST schema profiles.
---

# 🐘 Skill: Mudanças Seguras no Supabase (Reflex OS V3)

Esta skill orienta o **Engenheiro de Dados (R3)** no desenho e governança do banco PostgreSQL no Supabase.

## 🔒 Princípios de Segurança Relacional

1. **Idempotência Absoluta:**
   - Todo script SQL em `supabase/migrations/` deve ser repetível com segurança: `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `DO $$ BEGIN ... END $$;`.
2. **Row Level Security (RLS) Mandatório:**
   - Toda nova tabela em qualquer schema (`public`, `biblioteca`, `processamento`, `cerebro_autoral`, `reflexoes`, `auditoria`) deve ativar RLS:
     `ALTER TABLE <schema>.<tabela> ENABLE ROW LEVEL SECURITY;`
3. **Trust Boundary Hardening:**
   - RPCs que gravam dados sensíveis ou relatórios cognitivos (`persistir_dossie_snapshot`, `registrar_relatorio_auditoria_v3_1`) devem revogar acesso de `PUBLIC`, `anon` e `authenticated`, sendo acessíveis estritamente via `service_role`.
4. **PostgREST Schema Profiles:**
   - Consultas HTTP ou testes a schemas fora de `public` exigem os headers:
     `Accept-Profile: <schema>` e `Content-Profile: <schema>`.
5. **Gate de Produção:**
   - O comando `supabase db push --linked` é classificado como ASK e jamais deve ser executado de forma não supervisionada.
