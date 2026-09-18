---
name: design-system-rflex
description: >-
  Diretrizes de Design Tokens, hierarquia visual, usabilidade e acessibilidade WCAG 2.2 AA para o Rflex01.
---

# Design System e Engenharia de Interface Rflex01

1. **Tokens de Design e Consistência:**
   - Utilização rigorosa das classes utilitárias do Tailwind configuradas no projeto.
   - Escalas tipográficas claras e espaçamentos baseados em múltiplos de 4px / 8px.
2. **Estados Obrigatórios de Componente:**
   - Todo componente interativo deve prever: `default`, `hover`, `active`, `focus-visible`, `disabled`, `loading` e `error`.
3. **Acessibilidade WCAG 2.2 AA:**
   - Contraste mínimo de texto de 4.5:1 para texto normal e 3:1 para texto grande.
   - Suporte completo a navegação por teclado (`Tab`, `Enter`, `Escape`, setas).
   - Uso correto de atributos ARIA (`aria-expanded`, `aria-controls`, `aria-label`).
