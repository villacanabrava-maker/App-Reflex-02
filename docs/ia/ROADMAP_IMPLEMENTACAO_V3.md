# ROADMAP DE IMPLEMENTAÇÃO — CÉREBRO AUTORAL V3
**Missão:** MIS-0004 | **Status:** Normativo | **Data:** 2026-09-18

---

## 1. Princípio de Execução: Implementação Incremental em 10 Ondas (Waves)

A transição da inteligência do App Reflex 02 para a arquitetura V3 segue o princípio da **não-regressão**:
- O aplicativo continua funcional em cada etapa.
- Nenhuma migração destrutiva é aplicada sem teste em ambiente isolado.
- Os pipelines legados coexistem como fallback até a validação completa da onda correspondente no Golden Dataset.

---

## 2. Mapa das 10 Ondas de Implementação (Wave 0 a Wave 10)

```mermaid
flowchart LR
    W0[W0: Infra & Base] --> W1[W1: Evals V2]
    W1 --> W2[W2: Chunking Contextual]
    W2 --> W3[W3: Busca Híbrida Postgres]
    W3 --> W4[W4: Perfis & Abstenção]
    W4 --> W5[W5: Ontologia SKOS]
    W5 --> W6[W6: Fila Consolidação]
    W6 --> W7[W7: Metamemória & Telemetria]
    W7 --> W8[W8: Aprendizado Edição]
    W8 --> W9[W9: Cérebro Autoral UI]
    W9 --> W10[W10: Hardening & Prod]
```

---

### Wave 0 — Fundação de Dados e Extensão do Esquema Supabase
- **Foco:** Criar as tabelas e extensões necessárias no Postgres 17 sem alterar as tabelas existentes de produção.
- **Entregáveis:**
  - Criação da tabela `conceitos_ontologia_v3` e `relacoes_conceitos_v3`.
  - Adição de colunas `tipo_origem`, `peso_autoral`, `contexto_narrativo` e `tsvector_pt` em `episodio_chunks`.
  - Índices HNSW ajustados para busca vetorial com filtro de autor.
- **Critério de Saída:** Migrações executadas no banco e testes de integração de esquema passando.

---

### Wave 1 — Framework de Avaliação e Golden Dataset
- **Foco:** Estabelecer a régua de medição antes de alterar os pipelines de geração.
- **Entregáveis:**
  - Implementação do runner de testes `npm run test:evals`.
  - Criação dos 12 casos do Golden Dataset com gabarito de avaliação.
  - Implementação das funções de métrica determinística (Citation Precision, Reciprocal Rank).
- **Critério de Saída:** Baseline de métricas do sistema atual registrado para comparação.

---

### Wave 2 — Pipeline de Chunking Semântico e Enriquecimento Contextual
- **Foco:** Substituir o particionamento arbitrário por janelamento estruturado baseado em tópicos.
- **Entregáveis:**
  - Implementação do chunker baseado em fronteiras de parágrafos e coerência semântica.
  - Injeção de metadados de proveniência em cada chunk (data, fonte, tipo de documento, autor vs citação).
  - Pré-computação do `contexto_narrativo` (Contextual Retrieval) para novos episódios.
- **Critério de Saída:** Chunks gerados mantêm contexto compreensível isoladamente (eval de groundedness preliminar $\ge 90\%$).

---

### Wave 3 — Busca Híbrida e Re-Ranking no PostgreSQL
- **Foco:** Unificar busca semântica (`pgvector`) e busca lexical (`tsvector` em português com dicionário lematizado).
- **Entregáveis:**
  - Stored Procedure `busca_hibrida_reciprocal_rank_fusion` no Postgres.
  - Ponderação estrita do multiplicador autoral ($1.5\times$ para notas próprias).
  - Filtros determinísticos por autor, data e taxonomia pré-recuperação.
- **Critério de Saída:** Latência P95 $\le 100\text{ ms}$ no banco; Recall@10 superior em 25% à busca puramente vetorial.

---

