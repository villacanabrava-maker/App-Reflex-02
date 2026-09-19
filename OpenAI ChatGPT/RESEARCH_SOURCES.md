# Fontes Externas Oficiais

Verifique novamente quando a tarefa depender de comportamento atual.

## OpenAI — AGENTS.md
https://developers.openai.com/pt-BR/docs/agent-configuration/agents-md

- Codex lê `AGENTS.md` antes do trabalho.
- instruções são compostas por escopo.

## OpenAI — Criar Skills
https://developers.openai.com/pt-BR/docs/build-skills

- Skill = diretório + `SKILL.md`.
- `name` e `description` são essenciais.
- Codex descobre Skills de repo em `.agents/skills`.
- manter Skills pequenas, focadas e progressivamente carregadas.

## OpenAI — Skills no ChatGPT
https://help.openai.com/en/articles/20001066

- workflows reutilizáveis;
- podem conter instruções, exemplos e código.

## OpenAI — Agents SDK
https://openai.github.io/openai-agents-python/

- Agents, tools/handoffs, guardrails, tracing e sessions.

## OpenAI — Orchestration
https://openai.github.io/openai-agents-python/multi_agent/

- manager/agents-as-tools para coordenação central;
- handoff quando especialista assume a etapa.

## OpenAI — Guardrails
https://openai.github.io/openai-agents-python/guardrails/

- separar input/output/tool guardrails;
- side effects pedem checks no ponto correto.

## OpenAI — Tracing
https://openai.github.io/openai-agents-python/tracing/

- rastrear gerações, tools, handoffs e guardrails.

## Supabase
https://supabase.com/docs

- verificar docs/changelog atual;
- RLS, grants e SECURITY DEFINER exigem revisão explícita.

## Vercel
https://vercel.com/docs

- deployment é artefato imutável;
- preview e produção precisam ser reconciliados por SHA/branch/alias.

## OpenAI / Codex — configuração e multiagentes (verificado em 2026-09-19)

- OpenAI Codex — AGENTS.md: https://developers.openai.com/pt-BR/docs/agent-configuration/agents-md
- OpenAI Codex — configuração básica: https://developers.openai.com/pt-BR/docs/config-file/config-basic
- OpenAI Codex — referência de configuração: https://developers.openai.com/pt-BR/docs/config-file/config-reference
- OpenAI Codex — subagentes personalizados: https://developers.openai.com/pt-BR/docs/agent-configuration/subagents
- OpenAI Agents SDK — overview: https://openai.github.io/openai-agents-python/
- OpenAI Agents SDK — orchestration: https://openai.github.io/openai-agents-python/multi_agent/
- OpenAI Agents SDK — guardrails: https://openai.github.io/openai-agents-python/guardrails/
- OpenAI Agents SDK — tracing: https://openai.github.io/openai-agents-python/tracing/

Consequências adotadas: AGENTS.md para convenções persistentes, .codex/config.toml para defaults de projeto, .codex/agents para papéis especializados, Skills para workflows reutilizáveis e manager + especialistas como padrão principal.
