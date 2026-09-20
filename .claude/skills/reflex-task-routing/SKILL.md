---
name: reflex-task-routing
description: Classifica a missão e escolhe o menor conjunto útil de R1-R9 e runtimes.
---

# reflex-task-routing — adapter Claude Cloud

Esta Skill é uma projeção da capacidade canônica registrada em `docs/agent-system/skill-registry.yaml`.

1. Leia a entrada canônica do registry e os adapters referenciados.
2. Aplique `docs/agent-system/SOURCE_OF_TRUTH.md` e `permissions.yaml`.
3. Não dispare três runtimes para a mesma tarefa sem ganho de independência, capacidade ou evidência.
4. Registre evidência usando a taxonomia canônica e faça handoff estruturado quando necessário.
