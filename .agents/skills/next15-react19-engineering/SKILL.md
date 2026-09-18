---
name: next15-react19-engineering
description: >-
  Boas práticas de engenharia com Next.js 15 (App Router), React 19, Server Components, Server Actions e TypeScript.
---

# Engenharia Front-End: Next.js 15 & React 19

1. **Fronteira Server vs Client:**
   - Mantenha componentes como Server Components por padrão.
   - Utilize 'use client' exclusivamente onde houver interatividade de browser (hooks useState, useEffect, event listeners).
2. **Server Actions & Mutações:**
   - Realize validação rigorosa de inputs com Zod antes de qualquer processamento no servidor.
   - Trate erros de forma amigável e revalide tags de cache com revalidateTag / revalidatePath.
3. **Tipagem Estrita:**
   - Proibido o uso de `any` explícito ou implícito. Defina interfaces completas para todas as props e estados.
