# Mapping Legado V3.1 → Modelo Canônico V1

**Missão:** TP-RCMO-01  
**Baseline live:** `main@b14d1e7f24f20bb90168312fbfc7abf401750847`  
**Supabase:** `xenapowdtfhdwcfthfrn` — read-only inspection  
**Regra:** este mapping é conceitual. Nenhuma linha é migrada por este documento.

## 1. Estratégia

Classificações:
- **PRESERVE** — superfície já compatível e deve continuar existindo.
- **ADAPT** — semântica válida, mas contrato precisa de camada/adaptação.
- **RECLASSIFY** — dado existente continua válido, porém pertence a outra camada canônica.
- **BACKFILL-LATER** — campo/relação futuro só pode ser preenchido quando houver evidência determinística.
- **DO-NOT-INFER** — é proibido preencher automaticamente a partir de plausibilidade.

O princípio de TP-RCMO-02 será **expand-first**. TP-RCMO-01 não autoriza DDL.

## 2. Tabela de compatibilidade

| Legado V3.1 | Entidade canônica | Classe | Decisão |
|---|---|---|---|
| `biblioteca.obras` | Source | PRESERVE/ADAPT | ID e tenant podem ser preservados; `natureza/papel_fonte` alimentam source_kind/source_role por mapping explícito |
| `biblioteca.versoes_obras` | Source Version | PRESERVE | `id`, `obra_id`, `numero_versao`, `hash_sha256`, mime/size já cobrem núcleo do contrato |
| `processamento.documentos_processados` | Processing Projection | RECLASSIFY | não é Source Version; representa materialização de processamento de uma versão |
| `processamento.secoes` | Structural Node | ADAPT | hierarquia pai/ordem/título é reaproveitável; identidade fica scoped à Source Version |
| `processamento.fragmentos` | Retrieval/Processing Projection | RECLASSIFY | não é Evidence Anchor canônico; pode auxiliar resolução/migração |
| `processamento.vetores` | Retrieval Projection | RECLASSIFY | embedding/ranking não altera epistemologia |
| `processamento.sinteses` | Legacy Derived Artifact / futuro RCMO | ADAPT | não reclassificar como RCMO sem method/version/execution/provenance reconstruíveis |
| `cerebro_autoral.claims` | Claim | PRESERVE/ADAPT | enums físicos V3.1 permanecem canônicos; source_type/id/version precisam resolver para Source Version no futuro |
| `cerebro_autoral.claim_provenance` | Evidence Anchor + Annotation/Binding | ADAPT | quote/start/end/hash são valiosos; faltam source_version explícita, offset_unit, normalization, contexto e relation support/counterevidence |
| `cerebro_autoral.memory_events` | Event/Decision/Lineage Ledger | PRESERVE | append-only, idempotência e causalidade devem ser reutilizadas; não criar ledger paralelo |
| `cerebro_autoral.propostas_atualizacao` | Proposal | PRESERVE/ADAPT | `estado_decisao` mapeia para decision_status; aceitação não equivale por si só a confirmed_authorial |
| `cerebro_autoral.caracteristicas` | Confirmed Authorial Projection / legado | ADAPT | somente linhas com confirmação humana comprovável podem ser classificadas como projeção autoral confirmada |
| `cerebro_autoral.regras` | Confirmed Authorial Projection / legado | ADAPT | idem; `ativa=true` não prova decisão humana |
| `taxonomia.skos_conceitos` | Concept registry externo ao core | PRESERVE | RCMO/Annotation referencia; não criar taxonomia paralela |
| `taxonomia.skos_relacoes` | Concept relation registry | PRESERVE | permanece no namespace SKOS |
| Dossiê V3.1 | retrieval/output projection | PRESERVE | Allowed Use e auditoria continuam gates; não é RCMO automaticamente |

## 3. Mappings determinísticos conhecidos

### 3.1 Source / Source Version

`biblioteca.obras.id -> Source.source_id`  
`biblioteca.versoes_obras.id -> SourceVersion.source_version_id`

`versoes_obras.hash_sha256` mapeia diretamente para `content_hash` com `hash_algorithm=sha256`.

O campo `normalization_profile` **não existe no legado**. Deve ser:
- conhecido pelo extrator e persistido futuramente; ou
- marcado como desconhecido no mapping histórico.

Nunca inventar `NFC` só porque é um default conveniente.

### 3.2 Structural Node

`processamento.secoes` fornece:
- identidade;
- `secao_pai_id`;
- `nivel`;
- `ordem`;
- `titulo`;
- `tipo_secao`.

O vínculo até Source Version é reconstruível por:

`secoes.documento_processado_id -> documentos_processados.versao_obra_id`.

Parágrafos/páginas ainda não possuem entidade estrutural estável própria no schema live.

### 3.3 Evidence Anchor

O legado `claim_provenance` possui:
- `span_texto_original`;
- `span_start`;
- `span_end`;
- `content_hash`.

