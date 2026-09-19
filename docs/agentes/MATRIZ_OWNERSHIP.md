# MATRIZ DE OWNERSHIP DE CÓDIGO E ARQUIVOS — APP REFLEX 02
### Mapa Conceitual de CODEOWNERS, Autoridades e Matriz RACI dos 9 Agentes
**Missão:** AGENT HARNESS V2 | **Status:** Normativo e Canônico | **Data:** 2026-09-18

---

## 1. Princípio da Delimitação de Território

> [!IMPORTANT]
> **REGRA DE OURO DE OWNERSHIP:**  
> Nenhum agente possui autorização para modificar arquivos fora do seu escopo funcional designado sem requisição formal de handoff ou aprovação do Arquiteto (A1). Modificações não autorizadas são bloqueadas no Quality Gate.

---

## 2. Matriz Conceitual de CODEOWNERS

| Caminho no Repositório | Responsável Primário (Implementa) | Especificador / Designer | Auditor Independente (Verifica) | Reconciliador (Registra) |
|---|:---:|:---:|:---:|:---:|
| `src/componentes/**` | **A3 (Frontend)** | A2 (Design & UX) | A7 (QA & AppSec) | A9 (Evidência) |
| `src/app/**` (Páginas e Rotas) | **A3 (Frontend)** | A2 (Design & UX) | A7 (QA & AppSec) | A9 (Evidência) |
| `src/estilos/**` / Tailwind tokens | **A2 (Design & UX)** | A2 (Design & UX) | A3 (Frontend) | A9 (Evidência) |
| `supabase/migrations/**` | **A4 (Backend Supabase)** | A1 (Arquitetura) | A7 (QA & AppSec) | A9 (Evidência) |
| `supabase/seed.sql` / RPCs | **A4 (Backend Supabase)** | A4 (Backend Supabase) | A7 (QA & AppSec) | A9 (Evidência) |
| `src/ia/**` (Cliente, Orquestrador, Claims) | **A5 (IA & Conhecimento)** | A1 (Arquitetura) | A7 (QA & AppSec) | A9 (Evidência) |
| `src/dominios/cerebro/**` / `taxonomia/**` | **A5 (IA & Conhecimento)** | A1 (Arquitetura) | A7 (QA & AppSec) | A9 (Evidência) |
| `.github/workflows/**` (CI/CD) | **A6 (Plataforma & SRE)** | A6 (Plataforma & SRE) | A7 (QA & AppSec) | A9 (Evidência) |
| `package.json` / `tsconfig.json` | **A6 (Plataforma & SRE)** | A1 (Arquitetura) | A7 (QA & AppSec) | A9 (Evidência) |
| `tests/seguranca/**` / `tests/e2e/**` | **A7 (QA & AppSec)** | A7 (QA & AppSec) | A1 (Arquitetura) | A9 (Evidência) |
| `tests/<unidade>/**` | Especialista Owner | Especialista Owner | A7 (QA & AppSec) | A9 (Evidência) |
| `docs/pesquisa-evolucao/**` | **A8 (Pesquisa & Evolução)**| A8 (Pesquisa & Evolução)| A1 (Arquitetura) | A9 (Evidência) |
| `docs/coordenacao/**` | **A9 (Continuidade)** | A9 (Continuidade) | A1 (Arquitetura) | A9 (Evidência) |
| `docs/adr/**` (Decisões de Arquitetura)| **A1 (Arquitetura)** | A1 (Arquitetura) | A7 (QA & AppSec) | A9 (Evidência) |
| `docs/ia/**` (Especificações V3.1) | **A5 & A8 (IA / Pesquisa)**| A1 (Arquitetura) | A7 (QA & AppSec) | A9 (Evidência) |

---

## 3. Matriz RACI da Equipe Multiagente

- **R (Responsible):** Quem executa a tarefa.
- **A (Accountable):** Quem responde pelo resultado final e tem poder de veto.
- **C (Consulted):** Quem deve ser consultado antes ou durante a execução.
- **I (Informed):** Quem deve ser informado após a conclusão.

| Tipo de Tarefa / Decisão | A1 | A2 | A3 | A4 | A5 | A6 | A7 | A8 | A9 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Novo Endpoint ou Schema no Banco** | A | I | C | **R** | C | I | C | I | I |
| **Novo Componente de Interface** | A | C | **R** | I | I | I | C | I | I |
| **Novo Schema Zod / Pipeline de Claims** | A | I | C | C | **R** | I | C | C | I |
| **Configuração de CI / Pipeline GitHub** | A | I | I | I | I | **R** | C | I | I |
| **Auditoria e Laudo de Release** | A | I | I | I | I | I | **R** | I | C |
| **Pesquisa e Diagnóstico de Causa-Raiz** | A | C | C | C | C | C | C | **R** | I |
| **Handoff e Reconciliação com ChatGPT** | C | I | I | I | I | I | C | I | **R / A** |
| **Decisão Arquitetural (ADR)** | **R / A** | C | C | C | C | C | C | C | I |

---

## 4. Regras de Resolução de Conflitos de Domínio

1. **Conflito UI vs Backend (ex: A3 solicita coluna ad-hoc no banco):**
   - A4 tem autoridade para recusar se ferir a integridade relacional ou normalização.
   - A1 é acionado para mediar o contrato de dados.
2. **Conflito Design vs Performance (ex: A2 exige animação pesada):**
   - A3 apresenta a telemetria de renderização; A2 adapta os tokens de design.
3. **Conflito Velocidade vs Segurança (ex: Implementador quer suprimir teste de RLS):**
   - **A autoridade de A7 é absoluta:** nenhum código com teste ignorado (`test.skip`) ou vulnerabilidade de RLS é liberado para merge.
