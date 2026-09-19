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
| **MIS-0005** | Fusão Epistemológica, Memória Tipada, Claims e Especificação Executável do Cérebro Reflex V3.1: Integração de pesquisa aprofundada do usuário e literatura acadêmica (Claimify, LongMemEval, LoCoMo, BEAM, HippoRAG 2, Graphiti, SKOS), definição formal de Claims, 10 Estados Epistemológicos, Memory-Inference Firewall (métrica MILR = 0%), Vetor de Confiança de 10 dimensões, Abstenção em 7 modalidades, Dossiê Contextual com Allowed Use, Auditor Cognitivo Pós-Geração, Golden Dataset V3 (12 famílias CBR), Benchmark de Retrieval sob orçamentos fixos, Roadmap V3.1 em 10 Fases e ADR 0003. | A1, A4, A5, A7, A8, A9 | `CONCLUÍDO` | Atual | `[CONFIRMADO-TESTE]` / `[CONFIRMADO-CODIGO]` (12 novos documentos conceituais V3.1 + ADR 0003 + AG-0004 + 74 testes passando, status P0 atualizado). |

---

## 2. Roteiro Executável de Implementação V3.1 (Próximas Missões)

Conforme estabelecido em `docs/ia/ROADMAP_V3_1.md`:

1. **Fase 1 (Candidata à MIS-0006): Claims, Provenance e Estados Epistemológicos**
   - Modelagem do validador de NLI Entailment isolado, extrator de proposições descontextualizadas e regra *Ambiguidade $\to$ Não Extrai*.
2. **Fase 2: Golden Dataset V3 e Medição de Memory-Inference Leakage (MILR)**
   - Implementação do runner das 12 famílias CBR e linha de base de MILR.
3. **Fase 3: Livro-Razão de Eventos Episódicos (`memory_events`)**
   - Primeira migration do novo ciclo (append-only ledger no PostgreSQL 17).
4. **Fase 4: Retrieval Multi-Rota com Abstenção Honesta**
   - RRF no banco com as 7 categorias de abstenção.
5. **Fases 5 a 10:** Dossiê Epistemológico, Auditor Cognitivo, Consolidação Lenta, Memória Procedural, Grafo Bitemporal e Interface do Cérebro.
