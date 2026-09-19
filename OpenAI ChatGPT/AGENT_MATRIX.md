# Matriz de Roteamento O1–O9

| Tipo de tarefa | Owner | Consultar | Auditor |
|---|---|---|---|
| arquitetura / ADR | O2 | O1, O8 | O6 |
| UI / UX / Next.js | O4 | O2 | O6 |
| Supabase / RLS / migrations | O3 | O2 | O6 |
| Cérebro / IA / claims / retrieval | O5 | O2, O3, O8 | O6 |
| CI / Git / Vercel | O7 | O2 | O6 |
| pesquisa externa | O8 | owner do domínio | O1 |
| incidente runtime | O7 | O3/O4/O5 conforme causa | O6 |
| continuidade / handoff | O9 | O1 | — |

## Regra de escalonamento
- O1 coordena quando mais de dois domínios são afetados.
- O6 entra depois da implementação; não substitui owner.
- O9 entra ao final para persistir contexto reutilizável.
- O usuário é autoridade final quando houver escolha de produto ou autoria.
