---
name: reflex-handoff
description: >-
  Protocolo e contrato padronizado de handoff entre especialistas e entre runtimes (Antigravity ↔ OpenAI).
  Exige relatório estruturado com diffs físicos e matriz de evidências.
---

# 📋 Skill: Protocolo Estruturado de Handoff (Reflex OS V3)

Nenhum agente pode encerrar uma tarefa com mensagens genéricas como 'está pronto'. Todo especialista deve emitir um **Output Contract** completo conforme `docs/agent-system/schemas/output-contract.schema.json`.

## 📦 Estrutura do Handoff

```markdown
### 📋 RELATÓRIO DE HANDOFF TÉCNICO
- **ID DA MISSÃO / TAREFA:** [ex: MIS-0013 / TSK-0013-01]
- **PAPEL EMISSOR:** [ex: R4 — PRODUCT & FRONTEND]
- **VEREDITO:** [PASS | FAIL | BLOCKED | ESCALATED]
- **RESUMO DAS ALTERAÇÕES:** [Descrição sucinta]
- **ARQUIVOS ALTERADOS:**
  - `caminho/arquivo.ts` (CREATE | MODIFY | DELETE - justificativa)
- **MATRIZ DE EVIDÊNCIAS:**
  - Claim: "Todas as suítes de teste passaram" -> `[CONFIRMADO-TESTE]` -> stdout do vitest (173/173)
  - Claim: "Compilação sem erros" -> `[CONFIRMADO-CODIGO]` -> next build código 0
- **RISCOS REMANESCENTES:** [Lista de pendências se houver]
- **PRÓXIMO PASSO RECOMENDADO:** [Papel de destino, ex: R6 para auditoria]
```
