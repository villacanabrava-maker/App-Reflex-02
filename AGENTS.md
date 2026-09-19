# Constituição Operacional e Governança Multiagente V3 — App Reflex 02
### Reflex Agent Operating System V3 (Runtime Antigravity 2.0 & OpenAI Codex)

Este repositório adota o **Reflex Agent Operating System V3**, uma arquitetura multiagente compartilhada, runtime-neutral e ancorada no repositório canônico do GitHub (`villacanabrava-maker/App-Reflex-02`).

---

## 1. O Princípio Central do Sistema Operacional de Agentes

> **"O AGENTE CERTO com O CONTEXTO CERTO usando AS FERRAMENTAS CERTAS para UMA TAREFA DELIMITADA com UMA SAÍDA VERIFICÁVEL."**

A autoridade e os limites de cada inteligência não derivam do modelo ou da interface, mas do **Task Packet tipado** emitido por R1 e do cumprimento do **Output Contract** auditado por R6.

---

## 2. A Equipe Canônica dos Nove Papéis (R1–R9)

A especificação normativa de cada papel encontra-se em `docs/agent-system/agent-registry.yaml`:

```
┌────────────────────────────────────────────────────────────────────────┐
│ R1 — ORCHESTRATOR (Coordenação Geral, Despacho e Lock de Missão)       │
└──────────────────┬──────────────────────────────────┬──────────────────┘
                   │                                  │
         ┌─────────┴─────────┐              ┌─────────┴─────────┐
         ▼                   ▼              ▼                   ▼
      DESIGN             DATABASE        EVALUATOR           EVIDENCE
     & FRONTEND          & SUPABASE      & SECURITY         & CONTINUITY
  R4 (UI/UX/Next.js)   R3 (PostgreSQL)  R6 (Zero-Trust)    R9 (Livro-Razão)
         │                   │              │                   │
         └─────────┬─────────┘              └─────────┬─────────┘
                   │                                  │
         ┌─────────┴─────────┐              ┌─────────┴─────────┐
         ▼                   ▼              ▼                   ▼
    ARCHITECTURE         COGNITIVE       RESEARCH           PLATFORM
    R2 (Contratos)      R5 (Cérebro)    R8 (Consultivo)    R7 (CI/CD/SRE)
```

1. **R1 (ORCHESTRATOR):** Despacha Task Packets, arbitra dependências e administra o `docs/agent-system/missions/MISSION_LOCK.json`.
2. **R2 (ARCHITECTURE):** Define arquitetura, elabora ADRs e zela pela integridade conceitual.
3. **R3 (DATA & SUPABASE):** Modela banco PostgreSQL, constrói safe migrations idempotentes e governa RLS.
4. **R4 (PRODUCT & FRONTEND):** Projeta e implementa UI/UX com Next.js 15, React 19 e conformidade WCAG 2.2 AA.
5. **R5 (COGNITIVE & KNOWLEDGE):** Governa o Cérebro Reflex V3.1, claims, NLI, Memory Firewall (MILR = 0%) e Dossiê Contextual.
6. **R6 (QA, SECURITY & EVALS):** Auditor independente Zero-Trust (`SELF_REVIEW != INDEPENDENT_REVIEW`) e guardião dos release gates.
7. **R7 (PLATFORM & RUNTIME):** Sustenta esteiras de CI/CD (GitHub Actions), higiene de segredos e observabilidade do runtime de produção.
8. **R8 (RESEARCH & EVOLUTION):** Conduz pesquisas empíricas de causa-raiz e literatura acadêmica sob orçamento delimitado.
9. **R9 (CONTINUITY & EVIDENCE):** Administra o livro-razão de evidências, concilia diffs reais e emite relatórios formais de handoff.

---

## 3. Adaptadores de Execução e Continuidade

O sistema opera com dois adaptadores de execução equivalentes e isomórficos:
- **Adaptador Google Antigravity 2.0:** Configurado em `.agents/agents/` (agentes `rflex-*`), `.agents/skills/reflex-*`, `.agents/hooks.json` e `GEMINI.md`.
- **Adaptador OpenAI ChatGPT / Codex:** Configurado em `OpenAI ChatGPT/` e `.codex/agents/*.toml` (papéis O1–O9).

### Camada de Continuidade OpenAI / Codex
Agentes OpenAI (ChatGPT, Codex e derivados) devem usar a pasta `OpenAI ChatGPT/` como camada de bootstrap e continuidade do projeto.
- Entrada primária: `OpenAI ChatGPT/BOOTSTRAP.md`
- Estado atualizado: `OpenAI ChatGPT/CURRENT_STATE.md`
- Orquestração Codex: `OpenAI ChatGPT/ORCHESTRATION.md` e `.codex/config.toml`

---

## 4. Documentação Normativa Canônica

Para consultar os contratos formais e manuais do sistema:
- `docs/agent-system/CONSTITUTION.md` — A Constituição multiagente e regras invariantes.
- `docs/agent-system/SOURCE_OF_TRUTH.md` — Hierarquia formal de autoridade e resolução de conflitos.
- `docs/agent-system/CURRENT_STATE.md` — Estado material da infraestrutura e suíte de testes.
- `docs/agent-system/agent-registry.yaml` — Registro formal dos papéis R1–R9.
- `docs/agent-system/permissions.yaml` — Matriz de menor privilégio `DENY > ASK > ALLOW`.
- `docs/agent-system/orchestration-modes.yaml` — Os modos canônicos de orquestração.
- `docs/agent-system/schemas/` — Schemas JSON de validação de Task Packets, Output Contracts e Mission Lock.
