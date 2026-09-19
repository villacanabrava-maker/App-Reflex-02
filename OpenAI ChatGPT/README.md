# OpenAI ChatGPT — Camada de Continuidade, Operação e Inteligência do App Reflex 02

Esta pasta existe para que uma **nova conversa do ChatGPT, um agente Codex ou outro agente OpenAI** possa entrar neste repositório e reconstruir rapidamente o contexto operacional do projeto sem depender da memória de uma única conversa.

Ela **não substitui** o código, o banco, o GitHub, o Supabase, a Vercel, o `AGENTS.md` raiz ou a documentação canônica. Ela organiza essas fontes, ensina como verificá-las e registra continuidade com evidência.

## Objetivos

1. Reduzir perda de contexto entre conversas.
2. Ensinar a um agente OpenAI como operar neste repositório com segurança.
3. Separar fatos verificados, decisões humanas, hipóteses e histórico.
4. Tornar explícitos os conectores, ferramentas, Skills, papéis e limites disponíveis.
5. Preservar a metodologia de trabalho construída entre Usuário, ChatGPT e Antigravity.
6. Permitir que novas sessões atualizem o contexto sem transformar conversa em fonte de verdade.

## Regra de início

Antes de qualquer tarefa substancial, leia nesta ordem:

1. `../AGENTS.md`
2. `BOOTSTRAP.md`
3. `CURRENT_STATE.md`
4. `METHODOLOGY.md`
5. `PROJECT_MAP.md`
6. o workflow específico da tarefa em `workflows/`
7. o perfil especializado correspondente em `agents/`

Depois confirme o estado real no GitHub/Supabase/Vercel quando a tarefa depender deles.

## Estrutura

- `BOOTSTRAP.md` — protocolo de entrada em uma nova sessão.
- `CURRENT_STATE.md` — snapshot operacional verificado.
- `PROJECT_MAP.md` — mapa do código e dos domínios.
- `METHODOLOGY.md` — regras de trabalho, evidência e qualidade.
- `OPENAI_CAPABILITIES.md` — capacidades e limites de ChatGPT/Codex neste projeto.
- `ORCHESTRATION.md` — equipe virtual OpenAI O1–O9 e modos de orquestração.
- `DATABASE_MAP.md` — mapa atual do Supabase.
- `DEPLOYMENT_MAP.md` — GitHub ↔ Vercel ↔ runtime.
- `SECURITY_AND_SECRETS.md` — fronteiras de segurança.
- `CONTINUITY_LEDGER.md` — livro-razão resumido das mudanças verificadas.
- `DECISIONS.md` — decisões operacionais vigentes.
- `RESEARCH_SOURCES.md` — fontes externas oficiais usadas na metodologia.
- `agents/` — perfis especializados OpenAI.
- `workflows/` — procedimentos repetíveis.
- `skills/` — playbooks canônicos; as Skills auto-descobertas pelo Codex ficam em `../.agents/skills/openai-reflex-*` e apontam para estes playbooks.

## Princípio central

> **O contexto persistente do projeto não é a conversa. É o conjunto reconciliado de código, banco, runtime, decisões humanas e evidências versionadas.**

## Atualização desta pasta

Ao final de uma sessão que alterou o estado real do projeto:

1. reconciliar o HEAD de `main`;
2. conferir CI;
3. conferir Supabase/Vercel se afetados;
4. atualizar `CURRENT_STATE.md` apenas com fatos verificados;
5. acrescentar um registro compacto em `CONTINUITY_LEDGER.md`;
6. registrar decisões humanas novas em `DECISIONS.md`;
7. nunca registrar segredos, tokens, senhas, chaves ou transcrições integrais de conversa.

A pasta deve permanecer **curta, navegável, verificável e útil para bootstrap**.
