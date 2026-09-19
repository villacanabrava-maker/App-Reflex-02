<!--
TEMPLATE DE DOCUMENTO DE MISSÃO — copie este arquivo para claude-code/memoria/CC-XXXX.md
(use o próximo número livre, conferindo claude-code/memoria/INDICE.md) e preencha o cabeçalho
e a primeira seção antes de acionar qualquer subagente. Ver claude-code/METODOLOGIA.md para as
regras completas. NUNCA edite ou apague uma seção já escrita — apenas adicione a próxima.
-->

# Missão CC-XXXX — <título curto do que está sendo feito>

**Status:** EM ANDAMENTO
**Aberta em:** <data/hora ISO>
**Encerrada em:** —
**Branch:** <branch git atual>
**Agentes envolvidos até agora:** <atualizar a cada rodada>

---

## Rodada 1 — Entrada do Orquestrador

**Agente:** sessão principal (Claude Code, papel de orquestrador / rflex-architect)
**Timestamp:** <data/hora ISO>

**Pedido do usuário (fiel, resumido se longo):**
<cole ou resuma fielmente o pedido>

**Minha interpretação:**
<o que entendi que o usuário quer, escopo, restrições>

**Plano:**
<passos previstos, em ordem>

**Subagentes que vou acionar e por quê:**
<lista: nome do subagente → motivo>

---

## Rodada 2 — Execução: <nome-do-subagente>

**Agente:** `<nome-do-subagente>`
**Timestamp:** <data/hora ISO>

**Task Packet recebido do orquestrador:**
<objetivo específico, arquivos-alvo, contratos/restrições, critério de saída>

**O que li antes de começar:**
<este documento de missão inteiro + quaisquer arquivos/skills consultados>

**O que fiz:**
<narrativa objetiva do trabalho realizado>

**Arquivos alterados/criados:**
<lista de paths>

**Verificações executadas:**
<comandos rodados e resultado — tsc, lint, test, etc.>

**Contrato de saída (campos do seu papel — ver METODOLOGIA.md §5):**
<preencher os campos específicos do papel deste agente>

**Riscos/pendências para o próximo agente:**
<o que fica em aberto>

**Evidência:** `[CONFIRMADO-CODIGO]` / `[CONFIRMADO-TESTE]` / `[RELATADO]` / `[PENDENTE]` / etc.

---

## Rodada 3 — Revisão do Orquestrador

**Agente:** sessão principal (orquestrador)
**Timestamp:** <data/hora ISO>

**Resumo do que foi feito na rodada anterior:**
<lido e revisado>

**Decisão:**
<próximo subagente a acionar, ou encerrar a missão, e por quê>

**Task Packet para o próximo agente (se houver):**
<objetivo, arquivos-alvo, contratos, critério de saída>

---

<!-- repita o padrão "Execução" + "Revisão" para cada rodada adicional -->

## Encerramento da Missão

**Agente:** `rflex-continuity-evidence` (ou orquestrador, em missões simples)
**Timestamp:** <data/hora ISO>

**Resumo executivo final:**
<o que foi entregue>

**Reconciliação (pedido ↔ plano ↔ diff real ↔ testes/CI):**
<confirma que bate>

**Commit(s)/PR relevante(s):**
<hashes/links>

**Próximos passos recomendados:**
<se houver>

**Status final:** CONCLUÍDA / BLOQUEADA
