---
name: reflex-continuity-close
description: >-
  Procedimento formal de fechamento de missões, atualização do livro-razão de evidências
  e emissão do relatório de handoff tripartite (R9).
---

# 📖 Skill: Fechamento de Missão & Continuidade Tripartite (Reflex OS V3)

Esta skill orienta o **Guardião da Continuidade (R9)** no encerramento ordenado de ciclos de trabalho.

## 🏁 Protocolo de Fechamento

1. **Auditoria de Diff Real vs. Solicitação:**
   - Conferir os arquivos modificados via `git status` e `git diff`.
   - Assegurar que nenhum arquivo fora de escopo foi tocado indevidamente.
2. **Coleta e Validação da Matriz de Evidências:**
   - Conferir se cada asserção técnica possui sua tag correspondente:
     `[CONFIRMADO-CODIGO]`, `[CONFIRMADO-TESTE]`, `[CONFIRMADO-CI]`, `[CONFIRMADO-RUNTIME]`.
3. **Atualização do Estado Compartilhado:**
   - Atualizar `docs/coordenacao/ESTADO_COMPARTILHADO.md` com as métricas da entrega.
   - Atualizar a tabela de missões em `docs/coordenacao/INDICE_MISSOES.md`.
4. **Liberação do Lock de Missão:**
   - Atualizar `docs/agent-system/missions/MISSION_LOCK.json` para status `RELEASED` ou `HANDOFF_PENDING`.
5. **Emissão do Relatório Formal de Handoff:**
   - Gerar o documento na pasta canônica `docs/coordenacao/antigravity-para-chatgpt/AG-XXXX.md` (ou em `docs/agent-system/handoffs/`), sintetizando os resultados, laudos de R6 e orientações para o próximo ciclo.
