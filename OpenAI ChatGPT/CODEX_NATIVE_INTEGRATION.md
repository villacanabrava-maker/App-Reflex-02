# Integração Nativa com Codex

Esta camada transforma a documentação de continuidade em recursos que o Codex consegue descobrir e aplicar diretamente quando o repositório está marcado como confiável.

## Descoberta de instruções
O Codex lê AGENTS.md ao iniciar uma tarefa e aplica instruções por escopo de diretório. O arquivo raiz continua sendo a constituição geral. A pasta OpenAI ChatGPT/ aprofunda o contexto de continuidade OpenAI.

## Configuração de projeto
.codex/config.toml define defaults conservadores: approval on-request, sandbox workspace-write, login shell desativado e até 6 threads de subagentes por sessão. O arquivo só deve ser carregado em repositório confiável.

## Papéis nativos
- reflex_orchestrator — O1
- reflex_architecture — O2
- reflex_supabase — O3
- reflex_frontend — O4
- reflex_cognitive — O5
- reflex_qa — O6
- reflex_platform — O7
- reflex_research — O8
- reflex_continuity — O9

Papéis de arquitetura, QA e pesquisa são read-only. Implementadores usam workspace-write. Nenhum papel contém segredo ou credencial.

## Padrão de orquestração
Preferir manager + especialistas para engenharia cross-domain: O1 confirma baseline e decompõe; especialistas exploram/implementam; O6 audita; O7 verifica CI/runtime; O9 persiste continuidade verificada.

## Skills
Skills são workflows reutilizáveis, não dumps de contexto. Os entrypoints de descoberta ficam em .agents/skills/openai-reflex-*/SKILL.md e os playbooks canônicos em OpenAI ChatGPT/skills/.

## Limite de continuidade
Persistir decisões humanas, estado live verificado, diffs/commits, testes/CI, problemas conhecidos, fontes e próximos passos. Não persistir segredos, tokens, cookies, dados pessoais desnecessários, chain-of-thought ou conjecturas como fatos.

## Validação
Executar: node "OpenAI ChatGPT/scripts/validate-context.mjs" antes de concluir mudanças nesta camada.
