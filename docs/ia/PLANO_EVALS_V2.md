# PLANO DE EVALS V2 — BENCHMARK E QUALIDADE COGNITIVA
**Missão:** MIS-0004 | **Status:** Normativo | **Data:** 2026-09-18

---

## 1. Princípio Fundamental de Avaliação Cognitiva

Em sistemas de IA generativa convencionais, testes baseiam-se em checagem superficial de strings ou métricas de ROUGE/BLEU.
No **App Reflex 02 V3**, uma resposta correta não é apenas sintaticamente agradável: ela deve ser **fiel ao pensamento autoral**, **rastreável até os chunks originais**, **desprovida de alucinações extrapolares** e **capaz de declarar abstenção** quando o acervo não dispuser de evidência suficiente.

O **Plano de Evals V2** estabelece um framework de avaliação sistemático, automatizado e com rigor quantitativo.

---

## 2. As 10 Dimensões de Avaliação Cognitiva

| # | Dimensão | Métrica | Limiar Mínimo de Aprovação | Método de Verificação |
|---|---|---|:---:|---|
| **1** | **Fidelidade à Fonte (Groundedness)** | % de afirmações suportadas diretamente pelos chunks citados | $\ge 95\%$ | LLM Judge + Verificação de NLI (Natural Language Inference) |
| **2** | **Precisão de Citação (Citation Precision)** | Razão de referências válidas vs citações fantasmas | $100\%$ | Validador determinístico de UUIDs de chunk no corpus |
| **3** | **Alinhamento ao Tom Autoral (Voice Match)** | Similaridade semântica e estilística com o perfil de escrita | $\ge 85\%$ | Comparação com embeddings e regras de `perfil_autoral_regras` |
| **4** | **Relevância de Recuperação (Recall@K)** | % de chunks essenciais presentes no top-$K$ recuperado | $\ge 90\%$ | Golden Retrieval Targets (anotação manual) |
| **5** | **Pureza de Contexto (Context Precision)** | % de chunks no prompt que foram realmente úteis | $\ge 70\%$ | LLM-as-a-Judge avaliando contribuição marginal de cada chunk |
| **6** | **Capacidade de Abstenção (Honest Abstention)** | Abster-se quando a evidência for insuficiente | $100\%$ | Casos de teste com perguntas fora do escopo do acervo |
| **7** | **Detecção de Contradição** | Identificar e sinalizar tensões temporais ou teóricas | $\ge 85\%$ | Casos em que o autor mudou de ideia ao longo dos anos |
| **8** | **Preservação de Nuance Conceitual** | Distinguir termos correlatos (ex: afeto vs emoção) | $\ge 90\%$ | Testes de consistência ontológica (SKOS) |
| **9** | **Latência de Pipeline (P95)** | Tempo fim a fim para recuperação + montagem de contexto | $\le 300\text{ ms}$ | Telemetria de backend (Next.js + Postgres) |
| **10** | **Custo por Síntese/Reflexão** | Consumo de tokens de entrada e saída por operação | $\le \$0.015$ | Auditoria de telemetria da OpenAI/Gemini/Anthropic |

---

## 3. Golden Dataset Canônico (12 Casos de Teste)

O Golden Dataset contém 12 instâncias que cobrem os 6 perfis de intenção e cenários de estresse cognitivo:

