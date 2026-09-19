# TASK PACKETS — MIS-0007: WAVE 1 (FUNDAÇÃO EPISTEMOLÓGICA EXECUTÁVEL)
### Orquestrador: A1 (rflex-architect)
### Modo: MULTI-DOMAIN SEQUENTIAL
**Data:** 19 de setembro de 2026 | **Status:** `EM EXECUÇÃO`

---

## Task Packet 1: A1 & A5 — Resolução do Gate 0 e Modelagem Conceitual
- **Objetivo:** Resolver todas as inconsistências da spec candidata: autoria sem default inseguro, segregação das 3 dimensões ontológicas, state machine de transições, span UTF-16, hash canônico SHA-256 e interface abstrata de NLI.
- **Entregas:**
  - Tipos TypeScript estritos em `src/tipos/cognitivo-v3.ts` (Enums de estados, tipos de claims, papéis de autoridade, schemas Zod de ciclo de vida e interfaces NLI).
  - Módulo do Memory-Inference Firewall em `src/dominios/cerebro/firewall-memoria.ts`.

---

## Task Packet 2: A4 — Engenharia de Dados & Migration Expand-First
- **Objetivo:** Modelar o Claims Ledger no PostgreSQL 17 sem quebrar nenhum código legado, com integridade cross-table estrita via FK composta e RLS ativo.
- **Entregas:**
  - Migration `supabase/migrations/0031_claims_ledger.sql` (Enums, `cerebro_autoral.claims`, `cerebro_autoral.claim_provenance`, FK composta `(claim_id, usuario_id)`, RLS e índices).
  - Atualização do teste de isolamento `tests/seguranca/supabase-isolamento-rls.test.ts` para cobrir a migration 0031.
  - Registro de bloqueio de live apply enquanto P0 estiver em aberto.

---

## Task Packet 3: A5 — Extração de Claims, NLI e Golden Dataset Runner
- **Objetivo:** Implementar o extrator de claims atômicos, o validador NLI configurável e o runner do Golden Dataset V3 (12 famílias CBR).
- **Entregas:**
  - `src/dominios/cerebro/validador-nli.ts` (com threshold versionado e provedor plugável).
  - `src/dominios/cerebro/extrator-claims.ts` (com descontextualização Claimify, hashing canônico e idempotência).
  - `tests/ia/fixtures/golden-dataset-seeds.ts` (Fixtures sintéticas e higienizadas para as 12 famílias CBR).
  - `tests/ia/golden-dataset-runner.test.ts` (Runner das famílias executáveis na Wave 1 com cálculo de MILR, AMR e cobertura).

---

## Task Packet 4: A7 — Auditoria Independente Zero-Trust
- **Objetivo:** Testar e auditar todas as salvaguardas da Wave 1.
- **Entregas:**
  - Testes adversariais em `tests/seguranca/claims-firewall-rls.test.ts` (Prompt injection, cross-user mismatch, violação de firewall, denominador zero em MILR/AMR).
  - Emissão do Laudo de Auditoria Zero-Trust.

---

## Task Packet 5: A9 — Relatório Técnico, Governança e Handoff
- **Objetivo:** Reconciliar toda a entrega, atualizar governança e emitir o handoff AG-0007.
- **Entregas:**
  - `docs/ia/WAVE_1_CLAIMS_EVALS_RESULT.md`.
  - Atualização de `docs/STATUS_PROJETO.md`, `docs/coordenacao/ESTADO_COMPARTILHADO.md` e `docs/coordenacao/INDICE_MISSOES.md`.
  - Relatório `docs/coordenacao/antigravity-para-chatgpt/AG-0007.md`.
