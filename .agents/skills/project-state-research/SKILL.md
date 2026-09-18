---
name: project-state-research
description: >-
  Metodologia para mapeamento sistemático de cobertura funcional, auditoria de dependências, diagnóstico de maturidade e inventário de boas soluções a preservar no App Reflex 02.
---

# 🔍 Skill: Pesquisa do Estado Real do Projeto (Project State Research)

Esta skill guia o **Agente 08 (rflex-research-evolution)** na análise diagnóstica contínua do estado concreto da aplicação, sem presumir funcionalidades a partir de nomes de arquivos e sem confundir documentação histórica com a realidade operacional.

## 🎯 Pilares de Diagnóstico
1. **Inspeção de Contratos e Schemas:**
   - Conferir o schema PostgreSQL real, views e RPCs frente às migrations em `supabase/migrations/`.
   - Verificar tabelas, RLS e permissões ativas.
2. **Mapeamento de Rotas e Componentes:**
   - Inventariar páginas em `src/app/`, discriminando rotas públicas, privadas, estáticas e dinâmicas.
   - Analisar divisão Server Components vs. Client Components.
3. **Inventário de Capacidades e Boas Soluções:**
   - Destacar módulos que operam com excelência e que devem ser estritamente preservados (ex: upload TUS direto do browser ao Supabase Storage, isolamento RLS, validação com Zod schemas).
4. **Levantamento de Lacunas e Pendências:**
   - Identificar discrepâncias entre o código e o banco conectado (ex: migrations não executadas no clone).
   - Mapear testes ausentes para fluxos críticos ou caminhos de erro.
5. **Relatório Estruturado de Cobertura:**
   - Fornecer visão panorâmica com base em dados verificáveis para orientar as decisões de A1 (Arquitetura) e aprovação do usuário.