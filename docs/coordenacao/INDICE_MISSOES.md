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
| **MIS-0004** | Pesquisa Cognitiva Profunda, Arquitetura de Memória e Sistema de Inteligência Autoral V3: Mitigação P0 de segurança, fundamentação neurocientífica, benchmark de 5 paradigmas de memória/RAG, especificação do modelo tripartite, ontologia SKOS, busca híbrida multi-sinal, abstenção honesta, consolidação/replay, aprendizado por edição, plano de evals V2 (Golden Dataset de 12 casos) e ADR 0002. | A1, A4, A5, A7, A8, A9 | `CONCLUÍDO` | Atual | `[CONFIRMADO-TESTE]` / `[CONFIRMADO-CODIGO]` (74 testes passando, documento mestre ARQUITETURA_COGNITIVA_V3.md + 10 cadernos temáticos + ADR 0002 + relatório de segurança P0). |

---

## 2. Próximas Ondas de Implementação (Roadmap V3)

Conforme formalizado em `docs/ia/ROADMAP_IMPLEMENTACAO_V3.md`:

1. **Wave 0 — Fundação de Dados e Extensão do Esquema Supabase**
   - Criação de tabelas de ontologia, relações e enriquecimento de `episodio_chunks` com colunas de proveniência e texto lematizado.
2. **Wave 1 — Framework de Avaliação e Golden Dataset**
   - Runner automatizado `npm run test:evals` e benchmark baseline dos 12 casos.
3. **Wave 2 — Pipeline de Chunking Semântico e Contextual Retrieval**
   - Enriquecimento com prefixo narrativo contextual por chunk.
4. **Wave 3 — Busca Híbrida e Re-Ranking no PostgreSQL**
   - Stored Procedure de RRF com multiplicador autoral $1.5\times$.
5. **Wave 4 — Perfis de Intenção e Abstenção Honesta**
   - Classificação de 6 perfis e barreira de corte $\tau=0.55$.
6. **Waves 5 a 10** — Ontologia SKOS, Fila de Consolidação, Metamemória, Aprendizado por Edição, UI do Cérebro e Hardening.
