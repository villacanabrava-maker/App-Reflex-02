# Estado Compartilhado do Projeto — App Reflex 02

**Data da Última Reconciliação:** 19 de setembro de 2026  
**Responsável pela Reconciliação:** A9 (rflex-continuity-evidence) em conjunto com A1 (rflex-architect) e A7 (rflex-qa-security)  
**Branch Canônica:** `main`  
**Repositório Remoto:** `https://github.com/villacanabrava-maker/App-Reflex-02.git`  
**Status do Pipeline:** Verde (100% dos testes e build passando)  
**Última Missão Concluída:** MIS-0009 — Wave 3: Gate de Integridade do Event Ledger + Taxonomia SKOS, Ontologia Formal e Ancoragem Conceitual  
**Próxima Missão:** MIS-0010 — Wave 4: Working Memory & Retrieval Híbrido Multi-Sinal  

---

## 1. Matriz de Infraestrutura & Integrações

| Componente | Estado Operacional | Classificação de Evidência | Detalhes & Configurações |
| :--- | :--- | :--- | :--- |
| **Repositório Git** | `ATIVO / CANÔNICO` | `[CONFIRMADO-CODIGO]` / `[CONFIRMADO-CI]` | Sincronizado no GitHub (`villacanabrava-maker/App-Reflex-02`). |
| **Arquitetura Cognitiva** | `WAVE 3 HOMOLOGADA / V3.1` | `[CONFIRMADO-TESTE]` / `[CONFIRMADO-DOCUMENTO]` | Event Ledger blindado (sem INSERT direto por clientes, actor_type resolvido no banco via RPC humana/sistêmica, state machine completa e constraints anti-cross-tenant), Ontologia SKOS (`skos_conceitos`, `skos_relacoes`), ancoragem `claim_conceitos` com preservação estrita do Firewall de Autoria, Golden Evals `CBR-05-TAXONOMY` executável com 100% de precisão e 0% duplicação, relatório `WAVE_3_TAXONOMIA_SKOS_RESULT.md`. |
| **Equipe Multiagente** | `HARNESS V2 OPERACIONAL` | `[CONFIRMADO-CODIGO]` / `[CONFIRMADO-TESTE]` | 9 agentes operando no modo `MULTI-DOMAIN SEQUENTIAL` via Task Packets tipados. |
| **Supabase** | `34 MIGRATIONS / ISOLADO` | `[CONFIRMADO-TESTE]` / `[CONFIRMADO-CODIGO]` | Project ref: `xenapowdtfhdwcfthfrn`. 30 migrations aplicadas live; migrations 0031 a 0034 prontas no repositório (`READY-BUT-NOT-APPLIED` sob exceção formal). RLS, imutabilidade e integridade referencial testadas localmente. |
| **Segurança & AppSec** | `SECURITY-EXCEPTION-DEV-001` | `[DECLARADO-USUARIO]` / `[CONFIRMADO-CODIGO]` | Decisão humana formalizada: `RISK ACCEPTED BY USER — DEVELOPMENT/TEST ONLY`. Credencial de teste mantida ativa; rotação postergada compulsoriamente para o `PRODUCTION SECURITY GATE`. Proibido `supabase db push --linked`. |
| **Hospedagem / Vercel** | `ADIADO / FORA DE ESCOPO` | `[CONFIRMADO-CODIGO]` | Nenhum deploy, CLI ou webhook Vercel ativo. Proibido por regra de governança. |
| **Suíte de Testes** | `PASSANDO (100%)` | `[CONFIRMADO-TESTE]` | 23 arquivos de testes Vitest (110 testes) cobrindo segurança, isolamento RLS, guardrails, golden dataset, integridade episódica, state machine, anti-cross-tenant e ontologia SKOS. |
| **Build de Produção** | `CONCLUÍDO COM SUCESSO` | `[CONFIRMADO-TESTE]` | Next.js 15 compilando estaticamente e rotas dinâmicas validadas (7.3s). |

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
