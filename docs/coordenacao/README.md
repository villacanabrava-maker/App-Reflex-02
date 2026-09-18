# Protocolo de Coordenação, Continuidade e Comunicação — App Reflex 02

## 1. Visão Geral

Este diretório centraliza a governança operacional, a memória contínua e os artefatos de comunicação assíncrona para o desenvolvimento do **App Reflex 02**.

O desenvolvimento opera através de uma arquitetura triangular de colaboração contínua:

```
                  ┌──────────────────────┐
                  │       USUÁRIO        │
                  │   (Dono do Produto   │
                  │ & Tomador de Decisão)│
                  └──────────┬───────────┘
                             │
            Interage, valida │ Formula prompts,
           e autoriza etapas │ revisa entregas
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────┐
│       CHATGPT         │         │      ANTIGRAVITY      │
│  (Análise, Estratégia │◄───────►│ (Equipe de 9 Agentes: │
│ e Redação de Prompts) │ Handoff │ Engenharia, Testes,   │
│                       │ via Git │ Git, CI e Governança) │
└───────────────────────┘         └───────────────────────┘
```

---

## 2. Divisão de Responsabilidades no Triângulo

1. **Usuário:**
   - Define prioridades, objetivos de negócio e requisitos humanos.
   - Fornece credenciais e autorizações através de canais seguros.
   - Transporta prompts gerados pelo ChatGPT para o Antigravity e relatórios gerados pelo Antigravity para o ChatGPT.
   - Delibera sobre decisões arquiteturais e mudanças de escopo.

2. **ChatGPT:**
   - Analisa relatórios técnicos (`AG-XXXX.md`), código e documentos.
   - Diagnostica riscos, trade-offs e dependências antes de qualquer execução.
   - Redige **Prompts Mestres Estruturados** com instruções claras, limites explícitos e critérios de aceitação.
   - Revisa auditorias documentais e alinha a evolução estratégica do produto.

3. **Antigravity (Equipe de Agentes A1 a A9):**
   - Recebe e executa o prompt autorizado pelo usuário.
   - **A1 (Arquiteto):** Orquestra o plano de trabalho e valida a coesão técnica.
   - **A2 a A8 (Especialistas):** Executam design, frontend, backend/Supabase, IA, plataforma, auditoria de segurança e pesquisa.
   - **A9 (Continuidade & Evidência):** Reconcilia o resultado real (diffs, testes, commits) e gera o relatório `AG-XXXX.md`.
   - Garante que a branch `main` no GitHub permaneça sempre com testes verdes (CI gate).

---

## 3. Estrutura deste Diretório

- `ESTADO_COMPARTILHADO.md`: Quadro vivo do estado funcional, integrações e métricas do projeto.
- `INDICE_MISSOES.md`: Registro de todas as missões executadas, em andamento e planejadas.
- `AUDITORIA_DOCUMENTAL_APP01_APP02.md`: Classificação rigorosa dos documentos herdados do App 01 vs App 02.
- `chatgpt-para-antigravity/`: Diretório de espelhamento de instruções e prompts estratégicos (`GPT-XXXX.md`).
- `antigravity-para-chatgpt/`: Relatórios formais de encerramento de missões (`AG-XXXX.md`).
- `missoes/`: Dossiês de documentação específica por missão (`MIS-XXXX/`).
- `decisoes/`: Registro formal de decisões técnicas e alinhamentos de coordenação.

---

## 4. Regras Fundamentais de Continuidade

1. **Evidência sobre Suposição:** Nenhuma etapa é encerrada com base em impressões; tudo exige stdout de testes, hash de commit e diff rastreável.
2. **Higiene de Segredos:** Credenciais privadas jamais são escritas em relatórios de coordenação.
3. **Isolamento de Escopo:** Não realizar refatorações alheias ao escopo da missão ativa.
4. **Vercel Postponed:** A plataforma Vercel permanece rigorosamente suspensa e fora do escopo até decisão contrária expressa do usuário.
