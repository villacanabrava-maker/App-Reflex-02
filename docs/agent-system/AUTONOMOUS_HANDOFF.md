# Autonomous Handoff — OpenAI ↔ Claude ↔ Antigravity

## Status

Contrato operacional do Reflex Agent OS V3 para coordenação entre runtimes.

GitHub é o plano de controle. Esta automação não autoriza merge em main, deploy de produção, migration live, purge físico ou alteração de secrets.

## Objetivo

Permitir que OpenAI e Claude trabalhem em sequência sem depender de copiar manualmente a conversa entre interfaces, e interromper explicitamente quando o trabalho precisar do Antigravity local ou de decisão humana.

## Unidade durável: issue-âncora

Cada missão autônoma usa uma issue GitHub como thread operacional. A issue contém objetivo, Task Packet, branch/SHA de baseline, acceptance criteria, resultados, Evidence, handoffs e human gates.

O chat não é o barramento. Issue + commits + PRs + CI são o registro durável.

## Envelope

O schema é docs/agent-system/schemas/handoff-event.schema.json.

Formato de comentário:

    [REFLEX-HANDOFF]
    {"mission_id":"COG-V1-001","target_runtime":"openai_cloud","next_runtime":"claude_cloud","issue_number":123,"branch":"chatgpt/cognitive-constitution-v1","sha":"...","hop":0,"max_hops":4,"prompt":"..."}

Somente comentários de usuário confiável/colaborador ou bots oficiais admitidos podem ser roteados.

## Estado finito

    READY
      -> RUNNING(runtime A)
      -> RESULT
         -> DONE -> HUMAN/PR GATE
         -> NEEDS_RUNTIME_B -> HANDOFF (hop + 1)
         -> NEEDS_ANTIGRAVITY -> HUMAN LOCAL GATE
         -> BLOCKED -> HUMAN

max_hops é no máximo 4. Isso impede Claude -> OpenAI -> Claude -> OpenAI indefinidamente.

## OpenAI Cloud

Para revisão de PR, a preferência é Codex GitHub Review automático configurado na conta/repositório.

Para handoff de missão, .github/workflows/reflex-agent-handoff.yml usa openai/codex-action@v1 em sandbox read-only nesta primeira versão. Não faz commit/push. O resultado volta para a issue-âncora. OPENAI_API_KEY entra somente como GitHub Secret.

## Claude Cloud

Para review automático, criar uma Claude Routine com GitHub trigger para PRs de head chatgpt/* e antigravity/*, sempre review-only.

Para handoff de missão, o workflow usa o API trigger da Routine.

Configuração:
- Repository variable CLAUDE_ROUTINE_URL
- Repository secret CLAUDE_ROUTINE_TOKEN

A Routine usa o prompt salvo em docs/agent-system/prompts/CLAUDE_HANDOFF_ROUTINE.md.

## Antigravity local

Antigravity não é fingido como runtime cloud.

Quando target_runtime=antigravity_local:
1. o workflow publica o prompt local na issue;
2. opcionalmente envia WhatsApp;
3. a automação para;
4. o usuário inicia o Antigravity;
5. Antigravity executa bootstrap/fetch e assume o Task Packet;
6. ao concluir, publica Evidence/PR e cria o próximo handoff GitHub.

Prompt base: docs/agent-system/prompts/ANTIGRAVITY_WAKE_PROMPT.md.

## WhatsApp

WhatsApp é canal de notificação, nunca fonte de verdade.

Configuração opcional via Twilio:
- TWILIO_ACCOUNT_SID
- TWILIO_API_KEY
- TWILIO_API_SECRET
- TWILIO_WHATSAPP_FROM
- TWILIO_WHATSAPP_TO
- TWILIO_WHATSAPP_CONTENT_SID

O Content Template deve estar aprovado para notificações iniciadas pelo sistema.

Modelo recomendado:

    Reflex 02: tarefa local pronta.
    Missão: {{1}}
    Branch: {{2}}
    SHA: {{3}}
    Abra o handoff: {{4}}

O prompt completo permanece na issue, não no WhatsApp.

## Anti-loop e ownership

1. hop <= max_hops <= 4.
2. OpenAI escreve somente em chatgpt/*.
3. Claude escreve somente em claude/*.
4. Antigravity escreve somente em antigravity/*.
5. Review pode ler qualquer branch, mas não tomar ownership dela.
6. Runtime não transforma review em merge.
7. Handoff não autoriza produção.
8. O mesmo mission_id preserva uma única issue-âncora.
9. Soluções concorrentes são reconciliadas por R1, não mescladas automaticamente.
10. SELF_REVIEW != INDEPENDENT_REVIEW.

## Activation checklist

GitHub:
- workflow presente em main;
- Actions habilitadas;
- issue-âncora por missão.

OpenAI:
- Codex Cloud conectado;
- Code Review automático recomendado;
- OPENAI_API_KEY somente para handoff via Codex Action.

Claude:
- Routine criada;
- App-Reflex-02 selecionado;
- GitHub connector incluído;
- Supabase/Vercel sem write unattended;
- API trigger criado;
- URL em variable e token em secret.

Antigravity:
- workspace local preservado;
- bootstrap canônico;
- git fetch antes de cada missão.

WhatsApp:
- sender aprovado;
- Content Template aprovado;
- secrets configurados;
- smoke test não produtivo.

## Definition of Done

A integração é operacional quando um smoke test prova:
1. OpenAI recebe handoff e publica resultado na issue.
2. OpenAI pode gerar handoff para Claude.
3. Claude recebe somente após o resultado OpenAI.
4. Claude publica resultado/Evidence e, se necessário, devolve ao OpenAI.
5. max_hops encerra a cadeia.
6. Antigravity gera human gate local.
7. WhatsApp, quando configurado, leva à issue correta.
8. nenhum teste faz merge/deploy/migration automaticamente.
