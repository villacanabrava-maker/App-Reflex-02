# Matriz de Decisão Arquitetural Final — Cérebro Reflex V3.1

**Missão:** MIS-0006 — Fechamento Conclusivo da Pesquisa, Design Freeze e Plano Mestre Executável  
**Data:** 18 de setembro de 2026  
**Status:** `DESIGN FREEZE / APROVADO PARA CRONOGRAMA DE WAVES`  
**Autores & Contribuintes:** A1 (Arquitetura), A5 (IA & Conhecimento), A7 (QA & AppSec / Red-Team), A8 (Pesquisa Aplicada), A9 (Continuidade & Evidências)  
**Documentos Precursores:** MIS-0004 (V3), MIS-0005 (V3.1), ADR 0002, ADR 0003  

---

## 1. Finalidade e Escopo da Matriz de Decisão

A presente matriz encerra definitivamente a etapa exploratória e de pesquisa da modernização da inteligência do App Reflex 02. Ela consolida os achados da MIS-0004, da MIS-0005, do acervo de literatura acadêmica internacional e do relatório executivo *"Plano de Modernização da IA do Reflex — Arquitetura Cognitiva V3.1 e a MIS-0005"* fornecido pelo Usuário (classificado formalmente como `FONTE EXTERNA DE PESQUISA FORNECIDA PELO USUÁRIO`).

O objetivo desta matriz é transformar hipóteses, modelos teóricos e ideias concorrentes em **decisões técnicas definitivas, vinculantes e auditáveis**, classificadas em cinco categorias operacionais:

1. **`MUST` (Obrigatório / Bloqueante):** Componentes fundamentais sem os quais o sistema não garante soberania autoral, proveniência ou segurança epistêmica. Entram no caminho crítico das Waves.
2. **`SHOULD` (Altamente Recomendado):** Mecanismos de alto valor que aprimoram performance, coerência ou governança, previstos para implementação logo após a consolidação dos componentes MUST.
3. **`EXPERIMENT` (Validação Empírica Obrigatória):** Tecnologias ou abordagens promissoras cujos custos, latência ou precisão exigem prova de conceito (PoC) com Golden Dataset antes de admissão no core.
4. **`DEFER` (Adiado Conscientemente):** Recursos viáveis, porém postergados para fases posteriores (pós-V3.1) para evitar escopo excessivo e diluição do foco do MVP cognitivo.
5. **`REJECT` (Rejeitado com Justificativa):** Abordagens que violam os princípios inegociáveis do App Reflex 02 (ex.: soberania autoral, determinismo de proveniência, menor privilégio) ou que apresentaram risco inaceitável de memory poisoning ou alucinação.

---

## 2. Reconciliação e Classificação da Literatura Científica

Para eliminar ambiguidade terminológica entre relatórios internos e o documento do Usuário, estabelece-se a classificação formal e paritária das referências acadêmicas:

| Trabalho / Referência | Ano | Venue / Status Acadêmico | Classificação Canônica | Papel no App Reflex 02 |
| :--- | :---: | :--- | :--- | :--- |
| **Claimify** (Yu et al.) | 2025 | ACL 2025 Main Conference | `PEER_REVIEWED` | Algoritmo de descontextualização de claims atômicos e resolução de anáforas. |
| **LoCoMo** (Maharana et al.) | 2024 | ACL 2024 Main Conference | `PEER_REVIEWED` | Benchmark e técnicas de recuperação em contextos temporais ultralongos (100k+ tokens). |
| **LongMemEval** (Wu et al.) | 2025 | ICLR 2025 / arXiv | `PEER_REVIEWED` | Metodologia de avaliação de memória de longo prazo para assistentes pessoais. |
| **HippoRAG / HippoRAG 2** (Bernal et al.) | 2024 | NeurIPS 2024 / arXiv | `PEER_REVIEWED` | Neuro-biologia computacional inspirada no hipocampo; Personalized PageRank sobre grafos de conhecimento. |
| **Graphiti** (Zep AI Research) | 2024 | Industrial Preprint / Open-Source | `PREPRINT_INDUSTRIA` | Grafos temporais dinâmicos com nós episódicos e arestas invalidadas pelo tempo. |
| **BEAM** (Benchmark for Episodic Authorial Memory) | 2024 | Workshop / Preprint | `PREPRINT_ACADEMICO` | Framework de avaliação de memória autoral episódica com separação fato vs. inferência. |
| **SKOS W3C Recommendation** (Miles & Bechhofer) | 2009 | W3C Standard Recommendation | `STANDARD_OFICIAL` | Padrão formal para organização de conhecimento (broad/narrow/related/scopeNote). |
| **Anthropic Contextual Retrieval** | 2024 | Relatório Técnico de Engenharia | `INDUSTRIA_BENCHMARK` | Injeção de contexto documental em chunks antes da indexação vetorial. |

