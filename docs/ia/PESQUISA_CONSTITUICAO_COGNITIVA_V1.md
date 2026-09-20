# Pesquisa R8 — Constituição Cognitiva V1 / RCMO

**Missão:** NEXT-COGNITIVE-CONSTITUTION-RCMO  
**Issue:** #17  
**Baseline:** `e95861c8c3355642d3e1b7946d40bc1fa6502c18`  
**Papel:** R8 — Research & Evolution  
**Status:** evidência externa para especificação; não autoriza implementação ou migration.

## 1. Perguntas de pesquisa

1. Como ancorar evidência em documentos de modo verificável mesmo quando o texto é reprocessado?
2. Como representar proveniência sem confundir fonte, transformação, inferência e autoria?
3. Como transformar evidências e claims em objetos analíticos versionados sem convertê-los automaticamente em memória autoral?
4. Quais avaliações devem bloquear extração, retrieval ou geração quando não há suporte suficiente?

## 2. Evidência externa

### W3C Web Annotation Data Model

A Recommendation do W3C separa **Annotation**, **Body** e **Target** e define selectors para endereçar trechos de recursos. Para texto, `TextQuoteSelector` usa trecho exato e contexto prefix/suffix; `TextPositionSelector` usa offsets. A combinação é útil para o Reflex: posição acelera resolução no mesmo artefato, enquanto quote+context ajuda a reancorar após mudanças controladas.

Fonte primária:
- https://www.w3.org/TR/annotation-model/

**Implicação Reflex:** uma evidência não deve ser apenas `fragmento_id`. Deve registrar versão da fonte, hash do conteúdo e um selector composto capaz de verificar/reancorar o span.

### W3C PROV-O

PROV-O distingue **Entity**, **Activity** e **Agent**, com relações como `wasDerivedFrom`, `wasGeneratedBy` e `wasAssociatedWith`.

Fonte primária:
- https://www.w3.org/TR/prov-o/

**Implicação Reflex:** documento/versão/span/claim/RCMO são entidades; extração/análise/curadoria são atividades; autor, pipeline e operador humano são agentes. O modelo deve permitir reconstruir a cadeia de derivação sem inferir autoria a partir da mera existência de uma entidade.

### W3C SKOS

SKOS formaliza conceitos e relações como `broader`, `narrower` e `related`, além de rótulos preferidos/alternativos.

Fonte primária:
- https://www.w3.org/TR/skos-reference/

**Implicação Reflex:** o trabalho V3.1 existente com SKOS deve ser preservado. RCMO pode referenciar conceitos, mas não deve inventar um segundo sistema taxonômico concorrente.

### Claimify

Claimify propõe extração e avaliação de claims factuais com foco em **atomicidade**, **correção** e utilidade de claims para verificação. O trabalho reforça que decompor texto em claims verificáveis é uma etapa distinta da avaliação factual posterior.

Fonte:
- https://arxiv.org/abs/2502.10855

**Implicação Reflex:** claim não é resumo, tema ou característica autoral. É uma unidade verificável com suporte e estado epistêmico próprios. Ambiguidade deve causar abstenção ou marcação explícita, não preenchimento plausível.

### FActScore

FActScore avalia factualidade decompondo geração em fatos atômicos e verificando suporte por uma fonte de conhecimento.

Fonte:
- https://aclanthology.org/2023.emnlp-main.741/

**Implicação Reflex:** avaliação pós-geração deve medir suporte por unidade, e não apenas uma nota holística da resposta. O Auditor V3.1 já aponta nessa direção e deve ser mantido.

### RAGAS

RAGAS propõe avaliação de pipelines RAG sem depender exclusivamente de referências manuais, separando aspectos do retrieval e da resposta.

Fonte:
- https://aclanthology.org/2024.eacl-demo.16/

**Implicação Reflex:** o Golden Dataset deve separar pelo menos: qualidade do conjunto recuperado, cobertura de evidência, fidelidade da resposta ao contexto e atribuição correta de autoria. Uma métrica agregada única é insuficiente.

### Abstention / unanswerable questions

Literatura recente sobre abstention em LLMs mostra que modelos frequentemente respondem quando deveriam recusar/abster-se, e que avaliação precisa conter casos não respondíveis e ambíguos, não apenas perguntas com resposta.

Fonte representativa:
- https://aclanthology.org/2025.coling-main.368/

**Implicação Reflex:** casos de insuficiência, conflito, ambiguidade, ausência de evidência e pedido fora do escopo devem ser famílias próprias do Golden Dataset.

## 3. Síntese arquitetural

A evidência convergente favorece uma cadeia explícita:

```text
Source Version
  -> Document Structure
  -> Evidence Anchor / Annotation
  -> Claim / Observation
  -> Method Execution
  -> RCMO
  -> Proposal / Interpretation
  -> Human Decision
  -> Confirmed Authorial Projection
```

Nenhuma seta representa promoção automática de autoria.

## 4. Decisões recomendadas para R2/R5

1. Adotar um **Evidence/Annotation Core** inspirado no Web Annotation Data Model, sem exigir RDF como formato de persistência.
2. Representar provenance como grafo lógico compatível com PROV-O, mesmo que a implementação inicial use PostgreSQL relacional/JSONB.
3. Preservar SKOS como taxonomia canônica; RCMO referencia conceitos existentes.
4. Definir RCMO como resultado versionado de uma execução metodológica sobre evidências/claims, não como memória.
5. Tratar métodos como entidades versionadas: input contract, output schema, allowed evidence classes, abstention conditions, evaluator.
6. Expandir o Golden Dataset com casos negativos e de abstention, além de MILR/AMR.
7. Não introduzir migration nem reprocessamento até a especificação ser aprovada por R6 e gate humano.

## 5. Limitações

- Padrões W3C descrevem modelos gerais; não determinam o schema físico do Reflex.
- Claimify/FActScore/RAGAS avaliam problemas relacionados, mas não resolvem soberania autoral específica do produto.
- O nome e semântica de RCMO são definidos pelo próprio Reflex; não são um padrão externo.
- A pesquisa sustenta arquitetura; benchmark real no corpus Reflex ainda precisa ser executado depois da especificação.
