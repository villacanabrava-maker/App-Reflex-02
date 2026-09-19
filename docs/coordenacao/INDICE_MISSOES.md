# Índice Geral de Missões — App Reflex 02

Este documento cataloga o histórico, estado atual e planejamento de missões executadas pela equipe de engenharia do Antigravity em alinhamento com os prompts estruturados pelo ChatGPT e autorizados pelo Usuário.

---

## 1. Tabela Histórica de Missões

| ID da Missão | Título / Escopo Principal | Agentes Chave | Estado | Commits Associados | Evidência de Fechamento |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MIS-0000** | Fundação Independente do App Reflex 02, Desacoplamento do App 01, Conexão ao novo Supabase (`xenapowdtfhdwcfthfrn`) e repositório GitHub. | A1, A3, A4, A6, A7 | `CONCLUÍDO` | `d7266df` .. `2623a31` | `[CONFIRMADO-CI]` / `[CONFIRMADO-TESTE]` (CI verde no GitHub, 55 testes passando). |
| **MIS-0001** | Integração do Agente 08 (`rflex-research-evolution`), inclusão de 3 skills de pesquisa, testes de segurança e pasta sanitizada `docs/pesquisa-evolucao/`. | A1, A7, A8 | `CONCLUÍDO` | `f72d10d` | `[CONFIRMADO-CI]` / `[CONFIRMADO-TESTE]` (61 testes passando, suite a8-qualificacao aprovada). |
| **MIS-0002** | Criação do Agente 09 (`rflex-continuity-evidence`), Protocolo de Coordenação Tripartite (Usuário ↔ ChatGPT ↔ Antigravity), Auditoria Documental e Relatório AG-0001. | A1, A7, A9 | `CONCLUÍDO` | `0ecf754` | `[CONFIRMADO-CI]` / `[CONFIRMADO-TESTE]` (Suite a9-qualificacao, CI verde). |
| **MIS-0003** | Fundação de Dados + Mapa de Inteligência: Reconciliação do Supabase (migrations 0026 a 0030 aplicadas, RLS e grants em sistema.*), eliminação de fallback binário em extração, auditoria forense do Cérebro/Taxonomia e Arquitetura V2. | A1, A4, A5, A7, A8, A9 | `CONCLUÍDO` | `1b64552` | `[CONFIRMADO-TESTE]` / `[CONFIRMADO-CODIGO]` (Suite supabase-isolamento-rls passando, 30 migrations paritárias, 7 docs de IA e 5 docs de Supabase gerados). |
| **MIS-0004** | Pesquisa Cognitiva Profunda, Arquitetura de Memória e Sistema de Inteligência Autoral V3: Mitigação P0 de segurança, fundamentação neurocientífica, benchmark de 5 paradigmas de memória/RAG, especificação do modelo tripartite, ontologia SKOS, busca híbrida multi-sinal, abstenção honesta, consolidação/replay, aprendizado por edição, plano de evals V2 (Golden Dataset de 12 casos) e ADR 0002. | A1, A4, A5, A7, A8, A9 | `CONCLUÍDO` | `657d23a` | `[CONFIRMADO-CI]` / `[CONFIRMADO-TESTE]` (74 testes passando, documento mestre ARQUITETURA_COGNITIVA_V3.md + 10 cadernos temáticos + ADR 0002 + relatório de segurança P0). |
| **MIS-0005** | Fusão Epistemológica, Memória Tipada, Claims e Especificação Executável do Cérebro Reflex V3.1: Integração de pesquisa aprofundada do usuário e literatura acadêmica (Claimify, LongMemEval, LoCoMo, BEAM, HippoRAG 2, Graphiti, SKOS), definição formal de Claims, 10 Estados Epistemológicos, Memory-Inference Firewall (métrica MILR = 0%), Vetor de Confiança de 10 dimensões, Abstenção em 7 modalidades, Dossiê Contextual com Allowed Use, Auditor Cognitivo Pós-Geração, Golden Dataset V3 (12 famílias CBR), Benchmark de Retrieval sob orçamentos fixos, Roadmap V3.1 em 10 Fases e ADR 0003. | A1, A4, A5, A7, A8, A9 | `CONCLUÍDO` | `e269cd2` | `[CONFIRMADO-CI]` / `[CONFIRMADO-TESTE]` (12 novos documentos conceituais V3.1 + ADR 0003 + AG-0004 + 74 testes passando, status P0 atualizado). |
| **AGENT-HARNESS-V2** | Modernização, Especialização, Teste e Governança dos 9 Agentes: A1 reestruturado como único `mainAgent: true`, A2 a A9 como `subagent: true`, prompts em 15 seções padronizadas com descrições discriminativas e negativas, introdução do Task Packet e Output Contracts tipados por agente, política DENY > ASK > ALLOW com proteções Windows via hooks Node.js, Matriz RACI / CODEOWNERS, os 6 modos de orquestração, suíte de testes de qualificação (`tests/seguranca/agent-harness-v2.test.ts`), 8 documentos normativos em `docs/agentes/` e AGENTS.md atualizado. | A1 a A9 | `CONCLUÍDO` | Atual | `[CONFIRMADO-TESTE]` / `[CONFIRMADO-CODIGO]` (80 testes passando em 21 arquivos, 8 documentos normativos em docs/agentes/, 9 agent.md modernizados, novo teste de harness verde). |

---

## 2. Próximas Missões Planejadas (Fases do Roadmap V3.1)

Com a governança multiagente do Harness V2 100% formalizada e testada, a equipe está apta a executar as fases de implementação da V3.1:

1. **MIS-0006: Fase 1 (Claims & Provenance) + Fase 2 (Evals de MILR)**
   - *Owners:* A5 (IA & Conhecimento), A7 (QA & AppSec), A1 (Coordenação), A9 (Continuidade).
   - *Objetivo:* Prototipagem isolada do extrator de claims, validador de NLI Entailment com regra *Ambiguidade $\to$ Não Extrai* e implementação do runner das 12 famílias CBR com medição de MILR.
2. **MIS-0007: Fase 3 (Episodic Event Ledger)**
   - *Owners:* A4 (Backend Supabase), A7 (QA & AppSec), A1 (Coordenação).
   - *Objetivo:* Primeira migration do novo ciclo (`memory_events` append-only com RLS).
