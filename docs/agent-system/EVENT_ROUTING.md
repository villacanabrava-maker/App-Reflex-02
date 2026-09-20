# Event Routing — Reflex Tri-Runtime

## Objetivo

Definir **quem acorda quando** sem criar loops nem três coordenadores concorrentes.

GitHub continua sendo o plano de controle da engenharia. Supabase pode originar eventos do produto/dados.

## Matriz

| Evento | Claude Cloud | OpenAI Cloud | Antigravity local | Regra |
|---|---|---|---|---|
| PR aberto/atualizado | Routine GitHub | Codex auto/manual review | sob handoff local | revisão paralela read-only é permitida |
| PR pronto para revisão | Routine filtrada | Codex R6 recomendado | A7/R6 local opcional | implementador não é único auditor |
| CI falhou | via PR trigger ou futura Routine API chamada por GitHub | Codex Action/Agents API futuramente | handoff local quando necessário | primeiro diagnosticar, depois corrigir |
| Release | Routine GitHub | GitHub Action/Agents API quando configurado | observação local opcional | não promover produção automaticamente |
| Drift agendado | Routine schedule | Agents API via scheduler futuro | não obrigatório | leitura + PR documental, sem produção |
| Incidente Vercel | Routine API futura/read-only | Agents API futura | R7 local | correlacionar deployment/branch/SHA/log |
| Evento de banco/produto | Supabase webhook/queue -> Routine/API | Supabase webhook/queue -> Agents API | handoff local | usar Supabase somente quando o evento nasce no produto |
| Pedido humano | pode receber missão | pode receber missão | pode receber missão | R1 escolhe o menor conjunto útil |

## Envelope de evento recomendado

Qualquer integração programática futura deve transportar somente metadados necessários:

```json
{
  "event_id": "provider-id-or-hash",
  "source": "github|supabase|vercel|human",
  "event_type": "pull_request.synchronize",
  "repository": "villacanabrava-maker/App-Reflex-02",
  "sha": "...",
  "pr_number": 15,
  "mission_id": "...",
  "owner_runtime": "claude_cloud|openai_cloud|antigravity_local|human",
  "allowed_actions": ["read", "review", "branch_write"],
  "idempotency_key": "..."
}
```

Não colocar secrets, conteúdo sensível desnecessário ou instruções não confiáveis como autoridade.

## Anti-loop

1. Cada evento possui `event_id` e `idempotency_key`.
2. Runtime ignora evento causado pelo próprio bot/branch quando não há handoff explícito.
3. Branch identifica ownership: `claude/*`, `chatgpt/*`, `antigravity/*`.
4. Um runtime não edita a branch de outro em automação não supervisionada.
5. Mudança de owner exige handoff registrado.
6. Eventos de CI não autorizam merge.
7. Eventos de produção não autorizam mutação de produção.
8. Rate limits/debounce são obrigatórios antes de ligar triggers amplos.

## Fases

### Fase A — agora
- CI existente;
- Claude Routine em PR, depois do setup humano;
- Codex review em PR;
- Antigravity por handoff local.

### Fase B — control plane versionado; ativação por credenciais
- workflow `reflex-agent-handoff.yml` recebe workflow_dispatch, repository_dispatch e comentários [REFLEX-HANDOFF];
- OpenAI executa via Codex GitHub Action em sandbox read-only;
- Claude executa via Routine API quando URL/token forem configurados;
- Antigravity interrompe a cadeia em human gate local;
- WhatsApp é notificação opcional para esse human gate;
- hop/max_hops limita a cadeia a no máximo quatro transições.

Detalhes: `docs/agent-system/AUTONOMOUS_HANDOFF.md`.

### Fase C — eventos do produto
- Supabase Database Webhooks / Queues;
- Edge Function valida evento e escopo;
- dispara runtime apropriado;
- resultado volta ao GitHub como issue/PR/evidence quando for engenharia.

Não usar Supabase para substituir GitHub na coordenação de código.
