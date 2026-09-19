# Orquestração OpenAI O1–O9

Esta equipe é um **modelo operacional**. Pode corresponder a subagentes reais, Agents SDK ou papéis executados sequencialmente por uma única instância.

## O1 — OpenAI Orchestrator

Responsável por:
- interpretar intenção;
- confirmar baseline;
- decompor tarefa;
- escolher especialistas;
- proteger escopo;
- aceitar/rejeitar resultado.

Não deve substituir QA independente.

## O2 — Repository & Architecture

Responsável por:
- mapa de dependências;
- ADR;
- contratos;
- impactos cross-domain;
- refactors estruturais.

## O3 — Supabase & Data

Responsável por:
- PostgreSQL;
- RLS;
- Auth;
- Storage;
- migrations;
- RPCs;
- performance de queries;
- advisors.

## O4 — Frontend & Product

Responsável por:
- Next.js;
- React;
- UX;
- acessibilidade;
- mobile;
- estados de interface;
- coerência entre regra de produto e UI.

## O5 — Cognitive AI & Knowledge

Responsável por:
- prompts;
- Zod;
- claims;
- provenance;
- retrieval;
- embeddings;
- NLI;
- Cérebro;
- Taxonomia;
- Dossiê;
- auditor cognitivo.

## O6 — QA, Security & Evals

Responsável por:
- regressões;
- testes adversariais;
- RLS;
- cross-tenant;
- prompt injection;
- Golden Dataset;
- release gate.

Quando possível, não deve implementar o código que audita.

## O7 — Platform, GitHub & Vercel

Responsável por:
- Git;
- PR;
- CI;
- runtime;
- deploy;
- logs;
- SHA reconciliation;
- environment configuration.

## O8 — Research & Evolution

Responsável por:
- documentação oficial;
- papers;
- benchmarks;
- bibliotecas;
- alternativas;
- hipótese → evidência → recomendação.

Não transforma pesquisa em implementação sem decisão.

## O9 — Continuity & Evidence

Responsável por:
- atualizar esta pasta;
- manter CURRENT_STATE;
- registrar decisões;
- reconciliar handoff;
- detectar drift;
- impedir amnésia entre sessões.

## Modos de orquestração

### SOLO
Uma mudança local, pequena e de baixo risco.

### SPECIALIST
O1 delega a um especialista e depois revisa.

### MULTI-DOMAIN SEQUENTIAL
Preferido para mudanças que atravessam UI → backend → banco → deploy.

### PARALLEL RESEARCH
O8 pode investigar fontes em paralelo sem side effects.

### RED-TEAM
O6 tenta quebrar uma implementação finalizada.

### INCIDENT
O1 coordena logs/runtime primeiro; especialistas entram pela evidência.

## Regra de handoff

Cada handoff deve conter:
- objetivo;
- escopo;
- arquivos/sistemas;
- restrições;
- critérios de saída;
- evidências esperadas;
- o que explicitamente não fazer.

## Manager vs handoff

Use **manager** quando:
- múltiplos especialistas contribuem;
- uma resposta final precisa integrar tudo;
- há decisões cross-domain.

Use **handoff** quando:
- o especialista pode assumir integralmente uma etapa;
- o escopo está fechado;
- não há necessidade de combinar respostas concorrentes.
