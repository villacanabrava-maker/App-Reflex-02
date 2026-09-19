---
name: authorial-ai-retrieval
description: >-
  Padrões para extração estruturada de IA (Structured Outputs via Zod), Hybrid Search, pgvector e proveniência documental.
---

# Inteligência Aplicada & Recuperação Autoral V3.1

1. **Saídas Estruturadas Obrigatórias:**
   - Toda chamada ao modelo LLM para extração de dados e classificação deve utilizar Structured Outputs com esquema Zod estrito (`.strict()`).

2. **Busca Híbrida Multi-Sinal (Adaptive Hybrid Retrieval):**
   - Combine busca lexical (Full-Text Search com `to_tsvector('portuguese', ...)` e filtragem de stopwords), busca semântica densa (`pgvector` com `cosine distance`), ancoragem ontológica SKOS (`taxonomia.skos_conceitos` e `claim_conceitos`) e filtros epistemológicos/temporais.
   - Aplique fusão por ranqueamento recíproco (RRF) configurável (`rrf_k = 60`) decompondo os sinais individuais (`dense_rank`, `lexical_rank`, `taxonomy_match`, `temporal_fit`).

3. **Rastreabilidade, Claims e Proveniência Estrita:**
   - Todo fragmento ou proposição atômica recuperada deve reportar proveniência auditável: `claim_id`, `source_id`, `source_version`, span de caracteres UTF-16, hash criptográfico SHA-256 e status epistemológico.

4. **Working Memory & Dossiê Contextual Estanque:**
   - O contexto deve ser entregue exclusivamente via Dossiê Contextual V3.1 com 9 compartimentos estanques (`task`, `direct_evidence`, `episodic_memory`, `semantic_memory`, `procedural_memory`, `concept_relations`, `counterevidence`, `hypotheses`, `uncertainties`).
   - É terminantemente **proibido hidden retrieval**: Redator e Planejador não devem fazer consultas adicionais ao banco em tempo de execução sem passar pelo Retriever formal.

5. **Políticas de Allowed Use & Soberania Autoral:**
   - Todo item recuperado carrega restrições normativas de uso: fontes externas (`CAN_SUPPORT_EXTERNAL_CLAIM`, `CANNOT_SUPPORT_AUTHORIAL_CLAIM`), conjecturas (`CAN_INSPIRE_QUESTION`, `CANNOT_BE_STATED_AS_MEMORY`), memórias superadas (`HISTORICAL_ONLY` ou `COUNTEREVIDENCE_ONLY`) e autoria humana confirmada (`CAN_SUPPORT_AUTHORIAL_CLAIM`).

6. **Abstenção Cognitiva Honesta:**
   - Quando o limiar de pertinência não for atingido ou o acervo não dispuser de dados suficientes, o motor de busca deve emitir formalmente o estado `INSUFFICIENT_EVIDENCE`, inibindo alucinações e preenchendo o compartimento de incertezas.
