---
name: claim-provenance
description: >-
  Protocolo e árvore de decisão para extração de claims descontextualizados, validação por NLI Entailment,
  aplicação do Memory-Inference Firewall e rastreabilidade de linhagem ponta a ponta no Cérebro Reflex V3.1.
---

# Protocolo de Claims & Linhagem de Proveniência — Cérebro Reflex V3.1

Este guia operacional orienta o Agente A5 e os motores cognitivos na extração atômica de afirmações, desambiguação e prevenção de vazamento de inferência (**MILR**).

---

## 1. Árvore de Decisão de Extração (Decision Tree)

```mermaid
flowchart TD
    Start[Sentença Candidata a Claim] --> Q1{A sentença contém pronomes soltos ou anáforas?}
    Q1 -->|Sim| Descon[Aplicar Descontextualização com Entidades Explícitas]
    Q1 -->|Não| Q2{Permanece ambiguidade não resolvida?}
    
    Descon --> Q2
    Q2 -->|Sim| StopAmbig[REGRA DE OURO: AMBIGUIDADE -> NÃO EXTRAI]
    Q2 -->|Não: Auto-suficiente| Q3{Validador de Entailment NLI contra o Span}

    Q3 -->|Classificação Neutral ou Contradiction| Rej[Descartar Claim Candidato]
    Q3 -->|Score Entailment < 0.85| Rej
    Q3 -->|Score Entailment >= 0.85| Q4{Origem da Afirmação?}

    Q4 -->|Citação Direta ou Fato Documental| Ext[Classificar como extracted ou quoted]
    Q4 -->|Dedução Lógica do LLM| Inf[Classificar como inferred - Allowed Use: CANNOT_ASSERT_AS_MEMORY]
    Q4 -->|Aprovação Explícita do Autor Humano| Aut[Classificar como confirmed_authorial]
```

---

## 2. Regras de Decisão Operacional

### Regra 1: O Teste de Ambiguidade
- **SE** a proposição depende de interpretação subjetiva de termos indeterminados (*"coisas"*, *"certos autores"*, *"naquele período"* sem datação):
  - **STOP: NÃO EXTRAIR O CLAIM**. O chunk original permanece preservado para leitura humana na biblioteca.

### Regra 2: A Fronteira entre Memória e Inferência
- **SE** uma afirmação for gerada por extrapolação de modelo de linguagem:
  1. Atribuir obrigatoriamente `epistemic_status = 'inferred'`;
  2. Adicionar tag `allowed_use = ['CAN_INSPIRE_QUESTION', 'CAN_BE_MENTIONED_AS_POSSIBLE_DEDUCTION']`;
  3. **NUNCA** permitir prefixos de rememoração (*"Você sempre..."*, *"Lembro que você prefere..."*).

### Regra 3: Rastreabilidade de Linhagem (Lineage)
- Todo claim aceito deve carregar:
  - `source_id` (UUID do documento original);
  - `chunk_id` (UUID do fragmento leitor);
  - `span_exato` (texto literal exato do trecho de suporte);
  - `offsets` (início e fim no documento);
  - `entailment_score` (grau de sustentação inferencial).
