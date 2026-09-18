---
name: authorial-ai-retrieval
description: >-
  Padrões para extração estruturada de IA (Structured Outputs via Zod), Hybrid Search, pgvector e proveniência documental.
---

# Inteligência Aplicada & Recuperação Autoral

1. **Saídas Estruturadas Obrigatórias:**
   - Toda chamada ao modelo LLM para extração de dados deve utilizar Structured Outputs com esquema Zod estrito.
2. **Busca Híbrida (Hybrid Retrieval):**
   - Combine busca lexical (Full-Text Search com `tsvector` em português) e busca semântica (vetores pgvector com `cosine distance`).
   - Aplique fusão por ranqueamento recíproco (RRF) para calibrar os resultados mais relevantes.
3. **Rastreabilidade e Proveniência:**
   - Todo fragmento ou insight gerado pela IA deve conter metadados obrigatórios: `document_id`, `chunk_id`, `page_number` e data de extração.
