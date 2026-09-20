# Task Packets — Implementação pós-Constituição Cognitiva V1

**Missão mãe:** NEXT-COGNITIVE-CONSTITUTION-RCMO  
**Regra:** estes packets não autorizam execução automática. Cada frente deve ganhar branch própria quando iniciada, com baseline live novo.

## TP-RCMO-01 — Modelo canônico de entidades

**Owner:** R2 + R5  
**Risco:** HIGH  
**Objetivo:** transformar Constituição V1 em contratos de entidades e estados, sem migration.

**In scope**
- Source / Source Version;
- Structural Node;
- Evidence Anchor / Annotation;
- Claim;
- Method Definition / Execution;
- RCMO;
- Proposal;
- Confirmed Authorial Projection;
- lineage e supersession.

**Acceptance**
- schemas lógicos completos;
- invariantes e transições explícitas;
- nenhuma promoção automática de autoria;
- mapping para legado documentado.

**Handoff:** R6 design review.

---

## TP-RCMO-02 — Reconciliação legado V1/V3.1

**Owner:** R2 + R3 + R5  
**Risco:** HIGH  
**Objetivo:** mapear tabelas/migrations V3.1 para o modelo V1 e classificar cada superfície em preserve/adapt/deprecate/backfill.

**Acceptance**
- zero DROP automático;
- estratégia expand-first;
- tabela de compatibilidade;
- plano de rollback;
- ledger `public._migrations` e histórico nativo reconciliados.

**Handoff:** R6 + gate humano antes de qualquer migration.

---

## TP-RCMO-03 — Document Structure V2

**Owner:** R3 + R5  
**Risco:** HIGH  
**Objetivo:** separar estrutura estável de documento das projeções de chunking/retrieval.

**Acceptance**
- identidade de Source Version;
- nós estruturais hierárquicos;
- reprocessamento não destrói lineage;
- chunks classificados como projeções;
- fixtures de edição/versionamento.

---

## TP-RCMO-04 — Evidence / Annotation Core

**Owner:** R3 + R5  
**Risco:** HIGH  
**Objetivo:** implementar âncoras verificáveis inspiradas em Web Annotation.

**Acceptance**
- exact quote + positions + contexto + hash;
- resolução/orphan detection;
- suporte e contraevidência;
- multi-tenant;
- lineage até Source Version;
- Golden families F1–F3 e F16 verdes.

---

## TP-RCMO-05 — RCMO mínimo viável

**Owner:** R5  
**Risco:** HIGH  
**Objetivo:** criar contrato e persistência mínima de RCMO sem integração automática ao Cérebro.

**Acceptance**
- type/schema/method/execution/version;
- evidence references;
- epistemic status;
- abstention;
- supersession;
- output validado por schema;
- nenhuma característica/regra criada automaticamente.

---

## TP-RCMO-06 — Analytical Method Registry

**Owner:** R2 + R5  
**Risco:** HIGH  
**Objetivo:** tornar métodos auditáveis e versionados.

**Acceptance**
- registry canônico;
- input/output contracts;
- prompt/model/config como dependências;
- evaluator associado;
- allowed evidence classes;
- abstention conditions;
- replay identificável.

---

## TP-RCMO-07 — Protocolos das 18 dimensões

**Owner:** R5  
**Risco:** HIGH  
**Objetivo:** substituir análise implícita por protocolos metodológicos versionados para cada dimensão.

**Acceptance**
- cada dimensão aponta para método/versão;
- evidência e contraevidência;
- critérios de suficiência;
- abstention;
- RCMO/proposal como saída;
- aprovação humana antes de projeção autoral.

---

## TP-RCMO-08 — Integração Cérebro Autoral

**Owner:** R5 + R4  
**Risco:** CRITICAL  
**Objetivo:** permitir que RCMOs gerem proposals revisáveis com UI epistemicamente honesta.

**Acceptance**
- source/evidence/status visíveis;
- diff de proposta;
- decisão humana explícita;
- event ledger;
- retry idempotente;
- nenhum bypass por API/UI.

**Handoff:** R6 independente obrigatório + gate humano.

---

## TP-RCMO-09 — Golden Dataset V4 / Evals

**Owner:** R6 + R5  
**Risco:** HIGH  
**Objetivo:** materializar `GOLDEN_DATASET_V4_PLAN.md` em fixtures e runner.

**Acceptance**
- F1–F16;
- MILR=0 gate;
- AMR=0 gate;
- tenant leakage=0;
- forbidden use=0 em famílias críticas;
- artefato de CI por versão metodológica.

---

## TP-RCMO-10 — Replay controlado / produção

**Owner:** R3 + R5 + R7  
**Risco:** CRITICAL  
**Objetivo:** somente após todos os gates, planejar backfill/reprocessamento do corpus existente.

**Acceptance**
- dry-run;
- estimativa de custo/volume;
- rollback;
- observabilidade;
- aprovação humana;
- Supabase/Vercel/GitHub reconciliados no SHA final.

**Proibido:** cron/replay automático antes do gate.
