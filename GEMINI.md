# App Reflex 02 — Adaptador de Execução Antigravity 2.0 (Reflex Agent OS V3)

Este repositório contém a plataforma **App Reflex 02** (Memória Reflexiva e Cérebro Autoral).
Este arquivo atua como o **adaptador de execução Always-On** do Google Antigravity 2.0, conectando o agente às fontes de verdade e normas canônicas do projeto.

---

## 1. Identidade e Repositório Canônico
- **Repositório GitHub Único:** `https://github.com/villacanabrava-maker/App-Reflex-02.git`
- **Branch Canônica:** `main`
- **Banco de Dados Supabase (DEV/TEST):** `xenapowdtfhdwcfthfrn` (`https://xenapowdtfhdwcfthfrn.supabase.co`)
- **Hospedagem em Produção:** Vercel (`https://app-reflex-02.vercel.app`)
  - A produção está **ativa** para visualização e diagnóstico.
  - Novos deploys e alterações de infraestrutura permanecem sob **Gate Humano Obrigatório** (proibido deploy autônomo via CLI).

---

## 2. Fontes de Verdade Canônicas (Leia Antes de Agir)
1. `docs/agent-system/CONSTITUTION.md` — Constituição multiagente e regras invioláveis.
2. `docs/agent-system/SOURCE_OF_TRUTH.md` — Hierarquia formal de autoridade e resolução de divergências.
3. `docs/agent-system/CURRENT_STATE.md` — Estado material comprovado da infraestrutura e testes.
4. `docs/agent-system/missions/MISSION_LOCK.json` — Lock lógico de concorrência entre Antigravity e OpenAI.
5. `docs/STATUS_PROJETO.md` — Documento histórico de status funcional do produto.

---

## 3. Regras Invariantes (Always-On)
1. **Respostas em Português do Brasil:** Toda interação, artefato, relatório e comentário deve ser entregue em português claro e profissional.
2. **Monopólio Autoral Humano:** Nenhuma inferência da IA se torna memória confirmada do autor sem aprovação explícita do Usuário.
3. **Menor Privilégio e Comandos Bloqueados:**
   - Proibido `rm -rf /` ou comandos destrutivos de sistema.
   - Proibido `drop database`, `drop schema` ou truncagem de tabelas.
   - Proibido `git push --force` ou `git push -f` em qualquer branch.
   - Proibido `DISABLE ROW LEVEL SECURITY`.
   - Proibido `supabase db push --linked` sem aprovação humana explícita (*ASK*).
4. **Uma Única Frente Funcional por Vez:** Não abrir frentes concorrentes em paralelo que toquem os mesmos módulos.
5. **Auditoria Independente Obrigatória:** Nenhuma alteração entra na branch `main` sem a suíte de testes passando e o laudo formal de R6 (`SELF_REVIEW != INDEPENDENT_REVIEW`).
6. **Classificação Canônica de Evidências:** Use sempre as tags probatórias:
   `[CONFIRMADO-CODIGO]`, `[CONFIRMADO-TESTE]`, `[CONFIRMADO-CI]`, `[CONFIRMADO-RUNTIME]`, `[CONFIRMADO-EXTERNO]`.

---

## 4. Caminhos de Skills e Procedimentos
- **Shared Skills canônicas:** `.agents/skills/reflex-*/SKILL.md`
- **Registro de Agentes (R1–R9):** `.agents/agents/rflex-*/agent.md`
- **Contratos de Handoff e Schemas:** `docs/agent-system/schemas/`

---

## 5. Instruções de Bootstrap
Ao assumir qualquer tarefa:
1. Ative a skill `reflex-bootstrap-reconcile`.
2. Verifique o Git HEAD canônico (`git fetch origin && git log -n 1 origin/main`).
3. Verifique o lock em `docs/agent-system/missions/MISSION_LOCK.json`.
4. Opere através de Task Packets tipados coordenados por R1 (`rflex-orchestrator`).
