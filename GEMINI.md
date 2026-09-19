# App Reflex 02 — Adapter Antigravity

Este arquivo adapta o Google Antigravity ao **Reflex Agent Operating System V3**.

## Fonte canônica

Leia:
- `docs/agent-system/CONSTITUTION.md`
- `docs/agent-system/SOURCE_OF_TRUTH.md`
- `docs/agent-system/CURRENT_STATE.md`
- `docs/agent-system/agent-registry.yaml`
- `docs/agent-system/permissions.yaml`
- `docs/agent-system/orchestration-modes.yaml`

Não redefina papéis neste arquivo.

## Projeto

- GitHub: `villacanabrava-maker/App-Reflex-02`
- Branch canônica: `main`
- Supabase: `xenapowdtfhdwcfthfrn`
- Vercel: projeto `app-reflex-02`
- Produção canônica: `https://app-reflex-02.vercel.app`

SHA, deployment e contagens devem ser verificados live.

## Adapter A1–A9 → R1–R9

- A1 `rflex-architect`: R1 Orchestrator + R2 Architecture.
- A2 `rflex-product-design` + A3 `rflex-frontend`: R4 Product & Frontend.
- A4 `rflex-backend-supabase`: R3 Data & Supabase.
- A5 `rflex-ai-knowledge`: R5 Cognitive & Knowledge.
- A7 `rflex-qa-security`: R6 QA, Security & Evals.
- A6 `rflex-platform`: R7 Platform & Runtime.
- A8 `rflex-research-evolution`: R8 Research & Evolution.
- A9 `rflex-continuity-evidence`: R9 Continuity & Evidence.

Os assets em `.agents/` são adapter nativo, não uma segunda constituição.

## Runtime

Leitura de GitHub/CI, metadata/advisors do Supabase e deployment/logs da Vercel é permitida quando a ferramenta estiver disponível. Deploy manual, mudança de domínio, secrets, migration live e mutação estrutural exigem gate humano.

Nunca diagnosticar Vercel sem reconciliar projeto → deployment → target → branch → SHA → alias.

## Stack

Next.js 15, React 19, TypeScript, Tailwind, Supabase/PostgreSQL 17, OpenAI, GitHub Actions e Vercel.

## Segurança

Nunca expor ou versionar segredos. Preservar RLS, tenant isolation, provenance e soberania autoral.
