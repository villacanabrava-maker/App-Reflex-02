---
name: reflex-bootstrap-reconcile
description: >-
  Protocolo obrigatório de bootstrap inicial e reconciliação material antes de qualquer ação.
  Verifica Git HEAD, status do CI, estado do Supabase live e status da Vercel.
---

# 🚀 Skill: Bootstrap & Reconciliação Material (Reflex OS V3)

Esta skill define o procedimento inegociável que qualquer agente (R1–R9) deve executar ao iniciar uma nova sessão ou missão.

## 📋 Checklist de Execução

1. **Inspeção de Repositório Git:**
   - Confirmar o repositório canônico: `https://github.com/villacanabrava-maker/App-Reflex-02.git`
   - Verificar a branch atual e o commit HEAD de `main`: `git fetch origin && git log -n 1 origin/main`
   - Verificar se há branches ativas concorrentes ou PRs abertos (`gh pr list`).
2. **Auditoria de Lock Lógico de Missão:**
   - Ler `docs/agent-system/missions/MISSION_LOCK.json`.
   - Se o lock estiver ocupado por outro runtime com status `IN_PROGRESS`, abster-se de alterações concorrentes e consultar R1.
3. **Auditoria de Banco Live (Supabase):**
   - Confirmar o project ref `xenapowdtfhdwcfthfrn`.
   - Verificar a contagem de migrations em `public._migrations`.
   - Lembrar de usar headers `Accept-Profile: <schema>` ao consultar tabelas fora de `public`.
4. **Auditoria de Hospedagem (Vercel):**
   - Reconhecer que a produção está ativa em `https://app-reflex-02.vercel.app`.
   - Não executar comandos CLI de deploy (`vercel deploy`). Mutações exigem Gate Humano explícito.
5. **Verificação de Saúde Operacional Local:**
   - `npx tsc --noEmit`
   - `npm run lint`
   - `npm test`
