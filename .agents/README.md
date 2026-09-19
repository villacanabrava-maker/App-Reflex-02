# Antigravity Adapter — Reflex Agent Operating System V3

A pasta `.agents/` é o adapter Antigravity do sistema operacional multiagente compartilhado.

- Constituição: `docs/agent-system/CONSTITUTION.md`
- Registry: `docs/agent-system/agent-registry.yaml`
- Permissões: `docs/agent-system/permissions.yaml`
- Skills: `docs/agent-system/skill-registry.yaml`

## Mapeamento

| Antigravity | Papel canônico |
|---|---|
| A1 rflex-architect | R1 + R2 |
| A2 rflex-product-design | R4 design |
| A3 rflex-frontend | R4 implementation |
| A4 rflex-backend-supabase | R3 |
| A5 rflex-ai-knowledge | R5 |
| A6 rflex-platform | R7 |
| A7 rflex-qa-security | R6 |
| A8 rflex-research-evolution | R8 |
| A9 rflex-continuity-evidence | R9 |

Os `agent.md`, Skills, Rules e Hooks continuam nativos do Antigravity, mas não redefinem papéis canônicos.

## Vercel

Vercel está ativa. Observação de deployment, SHA e logs pertence a R7/A6. Mutações de produção permanecem sob gate humano.

## Validação

`npm run agents:validate` detecta drift entre registry, Skills e adapters.
