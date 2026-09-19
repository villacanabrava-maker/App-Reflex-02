# Source of Truth — Reflex Agent OS V3

## Ordem de precedência

1. **Instrução humana explícita atual**
2. **Estado live verificado** — GitHub, CI, Supabase, Vercel, browser/runtime
3. **Código atual da `main`**
4. **Migrations versionadas**
5. **Documentação canônica atual**
6. **Continuidade**
7. **Handoffs históricos**
8. **Memória de conversa**

## Regras de reconciliação

- Nunca substituir runtime por snapshot documental.
- `CURRENT_STATE.md` é um snapshot datado, não uma autoridade permanente.
- Quando Git, banco e documentação divergirem, registrar o drift e identificar a causa antes de mutar qualquer sistema.
- Para Supabase, reconciliar separadamente arquivos de migration, `public._migrations` e histórico nativo do Supabase.
- Para Vercel, resolver projeto → deployment → target → branch → SHA → alias.
- Para PRs/branches, não integrar automaticamente trabalho concorrente ou draft.

## Taxonomia de evidência

- `[CONFIRMADO-CODIGO]`
- `[CONFIRMADO-TESTE]`
- `[CONFIRMADO-CI]`
- `[CONFIRMADO-RUNTIME]`
- `[CONFIRMADO-EXTERNO]`
- `[RELATADO]`
- `[INFERIDO]`
- `[PENDENTE]`
- `[BLOQUEADO]`

Cada evidência deve registrar quando aplicável: source, timestamp, SHA, branch, environment, comando/teste, artifact e role responsável.
