---
name: reflex-release-verify
description: >-
  Checklist rigoroso de verificação pré-release, deploy readiness e auditoria de produção.
  Garante que a branch main e a hospedagem Vercel permaneçam íntegras e seguras.
---

# 🚀 Skill: Verificação de Release & Deploy Readiness (Reflex OS V3)

Esta skill orienta os papéis **R6 (QA & Security)** e **R7 (Platform & Runtime)** antes da emissão do Laudo de Release.

## 📋 Checklist de Liberação de Release

1. **Pipeline de Integração Contínua (GitHub Actions):**
   - Todos os workflows de validação remota verdes e com status `success`.
2. **Suíte Local de Qualidade:**
   - 100% dos testes Vitest passando (`npm test`).
   - Zero erros no typecheck (`npx tsc --noEmit`).
   - Zero erros e zero avisos no linter (`npm run lint`).
   - Compilação de produção sem erros (`npm run build`).
3. **Segurança e Proteção de Segredos:**
   - Nenhum token, senha ou chave privada versionada no repositório.
   - Status de `SECURITY-EXCEPTION-DEV-001` revisado antes de promoção para produção.
4. **Governança da Hospedagem Vercel:**
   - Reconciliação do deployment de produção ativo (`app-reflex-02.vercel.app`).
   - Garantia de que nenhum deploy automático ou sem aprovação humana seja disparado.
