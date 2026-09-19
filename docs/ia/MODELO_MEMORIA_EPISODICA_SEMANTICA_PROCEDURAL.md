# Modelo de Engenharia: Memória Episódica, Semântica e Procedural — App Reflex 02

**Data:** 18 de setembro de 2026  
**Líder Técnico:** A5 (rflex-ai-knowledge) & A1 (rflex-architect)  
**Revisão de Segurança e Integridade:** A4 (rflex-backend-supabase) & A7 (rflex-qa-security)  

---

## 1. Visão Geral da Arquitetura Tripartite de Memória

Para que a inteligência do App Reflex 02 atue de forma coerente e contínua, o sistema estrutura seus dados em três pilares fundamentais, intermediados por uma memória de trabalho contextual e governados por metamemória:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           WORKING MEMORY                                │
│        (Dossiê Contextual Cirúrgico Montado para a Reflexão Atual)      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Alimenta-se de
        ┌────────────────────────────┼────────────────────────────┐
        ▼                            ▼                            ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│MEMÓRIA EPISÓDICA │       │ MEMÓRIA SEMÂNTICA│       │MEMÓRIA PROCEDURAL│
│(Ledger Imutável  │       │(Grafo Conceitual │       │ (Regras, Métodos │
│ de Fatos, Textos │       │   Taxonomia Viva │       │   e Anti-Regras  │
│ e Versões)       │       │    e Sínteses)   │       │   do Autor)      │
└──────────────────┘       └──────────────────┘       └──────────────────┘
        ▲                            ▲                            ▲
        └────────────────────────────┼────────────────────────────┘
                                     │ Supervisionado por
┌────────────────────────────────────┴────────────────────────────────────┐
│                              METAMEMÓRIA                                │
│         (Confiança Explicável, Proveniência Estrita e Incerteza)        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Especificação de Cada Subsistema de Memória

### 2.1 Memória Episódica (Episodic Memory Ledger)
- **Natureza:** Registro histórico e factual de tudo o que ocorreu ou foi ingerido. É estritamente **imutável** e ordenado no tempo.
- **Tabelas Supabase Correspondentes:**
  - `biblioteca.obras` e `biblioteca.fontes_obras`: O documento exato com hash, MIME, tamanho e data de upload.
  - `processamento.fragmentos`: Os trechos textuais literais extraídos com localização precisa (página, offset, seção pai).
  - `reflexoes.entradas`: O pedido do usuário, a intenção expressa e a data da solicitação.
  - `reflexoes.versoes_reflexao`: As versões sucessivas geradas pela IA (v1) e reescritas pelo autor (v2), preservando o diff exato.
- **Princípio Inegociável:** A memória episódica **nunca é apagada ou mutada**. Uma revisão não sobrescreve o passado; gera um novo episódio com vínculo ancestral (`versao_base_id`).

### 2.2 Memória Semântica (Semantic Memory Graph)
- **Natureza:** O corpo estruturado de conhecimento, categorias, significados e relações descontextualizadas da data específica em que foram lidas.
- **Tabelas Supabase Correspondentes:**
  - `taxonomia.conceitos`: Conceitos canônicos com termo preferencial, definição formal e domínio epistêmico.
  - `taxonomia.termos`: Sinônimos, aliases e expressões correlatas que apontam para o conceito canônico.
  - `taxonomia.relacoes`: Arestas do grafo semântico (`hiperonimo`, `hiponimo`, `antagonista`, `complementar`).
  - `processamento.sinteses`: Sínteses executivas e conceituais de seções e obras inteiras.
- **Princípio Inegociável:** Conceitos propostos por IA nascem em estado `revisao` e só passam a atuar como verdade canônica no grafo após confirmação do autor.

### 2.3 Memória Procedural (Procedural Authorial Memory)
- **Natureza:** O repertório de métodos, regras de composição, hábitos de pensamento e restrições formais que definem *como o autor opera*.
- **Tabelas Supabase Correspondentes:**
  - `cerebro_autoral.dimensoes`: O catálogo canônico das 18 dimensões metodológicas (Ontologia, Tensão, Dialética, Tom, etc.).
  - `cerebro_autoral.caracteristicas`: As fórmulas de pensamento identificadas no autor.
  - `cerebro_autoral.regras`:
    - *Prescritivas:* Diretrizes que o autor busca sistematicamente aplicar (ex: "Sempre ancorar abstrações em exemplos concretos").
    - *Proscritivas (Anti-Regras):* O que o autor rejeita categoricamente (ex: "Nunca usar lugares-comuns de IA nem frases de autoajuda").
- **Princípio Inegociável:** Uma regra procedural só é consolidada se houver evidência recorrente em múltiplas obras e aprovação explícita do autor.

---

## 3. A Memória de Trabalho (Working Memory / Dossiê Contextual)

A Memória de Trabalho é a estrutura dinâmica efêmera que alimenta o prompt do LLM em uma tarefa de reflexão específica:
- Ela é montada sob demanda através do **Retrieval Multi-Sinal**.
- Contém exclusivamente:
  1. A tese central da reflexão;
  2. As memórias episódicas diretamente pertinentes (top fragmentos filtrados);
  3. Os conceitos da memória semântica ativados pelo tema;
  4. As regras procedurais relevantes para o formato desejado;
  5. As incertezas e contraevidências conhecidas.
- **Regra de Higiene Cognitiva:** Se o Dossiê Contextual estiver vazio ou não encontrar fontes autorais relevantes, a memória de trabalho aciona o protocolo de **Abstenção** (*"Contexto Insuficiente"*), em vez de preencher o espaço com fragmentos recentes arbitrários.
