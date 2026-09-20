# Ativação Cloud — ordem recomendada

Este guia contém ações de conta/UI que **o usuário precisa executar**. O repositório apenas prepara o contrato.

## 1. Claude Code web

Após a base canônica estar integrada:
1. abrir Claude Code na web;
2. conectar o GitHub;
3. autorizar somente `villacanabrava-maker/App-Reflex-02`;
4. confirmar que `CLAUDE.md` é carregado;
5. executar uma sessão read-only de bootstrap;
6. não habilitar unrestricted branch pushes.

### Routine 1 — PR Supervisor
Trigger: eventos de Pull Request suportados.

Prompt recomendado:
```text
Leia AGENTS.md, CLAUDE.md e docs/agent-system/.
Reconcile o PR com a main e o CI.
Execute npm run agents:validate e os testes proporcionais ao diff.
Classifique ownership R1-R9 e riscos.
Não faça merge, deploy, migration live ou mudança de secrets.
Se precisar corrigir governança/infraestrutura de baixo risco, trabalhe em branch claude/* e abra PR.
Se o PR foi implementado por Claude, não declare R6 independente.
Produza Evidence e próximo handoff.
```

### Routine 2 — Drift Watch
Trigger: agenda diária ou semanal.

Prompt:
```text
Compare main, CI, docs/agent-system e referências live autorizadas.
Detecte drift de SHA, adapters, documentação e segurança.
Não modifique produção.
Se houver drift puramente documental e inequivocamente verificável, proponha PR em claude/*.
Caso contrário, apenas reporte.
```

## 2. Supabase no Claude

Para rotina não supervisionada, use MCP:
```text
https://mcp.supabase.com/mcp?project_ref=xenapowdtfhdwcfthfrn&read_only=true&features=docs,database,debugging
```

Não conectar escrita live a Routines.

## 3. Vercel no Claude

Não anexar inicialmente um conector Vercel com ferramentas de escrita a Routines não supervisionadas. Use observação interativa ou uma futura fachada read-only com tool allowlist explícita.

## 4. OpenAI / Codex Cloud

1. conectar o mesmo repositório ao Codex Cloud;
2. criar ambiente do repositório;
3. habilitar Code Review automático quando desejado;
4. usar `@codex review` / `@codex security review` como R6 independente quando o implementador for outro runtime;
5. manter Agents API como fase programática posterior, depois do fluxo GitHub estar estável.

## 5. Antigravity local

Manter a topologia física de seis agentes que o usuário escolheu.

A exigência é cobertura dos papéis R1-R9, não nove processos. Antes de alterar o adapter:
- atualizar workspace a partir da base canônica;
- executar `agy --version` e `agy --help`;
- validar Skills/MCP/permissões;
- mapear os seis agentes físicos aos nove papéis;
- fazer smoke test read-only;
- registrar Evidence no GitHub.

## 6. Só depois: automação cross-runtime

Quando Claude Cloud e Codex Cloud estiverem conectados e testados:
- GitHub Action/webhook pode acionar APIs para eventos que não tenham trigger nativo;
- Agents API pode hospedar fluxos OpenAI persistentes;
- Supabase Queues/Cron/Edge Functions pode acionar tarefas originadas por eventos do produto.

Não construir esse roteador antes dos smoke tests básicos.
