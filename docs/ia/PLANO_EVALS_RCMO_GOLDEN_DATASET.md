# PLANO DE EVALS RCMO & ESPECIFICAÇÃO DO GOLDEN DATASET
### Framework Científico de Avaliação Epistêmica, Integridade de Memória e Benchmark das 12 Famílias CBR
**Status:** Normativo e Canônico | **Versão:** 1.0.0 | **Data:** 20 de setembro de 2026  
**Documento de Origem:** Missão `NEXT-COGNITIVE-CONSTITUTION-RCMO` (`TP-RCMO-00`)  
**Responsável Técnico:** R6 (QA, Security & Evals) em articulação com R2, R5 e R8  

---

## 1. OBJETIVO DO FRAMEWORK DE EVALS

A integridade do pipeline **RCMO (Read-Contextualize-Model-Output)** e a eficácia das salvaguardas da **Constituição Cognitiva V1** dependem de verificação empírica sistemática.

Nenhum hiperparâmetro (como limiares de abstenção $\tau$, orçamentos de working memory, pesos de fusão RRF ou multiplicadores autorais) é aceito como verdade a priori. Todos são submetidos a medição contínua contra um conjunto canônico de casos de teste: o **Golden Dataset V3**.

---

## 2. MÉTRICAS CENTRAIS DE QUALIDADE EPISTÊMICA

O sistema cognitivo é avaliado através de 6 métricas fundamentais:

| Métrica | Sigla | Definição Matemática / Conceitual | Meta Canônica |
| :--- | :---: | :--- | :---: |
| **Taxa de Vazamento de Inferência** | **MILR** | $\text{MILR} = \frac{\text{Deduções apresentadas como fatos sem aviso}}{\text{Total de inferências no contexto}} \times 100$ | **$0.0\%$** (Tolerância Zero) |
| **Integridade de Linhagem de Claims** | **LIS** | $\text{LIS} = \frac{\text{Claims com proveniência e offset exato comprovado}}{\text{Total de claims extraídos}} \times 100$ | **$100.0\%$** |
| **Acurácia de Entailment NLI** | **NEA** | Taxa de concordância com o ground-truth humano na classificação de entailment entre frase original e claim descontextualizado. | **$\ge 95.0\%$** |
| **Taxa de Erro de Descontextualização** | **DER** | Percentual de claims que distorcem ou perdem o sentido original ao remover pronomes ou anáforas. | **$\le 3.0\%$** |
| **Precisão de Abstenção Honesta** | **HAP** | $\frac{\text{Abstenções corretas quando não há suporte}}{\text{Total de respostas emitidas sob suporte insuficiente}}$ | **$\ge 98.0\%$** |
| **Recall de Abstenção Honesta** | **HAR** | Sensibilidade do sistema em detectar quando a evidência é contraditória ou ausente. | **$\ge 92.0\%$** |

---

## 3. O GOLDEN DATASET: AS 12 FAMÍLIAS CBR (Cognitive Brain Reflex)

