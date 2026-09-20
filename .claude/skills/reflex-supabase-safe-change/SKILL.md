---
name: reflex-supabase-safe-change
description: Governa mudanças Supabase com migration versionada, RLS, rollback e reconciliação.
---

# reflex-supabase-safe-change — adapter Claude Cloud

Esta Skill é uma projeção da capacidade canônica registrada em `docs/agent-system/skill-registry.yaml`.

1. Leia a entrada canônica do registry e os adapters referenciados.
2. Aplique `docs/agent-system/SOURCE_OF_TRUTH.md` e `permissions.yaml`.
3. Rotinas cloud usam MCP project-scoped read-only. Escrita/migration live exige gate humano.
4. Registre evidência usando a taxonomia canônica e faça handoff estruturado quando necessário.
