---
name: evidence-ledger
description: >-
  Metodologia de registro e classificação de evidências técnicas para garantia de verdade factual
  em relatórios de governança do App Reflex 02.
---

# Skill: Livro-Razão de Evidências (Evidence Ledger)

## Propósito

No App Reflex 02, nenhuma afirmação técnica é aceita como verdadeira sem uma etiqueta de evidência verificável. Esta skill formaliza os critérios de qualificação e auditoria de evidências.

---

## Taxonomia Canônica de Evidências

Toda evidência citada nos relatórios de coordenação deve pertencer a uma das categorias:

| Categoria | Definição | Exemplo de Validação Aceito |
| :--- | :--- | :--- |
| `[CONFIRMADO-CODIGO]` | O código existe e foi inspecionado linha por linha no arquivo. | Caminho do arquivo e número de linhas ou bloco inspecionado. |
| `[CONFIRMADO-TESTE]` | Comportamento verificado por suite de testes automatizados com sucesso. | Trecho do stdout do Vitest com contagem de testes e duração. |
| `[CONFIRMADO-CI]` | Pipeline do GitHub Actions rodou e concluiu com status *Success*. | Link ou ID de execução da run de CI no repositório. |
| `[CONFIRMADO-RUNTIME]` | O processo executou localmente e respondeu a requisições reais. | Resposta HTTP capturada ou log de inicialização do servidor. |
| `[CONFIRMADO-EXTERNO]` | Validação direta com serviço externo oficial (ex: API Supabase). | Resposta autenticada de endpoint ou inspeção direta de dashboard. |
| `[RELATADO]` | Dado transmitido pelo usuário ou por terceiro, pendente de prova técnica. | Transcrição de instrução ou relato de comportamento anômalo. |
| `[INFERIDO]` | Hipótese técnica baseada em evidências parciais, sem prova direta. | Dedução de que um bug decorre de falta de índice no banco. |
| `[PENDENTE]` | Tarefa ou validação mapeada no escopo que ainda não ocorreu. | Teste de estresse agendado para ciclo futuro. |
| `[BLOQUEADO]` | Item impedido de avançar por causa externa ou escopo suspenso. | Validação de preview Vercel (escopo formalmente adiado). |

---

## Regra de Ouro de Honestidade Intelectual

Se um agente não rodou os testes, ele **NÃO PODE** declarar `[CONFIRMADO-TESTE]`. Declarar evidência falsa ou simular outputs inexistentes constitui violação direta da Constituição Operacional do App Reflex 02.