Gaps bloqueantes:
1. não há `source_version_id` na própria row;
2. não há `offset_unit`;
3. não há `normalization`;
4. não há prefix/suffix;
5. não há `resolution_status`;
6. não há relation support/counterevidence no vínculo.

Uma migration futura pode usar `claim_id -> claims.source_*` para tentar resolver fonte, mas **só** se o mapping de `source_type/source_id/source_version` for determinístico para aquela row.

### 3.4 Claims

Enums live confirmados:
- epistemic: `observed, quoted, extracted, consolidated, confirmed_authorial, inferred, hypothesized, proposed, rejected, superseded`;
- autoria: `AUTHOR_EXPLICIT, EXTERNAL_SOURCE, SYSTEM_INFERENCE, HUMAN_CONFIRMED, UNKNOWN`;
- verificabilidade: `VERIFIABLE, UNVERIFIABLE, AMBIGUOUS`.

A função live `validar_transicao_epistemica` é a referência de enforcement atual. O contrato V1 preserva essa máquina até mudança explicitamente aprovada.

### 3.5 Proposal

Mapping de decisão:

| Legado `estado_decisao` | Canônico |
|---|---|
| pendente | pending |
| confirmada | accepted |
| editada | edited |
| rejeitada | rejected |

**Atenção:** `propostas_atualizacao.estado_decisao='confirmada'` significa que a proposta foi aceita. Não prova isoladamente que qualquer claim ou projeção resultante está em `confirmed_authorial`.

Tipos legacy atuais:
- nova_caracteristica;
- atualizacao_regra;
- nova_metodologia;
- depreciacao.

Novos proposal types futuros devem ser adicionados expand-first; não sobrecarregar `dados_propostos` sem schema/version.

### 3.6 Characteristics / Rules

Risco legado:
- `caracteristicas.estado_revisao` e `estado_proposta` misturam review/materialização histórica;
- defaults como `confirmada` não são evidência suficiente de decisão humana;
- `regras.ativa=true` significa atividade, não provenance de confirmação.

Portanto:
- rows existentes permanecem válidas como dados legacy;
- classificação como Confirmed Authorial Projection exige trilha humana comprovável;
- ausência de decisão recuperável -> **DO-NOT-INFER**; não criar evento humano retroativo fictício.

## 4. Memory Events

Superfície live já fornece:
- `event_type`;
- `actor_type`;
- `actor_id`;
- `aggregate_type/id`;
- `correlation_id`;
- `causation_event_id`;
- `idempotency_key`;
- payload versionado;
- `occurred_at` e `recorded_at`;
- from/to epistemic status.

Decisão:
- **PRESERVE** como ledger auditável;
- eventos futuros de Method/RCMO/Proposal podem exigir expansão do enum `tipo_evento`, mas isso pertence a TP-RCMO-02+;
- Human Decision deve apontar para evento real com `actor_type=HUMAN`.

## 5. Artefatos derivados

### `processamento.sinteses`

Uma síntese existente não pode ser retroativamente chamada de RCMO apenas porque é conteúdo derivado.

Para mapping RCMO seriam necessários pelo menos:
- método/version;
- execution id;
- inputs;
- evidence bindings;
- schema version;
- lineage.

Sem isso: **Legacy Derived Artifact**.

### Branch concorrente `feature/cognitive-constitution-rcmo`

Status reconciliado:
- divergiu do `main` a partir de `e95861c...`;
- contém um commit exclusivo;
- redefine RCMO como “Read-Contextualize-Model-Output”.

Decisão:
- **não integrar em bloco** por conflito com a Constituição canônica;
- `PROTOCOLO_18_DIMENSOES_ESPECIFICACAO.md` pode servir como input documental em TP-RCMO-07, sujeito a revisão;
- qualquer schema daquela branch que use `fragmento_id` como âncora canônica deve ser reescrito para Evidence Anchor/Source Version;
- qualquer threshold/meta não presente no Golden Dataset canônico deve ser tratado como proposta experimental, não norma.

## 6. Backfill classes para TP-RCMO-02

### BF-A — Determinístico
Pode ser calculado sem inferência:
- Source IDs;
- Source Version IDs;
- obra/version numbering;
- links documento_processado -> versão;
- seção -> documento -> versão;
- hash SHA-256 existente.

### BF-B — Determinístico com convenção explícita
Exige conhecer implementação histórica:
- unidade dos offsets;
- normalização usada antes de hash;
- resolução de claim.source_type/source_id em alguns tipos.

### BF-C — Humano/evidência requerida
Nunca preencher automaticamente:
- decisão humana ausente;
- source_role autoral ambíguo;
- relação support vs counterevidence não registrada;
- conteúdo de Proposal que exigiria reconstruir diff perdido;
- confirmação de característica/regra sem evento/trilha auditável.

## 7. Gates para TP-RCMO-02

Antes de qualquer migration:
1. inventário completo de BF-A/B/C;
2. algoritmo de backfill idempotente;
3. dry-run somente leitura;
4. prova de zero perda de tenant/provenance;
5. estratégia de rollback;
6. R6 independente;
7. gate humano para migration live.
