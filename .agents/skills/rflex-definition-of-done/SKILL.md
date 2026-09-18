---
name: rflex-definition-of-done
description: >-
  Critérios inegociáveis de aceitação para considerar qualquer entrega concluída no App Reflex 02.
---

# Definição de Pronto (Definition of Done - DoD)

Uma tarefa ou PR só é considerado concluído quando atender 100% dos seguintes critérios:

1. ✅ **TypeScript Zero-Error:** `npx tsc --noEmit` executado com zero falhas.
2. ✅ **Lint & Formatação:** Sem violações de ESLint ou regras de estilo (`npm run lint`).
3. ✅ **Testes Unitários & Integração:** Cobertura preservada e testes passando no Vitest (`npm test`).
4. ✅ **Segurança de RLS:** Toda tabela com RLS ativado e políticas de segurança vigentes.
5. ✅ **Conformidade Acessibilidade:** Componentes de interface em conformidade com WCAG 2.2 AA.
6. ✅ **Build Limpo:** `npm run build` bem-sucedido sem warnings críticos.
7. ✅ **Hospedagem/Deploy:** *Vercel: não aplicável nesta etapa, por decisão do usuário.*
8. ✅ **Laudo de Auditoria (A7):** Veredito `PASS` emitido pelo Agente de Qualidade e Segurança.
