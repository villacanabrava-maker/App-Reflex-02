# Adapter Compatibility — Reflex Agent OS V3

## OpenAI / Codex

**Estado:** validado por documentação oficial + validação estática/CI do repositório.

Mantidos:
- `AGENTS.md` como instrução de repositório;
- `.codex/config.toml` project-scoped;
- nove agentes em `.codex/agents/*.toml`;
- Skills em `.agents/skills/`;
- approval policy e sandbox como controles do runtime.

Os nove TOMLs usam `name`, `description`, `sandbox_mode` e `developer_instructions`, e são ligados ao registry R1–R9.

## Antigravity

**Estado:** adapter conceitualmente reconciliado; smoke test do parser/runtime Antigravity ainda é obrigatório.

Preservados:
- nove `.agents/agents/*/agent.md`;
- Skills existentes;
- Rules;
- Hooks;
- scripts de guardrail.

Foram corrigidas apenas contradições verificadas de estado, sobretudo a política histórica que tratava Vercel como inexistente/adiada.

### Limitação atual

Esta sessão ChatGPT não executa o runtime local Antigravity. Portanto:
- não foi alegado que o frontmatter atual dos `agent.md` foi aceito pelo parser Antigravity 2.0;
- não foram renomeadas tools nem migrado `commandExecutionPolicy` com base em suposição;
- não foram inventados MCP servers;
- discovery, tool names, hooks e smoke tests A1–A9 permanecem gate do Antigravity.

A próxima sessão Antigravity deve validar seus adapters contra o runtime realmente instalado e propor somente ajustes comprovados.


## Claude Code Cloud

**Estado:** adapter versionado nesta branch; ativação da conta/cloud ainda depende de ação humana.

Incluído:
- `CLAUDE.md` fino;
- nove subagentes Claude como projeções R1–R9;
- onze Skills-proxy;
- runtime registry tri-runtime;
- política cloud-first e guia de Routines.

Decisão de segurança:
- o grande stack de hooks locais do protótipo ZIP não é promovido integralmente;
- Routines não supervisionadas devem manter branch `claude/*`;
- Supabase deve ser project-scoped + read-only;
- Vercel com escrita não é conector unattended padrão.

O smoke test definitivo exige conectar o repositório à conta Claude Code web e executar uma sessão/routine real.
