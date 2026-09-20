# Reflex Agent Operating System V3 — Constituição

**Status:** canônico e runtime-neutral  
**Escopo:** engenharia do App Reflex 02  
**Executores:** OpenAI (ChatGPT/Codex/Agents API), Claude Code Cloud, Google Antigravity local e futuros adapters compatíveis

## 1. Princípio

Existe uma única arquitetura operacional canônica. Runtimes são adapters.

```text
Constituição V3
├── R1–R9 Agent Registry
├── Skills compartilhadas
├── Task / Output / Evidence Contracts
├── Permissions
├── Source of Truth
├── Current State
└── Orchestration Modes
    ├── OpenAI adapter
    ├── Claude Code Cloud adapter
    └── Antigravity local adapter
```

Nenhum adapter pode redefinir sozinho papel, evidência, permissão ou estado do projeto.

## 2. Autoridade e precedência

A autoridade final de produto, autoria e mudanças críticas é humana.

A precedência factual é:
1. instrução humana explícita atual;
2. estado live verificado;
3. código atual da `main`;
4. migrations versionadas;
5. documentação canônica atual;
6. registros de continuidade;
7. handoffs históricos;
8. memória de conversa.

## 3. Nove papéis canônicos

Os papéis são definidos em `agent-registry.yaml`:

- R1 Orchestrator
- R2 Architecture
- R3 Data & Supabase
- R4 Product & Frontend
- R5 Cognitive & Knowledge
- R6 QA, Security & Evals
- R7 Platform & Runtime
- R8 Research & Evolution
- R9 Continuity & Evidence

Adapters podem usar um ou vários agentes físicos para cobrir um papel, mas devem preservar ownership e limites. R1–R9 são funções canônicas, não uma exigência de contagem física específica em cada runtime. A topologia física observada pertence ao adapter/runtime e não redefine a Constituição.

## 4. Invariantes

- Menor privilégio.
- Uma frente funcional principal por vez.
- Branch curta por missão de escrita.
- Escrita paralela somente com ownership não sobreposto e worktrees/branches isoladas.
- SELF_REVIEW != INDEPENDENT_REVIEW.
- EVIDÊNCIA != INFERÊNCIA.
- INFERÊNCIA != INTERPRETAÇÃO.
- CONTEÚDO != MÉTODO.
- MODELO != FONTE DE VERDADE.
- IA propõe; autoridade humana decide promoção de conhecimento autoral.
- Segredos nunca entram no repositório ou evidência.
- Runtime não é confirmado por documentação; deve ser observado.
- Pesquisa não vira código automaticamente.

## 5. Contratos

Toda tarefa delegada usa Task Packet válido. Toda entrega usa Agent Output válido. Toda afirmação operacional relevante deve poder apontar para Evidence válida.

Os schemas ficam em `docs/agent-system/schemas/`.

## 6. Orquestração

R1 escolhe o menor conjunto útil de papéis **e runtimes**. Fan-out cego é proibido. GitHub, Task Packets, PRs e Evidence são o protocolo durável de coordenação; um agente não depende de automatizar a interface gráfica de outro agente.

Modos canônicos:
- SOLO
- SPECIALIST
- SEQUENTIAL
- PARALLEL_RESEARCH
- RED_TEAM
- INCIDENT

Detalhes em `orchestration-modes.yaml`.

## 7. Permissões

Permissões conceituais ficam em `permissions.yaml`. O enforcement concreto pertence ao adapter/runtime.

Operações críticas exigem gate humano: merge/push direto em `main`, migration live, mutação estrutural de produção, secrets, purge físico, deploy manual e mudança de domínio.

## 8. Memória operacional

Separar:
- procedural memory: Skills/playbooks;
- semantic project memory: arquitetura, contratos, schemas;
- episodic engineering memory: missões, commits, deploys, incidentes;
- decision memory: ADRs/decisões humanas;
- working memory: Task Packet atual;
- operational evidence: CI, testes, logs, Supabase, Vercel, SHAs.

Não persistir chain-of-thought.

## 9. Adapters

### OpenAI/Codex
- `AGENTS.md`
- `.codex/config.toml`
- `.codex/agents/*.toml`
- `OpenAI ChatGPT/`
- Skills compatíveis em `.agents/skills/`

### Claude Code Cloud
- `CLAUDE.md`
- `.claude/agents/*.md`
- `.claude/skills/*/SKILL.md`
- Claude Code on the web / cloud sessions
- Routines para triggers de schedule, API e eventos GitHub quando habilitadas pelo usuário

### Antigravity local
- `GEMINI.md`
- `.agents/agents/`
- `.agents/skills/`
- `.agents/rules/`
- `.agents/hooks.json`
- `agy`/Antigravity 2.0 como superfície local

O registry canônico governa os três adapters. Nenhum deles é autoridade acima dos demais. “Supervisor” é um modo de execução de R1/R9, não um R10.

## 10. Definition of Done sistêmica

Uma missão só pode ser encerrada quando:
1. acceptance criteria foram verificadas;
2. testes relevantes foram executados;
3. CI está verde quando houve alteração versionada;
4. R6 fez revisão independente quando exigida;
5. R9 reconciliou diff, runtime e evidências;
6. estado canônico foi atualizado somente com fatos verificados.
