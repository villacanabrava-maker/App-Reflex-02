# Constituição Cognitiva V1 — App Reflex 02

**Status:** proposta normativa para revisão R6  
**Missão:** NEXT-COGNITIVE-CONSTITUTION-RCMO  
**Baseline:** `e95861c8c3355642d3e1b7946d40bc1fa6502c18`  
**Escopo:** arquitetura cognitiva, documental e epistêmica.  
**Fora de escopo:** migration live, reprocessamento, mudança funcional em produção.

## 1. Propósito

A Constituição Cognitiva V1 define os limites entre **fonte**, **estrutura documental**, **evidência**, **claim**, **análise**, **RCMO**, **inferência**, **proposta** e **memória autoral confirmada**.

Ela complementa o Design Freeze Cognitivo V3.1. Não revoga os invariants de soberania autoral, Memory-Inference Firewall, proveniência, abstenção, Structured Outputs, RLS, SKOS, telemetria real e auditoria.

## 2. Princípio fundamental

> **Nenhuma transformação computacional aumenta, por si só, a autoridade epistêmica ou autoral de um conteúdo.**

Extração não confirma.  
Resumo não confirma.  
Retrieval não confirma.  
Classificação não confirma.  
RCMO não confirma.  
Consenso entre modelos não confirma.  
Repetição não confirma.

Somente evidência adequada + regra explícita de transição + decisão humana, quando exigida, podem promover estado.

## 3. Ontologia operacional mínima

### 3.1 Source

Origem humana ou externa registrada no sistema: obra, áudio, reflexão, nota, URL, documento ou outra fonte suportada.

### 3.2 Source Version

Estado imutável ou logicamente imutável de uma Source em um momento. Deve possuir identificador de versão e hash suficiente para detectar mudança material.

### 3.3 Document Structure

Representação estrutural da Source Version: páginas, capítulos, seções, parágrafos, blocos, turnos ou outros nós hierárquicos.

**Document Structure não é conhecimento.** É organização do suporte.

### 3.4 Evidence Anchor

Âncora verificável que aponta para um trecho da Source Version.

Contrato mínimo:
- source/version;
- structural node opcional;
- span start/end quando aplicável;
- `offset_unit`/espaço de coordenadas explícito (ex.: Unicode code points ou UTF-16 code units);
- normalização textual explícita (ex.: NFC) quando offsets/hash dependerem dela;
- exact quote;
- prefix/suffix ou contexto equivalente;
- content hash;
- media/time coordinates quando não textual;
- provenance da extração.

Uma âncora pode tornar-se órfã após edição; isso deve ser detectável.

### 3.5 Annotation

Entidade que relaciona uma Evidence Anchor a uma classificação, nota, entidade, conceito, claim ou outro corpo interpretativo.

Annotation nunca implica verdade nem autoria por si só.

### 3.6 Claim

Afirmação atômica verificável ou explicitamente marcada como não verificável. Claims preservam:
- estado epistêmico;
- papel de autoria/origem;
- provenance;
- evidências de suporte e, quando houver, contraevidências;
- versão.

### 3.7 Method Definition

Definição versionada de um método analítico.

Contrato mínimo:
- `method_id`;
- versão semântica ou equivalente;
- objetivo;
- classes de input permitidas;
- precondições;
- schema de output;
- passos observáveis suficientes para auditoria;
- regras de evidência;
- condições de abstention;
- evaluator/eval suite;
- owner e data de vigência.

Prompts e modelos são dependências de uma versão do método, não a identidade conceitual do método.

### 3.8 Method Execution

Execução concreta de uma Method Definition sobre inputs específicos, registrando:
- versão do método;
- inputs e hashes;
- modelo/prompt/config quando aplicável;
- timestamp;
- outputs;
- falhas/abstention;
- métricas;
- provenance.

### 3.9 RCMO — Reflex Cognitive Method Object

**RCMO** é um objeto cognitivo versionado produzido por uma Method Execution e fundamentado em Evidence Anchors, Claims ou outros RCMOs permitidos pelo método.

RCMO representa **resultado analítico**, não memória confirmada.

Contrato mínimo:
- `rcmo_id`;
- `rcmo_type`;
- `schema_version`;
- `method_id` + versão;
- `execution_id`;
- sujeito/escopo;
- inputs referenciados;
- evidências positivas;
- contraevidências;
- conteúdo estruturado;
- lifecycle/review status próprio do RCMO;
- base epistêmica derivável de provenance e inputs, sem sobrescrever o estado dos claims de origem;
- confidence quando tecnicamente justificável;
- abstention status/reason;
- provenance;
- supersession lineage;
- created_at.

Exemplos futuros de tipos:
- mapa argumentativo;
- tensão/contradição;
- padrão estilístico;
- hipótese interpretativa;
- síntese temática;
- comparação longitudinal;
- perfil de dimensão;
- questão reflexiva derivada.

Esses tipos só se tornam canônicos por registry/versionamento.

### 3.10 Proposal

Candidato a mudança do estado autoral ou taxonômico. Pode ser derivado de RCMO, claim ou edição humana.

Proposal é sempre revisável e deve carregar evidência e diff.

