---
name: reflex-task-routing
description: >-
  Metodologia de decomposição e despacho de tarefas para R1 (Orchestrator).
  Gera Task Packets tipados e seleciona o modo de orquestração adequado.
---

# 🎯 Skill: Roteamento e Despacho de Tarefas (Reflex OS V3)

Esta skill orienta o **Orquestrador (R1)** na divisão de solicitações em **Task Packets tipados**, evitando tarefas vagas ou monolíticas.

## 🧭 Procedimento de Despacho

1. **Escolha do Modo de Orquestração (`docs/agent-system/orchestration-modes.yaml`):**
   - `SOLO`: Apenas R1 para leitura ou diagnóstico simples.
   - `SPECIALIST`: Envio para R3, R4, R5, R7 ou R8.
   - `MULTI_DOMAIN_SEQUENTIAL`: Pipeline completo envolvendo banco, IA, UI e auditoria.
   - `DUAL_HANDOFF`: Triangulação com OpenAI Codex (O1–O9).
2. **Emissão do Task Packet:**
   - Preencher estritamente todos os campos obrigatórios do schema `docs/agent-system/schemas/task-packet.schema.json`.
   - Delimitar expressamente: `in_scope`, `out_of_scope`, `write_scope`, `acceptance_criteria` e `required_evidence`.
3. **Aquisição do Lock Lógico:**
   - Registrar no arquivo `docs/agent-system/missions/MISSION_LOCK.json`.
4. **Despacho ao Especialista:**
   - No Antigravity: despachar usando a ferramenta `invoke_subagent` ou enviando mensagem tipada ao subagente correspondente.
5. **Quality Gate:**
   - Toda entrega deve passar obrigatoriamente pelo laudo independente de R6 antes do fechamento.