| ID | Perfil de Intenção | Pergunta / Gatilho | Chunks Esperados | Comportamento Esperado do Modelo |
|---|---|---|---|---|
| **TC-01** | `SINTESE_RECUPERACAO` | "Como eu defini a relação entre disciplina e criatividade em 2024?" | Chunks do diário 2024, tags: `criatividade`, `disciplina` | Citar os dois episódios de 2024 sem inferir opiniões de outros anos. |
| **TC-02** | `EXPLORACAO_CONCEITUAL` | "Qual a evolução do conceito de 'Reflexão' nas minhas notas?" | Conceito `Reflexao` + 4 episódios históricos | Mapear a linha temporal e as variações de escopo. |
| **TC-03** | `DESAFIO_CONTRADICAO` | "Eu sempre defendi o trabalho solitário?" | Episódio de 2023 (pró-solidão) e 2025 (pró-colaboração) | **Sinalizar a contradição temporal explicitamente**. |
| **TC-04** | `ABSTENCAO_RIGOROSA` | "Qual a minha opinião sobre teoria das cordas na física quântica?" | **Nenhum chunk relevante no acervo** | **Declarar abstenção imediata:** *"Você não possui anotações sobre física quântica no acervo."* |
| **TC-05** | `ESTILO_VOZ_DIRETA` | "Sintetize a reunião de ontem para um ensaio." | Transcrição de 30 min | Gerar texto em 1ª pessoa, conciso, sem clichês motivacionais. |
| **TC-06** | `PONDERACAO_AUTORAL` | "O que pensamos sobre o livro X?" | 1 nota do autor (peso 1.5) + 3 citações de terceiros (peso 0.8) | Privilegiar a interpretação autoral sobre a citação de terceiro. |
| **TC-07** | `GRAFO_RELACIONAL` | "Quais conceitos estão associados a 'Angústia Criativa'?" | Relações `skos:related` e `ont:desafia` | Listar os nós conectados com justificação semântica da aresta. |
| **TC-08** | `MEMORIA_PROCEDURAL` | "Como devo estruturar a revisão semanal?" | Regra procedural de revisão semanal | Apresentar o roteiro exato registrado no perfil do autor. |
| **TC-09** | `ANTI_ALUCINACAO` | "Quais livros da Virginia Woolf eu mencionei ter lido em maio de 2025?" | Notas de leitura de maio 2025 (cita apenas *Mrs Dalloway*) | Citar exclusivamente *Mrs Dalloway*, rejeitando suposições como *To the Lighthouse*. |
| **TC-10** | `CONSOLIDAÇÃO_RUIDO` | Fragmento com notas soltas de áudio com ruído. | Chunks de áudio transcrito | Ignorar hesitações ("humm", "então") e extrair o núcleo semântico. |
| **TC-11** | `FEEDBACK_EDICAO` | Simulação de edição onde o autor corta 3 vezes adjetivos barrocos. | Diff semântico v1 -> v2 | O sistema sugere a regra: *"Evitar adjetivação hiperbólica"*. |
| **TC-12** | `LATENCIA_STRESS` | Consulta complexa que cruza 3 taxonomias e busca híbrida. | Top-100 chunks candidatos | Re-ranking e montagem de contexto executados em menos de 250ms. |

---

## 4. Pipeline de Execução de Evals Automatizados

Os testes serão executados via script de avaliação integrado ao Vitest:
`npm run test:evals`

```typescript
// Estrutura conceitual do runner de Evals
describe('Cognitive Evals V2', () => {
  test.each(goldenDataset)('Caso $id: $perfil', async (caso) => {
    const context = await cognitiveRetrievalPipeline(caso.pergunta, caso.perfil);
    const response = await cognitiveSynthesisPipeline(caso.pergunta, context);
    
    // 1. Verificação Determinística de Citações
    expect(validateCitations(response, context.chunks)).toBe(true);
    
    // 2. Verificação de Abstenção se caso sem dados
    if (caso.esperaAbstencao) {
      expect(response.isAbstained).toBe(true);
      return;
    }
    
    // 3. Avaliação de Fidelidade (LLM as Judge)
    const judgeResult = await evaluateGroundedness(response, context.chunks);
    expect(judgeResult.score).toBeGreaterThanOrEqual(0.95);
  });
});
```

---

## 5. Critérios de Barreira de Qualidade (Quality Gates)

Nenhuma alteração no pipeline de IA, prompts de sistema, algoritmos de busca ou esquema de banco de dados poderá ser mesclada na `main` sem que:
1. Todos os 12 testes do Golden Dataset passem sem regressão.
2. A métrica de Fidelidade Global seja mantida em $\ge 95\%$.
3. A taxa de falsos positivos em perguntas sem resposta continue em $0\%$ (100% de abstenção correta).
