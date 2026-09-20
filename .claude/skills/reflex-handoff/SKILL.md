---
name: reflex-handoff
description: Entrega trabalho entre papéis/runtimes usando Task Packet, Agent Output e Evidence.
---

# reflex-handoff — adapter Claude Cloud

Esta Skill é uma projeção da capacidade canônica registrada em `docs/agent-system/skill-registry.yaml`.

1. Leia a entrada canônica do registry e os adapters referenciados.
2. Aplique `docs/agent-system/SOURCE_OF_TRUTH.md` e `permissions.yaml`.
3. GitHub/PR/evidence é o handoff durável; não dependa de copiar conversa entre interfaces.
4. Registre evidência usando a taxonomia canônica e faça handoff estruturado quando necessário.
