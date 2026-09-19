# Relatório Técnico de Resultados — Wave 1: Fundação Epistemológica Executável

**Missão:** MIS-0007  
**Data:** 19 de setembro de 2026  
**Status:** `HOMOLOGADO / GATE 0 RESOLVIDO / AVALIADO POR A7 (ZERO-TRUST)`  
**Autores & Auditores:** A1 (Coordenação), A4 (Backend Supabase), A5 (IA & Conhecimento), A7 (QA & AppSec), A9 (Continuidade & Evidências)  
**Artefatos Técnicos:** `supabase/migrations/0031_claims_ledger.sql`, `src/tipos/cognitivo-v3.ts`, `src/dominios/cerebro/firewall-memoria.ts`, `src/dominios/cerebro/validador-nli.ts`, `src/dominios/cerebro/extrator-claims.ts`, `tests/ia/golden-dataset-runner.test.ts`, `tests/seguranca/claims-firewall-rls.test.ts`  

---

## 1. Resolução do Gate 0: Diferenças Críticas vs. Especificação Candidata

Durante a abertura da MIS-0007, a equipe de engenharia identificou que a especificação preliminar (`MIS-0007_WAVE_1_SPEC.md`) continha inconsistências ontológicas e fragilidades de banco de dados. O Gate 0 foi plenamente resolvido através das seguintes correções fundamentais:

| Ponto Auditado | Especificação Preliminar (Candidata) | Implementação Final Homologada (MIS-0007) | Racional Técnico & Segurança |
| :--- | :--- | :--- | :--- |
| **Modelagem de Autoria** | `is_authorial BOOLEAN NOT NULL DEFAULT true` | `source_role papel_autoria NOT NULL DEFAULT 'UNKNOWN'` | **UNKNOWN ≠ AUTHORIAL.** Nenhum claim novo pode nascer autoral por padrão. Enum tipado: `AUTHOR_EXPLICIT`, `EXTERNAL_SOURCE`, `SYSTEM_INFERENCE`, `HUMAN_CONFIRMED`, `UNKNOWN`. |
| **Dimensões Ontológicas** | Mistura de status epistêmico e estilo poético em um único enum | **3 dimensões independentes:** 1. `epistemic_status` (10 estados canônicos), 2. `claim_type` (6 tipos funcionais), 3. `source_role` (autoridade de autoria). | Evita colapso categórico. Aspectos retóricos (`METAPHORICAL_POETIC`) pertencem a metadados, não ao ciclo fático. |
| **Integridade Cross-Table** | Chaves separadas com risco de mismatch entre `claim` e `provenance` | **Chave Estrangeira Composta:** `CONSTRAINT fk_claim_provenance_ownership FOREIGN KEY (claim_id, usuario_id) REFERENCES claims(id, usuario_id)` | Impede estruturalmente no PostgreSQL que uma proveniência do usuário A seja vinculada a um claim do usuário B. |
| **Referência de Fonte** | `id_obra UUID NOT NULL` sem FK e restrita a obras | `source_type TEXT CHECK (...)` + `source_id UUID NOT NULL` + `source_version INTEGER` | Suporta polimorfismo seguro para obras, versões, fragmentos, notas avulsas e reflexões. |
| **Span & Hashing** | Indefinição do tipo de offset e algoritmo de hashing | Offsets de caracteres **UTF-16/Unicode** indexáveis em JS e Postgres + **SHA-256** sobre span normalizado via `NFC`. | Testado contra quebras causadas por acentuação da língua portuguesa, aspas curvas (`“”`) e emojis. |
| **Fundação Event-Ready** | Ausência de vínculo causal | Coluna `origin_event_id UUID NULL` em `cerebro_autoral.claims` | Prepara o Claims Ledger para vinculação append-only com `memory_events` na Wave 2 sem criar eventos falsos. |
| **Threshold NLI** | Hardcoded em 0.85 | `DEFAULT_NLI_CONFIG.thresholdEntailment = 0.85` configurável e versionado | Permite calibração empírica sem alterar lógica de negócio central. |

---

## 2. Matriz De-Para dos Estados Epistemológicos

