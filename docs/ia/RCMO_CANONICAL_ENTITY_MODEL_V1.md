# Modelo Canônico de Entidades Cognitivas V1

**Missão:** TP-RCMO-01  
**Issue:** #21  
**Baseline:** `b14d1e7f24f20bb90168312fbfc7abf401750847`  
**Status:** proposta de contrato lógico para revisão R6  
**Regra:** este documento não cria tabelas e não autoriza migration.

## 1. Objetivo

Materializar a Constituição Cognitiva V1 em um modelo lógico que possa ser implementado posteriormente sem confundir fonte, estrutura, evidência, claims, análise metodológica e memória autoral.

A cadeia canônica permanece:

```text
Source
  -> Source Version
  -> Structural Node
  -> Evidence Anchor
  -> Annotation / Evidence Binding
  -> Claim
  -> Method Execution
  -> RCMO
  -> Proposal
  -> Human Decision
  -> Confirmed Authorial Projection
```

`memory_events` funciona como ledger episódico/auditável transversal. Não é substituído por este modelo.

## 2. Regras globais

### G1 — Tenant obrigatório
Toda entidade persistente pertencente a usuário deve carregar `tenant_id`/equivalente e qualquer relação cross-entity deve preservar isolamento do mesmo tenant.

### G2 — Identidade ≠ conteúdo
IDs identificam entidades. Conteúdo mutável relevante cria versão, evento ou supersession; não redefine silenciosamente a identidade histórica.

### G3 — Source Version é a unidade de conteúdo verificável
Evidence Anchor nunca aponta apenas para chunk de retrieval. Deve resolver contra uma Source Version determinada.

### G4 — Processing Projection não é fonte
Chunks, embeddings e sínteses operacionais podem ser refeitos e não ganham autoridade epistêmica por existir.

### G5 — Evidência é endereço verificável
Um Evidence Anchor descreve onde está o suporte. Ele não contém, por si só, a afirmação que o sistema deseja defender.

### G6 — Claim é proposição
Claim é unidade declarativa atômica com status epistêmico e papel de origem próprios.

### G7 — Método é versionado
Método analítico é identificado por `method_id + method_version`. Prompt/model/config são dependências de uma execução/versionamento, não a identidade conceitual do método.

### G8 — RCMO é análise derivada
RCMO é sempre resultado metodológico derivado. `accepted` significa análise humana aceita, nunca memória autoral confirmada.

### G9 — Proposal não é projeção autoral
Aceitar/editar uma Proposal deve produzir uma Human Decision auditável antes de qualquer materialização autoral.

### G10 — Confirmed Authorial Projection exige decisão humana
Nenhuma execução, modelo, confiança ou consenso substitui o evento humano explícito que autoriza uma projeção como autoral.

### G11 — Contraevidência é first-class
Bindings de evidência distinguem ao menos `support`, `counterevidence` e `context`.

### G12 — Supersession não apaga
Correções criam novas entidades/versões ou arestas `supersedes`. Histórico e provenance permanecem consultáveis.

## 3. Entidades

### 3.1 Source

Representa a origem conceitual de conteúdo.

Campos mínimos:
- `source_id: uuid`
- `tenant_id: uuid`
- `source_kind: author_work | external_work | reflection | note | audio | other`
- `source_role: AUTHOR_EXPLICIT | EXTERNAL_SOURCE | UNKNOWN`
- `title: string`
- `metadata: object`
- `created_at: timestamp`

**Não contém:** chunking, embedding, estado epistêmico de claims.

### 3.2 Source Version

Snapshot identificável do conteúdo de uma Source.

Campos mínimos:
- `source_version_id: uuid`
- `tenant_id: uuid`
- `source_id: uuid`
- `version_number: integer >= 1`
- `content_hash: string`
- `hash_algorithm: sha256`
- `mime_type: string | null`
- `size_bytes: integer | null`
- `normalization_profile: string`
- `created_at: timestamp`

Invariantes:
- `(source_id, version_number)` único no tenant;
- mudança material de conteúdo cria nova versão;
- hash e normalização devem ser suficientes para verificar selectors.

