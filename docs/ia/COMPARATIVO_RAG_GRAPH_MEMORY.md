# Análise Comparativa de Paradigmas: Vetorial vs. Grafos vs. Memória Integrada

**Data:** 18 de setembro de 2026  
**Líder Técnico:** A5 (rflex-ai-knowledge) & A8 (rflex-research-evolution)  
**Revisão de Arquitetura:** A1 (rflex-architect) & A4 (rflex-backend-supabase)  

---

## 1. Matriz Comparativa de Paradigmas

| Critério de Engenharia | 1. Vetorial Puro (Baseline) | 2. Híbrido BM25 + Vetor | 3. Microsoft GraphRAG | 4. HippoRAG 2 | 5. PostgreSQL Cognitivo Multidimensional (App Reflex V3) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Recuperação Factual Exata** | Baixa (alucina com nomes/datas) | **Alta** (BM25 captura termos literais) | Média-Alta | Alta | **Altíssima** (FTS com dicionário PT-BR + Índices GIN) |
| **Integração Multi-Hop** | Muito Baixa (não conecta trechos) | Baixa | Alta | **Altíssima** (PageRank) | **Alta** (Recursão SQL + nós conceituais da Taxonomia) |
| **Sumarização de Alto Nível** | Nula | Nula | **Altíssima** (Resumos comunitários) | Média | **Alta** (Sínteses de Seção e Obra no PostgreSQL) |
| **Sensibilidade Temporal** | Nula | Nula | Baixa | Baixa | **Nativa** (Timestamps e ranges `valid_from` / `valid_to`) |
| **Isolamento Autoral vs. Externo** | Difícil (requer metadados nos vetores) | Média | Difícil | Baixa | **Nativa** (Campos `origem: 'nucleo_autoral'` e RLS) |
| **Custo de Tokens por Livro** | **Mínimo** (~$0.02 em embeddings) | **Mínimo** (~$0.02) | **Extremo** (~$15.00 a $40.00 por livro) | Baixo (~$0.50) | **Controlado** (~$0.30 com extração taxonômica Zod) |
| **Latência de Retrieval** | **~15ms** | ~25ms | ~2500ms (pesado) | ~120ms | **~45ms** (PostgreSQL local/pooler indexado) |
| **Infraestrutura Necessária** | pgvector simples | pgvector + FTS | Neo4j/NetworkX + Pipeline complexo | Grafo em memória | **100% no Supabase Existente** (zero bancos extras) |
| **Risco de Alucinação em Retrieval** | Alto (traz chunks por estilo similar) | Médio | Médio | Baixo | **Mínimo** (Abstention quando score < threshold) |

---

## 2. Diagnóstico das Abordagens no Contexto do App Reflex 02

### Por Que NÃO Adotar GraphRAG Puro?
O GraphRAG da Microsoft foi projetado para analistas de inteligência com orçamentos quase ilimitados processando relatórios esparsos. Aplicar GraphRAG sobre uma biblioteca de 50 livros (contendo centenas de milhares de parágrafos) geraria um custo mensal de tokens inviável financeiramente para um produto pessoal, com latências de minutos para montar um grafo comunitário.

### Por Que NÃO Permanecer no Vetorial Puro?
O RAG puramente vetorial é a causa primária dos problemas que o usuário relatou: ele não compreende a negação ("o autor discorda de X" fica vetorialmente próximo de "o autor defende X"), não respeita termos exatos e perde completamente a estrutura do livro.

### A Escolha Arquitetural: PostgreSQL Cognitivo Multidimensional
O App Reflex 02 já possui o PostgreSQL 17 no Supabase com todas as capacidades necessárias:
1. `pgvector` para similaridade semântica densa;
2. `tsvector` e `GIN` para busca léxica rápida em português;
3. Integridade referencial para ligar Fragmentos ➔ Obras ➔ Conceitos ➔ Regras;
4. Queries recursivas (`WITH RECURSIVE`) para navegar o grafo de relações conceituais;
5. Segurança de RLS comprovada para garantir que memórias de um usuário nunca vazem para outro.
