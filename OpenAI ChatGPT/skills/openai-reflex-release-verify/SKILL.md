---
name: openai-reflex-release-verify
description: Verify and release App Reflex 02 through GitHub and Vercel with SHA-level reconciliation. Use for deploys, previews, production promotion, stale URL diagnosis, environment verification, runtime logs, rollback decisions, or confirming that a fix is actually live.
---

# OpenAI Reflex Release Verify

1. Read BOOTSTRAP, DEPLOYMENT_MAP and workflows/VERCEL_RUNTIME.md.
2. Identify the exact GitHub SHA intended for release and confirm CI is green.
3. Identify the exact Vercel project and target environment.
4. Reconcile deployment ID, branch, SHA, target, alias/domain and status.
5. Confirm required environment variables without printing secret values.
6. Use build logs for build failures and runtime logs for READY-but-broken behavior.
7. Test the canonical production URL after promotion.
8. For reported bugs, map the opened URL to deployment/branch/SHA before changing code.
9. Report CI, deployment READY, alias promotion and runtime behavior separately.
