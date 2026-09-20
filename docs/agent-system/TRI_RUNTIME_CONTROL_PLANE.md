# Tri-Runtime Control Plane — GitHub como plano de controle

## Topologia

```text
                           HUMANO
                 intenção + gates críticos
                              |
                              v
                         GITHUB
        source / Task Packets / PRs / CI / Evidence
              _________|___________
             /         |           \
            v          v            v
     OPENAI CLOUD   CLAUDE CLOUD   ANTIGRAVITY LOCAL
     ChatGPT/Codex  Code/Routines  2.0 / agy
          |             |             |
          +-------------+-------------+
                        |
                      R1-R9
                        |
                App Reflex 02
              /        |       \
          Supabase   Vercel    Browser
```

## Regra estrutural

Os três motores são **pares executores** da mesma Constituição. Nenhum runtime possui uma constituição própria.

“Supervisor” é um modo em que um runtime hospeda principalmente R1 + R9 para observar, rotear e reconciliar. Esse papel pode migrar entre runtimes.

## Roteamento por vantagem

- **Claude Cloud:** observação recorrente, GitHub-triggered supervision, tarefas cloud e mudanças em `claude/*`.
- **OpenAI/Codex:** arquitetura, implementação/revisão cloud, revisão automática de PR e, futuramente, Agents API para automação programática.
- **Antigravity local:** implementação e validação local, browser/IDE/CLI/MCP, inclusive com seis agentes físicos cobrindo R1-R9 conforme decisão humana.

Não duplicar trabalho apenas para “usar os três”.

## Independência R6

```text
Claude implementa       -> OpenAI ou Antigravity audita
OpenAI implementa       -> Claude ou Antigravity audita
Antigravity implementa  -> Claude ou OpenAI audita
```

CI automatizado é evidência adicional, não substitui auditoria lógica independente quando o risco exigir.

## Eventos

### GitHub
GitHub é o barramento primário da engenharia:
- PR opened/synchronize/ready;
- review/comment;
- CI/workflow result;
- release;
- issue/task quando configurado.

Claude Routines pode reagir nativamente aos eventos GitHub suportados. OpenAI pode reagir por Codex review, Codex Action ou Agents API. Antigravity local recebe handoff pelo repositório e é iniciado localmente.

### Supabase
Supabase **não é um quarto motor de IA**. Pode ser um barramento de eventos do produto:
- Database Webhooks;
- Queues;
- Cron;
- Edge Functions.

Use isso somente quando o evento nasce nos dados/produto. Eventos de engenharia permanecem preferencialmente no GitHub.

## Anti-loop

Nenhum runtime deve responder automaticamente ao commit gerado por outro runtime sem filtros.

Regras:
1. branches têm owner runtime;
2. bots/routines ignoram commits próprios;
3. uma missão possui um único owner de escrita por superfície;
4. handoff explícito antes de trocar owner;
5. merge e produção continuam gates humanos.
