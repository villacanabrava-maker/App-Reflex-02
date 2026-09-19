# App Reflex 02 — Reflex Agent Operating System V3 (Runtime Antigravity 2.0)

Este repositório implementa o adaptador oficial do **Reflex Agent Operating System V3** para o **Google Antigravity 2.0**, operando em paridade isomórfica com o **OpenAI Codex** sob a Constituição e o Registry Canônico definidos em `docs/agent-system/`.

---

## 👥 Os Nove Papéis Canônicos (R1–R9)

| Papel | Agente Antigravity | Função Canônica | Modelo | mainAgent | subagent |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **R1** | `rflex-orchestrator` | Orquestrador Geral, Despacho e Lock de Missão | `inherit` | **`true`** | `true` |
| **R2** | `rflex-architecture` | Arquiteto de Sistemas, ADRs e Domínios | `inherit` | `false` | `true` |
| **R3** | `rflex-data-supabase` | Engenheiro de Dados, PostgreSQL e Supabase | `inherit` | `false` | `true` |
| **R4** | `rflex-product-frontend` | Produto, Frontend Next.js 15 e Design System | `inherit` | `false` | `true` |
| **R5** | `rflex-cognitive-knowledge`| Engenheiro Cognitivo, IA, Claims e Dossiê V3.1 | `inherit` | `false` | `true` |
| **R6** | `rflex-qa-security` | Auditor Independente Zero-Trust e AppSec | `inherit` | `false` | `true` |
| **R7** | `rflex-platform-runtime` | Plataforma, CI/CD e Observabilidade Vercel | `inherit` | `false` | `true` |
| **R8** | `rflex-research-evolution`| Pesquisa Empírica Baseada em Evidências | `inherit` | `false` | `true` |
| **R9** | `rflex-continuity-evidence`| Continuidade, Livro-Razão e Handoff Tripartite | `inherit` | `false` | `true` |

> [!NOTE]
> **Especializações Delegáveis:**
> O papel R4 (`rflex-product-frontend`) pode despachar subagentes de especialização para tarefas pontuais de design (`rflex-product-design`) ou de componentes Next.js (`rflex-frontend`). O papel R1 (`rflex-orchestrator`) coordena o fluxo operacional enquanto R2 (`rflex-architecture`) delibera sobre decisões estruturais e ADRs.

---

## 🧠 Biblioteca de Shared Skills (`.agents/skills/`)

Núcleo compartilhado `reflex-*` (compatível com Antigravity e OpenAI/Codex):
- `reflex-bootstrap-reconcile`: Reconciliação live obrigatória antes de qualquer ação.
- `reflex-task-routing`: Roteamento e despacho de Task Packets por R1.
- `reflex-handoff`: Protocolo e contrato estruturado de transferência entre especialistas.
- `reflex-git-safe-worktree`: Governança de branch curta, worktree e prevenção de conflitos.
- `reflex-supabase-safe-change`: Safe migrations idempotentes, RLS e PostgREST schema profiles.
- `reflex-cognitive-integrity`: Claims, Memory-Inference Firewall, Allowed Use e Zod schemas.
- `reflex-rcmo`: Protocolo de Representação Cognitivo-Semântica Multicamadas para obras.
- `reflex-ui-runtime-verify`: Inspeção de acessibilidade WCAG 2.2 AA e verificação de fluxo.
- `reflex-independent-qa`: Auditoria Zero-Trust independente (R6).
- `reflex-release-verify`: Checklist de release gate e deploy readiness.
- `reflex-research`: Pesquisa baseada em evidências com orçamento delimitado (R8).
- `reflex-continuity-close`: Fechamento, livro-razão de evidências e handoff formal (R9).

---

## 🛡️ Segurança & Hooks (`.agents/hooks.json`)

- **PreToolUse:** Impede comandos destrutivos de sistema e banco, force push e chamadas não autorizadas de Vercel.
- **PostToolUse:** Registra telemetria de execução de ferramentas sem expor dados sensíveis.
- **Stop:** Garante validação estruturada de critérios de aceitação e integridade antes do encerramento da sessão.
