# ADR-0004 — Constituição Cognitiva V1 e RCMO

**Status:** Proposed  
**Data:** 2026-09-20  
**Missão:** NEXT-COGNITIVE-CONSTITUTION-RCMO

## Contexto

O Reflex V3.1 já possui Claims Ledger, Event Ledger, SKOS, retrieval multi-sinal, Dossiê com Allowed Use, Auditor Cognitivo e gates MILR/AMR. O runtime live, porém, ainda tem 0 claims materializados e o pipeline documental atual usa fragmentos/chunks como unidade operacional dominante.

A próxima evolução precisa evitar dois acoplamentos:
1. tratar chunk de retrieval como evidência canônica;
2. tratar output analítico como memória autoral.

## Decisão

Adotar a Constituição Cognitiva V1 com quatro separações arquiteturais:

1. **Document Structure V2** separada de chunking/retrieval.
2. **Evidence/Annotation Core** com âncoras verificáveis em Source Versions.
3. **Analytical Method Registry** com métodos versionados e condições de abstention.
4. **RCMO (Reflex Cognitive Method Object)** como resultado analítico versionado, sempre distinto de memória autoral confirmada.

A cadeia normativa passa a ser:

```text
Source Version -> Structure -> Evidence -> Claim -> Method Execution -> RCMO
                                                        |
                                                        v
                                                     Proposal
                                                        |
                                                 Human Decision
                                                        |
                                                        v
                                          Confirmed Authorial Projection
```

## Consequências positivas

- provenance sobrevive a mudanças de chunking;
- métodos podem evoluir com replay e comparação entre versões;
- outputs analíticos deixam de contaminar memória;
- contraevidência e abstention tornam-se first-class;
- 18 dimensões passam a ter protocolos auditáveis;
- Golden Dataset pode medir falhas por etapa.

## Custos

- maior número de entidades e contratos;
- necessidade futura de migration e backfill controlado;
- versionamento de métodos/prompts/evaluators;
- UI terá de expor status epistêmico com mais precisão;
- replay de análises exigirá idempotência e lineage.

## Alternativas rejeitadas

### A. Continuar usando `fragmentos` como evidência primária
Rejeitada porque fragmentos são projeções de processamento e podem mudar por re-chunking.

### B. Persistir apenas JSON de análise por dimensão
Rejeitada porque oculta método, input, versionamento e provenance.

### C. Promover RCMO diretamente para característica/regra
Rejeitada por violar Soberania Autoral e Memory-Inference Firewall.

### D. Introduzir grafo/RDF obrigatório no MVP
Rejeitada nesta etapa. Os modelos W3C orientam a semântica; PostgreSQL continua soberano e pode implementar o modelo relacionalmente.

## Gates

Antes de Status Accepted:
- revisão R6 independente;
- validação contra Design Freeze V3.1;
- Task Packets de implementação separados;
- Golden Dataset plan aprovado;
- decisão humana sobre qualquer incompatibilidade com legado.