### 3.3 Structural Node

Nó hierárquico estável dentro de uma Source Version.

Campos mínimos:
- `structural_node_id: uuid`
- `tenant_id: uuid`
- `source_version_id: uuid`
- `parent_node_id: uuid | null`
- `node_type: document | chapter | section | paragraph | page | turn | block | other`
- `ordinal: integer`
- `label: string | null`
- `structural_path: string[]`
- `locator: object`
- `created_at: timestamp`

Um Structural Node pode ajudar a resolver evidência, mas não substitui selector verificável.

### 3.4 Evidence Anchor

Endereço verificável de evidência em uma Source Version.

Campos mínimos:
- `evidence_anchor_id: uuid`
- `tenant_id: uuid`
- `source_version_id: uuid`
- `structural_node_id: uuid | null`
- `selector_type: text_quote | text_position | quote_and_position | media_fragment`
- `exact_quote: string | null`
- `prefix: string | null`
- `suffix: string | null`
- `start: integer | null`
- `end: integer | null`
- `offset_unit: unicode_code_point | utf16_code_unit | byte | time_ms | none`
- `normalization: none | NFC | NFD | NFKC | NFKD`
- `content_hash: string`
- `resolution_status: resolved | orphaned | ambiguous`
- `created_at: timestamp`

Invariantes:
- `start/end` só têm significado junto com `offset_unit`;
- para texto posicional: `start >= 0` e `end > start`;
- `exact_quote` é obrigatório para `text_quote` e `quote_and_position`;
- reprocessar chunks não pode invalidar automaticamente a âncora;
- resolver uma âncora em conteúdo materialmente diferente requer nova Source Version ou status não resolvido.

### 3.5 Annotation / Evidence Binding

Relação entre uma âncora e um corpo semântico.

Campos mínimos:
- `annotation_id: uuid`
- `tenant_id: uuid`
- `evidence_anchor_id: uuid`
- `body_kind: claim | concept | note | label | rcmo | proposal`
- `body_ref: EntityRef | null`
- `body_value: object | null`
- `relation: support | counterevidence | context | example | definition | mentions`
- `created_at: timestamp`

Regras:
- um Claim/RCMO pode ter múltiplos supports e counterevidences;
- ranking/retrieval não muda `relation`;
- Annotation não confirma verdade nem autoria.

### 3.6 Claim

Afirmação atômica verificável ou explicitamente marcada como não verificável.

Campos mínimos:
- `claim_id: uuid`
- `tenant_id: uuid`
- `statement: string`
- `subject/predicate/object: string | null`
- `claim_type`
- `epistemic_status`
- `source_role`
- `verifiability`
- `language`
- `nli_confidence: number | null`
- `origin_event_id: uuid | null`
- `primary_source_version_id: uuid | null`
- `created_at / updated_at`

Enums V3.1 preservados:

`claim_type`
- SOURCE_CLAIM
- AUTHOR_EXPLICIT_CLAIM
- SUMMARY_CLAIM
- INFERRED_CLAIM
- HYPOTHESIS_CLAIM
- PROCEDURAL_CLAIM

`epistemic_status`
- observed
- quoted
- extracted
- consolidated
- confirmed_authorial
- inferred
- hypothesized
- proposed
- rejected
- superseded

`source_role`
- AUTHOR_EXPLICIT
- EXTERNAL_SOURCE
- SYSTEM_INFERENCE
- HUMAN_CONFIRMED
- UNKNOWN

`verifiability`
- VERIFIABLE
- UNVERIFIABLE
- AMBIGUOUS

#### Máquina de transição V3.1 observada live