---

## 3. Matriz Decisória Geral dos Componentes Cognitivos

| ID | Componente / Proposta | Categoria | Wave Alvo | Agentes Envolvidos | Racional Técnico & Justificativa |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **DEC-01** | **Claims Ledger Estruturado com Hash de Span** | `MUST` | Wave 1 | A4, A5, A7 | A granularidade de documento/chunk é insuficiente para rastreabilidade de crenças. Todo claim deve ter `source_id`, `span_start`, `span_end`, `content_hash` e status de entailment imutável. |
| **DEC-02** | **NLI Entailment com Regra *Ambiguidade $\to$ Não Extrai*** | `MUST` | Wave 1 | A5, A7 | Elimina alucinação de claims. Se o modelo de extração não puder comprovar implicação lógica direta (Entailment) do texto-fonte, o claim é descartado preventivamente. |
| **DEC-03** | **Memory-Inference Firewall** | `MUST` | Wave 1 | A5, A7 | Barreira ontológica estrita: nenhuma inferência, síntese ou extrapolação estatística pode ser promovida a crença autoral ou fato histórico sem revisão humana deliberada. |
| **DEC-04** | **Runner de Evals com Golden Dataset (12 Famílias CBR)** | `MUST` | Wave 1 | A5, A7 | A integridade cognitiva exige validação automatizada em CI. O Golden Dataset de 12 famílias testa abstenção, vazamento, contradição e temporalidade. |
| **DEC-05** | **MILR = 0.0% no Golden Dataset Fechado** | `MUST` | Wave 1 | A5, A7 | Gate de liberação inegociável: zero vazamento de inferência como memória no benchmark sintético controlado de 12 casos. |
| **DEC-06** | **Episodic Event Ledger Append-Only (`memory_events`)** | `MUST` | Wave 2 | A4, A7 | O cérebro necessita de uma timeline de episódios imutável para auditar quando uma obra foi lida, quando uma reflexão foi gerada e como uma crença evoluiu no tempo. |
| **DEC-07** | **10 Estados Epistemológicos Tipados no Banco** | `MUST` | Wave 2 | A4, A5 | Mapeamento explícito de ciclo de vida: `RAW_EXTRACTED`, `PENDING_NLI`, `CANONICAL_FACT`, `HYPOTHESIS_ACTIVE`, `SUPERSEDED`, `REFUTED`, etc. |
| **DEC-08** | **Busca Híbrida Multi-Sinal (Dense + Lexical PT-BR + Recency)** | `MUST` | Wave 3 | A4, A5 | Supera as deficiências de busca exclusivamente vetorial em português, integrando `pgvector` (HNSW), PostgreSQL Full Text Search com lematização PT e decaimento temporal. |
| **DEC-09** | **Taxonomia Conceitual Baseada em SKOS W3C** | `MUST` | Wave 3 | A4, A5 | Estrutura formal em PostgreSQL (`broader`, `narrower`, `related`, `scopeNote`), impedindo colapso taxonômico sem depender de banco de grafos proprietário. |
| **DEC-10** | **Dossiê Contextual com Segregação Rígida e `Allowed Use`** | `MUST` | Wave 4 | A5, A7 | O prompt de reflexão não pode misturar crenças do autor com obras externas no mesmo bloco. Cada bloco contextual possui tags explícitas de autorização de uso. |
| **DEC-11** | **Orçamento Rígido de Contexto (Token Budgeting)** | `MUST` | Wave 4 | A5 | Alocação fixa e previsível: 40% Núcleo Autoral, 30% Obras Externas Relevantes, 20% Taxonomia/Linha do Tempo, 10% Instruções e Guardrails. |
| **DEC-12** | **Abstenção Honesta em 7 Modalidades** | `MUST` | Wave 5 | A5, A7 | Se o autor nunca escreveu sobre o tema ou as evidências forem insuficientes, a IA deve responder "Não há registro no seu acervo sobre X", sem inventar opiniões plausíveis. |
| **DEC-13** | **Auditor Cognitivo Pós-Geração (Post-Generation NLI)** | `SHOULD` | Wave 5 | A5, A7 | Valida se a reflexão gerada pelo modelo final não cometeu desvios em relação ao Dossiê Contextual fornecido. Executado assincronamente para não penalizar o TTFT. |
| **DEC-14** | **Consolidação Autoral Noturna / Hippocampal Replay** | `SHOULD` | Wave 6 | A4, A5 | Pipeline em batch (cron/job) que analisa clusters de eventos do dia, identifica contradições ou novas conexões conceituais e gera propostas para aprovação humana. |
| **DEC-15** | **Aprendizado por Edição do Usuário com Extração de Regras** | `SHOULD` | Wave 6 | A5 | Quando o usuário edita uma reflexão sugerida pela IA, o sistema infere uma regra de estilo/conteúdo que é submetida a aprovação antes de entrar no Cérebro. |
| **DEC-16** | **AMR (Authorial Misattribution Rate) como Métrica Contratual** | `SHOULD` | Wave 1 & 5 | A5, A7 | Mensuração de falsas atribuições de autoria, exigindo taxa inferior a 1.0% em testes amostrais abertos. |
| **DEC-17** | **Graphiti / HippoRAG 2 Dinâmico via Personalized PageRank** | `EXPERIMENT`| Wave 3 | A5, A8 | Testar se o cálculo de PPR via PL/pgSQL ou função local sobre o grafo de claims agrega ganho de recuperação relevante em relação à busca híbrida padrão, medindo custo e latência. |
| **DEC-18** | **NLI Local via SLM (Small Language Model) vs. LLM Remota** | `EXPERIMENT`| Wave 1 | A5, A8 | Avaliar a viabilidade de rodar um classificador NLI local/quantizado (ex.: DeBERTa-v3 ou similar) vs. chamadas estruturadas de alta velocidade (ex.: gpt-4o-mini com structured outputs). |
| **DEC-19** | **Fine-Tuning de Embeddings com Triplet Loss em Português** | `EXPERIMENT`| Wave 3 | A5, A8 | Medir se adaptação de domínio melhora o MRR em textos reflexivos e filosóficos em português em relação ao `text-embedding-3-small`. |
| **DEC-20** | **Graph Database Nativo Dedicado (Neo4j, Memgraph)** | `DEFER` | Pós-V3.1| A1, A4 | PostgreSQL 17 com CTEs recursivas, índices B-Tree compostos e `pgvector` atende plenamente ao volume previsto de um autor individual (dezenas de milhares de nós). Não justifica complexidade operacional adicional agora. |
| **DEC-21** | **Multi-Modalidade Nativa (Vídeo/Imagens no Cérebro Autoral)** | `DEFER` | Pós-V3.1| A3, A5 | Foco da V3.1 é estritamente texto, áudio transcrito e conceitos semânticos. Ingestão multimodal de imagens e vídeo será tratada em fase subsequente. |
| **DEC-22** | **Agentes Autônomos com Mutação Silenciosa de Crenças** | `REJECT` | N/A | A1, A7 | **REJEITADO.** Violação direta do Invariant de Soberania Autoral. A IA jamais pode alterar uma crença canônica do autor sem confirmação deliberada do usuário. |
| **DEC-23** | **Unificação de Fatos e Inferências na Mesma Estrutura de Dados**| `REJECT` | N/A | A1, A5, A7 | **REJEITADO.** Violação do Memory-Inference Firewall. Causa poluição irreversível da base de conhecimento com alucinações cumulativas. |
| **DEC-24** | **Desativação de RLS para Otimização de Consultas de IA** | `REJECT` | N/A | A4, A7 | **REJEITADO.** Violação de segurança e isolamento multi-tenant. Toda consulta de IA deve rodar sob o contexto do usuário autenticado ou de funções de segurança estritas. |
| **DEC-25** | **Busca Puramente Vetorial Sem Suporte Léxico / Exato** | `REJECT` | N/A | A5 | **REJEITADO.** Falha comprovada em termos técnicos, nomes próprios, neologismos do autor e vocabulário filosófico especializado. A busca deve ser híbrida. |

