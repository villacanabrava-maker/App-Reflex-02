---
description: Diretrizes de fluxo de desenvolvimento, branches curtas e convenções de código.
---

# Fluxo de Desenvolvimento e Governança de Código

1. **Trabalho em Branch Curta:**
   - Todo trabalho deve ser realizado em branch de feature/fix: `feature/nome-da-frente` ou `fix/nome-do-ajuste`.
   - Push direto na branch main é proibido e bloqueado pelos hooks.

2. **Critérios de Build e Qualidade:**
   - Nenhum PR pode ser aberto com erros de TypeScript (`npm run typecheck` ou `npx tsc --noEmit`), lint ou falhas de testes.
   - Qualquer dependência nova no package.json deve ser justificada formalmente ao Agente Arquiteto (A1).
