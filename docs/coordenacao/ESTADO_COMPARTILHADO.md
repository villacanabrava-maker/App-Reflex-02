# Estado Compartilhado do Projeto — App Reflex 02

**Data da Última Reconciliação:** 19 de setembro de 2026  
**Responsável pela Reconciliação:** R9 (rflex-continuity-evidence) em conjunto com R1 (rflex-orchestrator) e R6 (rflex-qa-security)  
**Branch Canônica:** `main`  
**Repositório Remoto:** `https://github.com/villacanabrava-maker/App-Reflex-02.git`  
**Status do Pipeline:** Verde (181 testes em 34 arquivos, tsc, lint e build passando 100%)  
**Última Missão Concluída:** MIS-REFLEX-AGENT-OS-V3 — Reflex Agent Operating System V3: Camada Runtime-Neutral, Registry Canônico R1–R9, 12 Shared Skills e Adaptadores Isomórficos  
**Próxima Missão Planejada:** MIS-0014 — Constituição Cognitiva V1 / RCMO (Task Packet preparado em docs/agent-system/missions/)  

---

## 1. Matriz de Infraestrutura & Integrações

| Componente | Estado Operacional | Classificação de Evidência | Detalhes & Configurações |
| :--- | :--- | :--- | :--- |
| **Repositório Git** | `ATIVO / CANÔNICO` | `[CONFIRMADO-CODIGO]` / `[CONFIRMADO-CI]` | Sincronizado no GitHub (`villacanabrava-maker/App-Reflex-02`). Head canônico `0c7f14c`, CI Actions verde (run `35454685808`). |
| **Arquitetura Multiagente** | `REFLEX AGENT OS V3` | `[CONFIRMADO-DOCUMENTO]` / `[CONFIRMADO-TESTE]` | Camada runtime-neutral formalizada em `docs/agent-system/` (`CONSTITUTION.md`, `agent-registry.yaml`, schemas JSON). Registry canônico R1–R9 refletido no Antigravity (`rflex-*`) e no Codex (`reflex-*`). 12 Shared Skills `reflex-*` operacionais. Hooks `PreToolUse`, `PostToolUse` e `Stop` em estrita conformidade. |
| **Arquitetura Cognitiva** | `WAVES 1-5 HOMOLOGADAS / V3.1` | `[CONFIRMADO-TESTE]` / `[CONFIRMADO-DOCUMENTO]` | Pipeline de Auditoria Cognitivo V3.1 em 3 camadas; Motor de Abstenção Honesta em 7 categorias; Imutabilidade de relatórios e dossiês via triggers; Zero sinais simulados em busca multi-sinal; Dossiê Contextual com Allowed Use; MILR = 0.0% e AMR = 0.0%. |
| **Supabase** | `38 MIGRATIONS / LIVE` | `[CONFIRMADO-TESTE]` / `[CONFIRMADO-CODIGO]` | Project ref: `xenapowdtfhdwcfthfrn`. **38 migrations aplicadas live** no banco DEV/TEST e registradas em `public._migrations` (incluindo `0038_production_readiness_hardening.sql`). Contagens reais conferidas via schema profiles: 1 obra, 1 versão, 1 doc processado, 20 seções, 47 fragmentos, 22 sínteses, 23 propostas (13 rejeitadas, 10 pendentes), 1 memory event, 0 regras/características confirmadas. RLS e RPCs restritas a `service_role`. |
| **Segurança & AppSec** | `SECURITY-EXCEPTION-DEV-001` | `[DECLARADO-USUARIO]` / `[CONFIRMADO-CODIGO]` | Decisão humana formalizada: `RISK ACCEPTED BY USER — DEVELOPMENT/TEST ONLY`. Credencial de teste mantida ativa; rotação postergada compulsoriamente para o `PRODUCTION SECURITY GATE`. Proibido `supabase db push --linked`. |
| **Hospedagem / Vercel** | `PRODUÇÃO ATIVA / GATE HUMANO` | `[CONFIRMADO-CODIGO]` / `[CONFIRMADO-RUNTIME]` | Vercel de produção ativa em `https://app-reflex-02.vercel.app` (deployment `dpl_FAGKTxzRLcwv5E62oLyWfCjniyVX`, commit `6ad983c`). Leitura e diagnóstico autorizados; deploys e mutações de infraestrutura permanecem sob **Gate Humano Estrito** (bloqueio por padrão de comandos CLI de deploy direto). |
| **Camada OpenAI/Codex** | `INTEGRADA / PASSANDO` | `[CONFIRMADO-TESTE]` / `[CONFIRMADO-DOCUMENTO]` | Pasta `OpenAI ChatGPT/` com 10 arquivos essenciais, 8 skills em `.agents/skills/openai-reflex-*`, 9 subagentes nativos em `.codex/agents/` (O1–O9) e teste `openai-context-layer.test.ts` passando 100%. |
| **Suíte de Testes** | `PASSANDO (100%)` | `[CONFIRMADO-TESTE]` | 34 arquivos de testes Vitest (**181 testes**) cobrindo segurança, isolamento RLS, guardrails, golden dataset, integridade episódica, ontologia SKOS, benchmark multi-sinal, Dossiê Contextual, Red-Team adversarial e harness de agentes V3. |
| **Build de Produção** | `CONCLUÍDO COM SUCESSO` | `[CONFIRMADO-TESTE]` | Next.js 15.5.25 compilando 100% de sucesso em rotas estáticas e dinâmicas (zero erros de types e lint). |

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

1. `[GATE HUMANO]` **Deploy e Mutações na Vercel:** A Vercel de produção está ativa (`app-reflex-02.vercel.app`). Deploys autônomos ou via CLI pelos agentes permanecem bloqueados; qualquer novo deployment exige validação prévia de SHA/branch e consentimento humano explícito.
2. `[BLOQUEADO]` **Self-Review como Substituta de Auditoria:** Especialistas não podem aprovar o próprio código para merge na `main`; o parecer de A7 é independente e obrigatório.
3. `[BLOQUEADO]` **Alterações Diretas de A1 em Código de Produto:** A1 atua como Planner/Orchestrator e deve despachar aos especialistas implementadores (A2–A6).
4. `[BLOQUEADO]` **Pesquisa Sem Orçamento:** A8 deve operar sob orçamento delimitado (máx 3 sub-perguntas e 5 fontes primárias).
5. `[BLOQUEADO]` **Mutações Destrutivas no Supabase:** Proibido `supabase db push --linked`, drop tables ou truncagem em qualquer banco conectado.
6. `[SEGURANÇA ATIVA]` **Exception de Teste:** `SECURITY-EXCEPTION-DEV-001` restrita exclusivamente ao ambiente DEV/TEST; rotação de credenciais compulsoriamente agendada para o Production Security Gate.