Além de transição idempotente, o runtime atual permite:
- observed -> quoted por EXTRACTOR_PIPELINE;
- observed -> extracted por EXTRACTOR_PIPELINE ou NLI_VALIDATOR;
- quoted -> extracted por NLI_VALIDATOR;
- extracted -> consolidated por SYSTEM_WORKER;
- extracted -> proposed por COGNITIVE_AGENT ou SYSTEM_WORKER;
- extracted -> rejected por NLI_VALIDATOR ou HUMAN;
- inferred -> hypothesized por COGNITIVE_AGENT ou SYSTEM_WORKER;
- hypothesized -> proposed por COGNITIVE_AGENT ou HUMAN;
- proposed -> confirmed_authorial **somente por HUMAN**;
- proposed -> rejected por HUMAN, NLI_VALIDATOR ou COGNITIVE_AGENT;
- rejected -> proposed por COGNITIVE_AGENT ou HUMAN;
- confirmed_authorial -> superseded **somente por HUMAN**;
- consolidated -> superseded por SYSTEM_WORKER ou HUMAN.

A implementação futura não pode alargar essas transições silenciosamente.

### 3.7 Method Definition

Definição versionada e auditável de método analítico.

Campos mínimos:
- `method_id: string` estável;
- `method_version: string`;
- `objective: string`;
- `owner_role: R1..R9`;
- `input_entity_types: string[]`;
- `output_schema_ref: string`;
- `allowed_evidence_relations: string[]`;
- `preconditions: string[]`;
- `abstention_conditions: string[]`;
- `evaluator_refs: string[]`;
- `dependencies: object[]`;
- `effective_from: timestamp`;
- `retired_at: timestamp | null`.

Mudança material em prompt, regras, schema, evaluator ou algoritmo exige nova versão ou declaração explícita de compatibilidade.

### 3.8 Method Execution

Execução concreta de uma Method Definition.

Campos mínimos:
- `execution_id: uuid`
- `tenant_id: uuid`
- `method_id`
- `method_version`
- `input_refs: EntityRef[]`
- `input_hashes: string[]`
- `dependency_snapshot: object`
- `status: running | succeeded | abstained | failed`
- `abstention_reason: enum | null`
- `output_refs: EntityRef[]`
- `correlation_id: uuid`
- `causation_event_id: uuid | null`
- `started_at / finished_at`

Abstention reasons canônicos:
- NO_EVIDENCE
- LOW_SUPPORT
- CONTRADICTORY_EVIDENCE
- AMBIGUOUS_SOURCE
- AMBIGUOUS_SCOPE
- AUTHORIAL_UNKNOWN
- METHOD_NOT_APPLICABLE
- OUT_OF_SCOPE
- VERSION_MISMATCH

### 3.9 RCMO — Reflex Cognitive Method Object

Artefato analítico versionado produzido por uma Method Execution.

Campos mínimos:
- `rcmo_id: uuid`
- `tenant_id: uuid`
- `rcmo_type: string`
- `schema_version: string`
- `method_execution_id: uuid`
- `subject_scope: object`
- `content: object`
- `evidence_annotation_ids: uuid[]`
- `confidence: object | null`
- `status: generated | validated | proposed | accepted | rejected | superseded`
- `abstention_reason: enum | null`
- `review_event_id: uuid | null`
- `supersedes_rcmo_id: uuid | null`
- `created_at`

Transições mínimas:
- generated -> validated;
- validated -> proposed;
- proposed -> accepted **somente com Human Decision**;
- proposed -> rejected **somente com Human Decision**;
- accepted -> superseded por nova análise/versionamento, preservando a decisão anterior;
- qualquer transição idempotente pode ser aceita sem novo efeito material.

**Proibido:** `accepted -> confirmed_authorial`. Não existe essa transição no namespace RCMO.

### 3.10 Proposal

Candidato revisável a mudança taxonômica/autoral/metodológica.

Campos mínimos:
- `proposal_id: uuid`
- `tenant_id: uuid`
- `proposal_type: string`
- `payload: object`
- `diff: object | null`
- `rationale: string`
- `confidence: number | null`
- `source_refs: EntityRef[]`
- `decision_status: pending | accepted | edited | rejected`
- `decision_event_id: uuid | null`
- `created_at`
- `decided_at: timestamp | null`

**Importante:** `accepted` aqui significa decisão sobre a proposta. Só vira projeção autoral se a decisão humana autorizar uma materialização específica.

### 3.11 Human Decision