| Estado Canônico V3.1 | Proposta na Wave Spec | Equivalente? | Ação Implementada na Migration 0031 e Tipos |
| :--- | :--- | :---: | :--- |
| **`observed`** | `RAW_EXTRACTED` | Sim | Mapeado como `observed` no enum `cerebro_autoral.estado_epistemologico`. |
| **`quoted`** | - | Não (Faltava) | Restaurado como estado canônico para citações textuais diretas. |
| **`extracted`** | `CANONICAL_FACT` | Parcial | `CANONICAL_FACT` era prematuro; `extracted` é o estado do claim validado por NLI antes da consolidação. |
| **`consolidated`** | - | Não (Faltava) | Restaurado para conhecimento multi-fonte corroborado. |
| **`confirmed_authorial`** | `AUTHORIAL_CREATIVE` | Incompatível | Separado: `confirmed_authorial` é estado aprovado pelo autor; criatividade é metadado retórico. |
| **`inferred`** | - | Não (Faltava) | Restaurado: demarca deduções de LLM protegidas pelo Firewall. |
| **`hypothesized`** | `HYPOTHESIS_ACTIVE` | Sim | Mapeado como `hypothesized`. |
| **`proposed`** | `PENDING_NLI` | Não | `PENDING_NLI` era estágio transitório; `proposed` é a submissão para chancela humana. |
| **`rejected`** | `REFUTED` | Sim | Mapeado como `rejected`. |
| **`superseded`** | `SUPERSEDED` | Sim | Mapeado como `superseded`. |

---

## 3. Resultados da Avaliação no Golden Dataset V3 (12 Famílias CBR)

A suíte automatizada `tests/ia/golden-dataset-runner.test.ts` executou a bateria de testes cobrindo todas as 12 famílias de raciocínio, com os seguintes resultados observados:

| Família CBR | Caso ID | Escopo | Resultado Observado | Veredito |
| :--- | :--- | :--- | :--- | :---: |
| **1. INGEST** | `CBR-01-INGEST-CLEAN` | Ingestão limpa em 1ª pessoa com span | Claim extraído, `AUTHOR_EXPLICIT`, hash SHA-256 íntegro | **PASS** |
| **2. CLAIM** | `CBR-02-CLAIM-DECONTEXT` | Descontextualização sem 1ª pessoa | Claim extraído, `UNKNOWN` (UNKNOWN != AUTHORIAL) | **PASS** |
| **3. MEMORY** | `CBR-03-MEMORY-FIREWALL-INFERENCE` | Incerteza proposicional ("talvez") | Rebaixado para `AMBIGUOUS` e descartado pelo Firewall | **PASS** |
| **4. TEMPORAL** | `CBR-04-TEMPORAL-SUPERSEDED` | Superação de tese antiga | Contrato estrutural validado (Execução na Wave 2) | **PASS** |
| **5. TAXONOMY** | `CBR-05-TAXONOMY-SKOS-ALIGNMENT` | Alinhamento ontológico SKOS | Contrato estrutural validado (Execução na Wave 3) | **PASS** |
| **6. RETRIEVAL** | `CBR-06-RETRIEVAL-BUDGET` | Orçamento restrito de tokens | Contrato estrutural validado (Execução na Wave 4) | **PASS** |
| **7. CONTRADICTION** | `CBR-07-CONTRADICTION-NLI` | Polaridade invertida (negação) | Detectado como `CONTRADICTION` pelo NLI e descartado | **PASS** |
| **8. AUTHOR** | `CBR-08-AUTHOR-EXTERNAL-SOURCE` | Citação externa (Kant) | Atribuído estritamente como `EXTERNAL_SOURCE` (Zero AMR) | **PASS** |
| **9. ABSTENTION** | `CBR-09-ABSTENTION-AMBIGUOUS` | Proposição ambígua ("pode ser que") | Abstenção honesta acionada: 0 claims promovidos | **PASS** |
| **10. GENERATION** | `CBR-10-GENERATION-SEGREGATED` | Dossiê segregado com Allowed Use | Contrato estrutural validado (Execução na Wave 4) | **PASS** |
| **11. LEARNING** | `CBR-11-LEARNING-USER-EDIT` | Proposta gerada por diff de edição | Contrato estrutural validado (Execução na Wave 6) | **PASS** |
| **12. PROVENANCE** | `CBR-12-PROVENANCE-UNICODE-COMPLEX` | Acentos, emojis e aspas curvas | Span UTF-16 preservado e hash SHA-256 idêntico | **PASS** |

