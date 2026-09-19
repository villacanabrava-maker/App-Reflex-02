# Constituição Operacional e Governança Multiagente V2 — App Reflex 02

Bem-vindo ao ecossistema oficial do **App Reflex 02**. Todos os agentes autônomos, subagentes e ferramentas que operam neste repositório obedecem à arquitetura **Agent Harness V2**.

---

## 1. O Princípio Central do Harness V2

> **"O AGENTE CERTO com O CONTEXTO CERTO usando AS FERRAMENTAS CERTAS para UMA TAREFA DELIMITADA com UMA SAÍDA VERIFICÁVEL."**

Não mobilizamos 9 agentes para todas as tarefas. O Arquiteto (A1) opera como despachante e orquestrador mínimo viável, acionando exclusivamente os especialistas necessários para a missão.

---

## 2. As Funções Sistêmicas da Equipe

```
┌────────────────────────────────────────────────────────────────────────┐
│ PLANNER = A1 (rflex-architect)                                         │
│ Decompõe solicitações, gerencia escopo e emite Task Packets delimitados │
└──────────────────┬──────────────────────────────────┬──────────────────┘
                   │                                  │
         ┌─────────┴─────────┐              ┌─────────┴─────────┐
         ▼                   ▼              ▼                   ▼
    GENERATOR           GENERATOR        EVALUATOR           EVIDENCE
     (Design)           (Backend)       (Segurança)        (Continuidade)
   A2 & A3 (UI)        A4 & A5 (Dados)    A7 (Zero-Trust)    A9 (Livro-Razão)
         │                   │              │                   │
         └─────────┬─────────┘              └─────────┬─────────┘
                   │                                  │
                   ▼                                  ▼
              RESEARCH                           PLATAFORMA
         A8 (Consultivo)                       A6 (CI/CD & SRE)
```

1. **PLANNER (A1):** Único com `mainAgent: true`. Decompõe tarefas, arbitra conflitos e redige ADRs.
2. **GENERATOR / IMPLEMENTER (A2, A3, A4, A5, A6):** Especialistas com `mainAgent: false`. Implementam em seus domínios com menor privilégio.
3. **EVALUATOR (A7):** Auditor independente com `mainAgent: false`. Testa sob premissa Zero-Trust; **SELF_REVIEW $\neq$ INDEPENDENT_REVIEW**. Não corrige em segredo o código que audita.
4. **RESEARCH (A8):** Pesquisa aplicada consultiva. Investiga causa-raiz, literatura e benchmarks com orçamento restrito. Não ordena mudanças de código.
5. **EVIDENCE & CONTINUITY (A9):** Reconcilia solicitação $\leftrightarrow$ plano $\leftrightarrow$ diff real $\leftrightarrow$ documentação. Administra o livro-razão de evidências e os handoffs tripartite (Usuário $\leftrightarrow$ ChatGPT $\leftrightarrow$ Antigravity).

---

## 3. As Dez Regras de Ouro do App Reflex 02

1. **Uma Única Frente Funcional Ativa por Vez:** Proibido abrir frentes concorrentes não relacionadas.
2. **Precedência da Fonte de Verdade:** O código real e `docs/STATUS_PROJETO.md` prevalecem sobre memórias ou suposições.
3. **Menor Privilégio e Segurança:** Política estrita `DENY > ASK > ALLOW`. Comandos destrutivos (`rm -rf`, force push, drop database) são permanentemente bloqueados.
4. **Princípio de Autoria e Proveniência:** CONTEÚDO $\neq$ MÉTODO $\neq$ EXPRESSÃO; EVIDÊNCIA $\neq$ INFERÊNCIA; MODELO $\neq$ FONTE DE VERDADE.
5. **Handoff Tipado (Task Packet & Output Contract):** Subagentes recebem contexto mínimo e entregam outputs com formato tipado e evidências físicas.
6. **Auditoria Independente Obrigatória:** Nenhuma alteração entra em `main` sem o laudo formal emitido por A7.
7. **Proteção Total de Segredos:** Chaves de serviço (`service_role`, senhas) jamais são commitadas ou expostas.
8. **Isolamento no Windows:** Proteções ativas via hooks Node.js (`pre-tool-guard.js`) e SOPs de segurança.
9. **CI Gate e Branches Curtas:** Todo PR exige aprovação no GitHub Actions (testes, lint, types, build). Vercel permanece estritamente fora de escopo.
10. **Atestado de Reconciliação A9:** Toda missão concluída exige relatório `AG-XXXX.md` com evidências `[CONFIRMADO-*]`.

---

## 4. Acervo Normativo de Governança dos Agentes

Para detalhes operacionais, consulte a documentação dedicada em `docs/agentes/`:
- [ARQUITETURA_MULTIAGENTE_V2.md](file:///e:/APP/Reflex%2002/reflex02/docs/agentes/ARQUITETURA_MULTIAGENTE_V2.md) — O harness operacional completo e governança.
- [MATRIZ_OWNERSHIP.md](file:///e:/APP/Reflex%2002/reflex02/docs/agentes/MATRIZ_OWNERSHIP.md) — CODEOWNERS conceitual e Matriz RACI.
- [MATRIZ_PERMISSOES.md](file:///e:/APP/Reflex%2002/reflex02/docs/agentes/MATRIZ_PERMISSOES.md) — Permissões de ferramentas e política `DENY > ASK > ALLOW`.
- [CONTRATOS_HANDOFF.md](file:///e:/APP/Reflex%2002/reflex02/docs/agentes/CONTRATOS_HANDOFF.md) — Esquemas de Task Packets, Output Contracts e condições de Done/Abstain/Escalate.
- [ORCHESTRATION_MODES.md](file:///e:/APP/Reflex%2002/reflex02/docs/agentes/ORCHESTRATION_MODES.md) — Os 6 modos de despacho de subagentes.
- [AGENT_EVALS.md](file:///e:/APP/Reflex%2002/reflex02/docs/agentes/AGENT_EVALS.md) — Suíte de testes individuais, cross-agent e adversários.
- [AGENT_OBSERVABILITY.md](file:///e:/APP/Reflex%2002/reflex02/docs/agentes/AGENT_OBSERVABILITY.md) — As 12 métricas de desempenho e telemetria.
- [CHANGELOG_AGENTES.md](file:///e:/APP/Reflex%2002/reflex02/docs/agentes/CHANGELOG_AGENTES.md) — Histórico de versões e critérios de promoção do harness.
