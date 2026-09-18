# App Reflex 02 — Sistema Multiagente de Engenharia & Governança (Antigravity 2.0)

Este repositório está configurado com a infraestrutura de **7 Agentes Especialistas**, **Skills Modulares**, **Políticas de Menor Privilégio** e **Hooks de Segurança Determinísticos** para o **Google Antigravity 2.0**.

---

## 👥 A Equipe dos 7 Agentes

| Agente | Arquivo | Responsabilidade Principal |
| :--- | :--- | :--- |
| **A1: rflex-architect** | `.agents/agents/rflex-architect/agent.md` | Arquitetura de Software, Domínio & Coordenação |
| **A2: rflex-product-design** | `.agents/agents/rflex-product-design/agent.md` | Design System, Usabilidade & Acessibilidade WCAG 2.2 AA |
| **A3: rflex-frontend** | `.agents/agents/rflex-frontend/agent.md` | Next.js 15, React 19, Tailwind CSS & Performance UI |
| **A4: rflex-backend-supabase** | `.agents/agents/rflex-backend-supabase/agent.md` | PostgreSQL, RLS, Storage TUS, RPCs & Safe Migrations |
| **A5: rflex-ai-knowledge** | `.agents/agents/rflex-ai-knowledge/agent.md` | Structured Outputs (Zod), Hybrid Search & RAG Autoral |
| **A6: rflex-platform** | `.agents/agents/rflex-platform/agent.md` | CI/CD, GitHub Actions, Ambiente Git & SRE |
| **A7: rflex-qa-security** | `.agents/agents/rflex-qa-security/agent.md` | Auditoria Independente, AppSec & Testes de Regressão |

---

## 🧠 Biblioteca de Skills (.agents/skills/)

- `rflex-source-of-truth`: Governança e consulta obrigatória a `docs/STATUS_PROJETO.md`.
- `rflex-handoff-contract`: SOP estruturado para passagem de tarefas entre especialistas.
- `rflex-definition-of-done`: Checklist inegociável de critérios de aceite (DoD).
- `rflex-git-workflow`: Fluxo de branches curtas e convenções de commit.
- `architecture-audit`: Análise de impacto e documentação de ADRs.
- `design-system-rflex`: Tokens, anatomia de componentes e WCAG 2.2 AA.
- `next15-react19-engineering`: Server/Client Components e tipagem estrita.
- `supabase-safe-migrations`: Migrations idempotentes, RLS e índices.
- `authorial-ai-retrieval`: Zod schemas, busca híbrida e proveniência.
- `vercel-preview-observability`: *[Adiado/Não aplicável nesta etapa]* Metodologia futura de preview.
- `independent-qa-security`: Testes adversários e emissão de laudo de auditoria.
- `code-reviewer`, `design-master`, `idea-generator`, `qa-tester`: Skills analíticas complementares de revisão.

---

## 🛡️ Segurança & Hooks (.agents/hooks.json)

- **PreToolUse:** Impede comandos destrutivos de sistema e banco, force push e chamadas não autorizadas de Vercel.
- **Stop:** Garante validação estruturada de critérios de aceitação e integridade antes do encerramento da sessão.
