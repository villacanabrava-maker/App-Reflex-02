# Estado Compartilhado do Projeto — App Reflex 02

**Data da Última Reconciliação:** 18 de setembro de 2026  
**Responsável pela Reconciliação:** A9 (rflex-continuity-evidence) em conjunto com A1 (rflex-architect) e A8 (rflex-research-evolution)  
**Branch Canônica:** `main`  
**Repositório Remoto:** `https://github.com/villacanabrava-maker/App-Reflex-02.git`  
**Status do Pipeline:** Verde (100% dos testes e build passando)  
**Última Missão Concluída:** MIS-0005 (Fusão Epistemológica, Memória Tipada, Claims e Especificação Executável do Cérebro Reflex V3.1)  

---

## 1. Matriz de Infraestrutura & Integrações

| Componente | Estado Operacional | Classificação de Evidência | Detalhes & Configurações |
| :--- | :--- | :--- | :--- |
| **Repositório Git** | `ATIVO / CANÔNICO` | `[CONFIRMADO-CODIGO]` / `[CONFIRMADO-CI]` | Sincronizado no GitHub (`villacanabrava-maker/App-Reflex-02`). |
| **Supabase** | `RECONCILIADO / 100% PARIDADE` | `[CONFIRMADO-TESTE]` / `[CONFIRMADO-CODIGO]` | Project ref: `xenapowdtfhdwcfthfrn`. 30 migrations aplicadas, RLS ativo em todos os schemas (`sistema`, `cerebro_autoral`, etc.), bucket `originais-biblioteca` ajustado em 50MB. Schema V3 suspenso aguardando faseamento de claims. |
| **Segurança & AppSec** | `P0 ABERTO — CREDENCIAL REVOGAÇÃO PENDENTE` | `[CONFIRMADO-TESTE]` / `[CONFIRMADO-CODIGO]` | Saneado no código local e de CI (`tests/seguranca/supabase-isolamento-rls.test.ts`). Aguardando redefinição da senha do banco pelo usuário no console web Supabase. |
| **Hospedagem / Vercel** | `ADIADO / FORA DE ESCOPO` | `[CONFIRMADO-CODIGO]` | Nenhum deploy, CLI ou webhook Vercel ativo. Proibido por regra de governança. |
| **Equipe Multiagente** | `OPERACIONAL (9 AGENTES)` | `[CONFIRMADO-CODIGO]` / `[CONFIRMADO-TESTE]` | 9 agentes (A1 a A9) governados por suas atribuições constitucionais estritas. |
| **Suíte de Testes** | `PASSANDO (100%)` | `[CONFIRMADO-TESTE]` | 20 arquivos de testes Vitest (74 testes) cobrindo segurança, RLS, IA, guardrails, isolamento e qualificação. |
| **Build de Produção** | `CONCLUÍDO COM SUCESSO` | `[CONFIRMADO-TESTE]` | Next.js 15 compilando estaticamente e rotas dinâmicas validadas. |

---

## 2. Mapa dos 9 Agentes Constitucionais

| ID | Nome Canônico | Atribuição Exclusiva e Inegociável |
| :--- | :--- | :--- |
| **A1** | `rflex-architect` | Arquitetura e Coordenação Geral |
| **A2** | `rflex-product-design` | Design e UX (Interfaces, Design System e Acessibilidade WCAG AA) |
| **A3** | `rflex-frontend` | Frontend (Next.js 15, React 19, Componentes e Navegação) |
| **A4** | `rflex-backend-supabase` | Backend e Supabase (PostgreSQL 17, RLS, Storage TUS e Migrations) |
| **A5** | `rflex-ai-knowledge` | IA e Conhecimento (Claims, RAG, NLI, Memory Firewall, Taxonomia SKOS) |
| **A6** | `rflex-platform` | Plataforma e SRE (CI/CD, GitHub Actions, Ambiente Git e Observabilidade) |
| **A7** | `rflex-qa-security` | Qualidade e Segurança (Evals, AppSec, Auditoria RLS e Testes Automatizados) |
| **A8** | `rflex-research-evolution` | Pesquisa e Evolução (Literatura de ponta, Benchmarks e Diagnósticos) |
| **A9** | `rflex-continuity-evidence` | Continuidade, Evidência e Comunicação (Livro-razão de fatos, protocolos tripartite) |

---

## 3. Estado Cognitivo e Arquitetura de Inteligência V3.1

A MIS-0005 consolidou o salto epistemológico do projeto:
- **Fusão Epistemológica:** Unificação da MIS-0004 com o documento aprofundado do usuário, literatura acadêmica (Claimify, LongMemEval, LoCoMo, BEAM, HippoRAG 2, Graphiti, SKOS) e auditoria do código real.
- **Claims como Unidade Atômica:** Proposição verificável e descontextualizada com validação por NLI Entailment e regra *Ambiguidade $\to$ Não Extrai*.
- **10 Estados Epistemológicos:** `observed`, `quoted`, `extracted`, `consolidated`, `confirmed_authorial`, `inferred`, `hypothesized`, `proposed`, `rejected`, `superseded`.
- **Memory-Inference Firewall:** Barreira que impede inferências do modelo de serem apresentadas como memórias, governada pela métrica **MILR (Memory-Inference Leakage Rate)** com meta de $0.0\%$.
- **Vetor de Confiança (Confidence Vector):** Substituição do número escalar arbitrário por vetor de 10 dimensões calibráveis por tarefa.
- **Taxonomia de Abstenção:** 7 categorias estruturadas de recusa consciente de resposta.
- **Reclassificação Epistêmica:** Todos os parâmetros numéricos fixos da V3 reclassificados como `BASELINE EXPERIMENTAL` a calibrar.
- **Novo Roadmap em 10 Fases:** Sequenciamento iniciando por Claims e Provenance (Fase 1) e Evals/MILR (Fase 2).
- **ADR 0003:** Formalizado em substituição qualificadora ao histórico ADR 0002.

---

## 4. Bloqueios e Restrições Vigentes

1. `[BLOQUEADO]` **Vercel:** Não realizar tentativas de deploy ou linkage de projeto até aprovação explícita do usuário.
2. `[BLOQUEADO]` **Migrations de Schema V3:** Suspensas migrações de tabelas da V3 até que a Fase 1 (Claims) e Fase 2 (Evals) estejam prototipadas e validadas.
3. `[BLOQUEADO]` **Mutações Destrutivas no Supabase:** Toda evolução de schema requer migration versionada e revisão de segurança prévia (A4/A7).
4. `[BLOQUEADO]` **Reescrita Cognitiva em Produção:** Qualquer avanço nas fases do Roadmap V3.1 requer aprovação do usuário e ChatGPT via novos prompts dedicados por ciclo.