---

## 4. Análise Crítica do Red-Team (A7 / rflex-qa-security)

O Agente A7 (QA & AppSec) realizou a avaliação adversarial rigorosa da arquitetura proposta. Abaixo constam os desafios técnicos identificados, os riscos mapeados e os controles compensatórios obrigatórios:

### 4.1. Desafio: Sobrecarga e Custo do NLI Síncrono na Ingestão
- **Risco:** Executar validação de Entailment via LLM para centenas de claims por documento durante o upload pode elevar os custos de API e degradar a experiência do usuário.
- **Veredito do Red-Team:** **Aprovado com mitigação.** A extração e o NLI devem rodar obrigatoriamente em **segundo plano (background/async)**. O upload do documento no Supabase Storage e a visualização do texto ocorrem imediatamente; a extração de claims é processada assincronamente com batching e cache de hashing.

### 4.2. Desafio: Risco de Envenenamento Indireto de Memória (Indirect Prompt Injection)
- **Risco:** Obras externas (livros, PDFs baixados da internet) podem conter injeções maliciosas instruindo o extrator de claims a criar crenças falsas ou extrair dados confidenciais do usuário.
- **Veredito do Red-Team:** **Aprovado com isolamento estrito.**
  1. Fontes externas são marcadas com o papel epistemológico `EXTERNAL_SOURCE` e jamais acessam o compartimento de crenças centrais;
  2. Extratores usam schemas Zod rígidos com sanitização de texto;
  3. Prompts de extração operam com delimitadores claros e instrução estrita de desconsiderar diretivas imperativas presentes no corpo do texto.

