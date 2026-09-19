---
name: reflex-rcmo
description: >-
  Especificação do modelo RCMO (Representação Cognitivo-Semântica Multicamadas para Obras).
  Governa a transição estrutural: Obra -> Seções -> Fragmentos -> Claims -> Conceitos -> Grafo.
---

# 📚 Skill: Protocolo RCMO — Representação Cognitivo-Semântica Multicamadas

Esta skill estabelece os fundamentos do modelo **RCMO** para a evolução da ingestão documental e ontologia do Cérebro Reflex.

## 🧱 As Camadas Estruturais do RCMO

```
┌─────────────────────────────────────────────────────────────┐
│ CAMADA 1: TEXTO BRUTO & PROVENIÊNCIA MATERIAL (PDF / TUS)   │
│ Obra, Versão, Hash SHA-256 do arquivo original, Spans UTF-16│
├─────────────────────────────────────────────────────────────┤
│ CAMADA 2: ESTRUTURA MACRO (Sumário, Capítulos, Seções)      │
│ Hierarquia de seções, metadados de paginação e ordem linear │
├─────────────────────────────────────────────────────────────┤
│ CAMADA 3: SEGMENTAÇÃO ATÔMICA (Fragmentos & Sínteses)       │
│ Fragmentos contextuais com janelas delimitadas e embeddings │
├─────────────────────────────────────────────────────────────┤
│ CAMADA 4: AFIRMAÇÕES NUCLEARES (Ledger de Claims V3.1)      │
│ Claims atômicos descontextualizados, estados epistêmicos    │
├─────────────────────────────────────────────────────────────┤
│ CAMADA 5: ANCORAGEM CONCEITUAL & GRAFO (SKOS & Ontologia)   │
│ Conceitos preferenciais, relações broader/narrower/related  │
├─────────────────────────────────────────────────────────────┤
│ CAMADA 6: MEMÓRIA DINÂMICA (Event Ledger & Replay)          │
│ Histórico de eventos, consolidação e aprendizado por edição │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Aplicação no Processamento
1. A transição de uma obra para o Cérebro Reflex deve respeitar estritamente a linhagem ascendente: todo claim precisa rastrear seu fragmento de origem, seção e obra de proveniência.
2. Obras classificadas como `fonte_externa` jamais recebem autoridade de `nucleo_autoral`.
