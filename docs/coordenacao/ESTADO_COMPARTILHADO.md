# Estado Compartilhado do Projeto — App Reflex 02

**Data da Última Reconciliação:** 19 de setembro de 2026  
**Responsável pela Reconciliação:** A9 (rflex-continuity-evidence) em conjunto com A1 (rflex-architect) e A7 (rflex-qa-security)  
**Branch Canônica:** `main`  
**Repositório Remoto:** `https://github.com/villacanabrava-maker/App-Reflex-02.git`  
**Status do Pipeline:** Verde (100% dos testes e build passando)  
**Última Missão Concluída:** MIS-0008 — Wave 2: Episodic Event Ledger, Timeline Epistêmica e Hardening Transacional da Fundação de Claims  
**Próxima Missão:** MIS-0009 — Wave 3: SKOS Ontologia, Taxonomia Formal e Ancoragem Conceitual  

---

## 1. Matriz de Infraestrutura & Integrações

| Componente | Estado Operacional | Classificação de Evidência | Detalhes & Configurações |
| :--- | :--- | :--- | :--- |
| **Repositório Git** | `ATIVO / CANÔNICO` | `[CONFIRMADO-CODIGO]` / `[CONFIRMADO-CI]` | Sincronizado no GitHub (`villacanabrava-maker/App-Reflex-02`). |
| **Arquitetura Cognitiva** | `WAVE 2 HOMOLOGADA / V3.1` | `[CONFIRMADO-TESTE]` / `[CONFIRMADO-DOCUMENTO]` | Event Ledger implementado (`memory_events`), imutabilidade real via trigger, RPC transacional `transicionar_estado_claim` com row locking e soberania autoral humana estrita, Timeline API com cursor, relatórios `WAVE_1_CLAIMS_EVALS_RESULT.md` e `WAVE_2_EVENT_LEDGER_RESULT.md`. |
| **Equipe Multiagente** | `HARNESS V2 OPERACIONAL` | `[CONFIRMADO-CODIGO]` / `[CONFIRMADO-TESTE]` | 9 agentes operando no modo `MULTI-DOMAIN SEQUENTIAL` via Task Packets tipados. |
| **Supabase** | `32 MIGRATIONS / ISOLADO` | `[CONFIRMADO-TESTE]` / `[CONFIRMADO-CODIGO]` | Project ref: `xenapowdtfhdwcfthfrn`. 30 migrations aplicadas live; migrations 0031 e 0032 prontas no repositório (`READY-BUT-NOT-APPLIED`). RLS e imutabilidade auditados via testes locais. |
| **Segurança & AppSec** | `P0 ABERTO — CREDENCIAL REVOGAÇÃO PENDENTE` | `[CONFIRMADO-TESTE]` / `[CONFIRMADO-CODIGO]` | Saneado no código local e de CI. Push live bloqueado para proteger contra uso de credenciais pendentes de rotação no console web. |
| **Hospedagem / Vercel** | `ADIADO / FORA DE ESCOPO` | `[CONFIRMADO-CODIGO]` | Nenhum deploy, CLI ou webhook Vercel ativo. Proibido por regra de governança. |
| **Suíte de Testes** | `PASSANDO (100%)` | `[CONFIRMADO-TESTE]` | 23 arquivos de testes Vitest (100 testes) cobrindo segurança, isolamento RLS, guardrails, golden dataset de 12 famílias, imutabilidade episódica e timeline. |
| **Build de Produção** | `CONCLUÍDO COM SUCESSO` | `[CONFIRMADO-TESTE]` | Next.js 15 compilando estaticamente e rotas dinâmicas validadas. |

---

## 2. Mapa dos 9 Agentes no Harness V2

| ID | Nome Canônico | Função Sistêmica | mainAgent | subagent | Modelo Típico | Responsabilidade Primária |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **A1** | `rflex-architect` | PLANNER / ORCHESTRATOR | **`true`** | `true` | `pro` / `inherit` | Coordenação Geral, Decomposição em Task Packets e ADRs |
| **A2** | `rflex-product-design` | GENERATOR (Design) | `false` | `true` | `flash` / `pro` | Design System, UX, Tokens e Acessibilidade WCAG 2.2 AA |
| **A3** | `rflex-frontend` | GENERATOR (Frontend) | `false` | `true` | `flash` / `pro` | Interfaces Next.js 15, React 19, Componentes e Rotas |
| **A4** | `rflex-backend-supabase` | GENERATOR (Backend) | `false` | `true` | `pro` | PostgreSQL 17, RLS, Storage TUS e Safe Migrations |
| **A5** | `rflex-ai-knowledge` | GENERATOR (Cognitivo) | `false` | `true` | `pro` | Claims, Schemas Zod, RAG, NLI e Memory Firewall |
| **A6** | `rflex-platform` | PLATAFORMA / SRE | `false` | `true` | `flash` / `inherit` | CI/CD, GitHub Actions, Hygiene de Segredos e Git |
| **A7** | `rflex-qa-security` | EVALUATOR (Zero-Trust) | `false` | `true` | `pro` | Auditoria Independente, Suíte E2E e Laudos de Release |
| **A8** | `rflex-research-evolution`| RESEARCH (Consultivo) | `false` | `true` | `pro` / `flash` | Pesquisa Baseada em Evidências e Diagnósticos |
| **A9** | `rflex-continuity-evidence`| EVIDENCE / HANDOFF | `false` | `true` | `flash` / `inherit`| Livro-Razão de Evidências e Intercâmbio Tripartite |

---

## 3. Acervo de Governança do Harness V2

A governança multiagente está consolidada e normatizada nos seguintes documentos:
- `AGENTS.md` (Constituição multiagente atualizada);
- `docs/agentes/ARQUITETURA_MULTIAGENTE_V2.md` (Harness operacional completo);
- `docs/agentes/MATRIZ_OWNERSHIP.md` (Mapa de CODEOWNERS e Matriz RACI);
- `docs/agentes/MATRIZ_PERMISSOES.md` (Matriz de Menor Privilégio e política DENY > ASK > ALLOW);
- `docs/agentes/CONTRATOS_HANDOFF.md` (Task Packets e Output Contracts tipados);
- `docs/agentes/ORCHESTRATION_MODES.md` (Os 6 modos de despacho de subagentes);
- `docs/agentes/AGENT_EVALS.md` (Suíte de testes individuais, cross-agent e adversários);
- `docs/agentes/AGENT_OBSERVABILITY.md` (As 12 métricas de telemetria e KPIs);
- `docs/agentes/CHANGELOG_AGENTES.md` (Histórico de versões e critérios de promoção).

---

## 4. Bloqueios e Restrições Vigentes

1. `[BLOQUEADO]` **Vercel:** Não realizar tentativas de deploy ou linkage de projeto até aprovação explícita do usuário.
2. `[BLOQUEADO]` **Self-Review como Substituta de Auditoria:** Especialistas não podem aprovar o próprio código para merge na `main`; A7 é obrigatório.
3. `[BLOQUEADO]` **Alterações Diretas de A1 em Código de Produto:** A1 atua como Planner e deve despachar aos especialistas (A2–A6).
4. `[BLOQUEADO]` **Pesquisa Sem Orçamento:** A8 deve operar sob orçamento delimitado (máx 3 sub-perguntas e 5 fontes primárias).
