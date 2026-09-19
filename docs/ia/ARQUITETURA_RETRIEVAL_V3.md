# Arquitetura de Retrieval Multi-Sinal Adaptativo V3 — App Reflex 02

**Data:** 18 de setembro de 2026  
**Líder Técnico:** A5 (rflex-ai-knowledge) & A8 (rflex-research-evolution)  
**Revisão de Desempenho e SQL:** A4 (rflex-backend-supabase) & A1 (rflex-architect)  

---

## 1. O Problema do Retrieval Monolítico

O RAG tradicional comete o erro de usar uma única estratégia de busca (geralmente `top-k` de similaridade de cosseno vetorial) para todos os tipos de perguntas. Uma pergunta pontual sobre uma citação exata requer precisão léxica; uma pergunta sobre a evolução de uma tese requer navegação temporal e conceitual.

A versão V3 implementa um **Motor de Retrieval Adaptativo em Duas Etapas**:
1. **Classificação da Intenção de Busca (Query Intent Classifier)**
2. **Combinação Ponderada Multi-Sinal com Re-ranking e Abstenção**

---

## 2. Os Seis Perfis de Intenção de Retrieval

```
                       QUERY DO USUÁRIO / TEMA DE REFLEXÃO
                                       │
                                       ▼
                       [CLASSIFICADOR DE INTENÇÃO (Zod)]
                                       │
         ┌───────────────┬─────────────┼───────────────┬───────────────┐
         ▼               ▼             ▼               ▼               ▼
    1. FACTUAL      2. CONCEITUAL  3. RELACIONAL   4. EVOLUTIVO   5. METODOLÓGICO
   (Busca Léxica     (Vetores +    (Navegação de   (Ordenação      (Dimensões +
     Exata FTS)      Taxonomia)     Grafo SKOS)    Temporal)        Regras Cérebro)
```

1. **Factual Local ("Onde eu citei a passagem de Kierkegaard sobre a angústia?"):**
   - *Estratégia:* Prioridade absoluta para Busca Lexical (Full-Text Search PostgreSQL com `to_tsquery('portuguese', ...)`).
2. **Conceitual ("Qual a definição central de autonomia no meu pensamento?"):**
   - *Estratégia:* Híbrido denso (Vetor pgvector) + busca no nó preferencial da Taxonomia (`taxonomia.conceitos`).
3. **Relacional ("Como o conceito de poder se articula com o de liberdade?"):**
   - *Estratégia:* Graph traversal no PostgreSQL (`WITH RECURSIVE`) partindo de ambos os conceitos para encontrar caminhos de conexão e tensões antagonistas.
4. **Evolutivo ("Como minha visão sobre tecnologia mudou entre 2024 e 2026?"):**
   - *Estratégia:* Recuperação com janelas temporais ordenadas por `criado_em` e `valid_from`, comparando fragmentos de períodos distintos.
5. **Metodológico ("Como normalmente estruturo ensaios com oposição dialética?"):**
   - *Estratégia:* Recuperação de características e regras do `cerebro_autoral`, filtradas pela dimensão canônica correspondente.
6. **Global / Panorâmico ("Quais os principais temas transversais em toda a Biblioteca?"):**
   - *Estratégia:* Consulta agregada nas sínteses de obra e clusters de conceitos, sem despejar fragmentos atômicos no prompt.

---

## 3. Função de Pontuação Multi-Sinal Calibrada

O score de pertinência de um fragmento candidato não depende apenas de um número arbitrário, mas da fusão ponderada de sinais:

$$\text{Score}(F) = w_{\text{lex}} \cdot S_{\text{lex}} + w_{\text{sem}} \cdot S_{\text{sem}} + w_{\text{tax}} \cdot S_{\text{tax}} + w_{\text{aut}} \cdot S_{\text{aut}} - w_{\text{con}} \cdot P_{\text{con}}$$

Onde:
- $S_{\text{lex}}$: Score normalizado de ranking FTS (`ts_rank_cd`).
- $S_{\text{sem}}$: Similaridade de cosseno do embedding vetorial ($1 - \text{distância}$).
- $S_{\text{tax}}$: Bônus se o fragmento estiver diretamente associado a um conceito ativado no plano argumentativo.
- $S_{\text{aut}}$: Multiplicador autoral (**peso 1.5x para obras do Núcleo Autoral**, peso 1.0x para fontes externas).
- $P_{\text{con}}$: Penalidade se o fragmento estiver marcado como contraditado ou superado temporalmente.

*Nota de Governança:* Os pesos exatos ($w_{\text{lex}}, w_{\text{sem}}, \dots$) serão afinados através do pipeline de Evals (Golden Dataset) e nunca adotados por intuição subjetiva.

---

## 4. O Mecanismo de Abstenção Cognitiva ("Saber Dizer Não Sei")

Se após o retrieval e re-ranking:
- A pontuação do melhor fragmento for inferior ao limiar de corte ($\text{Score}_{\max} < \theta_{\text{abstencao}}$); ou
- Não existirem fragmentos com grau de aderência comprovável;

O sistema **inibe a geração de texto fabulado** e aciona o protocolo formal de resposta:

```markdown
> [!NOTE]
> **Contexto Insuficiente no Cérebro Autoral**
> O sistema não identificou memórias autorais ou fontes suficientes no seu acervo 
> para embasar uma reflexão rigorosa sobre este tema.
> 
> **Opções do Autor:**
> 1. Inserir uma obra ou texto de referência na Biblioteca para subsidiar a reflexão.
> 2. Redigir a partir de primeiros princípios (sem vincular falsas memórias).
```
