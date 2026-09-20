# Adapter OpenAI — Orquestração

A definição canônica vive em:
- `docs/agent-system/agent-registry.yaml`
- `docs/agent-system/orchestration-modes.yaml`
- `docs/agent-system/permissions.yaml`

O1–O9 são aliases OpenAI de R1–R9.

## Codex

Use `.codex/agents/*.toml` para subagentes project-scoped quando disponíveis. Mantenha escopo delimitado, menor privilégio e modelos herdados por padrão.

## Modos

SOLO, SPECIALIST, SEQUENTIAL, PARALLEL_RESEARCH, RED_TEAM e INCIDENT.

R1 escolhe o menor conjunto útil. Leitura/pesquisa pode ser paralela; escrita paralela exige ownership não sobreposto e isolamento.

## Independência

Se a mesma instância lógica implementou e revisou, classifique como self-review. Não rotule como auditoria R6 independente.
