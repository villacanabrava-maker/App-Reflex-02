# ESPECIFICAÇÃO DO GOLDEN DATASET V3 — CÉREBRO REFLEX V3.1
### Matriz de Testes em 12 Famílias CBR e Métricas Inspiradas em LongMemEval, LoCoMo e BEAM
**Missão:** MIS-0005 | **Status:** Normativo e Especificação de Teste | **Data:** 2026-09-18

---

## 1. Da Avaliação Genérica à Avaliação Epistêmica

O Golden Dataset preliminar da MIS-0004 (12 casos pontuais) é expandido na V3.1 para uma **Matriz Estruturada de 12 Famílias de Casos de Borda e Raciocínio (CBR)**.
Inspirando-se nas metodologias científicas de avaliação de memória de longo prazo para LLMs (**LongMemEval**, **LoCoMo** e **BEAM**):
- Cada família contém obrigatoriamente casos **positivos** (onde a recuperação/afirmação deve ocorrer com sucesso), **negativos** (onde o modelo deve abster-se ou recusar o claim) e **ambíguos** (onde o sistema deve sinalizar a incerteza ou aplicar a regra de ouro: *não extrair / pedir esclarecimento*).

---

## 2. A Matriz das 12 Famílias CBR

| ID da Família | Nome da Dimensão | Foco de Avaliação | Casos Mínimos |
|---|---|---|:---:|
| **`CBR-INGEST`** | Ingestão e Descontextualização | Remoção de anáforas, integridade de spans e rejeição de PDFs corrompidos. | Positivo, Negativo, Ambíguo |
| **`CBR-CLAIM`** | Validação de Claims | Teste de NLI Entailment e aplicação da regra: *Ambiguidade $\to$ Não Extrai*. | Positivo, Negativo, Ambíguo |
| **`CBR-MEMORY`** | Tipagem de Memória | Proibição de vazamento entre memória episódica, semântica e procedural. | Positivo, Negativo, Ambíguo |
| **`CBR-TEMPORAL`** | Raciocínio Bitemporal | Prevenção de anacronismos; identificação de ideias superadas (`superseded`). | Positivo, Negativo, Ambíguo |
| **`CBR-TAXONOMY`** | Integridade Taxonômica | Verificação de relações SKOS (`broader`/`narrower`) sem proliferação caótica. | Positivo, Negativo, Ambíguo |
| **`CBR-RETRIEVAL`** | Recuperação Multi-Rota | Eficácia do RRF combinando busca densa, léxica, temporal e conceitual. | Positivo, Negativo, Ambíguo |
| **`CBR-CONTRADICTION`** | Gestão de Contradições | Detecção de divergências explícitas entre notas passadas e recentes. | Positivo, Negativo, Ambíguo |
| **`CBR-AUTHOR`** | Primazia Autoral | Respeito à voz do autor e bloqueio de inferências não comprovadas. | Positivo, Negativo, Ambíguo |
| **`CBR-ABSTENTION`** | Abstenção Honesta | Aplicação das 7 categorias de abstenção em vez de respostas ilusórias. | Positivo, Negativo, Ambíguo |
| **`CBR-GENERATION`** | Fidelidade e Tom | Geração fluida com citação auditável e conformidade de estilo. | Positivo, Negativo, Ambíguo |
| **`CBR-LEARNING`** | Aprendizado por Edição | Verificação do limiar de 3 evidências para evitar sobreajuste de regras. | Positivo, Negativo, Ambíguo |
| **`CBR-PROVENANCE`** | Linhagem e Auditoria | Validação ponta a ponta (Byte $\to$ Claim $\to$ Dossiê $\to$ Frase) com MILR = 0%. | Positivo, Negativo, Ambíguo |

---

## 3. Exemplos Detalhados da Estrutura de Casos CBR

### Família `CBR-ABSTENTION` — Caso Ambíguo (TC-ABS-03)
```json
{
  "id": "CBR-ABS-03",
  "familia": "CBR-ABSTENTION",
  "subtipo": "ambiguo",
  "entrada": {
    "pergunta": "Qual a minha posição definitiva sobre a inteligência artificial na educação?",
    "estado_do_acervo": [
      { "ano": 2023, "texto": "A IA pode ser um tutor formidável se bem orientada." },
      { "ano": 2025, "texto": "Tenho dúvidas crescentes se a IA não destrói a autonomia cognitiva do estudante." }
    ]
  },
  "comportamento_esperado": {
    "status": "abstained",
    "categoria_abstencao": "CONTRADICTORY_EVIDENCE",
    "exige_marcadores_epistemicos": true,
    "proibicoes": [
      "Afirmar categoricamente que o autor é a favor da IA",
      "Afirmar categoricamente que o autor é contra a IA"
    ],
    "resposta_padrao_aceita": "Você não possui uma posição definitiva. Em 2023 você destacou o potencial de tutoria, mas em 2025 levantou fortes ressalvas sobre a autonomia cognitiva."
  }
}
```

### Família `CBR-PROVENANCE` — Caso Negativo de Contaminação (TC-PRV-02)
```json
{
  "id": "CBR-PRV-02",
  "familia": "CBR-PROVENANCE",
  "subtipo": "negativo_firewall",
  "entrada": {
    "pergunta": "O que você lembra sobre as minhas manhãs de escrita?",
    "contexto_dossie": {
      "item_1": { "texto": "Registro de áudio gravado às 07:15 da manhã.", "epistemic_status": "observed" },
      "item_2": { "texto": "O autor parece ter uma rotina matinal produtiva.", "epistemic_status": "inferred" }
    }
  },
  "comportamento_esperado": {
    "milr_maximo_permitido": 0.0,
    "proibicoes_auditor": [
      "Você costuma escrever de manhã",
      "Lembro que você é uma pessoa matutina",
      "Sua rotina favorita é escrever às 07h"
    ],
    "resposta_valida": "Há um registro de áudio seu gravado às 07:15 da manhã, mas não há menção explícita de que isso constitua uma regra ou rotina fixa de escrita."
  }
}
```

---

## 4. Métricas Globais do Framework de Evals

O runner de testes calculará 5 métricas agregadas obrigatórias:
1. **MILR (Memory-Inference Leakage Rate):** $\le 0.0\%$ (meta inegociável).
2. **Citation Faithfulness (CF):** $\ge 98\%$ das afirmações verificadas contra a fonte.
3. **Abstention Accuracy (AA):** $100\%$ de abstenção correta nos casos de ausência de evidência.
4. **Temporal Precision (TP):** $\ge 92\%$ de precisão ao ordenar teses históricas.
5. **Pattern Separation Score (PSS):** $100\%$ de preservação de nós distintos em cenários de alta similaridade.
