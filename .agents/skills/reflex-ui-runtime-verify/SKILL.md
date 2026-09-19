---
name: reflex-ui-runtime-verify
description: >-
  Verificação de interfaces em runtime, conformidade de acessibilidade WCAG 2.2 AA,
  inspeção de componentes React 19/Next.js 15 e validação de fluxos de usuário.
---

# 🎨 Skill: Verificação de UI & Acessibilidade em Runtime (Reflex OS V3)

Esta skill orienta o **Engenheiro de Produto & Frontend (R4)** e o **Auditor (R6)** na garantia de usabilidade e respeito às normas de acessibilidade.

## 👁️ Diretrizes de Inspeção

1. **Acessibilidade WCAG 2.2 Nível AA:**
   - Contraste de cores mínimo de 4.5:1 para texto normal e 3:1 para texto grande/componentes interativos.
   - Navegação completa por teclado (Tab, Enter, Espaço, Esc em modais e diálogos).
   - Atributos ARIA adequados (`aria-expanded`, `aria-haspopup`, `aria-label`).
   - Gerenciamento de foco ao abrir e fechar modais (trapping de foco e retorno ao elemento acionador).
2. **Next.js 15 & React 19 Best Practices:**
   - Divisão criteriosa entre Server Components (padrão) e Client Components (`'use client'`).
   - Ausência de hidratação inconsistente (mismatches entre servidor e cliente).
   - Uso de componentes shadcn/ui e Tailwind CSS sob o design token institucional.
3. **Verificação Além do Build:**
   - Não assumir que "build verde" é garantia de interface funcional.
   - Executar os testes dedicados em `tests/acessibilidade/` e verificar formulários e modais.
