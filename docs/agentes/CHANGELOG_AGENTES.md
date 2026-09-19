# CHANGELOG DE AGENTES E SKILLS — APP REFLEX 02
### Histórico de Evolução, Versionamento e Critérios de Promoção do Harness
**Missão:** AGENT HARNESS V2 | **Status:** Normativo e Canônico | **Data:** 2026-09-18

---

## 1. Princípio do Versionamento Estrito de Agentes

Nenhum arquivo `agent.md` ou `SKILL.md` pode ser modificado de forma informal ou sem rastreamento de versão. Cada atualização deve registrar o motivo, os testes de qualificação antes e depois, e o critério de promoção atendido.

---

## 2. Linha do Tempo de Versões do Harness Multiagente

### [Harness V2.0.0] — 18 de setembro de 2026 (Missão AGENT HARNESS V2)
- **Motivação:** Modernização completa da equipe de 9 agentes antes da implementação intensiva do Cérebro Reflex V3.1.
- **Mudanças Principais:**
  - **Reestruturação de Main Agent:** A1 mantido como único `mainAgent: true`; A2 a A9 reconfigurados como `mainAgent: false` e `subagent: true`.
  - **Padronização de System Prompt em 15 Seções:** Aplicada estrutura universal e discriminativa em todos os 9 arquivos `agent.md`.
  - **Adição de Descrições Negativas:** Cada agente define claramente quando NÃO deve ser invocado.
  - **Formalização dos Contratos de Handoff:** Introduzido o **Task Packet** e os **Output Contracts** tipados por agente.
  - **Menor Privilégio e Proteções Windows:** Mapeamento formal de `DENY > ASK > ALLOW` integrado aos hooks Node.js.
  - **Matriz RACI e Ownership:** Documentado o mapa de autoridade de arquivos por diretório.
  - **Suíte de Avaliação de Agentes (Agent Evals):** Criada bateria de testes individuais, cross-agent e adversários.

### [Harness V1.2.0] — 18 de setembro de 2026 (Missão MIS-0002)
- Criação do Agente A9 (`rflex-continuity-evidence`).
- Instituição do Protocolo de Comunicação Tripartite (Usuário ↔ ChatGPT ↔ Antigravity).
- Criação das skills `evidence-ledger`, `external-review-bridge` e `project-state-reconciliation`.

### [Harness V1.1.0] — 18 de setembro de 2026 (Missão MIS-0001)
- Integração do Agente A8 (`rflex-research-evolution`).
- Criação da pasta de evidências sanitizadas `docs/pesquisa-evolucao/`.
- Criação das skills `evidence-based-research` e `idea-generator`.

### [Harness V1.0.0] — Fundação Inicial (Missão MIS-0000)
- Configuração inicial dos 7 agentes fundadores (A1 a A7).
- Criação dos guardrails de segurança e hooks de intercâmbio.

---

## 3. Matriz de Versões Atual dos 9 Agentes Canônicos

| Agente | Versão Atual | Modelo Recomendado | Papel Constitucional |
|---|:---:|:---:|---|
| **A1 (`rflex-architect`)** | **v2.0.0** | `pro` / `inherit` | Planner & Coordenador Geral |
| **A2 (`rflex-product-design`)** | **v2.0.0** | `flash` / `pro` | Design System, UX e Acessibilidade (WCAG AA) |
| **A3 (`rflex-frontend`)** | **v2.0.0** | `flash` / `pro` | Engenharia de Interface em Next.js 15 e React 19 |
| **A4 (`rflex-backend-supabase`)**| **v2.0.0** | `pro` | PostgreSQL 17, RLS, Storage TUS e Migrations |
| **A5 (`rflex-ai-knowledge`)** | **v2.0.0** | `pro` | Claims, Schemas Zod, RAG, NLI e Memory Firewall |
| **A6 (`rflex-platform`)** | **v2.0.0** | `flash` / `inherit` | Plataforma, CI/CD, GitHub Actions e Observabilidade |
| **A7 (`rflex-qa-security`)** | **v2.0.0** | `pro` | Auditoria Independente, Zero-Trust e AppSec |
| **A8 (`rflex-research-evolution`)**| **v2.0.0**| `pro` / `flash` | Pesquisa Aplicada, Benchmarks e Diagnósticos |
| **A9 (`rflex-continuity-evidence`)**| **v2.0.0**| `flash` / `inherit`| Continuidade, Evidência e Intercâmbio Tripartite |
