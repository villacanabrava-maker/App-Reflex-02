---
name: openai-reflex-continuity
description: Preserve project context across ChatGPT/Codex sessions for App Reflex 02. Use after meaningful code, database, deployment, architecture, or product decisions, and whenever a new session needs to reconcile what changed since the last handoff.
---

# OpenAI Reflex Continuity

1. Compare the user's request with the real diff/commits and live systems affected.
2. Record only verified state changes, not full conversation transcripts.
3. Update `OpenAI ChatGPT/CURRENT_STATE.md` when current runtime or architecture changed.
4. Append a compact event to `OpenAI ChatGPT/CONTINUITY_LEDGER.md`.
5. Update `OpenAI ChatGPT/DECISIONS.md` for new human product/architecture decisions.
6. Use evidence labels from `OpenAI ChatGPT/BOOTSTRAP.md`.
7. Never store secrets, tokens, passwords, cookies, or hidden chain-of-thought.
8. Explicitly flag stale documentation instead of silently reconciling it.