Registro lógico de decisão humana; no legado atual é representável pelo Event Ledger e/ou dados de decisão da Proposal.

Campos mínimos:
- `decision_event_id: uuid`
- `tenant_id: uuid`
- `actor_type: HUMAN`
- `actor_id: string`
- `subject_ref: EntityRef`
- `decision: accept | edit_accept | reject | supersede`
- `justification: string | null`
- `payload_hash: string`
- `recorded_at: timestamp`

Não deve ser fabricado por backend como se fosse usuário.

### 3.12 Confirmed Authorial Projection

Materialização do estado que o produto pode tratar como autoral confirmado.

Campos mínimos:
- `projection_id: uuid`
- `tenant_id: uuid`
- `projection_type: characteristic | rule | claim | concept | methodology`
- `source_proposal_id: uuid`
- `decision_event_id: uuid`
- `content_ref: EntityRef | null`
- `content_snapshot: object`
- `status: active | superseded | revoked`
- `supersedes_projection_id: uuid | null`
- `effective_at: timestamp`

Invariantes:
- `decision_event_id` obrigatório e deve apontar para HUMAN;
- não pode nascer de Method Execution/RCMO diretamente;
- supersession/revogação de projeção já autoral também exige decisão humana quando altera o que o sistema atribui ao autor.

### 3.13 Lineage Edge

Relação auditável genérica entre entidades.

Campos:
- `lineage_edge_id: uuid`
- `tenant_id: uuid`
- `from_ref: EntityRef`
- `to_ref: EntityRef`
- `relation: version_of | derived_from | generated_by | supported_by | counterevidenced_by | proposed_from | materialized_from | confirmed_by | supersedes | references`
- `event_id: uuid | null`
- `created_at`

Nenhuma aresta muda, sozinha, a autoridade epistêmica de um nó.

## 4. EntityRef

Forma canônica para referências polimórficas:

```json
{
  "entity_type": "claim",
  "id": "00000000-0000-0000-0000-000000000000"
}
```

`entity_type` deve pertencer ao registry de entidades vigente.

## 5. Separação dos namespaces de estado

| Namespace | Estados | Significado |
|---|---|---|
| Claim epistemic | observed…superseded | força/origem epistêmica |
| Evidence resolution | resolved/orphaned/ambiguous | capacidade de resolver âncora |
| Method Execution | running/succeeded/abstained/failed | resultado operacional da execução |
| RCMO review/lifecycle | generated/validated/proposed/accepted/rejected/superseded | ciclo do artefato analítico |
| Proposal decision | pending/accepted/edited/rejected | decisão sobre candidato |
| Authorial Projection | active/superseded/revoked | estado materializado autoral |

É proibido converter estados por similaridade nominal. Em particular:
- RCMO `accepted` != Claim `confirmed_authorial`;
- Proposal `accepted` != Claim `confirmed_authorial`;
- Evidence `resolved` != Claim `validated/consolidated`.

## 6. Provenance mínima reconstruível

Para qualquer Confirmed Authorial Projection, deve ser possível reconstruir:

```text
projection
  -> human decision
  -> proposal
  -> RCMO(s) / claim(s)
  -> method execution
  -> method definition + version
  -> annotation/evidence binding
  -> evidence anchor
  -> source version
  -> source
```

Nem toda projeção precisa ter RCMO; uma confirmação humana direta de claim pode seguir:

```text
projection -> human decision -> proposal/claim -> evidence anchor -> source version -> source
```

## 7. Stop conditions para implementação física

TP-RCMO-02 ou posterior deve parar se descobrir que:
- um ID legacy não pode ser mapeado sem perder tenant/provenance;
- offsets não podem ser interpretados sem conhecer sua unidade;
- uma característica/regra confirmada não possui evidência de decisão humana recuperável;
- backfill exigiria inventar evidence anchor;
- uma migration exigiria DROP/overwrite para satisfazer o modelo;
- um campo legacy mistura estados de namespaces diferentes sem regra determinística de mapping.

Esses casos exigem estratégia explícita de legado, não preenchimento plausível.
