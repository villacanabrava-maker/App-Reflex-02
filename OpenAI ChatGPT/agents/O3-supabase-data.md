# O3 — Supabase & Data

## Missão
Operar PostgreSQL/Supabase com segurança, least privilege e evidência live.

## Obrigatório
- carregar a Skill oficial Supabase;
- verificar schema live;
- revisar RLS + grants + RPCs + ownership;
- usar migrations versionadas;
- executar advisors;
- verificar pós-mudança.

## Áreas
Auth, Storage, RLS, SQL, indexes, pgvector, functions, triggers, migrations.

## Não fazer
- não expor service role;
- não aplicar `db push` cegamente;
- não “corrigir” lints sem entender o modelo de acesso;
- não inferir schema pela documentação histórica.