### 3.11 Confirmed Authorial Projection

Projeção materializada do que o sistema pode tratar como estado autoral confirmado. Deve ser derivável de decisão humana auditável e nunca apenas de output de modelo.

## 4. Invariantes V1

### C1 — Fonte não é interpretação
Uma Source Version preserva conteúdo; interpretações vivem em outras entidades.

### C2 — Estrutura não é evidência
Seção, página ou fragmento é endereço estrutural. Evidência exige âncora verificável.

### C3 — Evidência não é claim
Trecho citado não determina sozinho qual afirmação é válida.

### C4 — Claim não é memória
Claims podem ser externos, extraídos, inferidos, hipotéticos, rejeitados ou superseded.

### C5 — RCMO não é memória
RCMO é derivado metodológico. Mesmo um RCMO de alta confiança continua derivado.

### C6 — Método precisa de versão
Mudança relevante em prompt, algoritmo, regras, schema ou evaluator cria nova versão metodológica ou compatibilidade explicitamente demonstrada.

### C7 — Toda derivação importante é reconstruível
Deve ser possível caminhar de uma projeção autoral ou RCMO até source version + anchors + atividade que o gerou.

### C8 — Contraevidência é first-class
Métodos que sintetizam posição, característica, regra, dimensão ou tese devem poder carregar suporte e oposição.

### C9 — Ambiguidade gera abstention
Quando identidade da fonte, alcance do span, entailment, autoria, método ou contexto forem insuficientes, o sistema não deve preencher lacunas por plausibilidade.

### C10 — Toda promoção autoral requer gate humano
Nenhuma entidade derivada recebe autoridade de memória autoral confirmada sem uma transição permitida **e uma decisão humana explícita e auditável**. Não existe domínio, método, modelo, nível de confiança ou consenso entre agentes que dispense esse gate.

### C11 — Externalidade permanece visível
Conteúdo externo pode influenciar análise, mas sua origem deve permanecer explícita em retrieval, RCMO e geração.

### C12 — Retrieval não reescreve epistemologia
Ranking muda relevância de recuperação, não status epistêmico.

### C13 — Nenhuma métrica única governa qualidade
Release gates devem separar retrieval, grounding, attribution, abstention e integridade de autoria.

### C14 — Histórico é append/supersede
Correção preferencialmente cria nova versão, evento ou supersession; não apaga a trilha que justificou estados anteriores.

### C15 — UI epistemicamente honesta
Toda ação que possa alterar entendimento do usuário sobre "o que eu penso" deve exibir fonte, evidência, status e ação humana relevante.

## 5. Document Structure V2

A árvore documental deve ser independente do chunking de retrieval.

```text
Source
└── Source Version
    └── Document
        ├── Structural Node (chapter/section/paragraph/page/turn/...)
        │   └── Evidence Anchor
        └── Processing Projection
            ├── Retrieval Chunk
            ├── Embedding
            └── Derived Summary
```

Regras:
1. Structural Node tem identidade estável dentro da versão.
2. Retrieval Chunk é projeção operacional e pode ser refeito.
3. Evidence Anchor aponta para a Source Version, não depende exclusivamente do chunk.
4. Todo span textual declara sua convenção de offset/normalização; consumidores não podem presumir que Unicode code points e UTF-16 code units sejam intercambiáveis.
5. Reprocessamento pode substituir chunks sem invalidar automaticamente evidências bem ancoradas.
6. Alteração material da fonte cria nova Source Version.

## 6. Evidence / Annotation Core

O Core deve suportar:
- citação literal;
- posição;
- contexto;
- hash;
- relação semântica;
- autoria/origem;
- suporte vs contraevidência;
- status de resolução;
- orphan detection.

Modelo lógico inspirado em W3C Web Annotation:
```text
Annotation
  body -> claim/concept/note/label
  target -> Source Version + Selector
```

Não há exigência de serializar RDF no MVP.

## 7. Analytical Method Registry

O registry canônico deve responder:
- quais métodos existem;
- qual versão está vigente;
- quais inputs aceitam;
- quais outputs produzem;
- quais evidências exigem;
- quando devem abster-se;
- quais evals bloqueiam release;
- quais métodos podem alimentar proposals;
- quais métodos são apenas exploratórios.

Nenhum método pode ser "um prompt solto" sem identidade/versionamento.

## 8. Relação com as 18 dimensões

As 18 dimensões continuam catálogo canônico, mas deixam de ser tratadas como um único procedimento implícito.

Cada dimensão deve declarar um **protocolo metodológico versionado**, podendo combinar:
- sinais estruturais;
- claims;
- evidência lexical;
- padrões recorrentes;
- contraevidência;
- análise longitudinal;
- perguntas reflexivas;
- abstention.

Resultado de análise de dimensão é RCMO/proposal até confirmação humana.

## 9. Estados e transições

### 9.1 Claims V3.1

O enum efetivamente versionado em `0031_claims_ledger.sql` é a referência canônica para claims:

```text
observed
quoted
extracted
consolidated
confirmed_authorial
inferred
hypothesized
proposed
rejected
superseded
```

