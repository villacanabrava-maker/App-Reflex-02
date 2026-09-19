# ADR 0002 — Arquitetura Cognitiva V3 e Sistema de Memória Autoral

- **Status:** Aceito
- **Data:** 2026-09-18
- **Decisores:** A1 (Maestro Geral), A2 (Arquiteto e Guardião de Dados), A4 (Inteligência Autoral, Taxonomia e RAG), A8 (Pesquisa Aplicada e Inovação), A9 (Coordenação e Continuidade), Usuário
- **Missão Relacionada:** MIS-0004

---

## 1. Contexto

O App Reflex 02 tem como diferencial a ampliação do pensamento do autor, exigindo que a inteligência artificial recupere com fidelidade o histórico pessoal de ideias, compreenda a evolução conceitual ao longo dos anos, aprenda com as correções estilísticas do autor e declare abstenção caso não possua evidências no acervo.

O sistema herdado do App 01 utilizava um RAG vetorial simples (embeddings isolados por fragmento), sofrendo de:
1. Perda de contexto do documento completo nos chunks recuperados;
2. Falta de distinção entre pensamentos autorais do usuário e citações externas de terceiros;
3. Ausência de ontologia relacional (apenas tags textuais não hierárquicas e suscetíveis a proliferação desordenada);
4. Ambição cega de responder a qualquer pergunta com os vetores mais próximos, gerando alucinações por falta de abstenção explícita;
5. Ausência de um ciclo de aprendizado a partir de correções feitas pelo autor em textos gerados.

Avaliou-se a adoção de frameworks externos de grafos e agentes (como GraphRAG da Microsoft, Neo4j, MemGPT/Letta ou Mem0).

---

## 2. Decisão

Decidimos adotar a **Arquitetura Cognitiva V3 baseada em PostgreSQL Cognitivo Nativo (Supabase)**, inspirada em modelos neurocientíficos de memória (CLS, Tulving, Baddeley) e nas melhores práticas de IA contemporânea (Contextual Retrieval da Anthropic, HippoRAG 2 e taxonomia relacional SKOS).

Especificamente:
1. **Infraestrutura Soberana no PostgreSQL 17:** Rejeitamos a inclusão de bancos de dados de grafos externos (Neo4j) ou frameworks proprietários opacos. Usamos `pgvector` (índices HNSW) combinado com `tsvector` (lematizado em português brasileiro) e consultas recursivas em SQL (`WITH RECURSIVE`).
2. **Modelo de Memória Tripartite:**
   - **Memória Episódica:** Chunks com Contextual Retrieval e âncoras temporais em `episodio_chunks`.
   - **Memória Semântica:** Grafo conceitual com 7 arestas semânticas e padrão SKOS em `conceitos_ontologia_v3` e `relacoes_conceitos_v3`.
   - **Memória Procedural:** Regras de estilo, tom e processos intelectuais consolidadas em `perfil_autoral_regras`.
3. **Ponderação Autoral na Recuperação Multi-Sinal:** Notas e reflexões próprias do usuário recebem multiplicador de relevância de $1.5\times$ em relação a transcrições brutas ou fontes de terceiros.
4. **Abstenção Honesta:** Implementação de limiar de confiança ($\tau = 0.55$) que força o sistema a declarar abstenção estruturada se a evidência for insuficiente.
5. **Aprendizado por Edição com Human-in-the-Loop:** Diff semântico categorizado nas 6 classes canônicas, exigindo 3 ocorrências convergentes e aprovação explícita do autor para virar regra permanente.
6. **Framework de Evals V2:** Golden Dataset de 12 casos cobrindo as 10 dimensões de qualidade cognitiva.

---

## 3. Consequências

### Positivas:
- **Zero Sobrecarga de Infraestrutura:** Continua com stack unificada no Supabase/Postgres, sem novos serviços gerenciados para operar.
- **Latência Determinística:** Consultas híbridas com RRF e expansão de grafo até 2 graus executadas no banco em menos de 50ms.
- **Custo Operacional Previsível:** O custo por síntese permanece abaixo de \$0,015.
- **Auditabilidade e Segurança:** Rastreabilidade estrita de cada afirmação com seu chunk de origem e isolamento total via RLS por `autor_id`.
- **Prevenção de Alucinação e Overfitting:** Barreiras explícitas de corte e validação humana.

### Negativas / Trade-offs e Mitigações:
- **Complexidade de Migração de Dados:** Necessidade de re-chunking e pré-computação contextual dos episódios existentes. *Mitigação:* Execução gradual em ondas (Wave 0 a Wave 10) com fallback para o sistema legado durante a transição.
- **Dependência de LLM de Consolidação:** A rotina de síntese de background consome tokens de modelo rápido. *Mitigação:* Agendamento em lotes noturnos/assíncronos utilizando modelos leves e de baixo custo.

---

## 4. Alternativas Rejeitadas

- **Neo4j / Memgraph Externo:** Rejeitado devido ao custo mensal elevado, redundância de dados fora do Supabase e quebra da conformidade do RLS.
- **Microsoft GraphRAG:** Rejeitado pelo custo exorbitante de indexação global (\$5 a \$30 por documento longo) e dependência de chamadas em massa a LLMs.
- **Mem0 / Letta Framework Cloud:** Rejeitado pela dependência de SaaS de terceiros, perda de custódia dos dados do autor e impossibilidade de executar queries locais via SQL.
- **Manutenção do Naive RAG do App 01:** Rejeitado pela incapacidade de sustentar a fidelidade e profundidade reflexiva exigidas pelo projeto.
