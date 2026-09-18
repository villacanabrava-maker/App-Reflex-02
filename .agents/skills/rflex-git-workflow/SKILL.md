---
name: rflex-git-workflow
description: >-
  Padrão de fluxo Git, criação de branches curtas, mensagens semânticas de commit e abertura de PRs.
---

# Fluxo de Trabalho Git no Rflex01

1. **Criação de Branch Curta:**
   - Branches devem partir da `main` atualizada.
   - Padrão de nomenclatura: `feature/nome-da-funcionalidade` ou `fix/descricao-do-bug`.
2. **Commits Semânticos:**
   - `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
3. **Abertura de Pull Request (PR):**
   - O PR deve conter a descrição do handoff, checklist do DoD e vínculo com a frente ativa.
   - O merge na branch `main` só ocorre após a aprovação formal do Release Gate.
