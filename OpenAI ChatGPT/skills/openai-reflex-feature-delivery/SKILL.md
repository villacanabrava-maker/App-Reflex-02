---
name: openai-reflex-feature-delivery
description: Deliver a feature or functional change in App Reflex 02 from verified baseline through branch, implementation, tests, PR, CI and runtime verification. Use for product work spanning Next.js, Supabase, cognitive AI, UI, or cross-domain behavior when a new capability or non-trivial fix must be implemented safely.
---

# OpenAI Reflex Feature Delivery

1. Read AGENTS.md, OpenAI ChatGPT/BOOTSTRAP.md, CURRENT_STATE.md and METHODOLOGY.md.
2. Confirm main HEAD, recent commits, CI and live systems touched by the task.
3. Write a bounded plan: user intent, domains, files/systems, invariants, verification and non-goals.
4. Route work through OpenAI ChatGPT/AGENT_MATRIX.md using only needed specialists.
5. Create a short branch; do not push directly to main.
6. Implement the smallest coherent change while preserving authorship/provenance and security boundaries.
7. Add regression tests for every user-visible or safety-relevant behavior.
8. Run tsc, lint, tests and build.
9. Require green GitHub Actions before merge.
10. Verify Vercel/Supabase live after merge when runtime or data changed.
11. Update CURRENT_STATE, CONTINUITY_LEDGER and DECISIONS when verified state or decisions changed.
12. Never declare completion from build success alone.
