---
name: reflex-independent-qa
description: >-
  Metodologia de auditoria independente Zero-Trust e testes adversários para R6.
  Audita isolamento RLS, conformidade de contratos, ausência de segredos e qualidade de código.
---

# 🛡️ Skill: Auditoria Independente Zero-Trust (Reflex OS V3)

Esta skill define a postura inegociável do **Auditor Independente (R6)**.

## 🎯 Princípios da Avaliação Independente

1. **Separação Obrigatória entre Implementador e Auditor:**
   $$\text{SELF\_REVIEW} \neq \text{INDEPENDENT\_REVIEW}$$
   O auditor nunca deve ser o mesmo agente que implementou a solução primária.
2. **Postura de Não-Interferência Silenciosa:**
   - Se R6 encontrar uma falha, ele **NÃO** deve corrigir o código funcional em segredo para aprovar o teste.
   - R6 deve documentar a falha com precisão, registrar o laudo com veredito `FAIL` ou `BLOCKED`, e devolver o Task Packet ao owner correspondente (R3, R4, R5, etc.).
3. **Bateria de Testes Mandatória:**
   - Testes de isolamento RLS e autorização (`tests/seguranca/`).
   - Testes do Golden Dataset e avaliação de métricas epistêmicas (MILR, AMR).
   - Testes de regressão e integridade de tipos (`npx tsc --noEmit`).
   - Linter e formatação (`npm run lint`).
   - Auditoria de segredos e tokens no histórico do Git.
