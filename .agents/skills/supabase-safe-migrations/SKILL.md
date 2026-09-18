---
name: supabase-safe-migrations
description: >-
  Guia para redação de migrations seguras no PostgreSQL/Supabase, políticas de RLS, idempotência e preservação de integridade.
---

# Procedimento de Safe Migrations no Supabase

Ao criar uma nova migration em `supabase/migrations/`:

1. **Idempotência:** Utilize sempre `IF EXISTS`, `IF NOT EXISTS` e blocos `DO $$ BEGIN ... END $$;`.
2. **Preservação de RLS:**
   - Toda nova tabela DEVE ter `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`.
   - Toda política DEVE ser testada contra múltiplos tenants e papéis (`authenticated` vs `anon`).
3. **Estratégia de Índices e Performance:**
   - Adicione índices para todas as chaves estrangeiras (`FK`) e colunas de busca frequente.
   - Para buscas vetoriais pgvector, utilize índices `HNSW` ou `IVFFlat` adequados.
4. **Zero Downtime:**
   - Não adicione colunas `NOT NULL` sem valor `DEFAULT` em tabelas populosas existentes.
