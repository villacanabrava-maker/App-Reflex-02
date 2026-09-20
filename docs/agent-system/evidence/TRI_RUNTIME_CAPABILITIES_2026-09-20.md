# Evidence — Capacidades Tri-Runtime verificadas em 2026-09-20

**Classificação:** [CONFIRMADO-EXTERNO] documentação oficial atual.

## Claude Code Cloud

Fonte: https://code.claude.com/docs/en/routines

Verificado:
- Routines executam na infraestrutura cloud gerenciada e continuam com o laptop fechado;
- triggers suportados: schedule, API e GitHub;
- GitHub trigger cobre categorias Pull Request e Release no estado atual;
- cada execução clona o repositório a partir da branch default;
- mudanças de Routine usam branch `claude/*` por padrão;
- conectores incluídos podem usar ferramentas, inclusive write, sem prompt de permissão durante a execução;
- Routines estão em research preview.

Implicação Reflex: Claude pode hospedar supervisão recorrente R1/R9, mas conectores unattended devem ser estritamente reduzidos.

## OpenAI

Fontes:
- https://developers.openai.com/docs/cloud
- https://developers.openai.com/docs/third-party/github
- https://developers.openai.com/api/docs/guides/agents-api/overview
- https://developers.openai.com/api/docs/guides/agents-api/sessions/webhooks
- https://developers.openai.com/docs/github-action

Verificado:
- Codex Cloud executa tarefas em ambientes cloud isolados ligados ao GitHub;
- Codex pode revisar PRs manual ou automaticamente quando configurado;
- Codex GitHub Action pode ser acionado por eventos do GitHub;
- Agents API oferece sessões persistentes/assíncronas, sandbox, MCP, subagentes e webhooks.

Implicação Reflex: OpenAI pode atuar como executor/revisor cloud independente e, numa fase posterior, participar do event router programático.

## Google Antigravity

Fontes:
- https://antigravity.google/docs/cli/reference/
- https://antigravity.google/docs/skills
- https://codelabs.developers.google.com/sdd-agy-cli

Verificado:
- `agy` opera o harness Antigravity no terminal;
- Antigravity suporta Skills e MCP;
- o CLI executa código/comandos e pode usar agentes/subagentes;
- permissões podem ser configuradas no runtime.

Implicação Reflex: manter Antigravity como executor local é compatível com a arquitetura; número de agentes físicos é detalhe do adapter.

## Supabase

Fontes:
- https://supabase.com/docs/guides/ai-tools/mcp
- https://supabase.com/docs/guides/cron
- https://supabase.com/docs/guides/database/webhooks
- https://supabase.com/docs/guides/queues/consuming-messages-with-edge-functions
- https://supabase.com/docs/guides/functions

Verificado:
- MCP pode ser limitado por `project_ref`, `read_only=true` e feature groups;
- Cron agenda jobs;
- Database Webhooks emitem eventos após INSERT/UPDATE/DELETE;
- Queues + Edge Functions permitem processamento assíncrono.

Implicação Reflex: Supabase é adequado como event bus/scheduler de eventos originados no produto, não como quarto runtime cognitivo de engenharia.

## Vercel

Fontes:
- https://vercel.com/platform
- https://vercel.com/changelog/vercels-mcp

Verificado:
- Vercel possui API/MCP e observabilidade;
- MCP também inclui operações de gerenciamento de projetos/deployments.

Implicação Reflex: não anexar o MCP completo a Routines unattended enquanto não houver restrição de tools suficiente para garantir read-only.

## Limitações

- capacidades cloud dependem do plano/conta e da configuração real do usuário;
- documentação externa não prova que o conector está habilitado no App Reflex 02;
- smoke tests de conta/runtime são necessários antes de classificar qualquer integração como [CONFIRMADO-RUNTIME].
