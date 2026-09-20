# Adapter OpenAI — O1–O9 → R1–R9

A definição canônica está em `docs/agent-system/agent-registry.yaml`.

| OpenAI | Papel canônico | Codex agent |
|---|---|---|
| O1 | R1 Orchestrator | `reflex_orchestrator` |
| O2 | R2 Architecture | `reflex_architecture` |
| O3 | R3 Data & Supabase | `reflex_supabase` |
| O4 | R4 Product & Frontend | `reflex_frontend` |
| O5 | R5 Cognitive & Knowledge | `reflex_cognitive` |
| O6 | R6 QA, Security & Evals | `reflex_qa` |
| O7 | R7 Platform & Runtime | `reflex_platform` |
| O8 | R8 Research & Evolution | `reflex_research` |
| O9 | R9 Continuity & Evidence | `reflex_continuity` |

R1 escolhe o menor conjunto útil. R6 é independente conforme risco. R9 fecha a continuidade. O usuário é autoridade final de produto, autoria e gates críticos.