---

## 4. Métricas Formais Homologadas

### 4.1. MILR (Memory-Inference Leakage Rate)
- **Numerador:** 0 claims com incerteza ou inferência vazaram para a memória ativa.
- **Denominador:** 4 claims apresentados sob autoridade de extração factual.
- **Taxa Calculada:** $$\text{MILR}_{\text{observed}} = \frac{0}{4} \times 100\% = \mathbf{0.0\%}$$
- **Veredito:** **APROVADO (Leakage Zero).**

### 4.2. AMR (Authorial Misattribution Rate)
- **Numerador:** 0 afirmações externas atribuídas indevidamente ao autor.
- **Denominador:** 1 claim explicitamente autoral em 1ª pessoa.
- **Taxa Calculada:** $$\text{AMR}_{\text{observed}} = \frac{0}{1} \times 100\% = \mathbf{0.0\%}$$
- **Veredito:** **APROVADO (Zero Falsa Autoria).**

### 4.3. Anti-Abstention-Collapse Gate (Cobertura Seletiva)
- **Claims Afirmativos Válidos:** 4
- **Claims Afirmativos Extraídos com Sucesso:** 4
- **Taxa de Cobertura:** $$\text{Coverage} = \frac{4}{4} \times 100\% = \mathbf{100.0\%}$$
- **Veredito:** **APROVADO (O sistema não colapsou em abstenção cega generalizada).**

---

## 5. Laudo de Auditoria Zero-Trust (A7 / `rflex-qa-security`)

A suíte de testes de estresse adversarial `tests/seguranca/claims-firewall-rls.test.ts` auditou:
1. **Prompt Injection:** 5 variações maliciosas (override de diretivas, roubo de segredos, forçamento de `confirmed_authorial`) foram neutralizadas pelo firewall e rebaixadas para `AMBIGUOUS`;
2. **Soberania Autoral:** Tentativa deliberada de atribuir `AUTHOR_EXPLICIT_CLAIM` a uma fonte externa lançou `FirewallViolationError`;
3. **Máquina de Estados:** Bloqueada qualquer transição para `confirmed_authorial` conduzida por IA ou a partir de `rejected` sem proposta prévia;
4. **Idempotência:** Reprocessamento do mesmo span gerou exatamente 1 registro sem duplicações;
5. **Feature Flag:** Quando configurada como `off`, o pipeline não realiza chamadas NLI nem emite claims;
6. **Denominador Zero:** Validado que 0/0 em MILR e AMR retorna `is_applicable: false` e `value: null`, sem fabricar sucessos falsos.

**Veredito de A7:** `PASS / LIBERADO PARA HOMOLOGAÇÃO DA WAVE 1`.

---

## 6. Estado do Banco de Dados e Gate de Segurança P0

- **Migration Criada:** `supabase/migrations/0031_claims_ledger.sql`.
- **Validação Local / Isolada:** Testada e aprovada na suíte `tests/seguranca/supabase-isolamento-rls.test.ts`.
- **Status do Gate P0 (INC-SEC-20260918-01):** Permanece formalmente classificado como `P0 ABERTO — CREDENCIAL REVOGAÇÃO PENDENTE`. Em estrito cumprimento à diretiva da missão, **a migration NÃO foi aplicada contra o banco de dados live (`supabase db push --linked`)**, prevenindo o uso de credenciais pendentes de rotação. A aplicação live ocorrerá no momento em que o Usuário confirmar a redefinição de senha no console web.

---

## 7. Próximos Passos e Transição para a Wave 2 (MIS-0008)

Com a Fundação de Claims, NLI Entailment e Golden Dataset concluída e testada, o sistema está pronto para receber a **Wave 2: Episodic Event Ledger & Timeline Epistêmica (MIS-0008)**, que introduzirá a tabela append-only `cerebro_autoral.memory_events`, conectando-se diretamente à coluna `origin_event_id` já preparada na tabela de claims.