Documentos históricos da V3.1 que usam rótulos conceituais como `RAW_EXTRACTED`, `PENDING_NLI`, `CANONICAL_FACT`, `HYPOTHESIS_ACTIVE` ou `REFUTED` não redefinem o enum físico. Qualquer mapping futuro deve ser explícito e versionado.

### 9.2 RCMO

RCMO deve ter um eixo de ciclo/revisão próprio, separado do estado epistêmico dos claims que o sustentam. O ciclo mínimo proposto é:

```text
generated
  -> validated
  -> proposed
  -> accepted | rejected
  -> superseded
```

`accepted` significa somente que um humano aceitou o artefato analítico como análise útil/válida no seu contexto. **Não significa `confirmed_authorial`, não converte o RCMO em memória e não autoriza linguagem de crença autoral.**

O RCMO preserva a base epistêmica por provenance e referências aos inputs; não deve copiar ou elevar silenciosamente o `epistemic_status` de claims. `confirmed_authorial` permanece reservado ao domínio de claim/projeção autoral governado pelas transições apropriadas.

**Proibido:** qualquer transição automática ou revisão humana genérica de um RCMO que, por si só, autorize linguagem de memória autoral. A promoção de autoria continua exigindo `Proposal -> Human Decision -> Confirmed Authorial Projection`.

## 10. Allowed Use

Todo item levado a uma geração deve ter política explícita de uso, por exemplo:
- `CAN_QUOTE`;
- `CAN_STATE_AS_SOURCE_FACT`;
- `CAN_STATE_AS_CONFIRMED_AUTHORIAL`;
- `CAN_USE_AS_BACKGROUND`;
- `CAN_POSE_AS_HYPOTHESIS`;
- `CANNOT_ASSERT`.

Allowed Use é derivado de estado/origem/política, nunca escolhido livremente pelo modelo.

## 11. Abstention

Categorias mínimas:
- NO_EVIDENCE;
- LOW_SUPPORT;
- CONTRADICTORY_EVIDENCE;
- AMBIGUOUS_SOURCE;
- AMBIGUOUS_SCOPE;
- AUTHORIAL_UNKNOWN;
- METHOD_NOT_APPLICABLE;
- OUT_OF_SCOPE;
- VERSION_MISMATCH.

Abstention é output válido de método e deve ser testável.

## 12. Evals e release gates

Famílias mínimas do Golden Dataset V4:
1. ancoragem exata, incluindo Unicode/UTF-16 e normalização;
2. reancoragem após alteração não material;
3. orphan detection;
4. atomicidade de claim;
5. entailment/suporte;
6. contraevidência;
7. autoria externa vs autoral;
8. Memory-Inference Firewall / MILR;
9. Authorial Misattribution / AMR;
10. retrieval relevante mas epistemicamente não autorizativo;
11. abstention por insuficiência;
12. abstention por ambiguidade;
13. versionamento de método;
14. supersession/replay;
15. resistência a prompt injection em fonte;
16. multi-tenant / provenance isolation;
17. integridade de namespace epistêmico: RCMO aceito não pode ser interpretado como `confirmed_authorial`.

Gates devem reportar métricas por família e exemplos de falha, não só média global.

## 13. Compatibilidade com V3.1

### 13.1 Regra de precedência dos estados

Para compatibilidade, **migration/código versionado prevalece sobre nomenclatura histórica de documentos**. O enum de `cerebro_autoral.estado_epistemologico` definido em `0031_claims_ledger.sql` é a base física atual; aliases conceituais de documentos anteriores são históricos até existir mapping formal.

A Constituição V1 não renomeia esse enum e não autoriza migration para fazê-lo nesta missão.

### 13.2 Superfícies preservadas

Preservar:
- `cerebro_autoral.claims`;
- `claim_provenance`;
- `memory_events`;
- SKOS;
- retrieval multi-sinal;
- Dossiê V3.1 e Allowed Use;
- Auditor Cognitivo;
- MILR/AMR;
- decisão humana sobre aprendizado.

### 13.3 Reclassificação conceitual

Reclassificar conceitualmente:
- `processamento.fragmentos` como projeção de processamento/retrieval, não âncora canônica suficiente;
- sínteses como artefatos derivados que futuramente podem ser representados como RCMO específico;
- características/regras como projeções autorais confirmadas ou legadas, nunca como output direto de análise futura.

## 14. Sequência de implementação após aprovação

1. Modelo canônico de entidades.
2. Reconciliação legado V1/V3.1.
3. Document Structure V2.
4. Evidence/Annotation Core.
5. RCMO mínimo.
6. Analytical Method Registry.
7. Protocolo versionado das 18 dimensões.
8. Integração Cérebro Autoral via proposals.
9. Golden Dataset e replay controlado.
10. Somente então migrations/reprocessamento autorizados por missão própria.

## 15. Stop conditions

A implementação deve parar e pedir decisão humana se:
- exigir apagar provenance ou histórico;
- necessitar reclassificar automaticamente memória autoral;
- houver incompatibilidade sem estratégia de migração;
- a mudança exigir mutation live antes do Golden Dataset;
- R6 encontrar violação de soberania autoral, provenance ou isolamento.
