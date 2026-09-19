# Estado Compartilhado do Projeto — App Reflex 02

**Data da Última Reconciliação:** 19 de setembro de 2026  
**Responsável pela Reconciliação:** A9 (rflex-continuity-evidence) em conjunto com A1 (rflex-architect) e A7 (rflex-qa-security)  
**Branch Canônica:** `main`  
**Repositório Remoto:** `https://github.com/villacanabrava-maker/App-Reflex-02.git`  
**Status do Pipeline:** Verde (127 testes em 25 arquivos e build passando 100%)  
**Última Missão Concluída:** MIS-0010 — Wave 4: Retrieval Híbrido Multi-Sinal, Working Memory e Dossiê Contextual Epistêmico V3.1  
**Próxima Missão:** MIS-0011 — Wave 5: Auditor Cognitivo Pós-Geração e Abstenção Honesta  

---

## 1. Matriz de Infraestrutura & Integrações

| Componente | Estado Operacional | Classificação de Evidência | Detalhes & Configurações |
| :--- | :--- | :--- | :--- |
| **Repositório Git** | `ATIVO / CANÔNICO` | `[CONFIRMADO-CODIGO]` / `[CONFIRMADO-CI]` | Sincronizado no GitHub (`villacanabrava-maker/App-Reflex-02`). |
| **Arquitetura Cognitiva** | `WAVE 4 HOMOLOGADA / V3.1` | `[CONFIRMADO-TESTE]` / `[CONFIRMADO-DOCUMENTO]` | Gate 0 concluído (mutação direta revogada para taxonomia, RPCs de curadoria humana via `auth.uid()`, `search_key` vs `identity_key`, remoção do default 0.85); Query Intent Router com 9 classes cognitivas; Motor de Retrieval V3.1 com 5 rotas comparativas (A, B0, B1, C, D) e abstenção honesta; Montador de Dossiê Contextual com sanitização anti-prompt-injection, 9 compartimentos e snapshot SHA-256; Eliminação de hidden retrieval no Redator e Planejador; Relatório `WAVE_4_RETRIEVAL_WORKING_MEMORY_RESULT.md`. |
| **Equipe Multiagente** | `HARNESS V2 OPERACIONAL` | `[CONFIRMADO-CODIGO]` / `[CONFIRMADO-TESTE]` | 9 agentes operando no modo `MULTI-DOMAIN SEQUENTIAL` via Task Packets tipados. |
| **Supabase** | `36 MIGRATIONS / LIVE` | `[CONFIRMADO-TESTE]` / `[CONFIRMADO-CODIGO]` | Project ref: `xenapowdtfhdwcfthfrn`. **36 migrations aplicadas live** no banco DEV/TEST e registradas em `public._migrations`. RLS, imutabilidade, state machine e RPCs de busca e curadoria validadas. |
| **Segurança & AppSec** | `SECURITY-EXCEPTION-DEV-001` | `[DECLARADO-USUARIO]` / `[CONFIRMADO-CODIGO]` | Decisão humana formalizada: `RISK ACCEPTED BY USER — DEVELOPMENT/TEST ONLY`. Credencial de teste mantida ativa; rotação postergada compulsoriamente para o `PRODUCTION SECURITY GATE`. Proibido `supabase db push --linked`. |
| **Hospedagem / Vercel** | `ADIADO / FORA DE ESCOPO` | `[CONFIRMADO-CODIGO]` | Nenhum deploy, CLI ou webhook Vercel ativo. Proibido por regra de governança. |
| **Suíte de Testes** | `PASSANDO (100%)` | `[CONFIRMADO-TESTE]` | 25 arquivos de testes Vitest (127 testes) cobrindo segurança, isolamento RLS, guardrails, golden dataset, integridade episódica, ontologia SKOS, benchmark multi-sinal e Zero-Trust de Dossiê Contextual. |
| **Build de Produção** | `CONCLUÍDO COM SUCESSO` | `[CONFIRMADO-TESTE]` | Next.js 15 compilando estaticamente e rotas dinâmicas validadas (10.4s). |

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
