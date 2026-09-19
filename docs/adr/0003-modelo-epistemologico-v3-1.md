# ADR 0003 — Modelo Epistemológico, Memória Tipada e Arquitetura de Claims V3.1

- **Status:** Aceito (Revisão Qualificadora do ADR 0002)
- **Data:** 18 de setembro de 2026
- **Decisores:** A1 (Arquitetura e Coordenação), A4 (Backend e Supabase), A5 (IA e Conhecimento), A7 (Qualidade e Segurança), A8 (Pesquisa e Evolução), A9 (Continuidade, Evidência e Comunicação), Usuário
- **Missão Relacionada:** MIS-0005

---

## 1. Contexto e Motivação da Revisão

O ADR 0002 estabeleceu uma conquista fundamental: a decisão pelo **PostgreSQL Cognitivo Nativo (Supabase)**, rejeitando a complexidade e custos proibitivos de bancos externos como Neo4j e GraphRAG.

Contudo, a auditoria crítica realizada na MIS-0005 — alimentada pela pesquisa aprofundada fornecida pelo usuário e por investigações em literatura de ponta (Claimify, LongMemEval, LoCoMo, BEAM) — revelou que o ADR 0002 continha vulnerabilidades conceituais:
1. **Unidade de Granularidade Excessivamente Grande:** Apoiava o raciocínio em chunks textuais brutos (1.000 a 1.500 caracteres), que misturam múltiplas afirmações e anáforas, impossibilitando a checagem factual rigorosa.
2. **Confusão Epistêmica Latente:** Não definia barreiras físicas para impedir que inferências e deduções geradas pelo LLM fossem indexadas e posteriormente recuperadas como se fossem memórias reais do autor.
3. **Premissas Numéricas Absolutistas:** Tratava parâmetros heurísticos (como o multiplicador 1.5× autoral, $\tau=0.55$, orçamento de 8k tokens e 3 repetições) como verdades consolidadas antes de qualquer calibração empírica.
4. **Sequência de Implementação Invertida:** Propunha criar tabelas e otimizar a busca antes de resolver a integridade atômica da proveniência dos fatos.

O **ADR 0002 permanece intacto no repositório como registro histórico**. Este **ADR 0003** assume a governança normativa da arquitetura cognitiva a partir de agora.

---

## 2. Decisões Arquiteturais Fundamentais

1. **O Claim como Cidadão de Primeira Classe:**
   Adotamos o **Claim (Proposição Verificável Descontextualizada)** como a unidade primária de raciocínio, linhagem, consolidação e contradição. O chunk permanece exclusivamente como contêiner de leitura contextual.
2. **Adoção dos 10 Estados Epistemológicos:**
   Toda entidade de conhecimento no sistema é obrigatoriamente rotulada com um e apenas um estado: `observed`, `quoted`, `extracted`, `consolidated`, `confirmed_authorial`, `inferred`, `hypothesized`, `proposed`, `rejected`, ou `superseded`.
3. **Instituição do `MEMORY_INFERENCE_FIREWALL`:**
   Fica estruturalmente proibido ao sistema recuperar e apresentar uma inferência de IA como memória factual autoral sem autorização ou transformação explícita. Institui-se o **MILR (Memory-Inference Leakage Rate)** como métrica de qualidade primária, com meta aspiracional $0.0\%$.
4. **Vetor de Confiança Multidimensional (Confidence Vector):**
   Abandona-se o escalar mágico fixo em favor de um vetor de 10 componentes calibráveis por tarefa (`support`, `provenance`, `independence`, `author_confirmation`, `temporal_fit`, `scope_fit`, `retrieval_stability`, `contradiction_load`, `model_agreement`, `historical_utility`).
5. **Taxonomia das 7 Formas de Abstenção:**
   A abstenção é formalizada como um comportamento esperado, correto e nobre, decomposta em 7 categorias estruturadas.
6. **Reclassificação Epistêmica dos Parâmetros:**
   Todos os parâmetros numéricos da V3 são formalmente reclassificados como **`BASELINE EXPERIMENTAL`**, sujeitos à calibração via o novo **Golden Dataset V3 (12 Famílias CBR)** e os benchmarks A/B de recuperação sob orçamento fixo de contexto.
7. **Reordenação do Roadmap em 10 Fases:**
   A implementação futura iniciará impreterivelmente por **Claims, Proveniência e Estados Epistemológicos** (Fase 1) e pela medição de **MILR** (Fase 2), antes de qualquer alteração de busca ou interface.

---

## 3. Consequências

### Positivas:
- **Imunidade contra Alucinações de Memória:** O sistema torna-se matematicamente incapaz de fingir que lembra de algo que apenas deduziu.
- **Rastreabilidade Fina (Lineage Claim-a-Claim):** Cada frase gerada no texto final tem âncora direta de proveniência no byte original da obra ou áudio.
- **Respeito à Dialética Humana:** Contradições e mudanças temporais de opinião do autor são preservadas e enriquecem o pensamento, em vez de gerarem erros de busca.
- **Governança Científica e Não-Dogmática:** Os parâmetros do sistema serão refinados com base em dados de teste, e não em palpites estáticos.

### Trade-offs e Mitigações:
- **Custo Computacional de Ingestão:** A descontextualização e a validação por NLI Entailment exigem processamento adicional no momento da extração.
  *Mitigação:* Processamento assíncrono em fila em lote; aplicação da regra *Ambiguidade $\to$ Não Extrai*, economizando validações desnecessárias.
- **Maior Complexidade de Metadados:** Cada aresta e claim carrega vetores e atributos temporais.
  *Mitigação:* Uso eficiente do formato `JSONB` indexado e tipos primitivos nativos do PostgreSQL 17.

---

## 4. Relação com Decisões Anteriores

- **ADR 0001 (Fundação Arquitetural):** Permanece plenamente válido e soberano (Next.js 15, TypeScript, Supabase/PostgreSQL 17, Tailwind).
- **ADR 0002 (Arquitetura Cognitiva V3):** Permanece como registro histórico da transição do Naive RAG para o Postgres Cognitivo. Suas afirmações absolutas e sequenciamento de fases ficam formalmente revogados e substituídos pelas disposições deste ADR 0003.
