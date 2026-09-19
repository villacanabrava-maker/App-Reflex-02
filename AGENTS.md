# Reflex Agent Operating System V3 — Instruções do Repositório

Este repositório opera com **uma única arquitetura multiagente canônica, runtime-neutral**.

## Read-first

Antes de trabalho não trivial, leia:
1. `docs/agent-system/CONSTITUTION.md`
2. `docs/agent-system/SOURCE_OF_TRUTH.md`
3. `docs/agent-system/CURRENT_STATE.md`
4. `docs/agent-system/agent-registry.yaml`
5. `OpenAI ChatGPT/BOOTSTRAP.md` quando o runtime for ChatGPT/Codex
6. `docs/STATUS_PROJETO.md` como documentação de produto, reconciliando drift com live

## Papéis

Os papéis canônicos são R1–R9 e existem normativamente em `docs/agent-system/agent-registry.yaml`.

- ChatGPT/Codex usa O1–O9 e `.codex/agents/*.toml` como adapters.
- Antigravity usa A1–A9 em `.agents/agents/` como adapter.
- Um adapter pode dividir ou combinar papéis, mas não redefinir a arquitetura.

## Fonte de verdade

Precedência obrigatória:
1. instrução humana explícita atual;
2. estado live verificado;
3. código atual da `main`;
4. migrations versionadas;
5. documentação canônica;
6. continuidade;
7. handoffs históricos;
8. memória de conversa.

## Regras operacionais

- R1 escolhe o menor conjunto útil de especialistas; fan-out cego é proibido.
- Uma frente funcional principal por vez.
- Branch curta por missão de escrita.
- Escrita concorrente somente com ownership não sobreposto e isolamento por branch/worktree.
- `SELF_REVIEW != INDEPENDENT_REVIEW`; R6/O6/A7 não aprova silenciosamente código que implementou.
- Nenhuma alteração entra em `main` sem CI e os gates definidos para o risco.
- Nunca expor segredos, tokens, senhas, cookies, private keys ou service-role credentials.
- Não usar force push, reset hard não aprovado, rm destrutivo, DROP DATABASE ou desativação de RLS.
- Migration live, deploy manual, secrets, purge físico e mutações estruturais de produção exigem gate humano.
- Vercel está ativa: leitura de deployment/logs é permitida; mutação de produção é gate humano.
- Para Supabase, reconciliar arquivos de migration, ledger `public._migrations` e histórico nativo antes de qualquer mudança.
- IA não transforma inferência em autoria confirmada sem decisão humana.

## Contratos e evidência

Use os schemas em `docs/agent-system/schemas/`.

Taxonomia: `[CONFIRMADO-CODIGO]`, `[CONFIRMADO-TESTE]`, `[CONFIRMADO-CI]`, `[CONFIRMADO-RUNTIME]`, `[CONFIRMADO-EXTERNO]`, `[RELATADO]`, `[INFERIDO]`, `[PENDENTE]`, `[BLOQUEADO]`.

## Validação

Antes de concluir alteração do sistema de agentes:
```bash
npm run agents:validate
npx tsc --noEmit
npm run lint
npm test
npm run build
```

Não persistir chain-of-thought. Persistir fatos, decisões, artefatos, resultados, evidências, riscos e pendências.
