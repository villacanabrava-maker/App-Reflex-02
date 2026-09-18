---
name: rflex-handoff-contract
description: >-
  Estrutura obrigatória de transferência de tarefas (Handoff SOP) entre especialistas
  e para o Auditor Independente (A7).
---

# Protocolo SOP de Handoff Estruturado

Nenhum agente pode encerrar uma tarefa com mensagens genéricas como 'está pronto'. É mandatório fornecer o relatório estruturado no seguinte formato:

```markdown
### 📋 RELATÓRIO DE HANDOFF TÉCNICO

- **ID DA TAREFA / FRENTE:** [Identificador ou Título]
- **AGENTE EMISSOR:** [Ex: rflex-frontend]
- **OBJETIVO DEFINIDO:** [O que foi solicitado]
- **ESCOPO EFETIVAMENTE REALIZADO:** [O que foi alterado]
- **ARQUIVOS ALTERADOS:**
  - `src/caminho/arquivo.tsx` (Descrição da alteração)
- **DECISÕES ARQUITETURAIS:** [Justificativas técnicas]
- **IMPACTO EM BANCO / DADOS:** [Nenhum | Descrição da Migration]
- **IMPACTO EM SEGURANÇA / RLS:** [Nenhum | Descrição das Políticas]
- **TESTES EXECUTADOS:**
  - Comando: `npm test` -> Resultado: [PASS / Logs resumidos]
  - Comando: `npm run typecheck` -> Resultado: [0 erros]
- **O QUE NÃO FOI TESTADO (PENDÊNCIAS):** [Relação honesta de limites]
- **EVIDÊNCIAS:** [Links de artifacts, logs ou screenshots]
- **RISCOS REMANESCENTES:** [Pontos de atenção]
- **PRÓXIMO AGENTE RESPONSÁVEL:** [Ex: rflex-qa-security para auditoria]
```
