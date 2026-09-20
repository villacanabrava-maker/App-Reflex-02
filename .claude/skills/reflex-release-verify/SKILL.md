---
name: reflex-release-verify
description: Reconciliará CI, preview/runtime, branch e SHA antes de release.
---

# reflex-release-verify — adapter Claude Cloud

Esta Skill é uma projeção da capacidade canônica registrada em `docs/agent-system/skill-registry.yaml`.

1. Leia a entrada canônica do registry e os adapters referenciados.
2. Aplique `docs/agent-system/SOURCE_OF_TRUTH.md` e `permissions.yaml`.
3. Vercel de escrita não é conector padrão de Routine não supervisionada; produção exige gate humano.
4. Registre evidência usando a taxonomia canônica e faça handoff estruturado quando necessário.