### Wave 4 — Motor de Perfis de Intenção e Abstenção Honesta
- **Foco:** Adequar a montagem de contexto e o limiar de relevância à intenção do usuário.
- **Entregáveis:**
  - Classificador de intenção da consulta (6 perfis canônicos).
  - Implementação da barreira de corte de relevância ($\tau = 0.55$).
  - Mecanismo de **abstenção explícita** com mensagem estruturada ao usuário quando a evidência for insuficiente.
- **Critério de Saída:** 100% de taxa de abstenção correta no caso de teste TC-04 (sem respostas inventadas).

---

### Wave 5 — Ontologia SKOS e Grafo Relacional de Conceitos
- **Foco:** Estruturação da taxonomia e teia conceitual com limites contra proliferação caótica.
- **Entregáveis:**
  - Módulo de gerenciamento de conceitos com relações `broader`, `narrower`, `related`, `desafia`, `precede`.
  - Algoritmo de busca por propagação de ativação restrita a 2 graus de distância via `WITH RECURSIVE`.
  - As 4 barreiras anti-inflação (deduplicação semântica, validação de densidade, hierarquia estrita e curadoria humana).
- **Critério de Saída:** Grafo navega até 2 graus em $<20\text{ ms}$; nenhuma proliferação de nós sinônimos duplicados.

---

### Wave 6 — Fila Assíncrona de Consolidação e Replay Noturno
- **Foco:** Implementar o modelo biológico de consolidação em dois estágios (Short-term buffer $\to$ Long-term neocortex).
- **Entregáveis:**
  - Fila de consolidação assíncrona (`fila_consolidacao_cognitiva`).
  - Worker de consolidação periódica (agrupamento de episódios recentes, atualização de resumos de alto nível e detecção de contradições).
  - Algoritmo de decaimento temporal e reforço de acesso.
- **Critério de Saída:** Processamento em lote noturno/agendado sem travar operações interativas.

---

### Wave 7 — Metamemória, Telemetria e Transparência Epistêmica
- **Foco:** Dar visibilidade e controle ao autor sobre o que o sistema sabe, o que infere e o que desconhece.
- **Entregáveis:**
  - Painel de Metamemória no frontend (taxa de cobertura de temas, lacunas de conhecimento, contradições pendentes).
  - Telemetria de custo, latência e taxa de acerto por agente.
  - Exportação de evidências e proveniência para cada reflexão gerada.
- **Critério de Saída:** Toda resposta de IA exibe o drawer de fontes com os UUIDs exatos e trechos destacados.

---

### Wave 8 — Motor de Aprendizado por Edição (Human-in-the-Loop)
- **Foco:** Aprender com as correções e preferências do autor sem risco de sobreajuste.
- **Entregáveis:**
  - Pipeline de diff semântico e classificação nas 6 categorias canônicas.
  - Anti-Overfitting Engine (limiar de 3 evidências convergentes).
  - Interface para o autor aprovar, refinar ou descartar regras de estilo sugeridas.
- **Critério de Saída:** Nenhuma regra procedural entra em vigor sem clique afirmativo do usuário.

---

### Wave 9 — Interface do Cérebro Autoral V3
- **Foco:** Experiência do usuário para explorar o próprio pensamento ampliado.
- **Entregáveis:**
  - Navegador visual do grafo de conceitos (força-dirigida, leve, renderizado via Canvas/SVG sem dependências pesadas).
  - Linha do tempo de evolução conceitual.
  - Modo "Diálogo Socrático" com o próprio acervo histórico.
- **Critério de Saída:** UI responsiva, fluida em navegadores desktop e móveis, sem bloqueios de thread principal.

---

### Wave 10 — Hardening, Otimização de Custos e Auditoria Final
- **Foco:** Estabilidade operacional, segurança, eficiência econômica e conformidade.
- **Entregáveis:**
  - Auditoria completa de RLS em todas as tabelas novas de IA.
  - Otimização de tokens (caching de prompts de sistema e compressão semântica).
  - Documentação final de operação e handoff para o A9.
- **Critério de Saída:** Todos os 10 Quality Gates cumpridos, 100% de testes unitários e de integração verdes.
