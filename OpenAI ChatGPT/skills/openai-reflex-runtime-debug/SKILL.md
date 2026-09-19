---
name: openai-reflex-runtime-debug
description: Diagnose App Reflex 02 bugs in deployed or preview environments. Use when the user reports errors, broken screens, Vercel runtime issues, stale previews, server component errors, failed processing, or behavior that differs between URLs/environments.
---

# OpenAI Reflex Runtime Debug

1. Capture the exact URL, symptom, and approximate time.
2. Resolve URL to Vercel project/deployment/target/branch/SHA.
3. Compare the deployment SHA with `main` before reading code.
4. Read build logs for build failures; runtime logs for execution failures.
5. Inspect the exact code path and live data involved.
6. Form one explicit causal hypothesis at a time.
7. Fix in a short branch and add a regression test.
8. Run typecheck, lint, test, and build.
9. Merge only after CI is green.
10. Verify the new deployment and reproduce the flow on the new SHA.
11. Update `OpenAI ChatGPT/CONTINUITY_LEDGER.md` if the incident changed project state.
