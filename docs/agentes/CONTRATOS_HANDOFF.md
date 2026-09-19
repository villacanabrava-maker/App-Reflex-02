# CONTRATOS DE HANDOFF E COMUNICAÇÃO TIPADA — APP REFLEX 02
### Especificação dos Task Packets, Output Contracts, Condições de Done, Abstain e Escalação
**Missão:** AGENT HARNESS V2 | **Status:** Normativo e Canônico | **Data:** 2026-09-18

---

## 1. O Princípio da Comunicação Tipada entre Agentes

A comunicação informal ou vaga ("fiz as alterações, veja se está bom") é proibida no App Reflex 02. Toda delegação de A1 para um especialista ocorre via **Task Packet**, e toda entrega de um especialista ocorre via **Output Contract** estruturado.

---

## 2. Especificação dos Output Contracts por Agente

### A2 — Design & UX (`rflex-product-design`)
```yaml
agent: "rflex-product-design"
task_id: "TSK-02-01"
component_spec: "src/componentes/cerebro/GrafoVisual.tsx"
tokens_used: ["color.surface.secondary", "spacing.4", "radius.md"]
wcag_aa_compliance:
  contrast_ratio: "7.1:1"
  focus_visible: true
  aria_labels_present: true
interactive_states: ["default", "hover", "focus-visible", "disabled"]
risks: "Gráficos SVG muito complexos podem degradar em telas de baixa densidade."
```

### A3 — Frontend (`rflex-frontend`)
```yaml
agent: "rflex-frontend"
task_id: "TSK-03-01"
components_created: ["src/componentes/cerebro/ClaimCard.tsx"]
routes_impacted: ["/cerebro"]
typecheck_status: "PASS (0 errors)"
lint_status: "PASS (0 errors)"
bundle_impact: "+1.2kB First Load JS"
tests_passing: "tests/cerebro/claim-card.test.ts (4 tests)"
evidence: "[CONFIRMADO-TESTE]"
```

### A4 — Backend & Supabase (`rflex-backend-supabase`)
```yaml
agent: "rflex-backend-supabase"
task_id: "TSK-04-01"
schema_impact: "Tabela taxonomia.conceitos_relacoes adicionada"
migration_created: "supabase/migrations/0031_conceitos_relacoes.sql"
rls_impact: "RLS ativo; policies para SELECT (autor_id) e INSERT (auth.uid() = autor_id)"
rollback_plan: "DROP TABLE taxonomia.conceitos_relacoes CASCADE;"
performance_impact: "Índice btree em (autor_id, conceito_origem_id); latência < 2ms"
tests: "tests/seguranca/supabase-isolamento-rls.test.ts"
risks: "Sem risco de bloqueio de tabela (tabela nova sem dados)."
evidence: "[CONFIRMADO-CODIGO] e [CONFIRMADO-TESTE]"
```

### A5 — IA & Conhecimento (`rflex-ai-knowledge`)
```yaml
agent: "rflex-ai-knowledge"
task_id: "TSK-05-01"
model_or_prompt_changed: "prompt_claim_extractor_v1.4"
epistemic_impact: "Garante estado 'extracted' com entailment >= 0.85"
zod_schema_enforced: "ClaimSchemaV3_1"
evals_run: "tests/ia/claim-entailment.test.ts (12 casos)"
milr_metric: "0.0% de vazamento de inferência"
estimated_cost: "$0.002 por 1.000 tokens processados"
evidence: "[CONFIRMADO-TESTE]"
```

### A6 — Plataforma & SRE (`rflex-platform`)
```yaml
agent: "rflex-platform"
task_id: "TSK-06-01"
ci_status: "VERDE (Run 35414164109)"
branch_status: "main sincronizada com origin"
secret_hygiene: "100% limpo; zero credenciais hardcoded em git grep"
deploy_status: "Vercel rigorosamente inativo e adiado"
evidence: "[CONFIRMADO-CI]"
```

### A7 — Qualidade & AppSec (`rflex-qa-security`)
```yaml
agent: "rflex-qa-security"
task_id: "TSK-07-01"
verdict: "PASS / APPROVED FOR RELEASE"
tests_run: 74
failures: 0
security_findings: "Nenhuma vulnerabilidade crítica; RLS auditado em 30 migrations"
release_blockers: "Nenhum no repositório. P0 de banco aguardando rotação humana no Supabase."
evidence: "[CONFIRMADO-TESTE] e [CONFIRMADO-CODIGO]"
```

### A8 — Pesquisa & Evolução (`rflex-research-evolution`)
```yaml
agent: "rflex-research-evolution"
task_id: "TSK-08-01"
question: "Como implementar GraphRAG sem banco Neo4j externo?"
sources_evaluated: 5
top_source: "HippoRAG 2 Preprint / W3C SKOS Recommendation"
proposal: "PostgreSQL 17 com CTEs recursivas (WITH RECURSIVE)"
stop_reason: "Pergunta respondida conclusivamente com prova de conceito em SQL"
evidence: "[CONFIRMADO-EXTERNAL]"
```

### A9 — Continuidade & Evidência (`rflex-continuity-evidence`)
```yaml
agent: "rflex-continuity-evidence"
mission_id: "MIS-0005"
report_issued: "docs/coordenacao/antigravity-para-chatgpt/AG-0004.md"
diff_reconciliation: "100% isomórfico com o prompt CG-0003"
divergences_detected: 0
state_ledger_updated: true
recommended_next_mission: "MIS-0006 (Fase 1 + 2: Claims e Evals)"
evidence: "[CONFIRMADO-CODIGO], [CONFIRMADO-TESTE], [CONFIRMADO-CI]"
```

---

## 3. Matriz de Condições de Parada: Done, Abstain e Escalate

| Agente | Condition of Done (Quando Encerrar) | Condition of Abstain (Quando Declarar Bloqueio) | Condition of Escalate (Para Quem Escalar) |
|---|---|---|---|
| **A1** | Plano aprovado, tarefas distribuídas e laudo A7 verde. | Requisitos ambíguos ou contraditórios do usuário. | Escala ao Usuário / ChatGPT. |
| **A2** | Protótipo visual completo e conformidade WCAG AA. | Ausência de fluxo de usuário ou personas definidas. | Escala a A1. |
| **A3** | Componente renderizado, responsivo e tipos TypeScript 0 erros. | API inexistente ou contrato de dados não fornecido. | Escala a A4 e A1. |
| **A4** | Migration idempotente criada e teste de RLS verde. | Desconhecimento do estado live do banco de dados. | Escala a A1 / Usuário (ASK). |
| **A5** | Schema Zod validado e taxa MILR = 0.0% nos evals. | Ausência de benchmark ou dados de teste suficientes. | Escala a A7 e A8. |
| **A6** | CI local e remoto verde sem segredos expostos. | Falha de infraestrutura remota do GitHub Actions. | Escala a A1. |
| **A7** | 100% dos testes executados e laudo formal emitido. | Impossibilidade de rodar testes automatizados. | Escala a A1 (BLOCK RELEASE). |
| **A8** | Pergunta respondida com fontes primárias avaliadas. | Ausência de literatura crível ou dados empíricos. | Escala a A1 com aviso de lacuna. |
| **A9** | Relatório AG-XXXX emitido e livro-razão reconciliado. | Divergência insanável entre plano e diff real de código. | Escala a A1 com alerta de desvio. |