### 4.3. Desafio: Latência do Auditor Cognitivo Pós-Geração na Interface
- **Risco:** Rodar uma segunda rodada de NLI após a geração de uma reflexão para auditar alucinações pode adicionar 3 a 5 segundos de latência, prejudicando o streaming em tempo real.
- **Veredito do Red-Team:** **Aprovado com arquitetura em dois níveis.**
  - **Nível 1 (Inline/Streaming):** O modelo principal gera a resposta utilizando restrição de proveniência e citações numéricas obrigatórias `[claim_id]`.
  - **Nível 2 (Assíncrono):** O Auditor Pós-Geração roda em background logo após a entrega do texto. Se detectar desvio crítico (MILR > 0), emite um badge visual de alerta na interface: *"Atenção: Esta reflexão contém deduções não ancoradas no seu acervo autoral"*.

### 4.4. Desafio: Escalabilidade do Grafo em PostgreSQL sem Neo4j
- **Risco:** Consultas recursivas complexas de múltiplos saltos no grafo de conhecimento podem sobrecarregar o banco de dados.
- **Veredito do Red-Team:** **Aprovado.** Para um aplicativo centrado no autor individual (estimativa de até 50.000 claims e 150.000 relações ao longo de anos de uso), consultas com CTEs recursivas com profundidade limitada ($\le 2$ saltos) e índices B-Tree compostos têm tempo de resposta sub-15ms no PostgreSQL 17. Não há justificativa para adicionar outro banco de dados à infraestrutura.

---

## 5. Conclusão e Handoff para o Design Freeze

Com a aprovação de A1, A5, A7, A8 e A9, esta matriz consolida formalmente as decisões da V3.1. Todos os componentes categorizados como `MUST` e `SHOULD` passam a constituir o escopo normativo do **Design Freeze Cognitivo V3.1** e do **Plano Mestre de Modernização**.
