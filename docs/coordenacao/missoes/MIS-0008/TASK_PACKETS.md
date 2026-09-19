# TASK PACKETS — MIS-0008: WAVE 2 (EPISODIC EVENT LEDGER & TIMELINE EPISTÊMICA)
### Orquestrador: A1 (rflex-architect)
### Modo: MULTI-DOMAIN SEQUENTIAL
**Data:** 19 de setembro de 2026 | **Status:** `EM EXECUÇÃO`

---

## Task Packet 1: A1 & A5 — Gate 0: Hardening Corretivo da Wave 1 & Schemas de Eventos
- **Objetivo:** Resolver as 7 inconsistências e qualificações da Wave 1 antes do Event Ledger:
  1. Qualificar `LocalReflexNLIValidator` como `HEURISTIC SHADOW VALIDATOR V1` (sem pretensão semântica enganosa);
  2. Qualificar `ExtratorClaimsV3` como `CLAIM EXTRACTION SCAFFOLD / SHADOW V1`;
  3. Alterar default da Feature Flag `FEATURE_COGNITIVE_V31_CLAIMS` para `off` (ausência de config != ativação implícita);
  4. Corrigir telemetria de custo: `provider_cost_usd = 0` quando local, separando de `estimated_cost_usd` com `cost_basis`;
  5. Formalizar `offset_encoding: "UTF16_CODE_UNIT"` nos tipos e na proveniência;
  6. Modelar união discriminada Zod para eventos: `MemoryEventPayloadSchema` e enums de tipos de evento/atores;
  7. Implementar paridade e espelhamento estrito da State Machine entre TypeScript e PostgreSQL.

---

## Task Packet 2: A4 — Engenharia de Dados & Migration `0032_episodic_event_ledger.sql`
- **Objetivo:** Criar o registro append-only de eventos no PostgreSQL 17, RLS de imutabilidade, integridade de autoria humana e RPC atômica de transição:
  1. Tipos Enum: `cerebro_autoral.tipo_evento`, `cerebro_autoral.tipo_ator`;
  2. Tabela `cerebro_autoral.memory_events` com `idempotency_key`, `correlation_id`, `causation_event_id`, `occurred_at`, `recorded_at`;
  3. Trigger de imutabilidade absoluta (`trg_memory_events_immutable`) rejeitando UPDATE e DELETE;
  4. Fechar mutação arbitrária de claims: remover políticas de UPDATE/DELETE direto de cliente em `cerebro_autoral.claims` e `cerebro_autoral.claim_provenance`;
  5. Função transacional RPC `cerebro_autoral.transicionar_estado_claim` com lock de linha (`FOR UPDATE`), validação de autoridade humana para `confirmed_authorial`, inserção do evento e atualização da projeção atômica;
  6. Foreign Key de `cerebro_autoral.claims.origin_event_id` apontando para `cerebro_autoral.memory_events(id)`;
  7. Atualização dos testes de isolamento de migrations locais.

---

## Task Packet 3: A5 — Módulos de Memória Episódica, Timeline API & Concurrency Control
- **Objetivo:** Implementar em TypeScript os serviços transacionais e de consulta da timeline:
  1. `src/dominios/cerebro/gerenciador-eventos.ts`: Serviço de registro e orquestração de eventos;
  2. `src/dominios/cerebro/transicao-epistemica.ts`: Executor da state machine transacional com controle otimista de concorrência;
  3. `src/dominios/cerebro/timeline-api.ts`: Repositório de consulta com paginação por cursor (evitando offsets desgovernados);
  4. Execução dos casos de TEMPORAL, CONTRADICTION e AUTHOR no Golden Dataset.

---

## Task Packet 4: A7 — Auditoria Independente Zero-Trust (Wave 2)
- **Objetivo:** Submeter a memória episódica a testes adversariais rigorosos:
  1. Tentar UPDATE e DELETE em `memory_events` e validar rejeição;
  2. Tentar atualizar `epistemic_status` para `confirmed_authorial` sem ser ator humano;
  3. Testar atomicidade de falha (rollback quando evento ou projeção falha);
  4. Testar concorrência e lost updates (dois atores tentando transicionar o mesmo claim);
  5. Testar idempotência de eventos (mesmo comando duas vezes gera exatamente 1 evento);
  6. Testar `source.slice(span_start, span_end)` com acentos, emojis, surrogate pairs e aspas curvas sob UTF-16;
  7. Emissão do Laudo de Auditoria Zero-Trust (Wave 2).

---

## Task Packet 5: A9 — Reconciliação, Relatório Técnico e Handoff
- **Objetivo:** Reconciliar o estado real, emitir os relatórios normativos e assegurar a STOP CONDITION:
  1. Registrar com clareza: 32 migrations versionadas, 30 live, 0031 e 0032 `READY-BUT-NOT-APPLIED` devido ao P0;
  2. `docs/ia/WAVE_2_EVENT_LEDGER_RESULT.md`;
  3. Atualização de `docs/STATUS_PROJETO.md`, `docs/coordenacao/ESTADO_COMPARTILHADO.md`, `docs/coordenacao/INDICE_MISSOES.md`;
  4. Relatório de Handoff `docs/coordenacao/antigravity-para-chatgpt/AG-0008.md`;
  5. Encerramento formal (STOP CONDITION respeitada: não iniciar Wave 3).
