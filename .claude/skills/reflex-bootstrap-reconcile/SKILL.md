---
name: reflex-bootstrap-reconcile
description: Reconcilia GitHub, CI, Supabase, Vercel e documentação antes de trabalho não trivial.
---

# reflex-bootstrap-reconcile — adapter Claude Cloud

Esta Skill é uma projeção da capacidade canônica registrada em `docs/agent-system/skill-registry.yaml`.

1. Leia a entrada canônica do registry e os adapters referenciados.
2. Aplique `docs/agent-system/SOURCE_OF_TRUTH.md` e `permissions.yaml`.
3. Estado live verificado vence snapshot. Em cloud unattended, use apenas conectores com menor privilégio.
4. Registre evidência usando a taxonomia canônica e faça handoff estruturado quando necessário.