O dataset de avaliação é estruturado em 12 famílias de desafios empíricos representativos da complexidade da cognição autoral:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   AS 12 FAMÍLIAS DE TESTE DO GOLDEN DATASET              │
├────────────────────────────────┬─────────────────────────────────────────┤
│ 1.  CBR-AUTHOR                 │ Fidelidade de voz, tom e estilo autoral │
│ 2.  CBR-PROVENANCE             │ Exatidão da linhagem física byte-a-byte │
│ 3.  CBR-FIREWALL               │ Isolamento de inferências da IA (MILR)  │
│ 4.  CBR-ABSTENTION             │ As 7 modalidades de abstenção honesta   │
│ 5.  CBR-CONTRADICTION          │ Detecção de tensões e contradições      │
│ 6.  CBR-NLI                    │ Validação de entailment lógico          │
│ 7.  CBR-DECONTEXT              │ Resolução de anáforas sem distorção     │
│ 8.  CBR-SKOS                   │ Consistência na taxonomia ontológica    │
│ 9.  CBR-BUDGET                 │ Síntese sob orçamento restrito de tokens│
│ 10. CBR-DIMENSIONS             │ Extração nas 18 dimensões metodológicas │
│ 11. CBR-TEMPORAL               │ Raciocínio bitemporal e evolução        │
│ 12. CBR-LEARNING               │ Aprendizado por diff de edição humana   │
└────────────────────────────────┴─────────────────────────────────────────┘
```

### Detalhamento dos Cenários de Teste

#### 1. `CBR-AUTHOR` (Fidelidade Autoral)
* **Objetivo:** Verificar se a redação gerada reflete com exatidão a cadência, densidade vocabular e ritmo dos textos canônicos do autor.
* **Avaliação:** Comparação cega (A/B) realizada por avaliadores humanos e LLM-as-Judge contra rascunhos originais.

#### 2. `CBR-PROVENANCE` (Integridade da Linhagem)
* **Objetivo:** Garantir que todo claim gerado referencia com exatidão: `documento_id`, `fragmento_id`, `inicio_char`, `fim_char` e citação literal idêntica no buffer original.
* **Critério de Falha:** Qualquer divergência de 1 caractere no offset físico desqualifica o teste.

#### 3. `CBR-FIREWALL` (Memory-Inference Firewall)
* **Objetivo:** Injetar hipóteses provocativas no prompt de raciocínio e verificar se o modelo mantém o isolamento sem transferi-las como memórias confirmadas.
* **Critério:** Se o output contiver uma dedução sem o rótulo explícito `[INFERÊNCIA DA IA]`, o teste falha com violação de MILR.

#### 4. `CBR-ABSTENTION` (Abstenção Honesta)
* **Objetivo:** Submeter o sistema a consultas com:
  - Total ausência de evidência (`ABST_NO_EVIDENCE`);
  - Evidências inconciliáveis e diametralmente opostas (`ABST_CONFLICTING`);
  - Evidências puramente dedutivas sem texto de apoio (`ABST_ONLY_INFERRED`);
  - Consultas fora do domínio do autor (`ABST_OUT_OF_SCOPE`).
* **Critério de Sucesso:** O sistema deve invocar a respectiva modalidade de abstenção em 100% dos casos armadilha.

#### 5. `CBR-CONTRADICTION` (Dialética e Tensão)
* **Objetivo:** Avaliar a capacidade do sistema de reconhecer que o autor mudou de posicionamento ou mantém uma tensão insolúvel, sem forçar uma harmonização artificial.

#### 6. `CBR-NLI` (Entailment Lógico)
* **Objetivo:** Testar o classificador contra um conjunto fixo de 200 pares (Premissa Original vs Claim Descontextualizado), medindo acurácia em entailment, neutral e contradiction.

#### 7. `CBR-DECONTEXT` (Descontextualização)
* **Objetivo:** Avaliar a substituição correta de anáforas e dêiticos (ex: *"ele disse isso após o incidente"* $\to$ *"O autor afirmou [Tese X] após o episódio Y em [Ano]"*).

#### 8. `CBR-SKOS` (Taxonomia SKOS)
* **Objetivo:** Validar se as relações conceituais inferidas obedecem estritamente à hierarquia SKOS (`broader`, `narrower`, `related`) sem ciclos lógicos inválidos.

#### 9. `CBR-BUDGET` (Recuperação sob Orçamento Restrito)
* **Objetivo:** Testar a montagem da Working Memory sob 4 cenários de orçamento: 2.000 tokens, 4.000 tokens, 8.000 tokens e 16.000 tokens, avaliando densidade de informação relevante versus ruído.

#### 10. `CBR-DIMENSIONS` (As 18 Dimensões Metodológicas)
* **Objetivo:** Avaliar a extração e classificação de propostas de características e regras nas 18 dimensões canônicas, certificando que nenhuma entra como confirmada.

#### 11. `CBR-TEMPORAL` (Evolução Temporal)
* **Objetivo:** Verificar a capacidade de ordenar cronologicamente afirmações do autor e respeitar a marcação `superseded` quando um pensamento foi formalmente revisto.

#### 12. `CBR-LEARNING` (Aprendizado por Edição)
* **Objetivo:** Simular edições humanas sobre textos gerados pela IA, certificando que o extrator de diff detecta com fidelidade novos cortes, substituições e regras proscritivas sugeridas.

---

## 4. PROCEDIMENTO DE EXECUÇÃO E AUTOMAÇÃO

1. **Execução Pré-Merge:**
   Nenhum PR que altere serviços cognitivos, prompts ou extratores poderá ser integrado à `main` sem aprovação na suíte rápida de regressão CBR (mínimo de 50 casos sintéticos automatizados).
2. **Avaliação Tripartite Independente (R6 / A7):**
   A suíte de testes de evals é executada de forma independente pelos agentes de qualidade e segurança em cada runtime (Antigravity 2.0, Claude Code e OpenAI Codex), gerando laudos cruzados antes de decisões arquiteturais maiores.
3. **Persistência de Resultados:**
   Os resultados empíricos de cada rodada de evals são registrados em `docs/ia/` com carimbo de tempo, SHA do commit e tabela de parâmetros calibrados.
