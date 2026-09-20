---
name: reflex-git-safe-worktree
description: Aplica branch/worktree seguro e ownership explícito por missão.
---

# reflex-git-safe-worktree — adapter Claude Cloud

Esta Skill é uma projeção da capacidade canônica registrada em `docs/agent-system/skill-registry.yaml`.

1. Leia a entrada canônica do registry e os adapters referenciados.
2. Aplique `docs/agent-system/SOURCE_OF_TRUTH.md` e `permissions.yaml`.
3. Claude Routine escreve por padrão em claude/*; nunca push direto em main nem force push.
4. Registre evidência usando a taxonomia canônica e faça handoff estruturado quando necessário.
