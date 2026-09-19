---
name: openai-reflex-cognitive-integrity
description: Design, review, or implement cognitive AI features in App Reflex 02. Use for Cérebro Autoral, claims, provenance, retrieval, embeddings, taxonomy, Dossiê V3.1, reflections, learning, authorial characteristics, memory, inference, prompts, or model behavior.
---

# OpenAI Reflex Cognitive Integrity

1. Read `docs/ia/DESIGN_FREEZE_COGNITIVO_V3_1.md` and `docs/ia/POLITICA_MEMORY_INFERENCE_FIREWALL.md`.
2. Identify memory type and epistemic status of every new artifact.
3. Require provenance for authorial claims and derived characteristics.
4. Treat ambiguity as abstention rather than extraction.
5. Validate model outputs with Zod/Structured Outputs.
6. Never promote inference, external-source content, or model plausibility into confirmed authorial memory without explicit human confirmation.
7. Preserve source → span/fragment → claim/proposal → human decision lineage.
8. Include negative/adversarial cases and abstention behavior in tests.
9. Run relevant cognitive evals and security tests before merge.
10. Make UI expose source, evidence, status, and human action whenever epistemically consequential.
