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
| **AGENT-HARNESS-V2** | Modernização, Especialização, Teste e Governança dos 9 Agentes: A1 reestruturado como único `mainAgent: true`, A2 a A9 como `subagent: true`, prompts em 15 seções padronizadas com descrições discriminativas e negativas, introdução do Task Packet e Output Contracts tipados por agente, política DENY > ASK > ALLOW com proteções Windows via hooks Node.js, Matriz RACI / CODEOWNERS, os 6 modos de orquestração, suíte de testes de qualificação (`tests/seguranca/agent-harness-v2.test.ts`), 8 documentos normativos em `docs/agentes/` e AGENTS.md atualizado. | A1 a A9 | `CONCLUÍDO` | `23f4a87` | `[CONFIRMADO-TESTE]` / `[CONFIRMADO-CODIGO]` (80 testes passando em 21 arquivos, 8 documentos normativos em docs/agentes/, 9 agent.md modernizados, novo teste de harness verde). |
| **MIS-0006** | Fechamento Conclusivo da Pesquisa, Design Freeze e Plano Mestre Executável da Modernização Cognitiva: Integração da pesquisa do usuário como fonte externa, reconciliação de literatura acadêmica (Claimify e LoCoMo como peer-reviewed), Red-Team adversarial (A7), Decision Matrix com MUST/SHOULD/EXPERIMENT/DEFER/REJECT (`docs/ia/DECISION_MATRIX_FINAL_V3_1.md`), Design Freeze com 14 Invariants e Cognitive MVP-1 (`docs/ia/DESIGN_FREEZE_COGNITIVO_V3_1.md`), Plano Mestre em 22 seções organizando 6 Waves (`docs/planos/PLANO_MESTRE_MODERNIZACAO_COGNITIVA_V3_1.md`), especificação técnica da Wave 1 (`docs/planos/MIS-0007_WAVE_1_SPEC.md`) e correção de drift de caminhos no Harness V2. | A1, A4, A5, A7, A8, A9 | `CONCLUÍDO` | Atual | `[CONFIRMADO-DOCUMENTO]` / `[CONFIRMADO-TESTE]` (Design Freeze congelado, 4 documentos mestres, 80 testes passando, zero mutação em código funcional ou banco). |

---

## 2. Próximas Missões Planejadas (Cronograma das 6 Waves do Plano Mestre)

Com a pesquisa concluída, o design congelado e o plano mestre homologado, a modernização cognitiva do Cérebro Reflex V3.1 será executada nas seguintes Waves atômicas:

1. **MIS-0007: Wave 1 — Fundação de Claims, NLI Entailment e Golden Dataset Runner**
   - *Owners:* A1 (Coordenação), A4 (Backend), A5 (IA & Conhecimento), A7 (QA & AppSec), A9 (Continuidade).
   - *Especificação:* `docs/planos/MIS-0007_WAVE_1_SPEC.md`.
   - *Objetivo:* Migration `0031_claims_ledger.sql` com RLS, motor Claimify de extração de claims, validador de NLI com regra *Ambiguidade $\to$ Não Extrai* e runner das 12 famílias CBR com cálculo automatizado de MILR (meta 0.0%) e AMR em Shadow Mode.
2. **MIS-0008: Wave 2 — Episodic Event Ledger & Timeline Epistêmica**
   - *Owners:* A4 (Backend), A5 (IA), A7 (QA & AppSec), A9 (Continuidade).
   - *Objetivo:* Migration `0032_episodic_event_ledger.sql`, timeline append-only `memory_events` e governança dos 10 estados epistemológicos com expiração de hipóteses superadas.
3. **MIS-0009: Wave 3 — Retrieval Híbrido Multi-Sinal & Ontologia SKOS**
   - *Owners:* A4 (Backend), A5 (IA), A7 (QA & AppSec), A9 (Continuidade).
   - *Objetivo:* Migration `0033_retrieval_hibrido_skos.sql`, motor híbrido `pgvector` HNSW + FTS lematizado PT-BR + Recência (RRF) e estrutura conceitual SKOS no PostgreSQL.
4. **MIS-0010: Wave 4 — Dossiê Contextual Segregado & Working Memory**
   - *Owners:* A5 (IA), A7 (QA & AppSec), A9 (Continuidade).
   - *Objetivo:* Montador de Working Memory com orçamentação matemática de tokens, compartimentalização estrita e tags de `Allowed Use`.
5. **MIS-0011: Wave 5 — Auditor Cognitivo Pós-Geração & Abstenção Honesta**
   - *Owners:* A5 (IA), A7 (QA & AppSec), A9 (Continuidade).
   - *Objetivo:* Motor das 7 modalidades de abstenção honesta e auditor assíncrono pós-geração com badge de integridade.
6. **MIS-0012: Wave 6 — Consolidação Autoral Noturna & Aprendizado por Edição**
   - *Owners:* A4 (Backend), A5 (IA), A7 (QA & AppSec), A9 (Continuidade).
   - *Objetivo:* Processamento batch noturno de reconciliação de crenças (hippocampal replay) e extração de regras a partir de edições do autor com fila de aprovação humana.
