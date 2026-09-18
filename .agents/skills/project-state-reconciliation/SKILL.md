---
name: project-state-reconciliation
description: >-
  Protocolo operacional de reconciliação contínua entre intenção humana, prompts refinados,
  planos de execução, diffs reais de código e commits no repositório.
---

# Skill: Reconciliação do Estado do Projeto (Project State Reconciliation)

## Propósito

Esta skill instrui o agente na condução da reconciliação estrita entre quatro esferas:
1. **Intenção do Usuário & ChatGPT:** O que foi acordado e formalizado no prompt da missão.
2. **Plano de Execução do Antigravity:** A decomposição técnica autorizada em tarefas e arquivos.
3. **Realidade do Repositório (Working Tree & Commits):** O diff real produzido em código, testes e configs.
4. **Relatório de Encerramento (Handover):** O atestado fidedigno do que foi entregue sem distorções.

---

## Procedimento de Execução (SOP)

### Passo 1: Inspeção Pré-Execução (Baseline Check)
Antes de qualquer modificação:
- Identifique o SHA do commit base (`git rev-parse HEAD`).
- Verifique a saúde do working tree (`git status`). Deve estar limpo.
- Anote o status das integrações ativas (Supabase, GitHub, Vercel).

### Passo 2: Rastreamento Contínuo de Diffs
Durante o desenvolvimento:
- Registre cada arquivo criado, modificado ou removido.
- Verifique se nenhuma alteração foge do escopo autorizado pela missão corrente.
- Bloqueie quaisquer alterações acidentais em rotas não relacionadas ou arquivos protegidos.

### Passo 3: Verificação Isomórfica Pós-Execução
Após os testes passarem:
- Compare a lista de arquivos alterados no git (`git diff --name-status`) contra a lista declarada no plano.
- Assegure que nenhum arquivo temporário, log com credenciais ou artefato espúrio esteja no working tree.
- Confirme que o commit final reflete estritamente a missão atribuída.
