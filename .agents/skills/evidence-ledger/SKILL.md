---
name: evidence-ledger
description: >-
  Metodologia, árvore de decisão e taxonomia de evidências técnicas para garantia de integridade factual
  e conciliação documental no livro-razão de governança do App Reflex 02.
---

# Livro-Razão de Evidências (Evidence Ledger Protocol)

Este protocolo orienta o Agente A9 e a equipe na auditoria, classificação e conciliação de evidências técnicas.

---

## 1. Árvore de Decisão de Reconciliação (Decision Tree)

```mermaid
flowchart TD
    Start[Alegação ou Relatório Recebido] --> Q1{Possui stdout de comando, diff ou link de CI?}
    Q1 -->|Não: Apenas afirmação textual| TagReported[Classificar como [REPORTED] ou [INFERRED]]
    TagReported --> Rej[STOP: Proibido atestar conclusão sem prova material]
    
    Q1 -->|Sim: Possui evidência física| Q2{A evidência confere com o repositório?}
    Q2 -->|Divergência de hash de commit ou arquivos| RegDiv[STOP: Registrar Divergência Crítica e Escalar para A1]
    Q2 -->|Isomórfico| Q3{O CI do GitHub Actions está Verde?}

    Q3 -->|Falha em qualquer job do CI| BlockCI[STOP: Bloquear Handoff - CI não aprovado]
    Q3 -->|CI Verde com Run ID| Pass[Classificar [CONFIRMADO-*] e Liberar Handoff AG-XXXX]
```

---

## 2. Taxonomia Padronizada de Evidências

Toda afirmação registrada nos relatórios de A9 deve receber obrigatoriamente uma das tags:

| Categoria | Definição | Exemplo de Prova Válida |
| :--- | :--- | :--- |
| `[CONFIRMADO-CODIGO]` | O código existe e foi inspecionado linha por linha no arquivo. | Caminho do arquivo e bloco de linhas inspecionado. |
| `[CONFIRMADO-TESTE]` | Comportamento verificado por suite de testes com sucesso. | Trecho do stdout do Vitest com contagem e duração. |
| `[CONFIRMADO-CI]` | Pipeline do GitHub Actions rodou e concluiu com status *Success*. | Link e ID da run de CI (ex: Run 35414164109 em 1m0s). |
| `[CONFIRMADO-RUNTIME]`| O processo executou localmente e respondeu a requisições reais. | Resposta HTTP capturada ou log de inicialização do servidor. |
| `[CONFIRMADO-EXTERNAL]`| Validação direta com serviço ou documentação oficial (ex: RFC). | Resposta autenticada de endpoint ou link persistente de doc. |
| `[REPORTED]` | Dado transmitido pelo usuário, pendente de validação de engenharia. | Transcrição de instrução ou relato de comportamento anômalo. |
| `[INFERRED]` | Hipótese técnica baseada em indícios parciais, sem prova direta. | Dedução de que um bug decorre de falta de índice no banco. |
| `[PENDING]` | Tarefa mapeada no escopo que ainda não ocorreu. | Teste de estresse agendado para ciclo futuro. |
| `[BLOCKED]` | Item impedido de avançar por causa externa ou restrição ativa. | Aguardando rotação de senha no console Supabase. |

---

## 3. Regra de Ouro da Honestidade Epistêmica

Se um agente não rodou os testes no ambiente real, ele **NÃO PODE** declarar `[CONFIRMADO-TESTE]`. Forjar evidências, simular outputs ou suprimir testes que falham constitui violação constitucional grave com bloqueio imediato no Quality Gate.
