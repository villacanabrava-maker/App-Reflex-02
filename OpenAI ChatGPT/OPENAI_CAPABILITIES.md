# Capacidades OpenAI no Repositório

## AGENTS.md

O Codex lê `AGENTS.md` antes de trabalhar e combina instruções por escopo de diretório. O `AGENTS.md` raiz é a constituição inicial; esta pasta acrescenta continuidade específica.

## Skills

OpenAI Skills são workflows reutilizáveis definidos por `SKILL.md`.

Neste projeto:
- Skills existentes do harness ficam em `.agents/skills/**`;
- Skills específicas desta camada usam prefixo `openai-reflex-`;
- os playbooks detalhados ficam nesta pasta;
- um agente novo deve usar Skills em vez de reinventar processos repetitivos.

No Codex:
- listar Skills com `/skills`;
- invocar explicitamente com `$nome-da-skill` quando necessário;
- permitir invocação implícita somente para Skills com descrição precisa.

## Ferramentas e conectores

Dependendo da sessão, ChatGPT/Codex pode ter:
- GitHub;
- Supabase;
- Vercel;
- web;
- arquivos;
- navegador;
- shell/container;
- MCPs adicionais.

Regra: **descobrir capacidades reais antes de prometer ações**.

## GitHub

Usar para:
- HEAD/branches;
- commits;
- conteúdo;
- PRs;
- CI;
- diffs;
- sincronização de branches.

## Supabase

Usar para:
- schema;
- RLS;
- Auth;
- Storage;
- SQL;
- migrations;
- advisors;
- runtime de banco.

Toda tarefa de Supabase deve seguir a Skill oficial disponível na sessão.

## Vercel

Usar para:
- projetos;
- deployments;
- logs;
- runtime errors;
- build logs;
- aliases/domínios;
- reconciliação de SHA.

## Web

Usar principalmente para:
- documentação oficial atual;
- changelogs;
- issues conhecidos;
- pesquisa técnica baseada em fontes.

Para fatos sobre OpenAI, preferir fontes oficiais atuais.

## Multiagente

OpenAI Agents SDK suporta dois padrões úteis:
- **manager / agents-as-tools**: um agente mantém controle e chama especialistas;
- **handoffs**: o especialista assume a etapa.

Neste repositório, o padrão preferido para engenharia é **manager com especialistas delimitados**, pois um coordenador precisa reconciliar o resultado final com o estado do projeto.

## Guardrails

Tarefas com side effects devem tratar guardrails como gates:
- segredo;
- destructive SQL;
- force push;
- produção;
- cross-tenant;
- promoção de inferência a memória.

## Tracing / observabilidade

Quando houver Agents SDK em runtime, usar tracing para:
- model calls;
- tools;
- handoffs;
- guardrails;
- custom spans.

No trabalho de repositório, o equivalente mínimo é:
- diff;
- logs;
- CI;
- deployment;
- evidência.

## Codex nativo no projeto

O Codex atual suporta subagentes personalizados por projeto através de `.codex/agents/*.toml`. Neste repositório, os papéis `reflex_orchestrator`, `reflex_architecture`, `reflex_supabase`, `reflex_frontend`, `reflex_cognitive`, `reflex_qa`, `reflex_platform`, `reflex_research` e `reflex_continuity` correspondem aos perfis O1–O9.

A configuração `.codex/config.toml` usa aprovação `on-request`, sandbox `workspace-write`, login shell desativado e limite de concorrência. O arquivo só deve ser carregado em repositório confiável. Modelos não são fixados nos papéis para permitir herança da melhor configuração disponível na sessão.
