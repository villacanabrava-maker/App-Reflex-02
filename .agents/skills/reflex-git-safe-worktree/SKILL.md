---
name: reflex-git-safe-worktree
description: >-
  Diretrizes de fluxo de trabalho Git seguro, uso de worktrees isolados, branches curtas
  e prevenção estrita de conflitos e force push.
---

# 🌿 Skill: Git Safe & Worktree Isolation (Reflex OS V3)

Esta skill rege a manipulação do repositório Git por todos os papéis, especialmente R1 e R7.

## 🛡️ Regras Invioláveis

1. **Nunca Force Push:** `git push --force` e `git push -f` são permanentemente proibidos e bloqueados por hooks.
2. **Branches Curtas e Tipadas:**
   - `antigravity/nome-da-missao` para trabalhos executivos do Antigravity.
   - `chatgpt/nome-da-frente` para trabalhos de formulação do ChatGPT.
   - Proibido push direto na `main` sem aprovação humana expressa.
3. **Worktrees para Tarefas Concorrentes:**
   - Quando for necessário investigar uma branch ou testar alterações sem sujar o workspace principal:
     `git worktree add ../reflex-worktree-temp <branch>`
   - Ao concluir, remover o worktree:
     `git worktree remove ../reflex-worktree-temp`
4. **Higiene de Commits:**
   - Mensagens claras com conventional commits: `feat:`, `fix:`, `chore:`, `docs:`.
   - Nunca comitar arquivos `.env`, chaves privadas ou dados sensíveis.
