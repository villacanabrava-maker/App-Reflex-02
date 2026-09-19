# claude-code/ — Ambiente de Orquestração e Memória do Claude Code

Esta pasta existe porque o App Reflex 02 já tinha um harness multiagente completo
(`.agents/`, escrito para o Antigravity), mas o Claude Code precisava do seu próprio ambiente
para: (1) subagentes que ele reconhece nativamente, (2) uma metodologia de trabalho explícita
para orquestrar esses subagentes, e (3) uma **memória compartilhada e persistente** entre eles,
para que um subagente acionado depois de outro saiba exatamente o que já foi decidido e feito.

Nome escolhido em minúsculas com hífen (`claude-code/`, não `Claude Code/`) para seguir a
convenção do resto do repositório (`docs/`, `src/`, `supabase/`) e evitar problemas de espaço
em caminho em scripts/CI — o conteúdo e a função são exatamente o que foi pedido.

## O que fica onde

| Caminho | O que é |
|---|---|
| `.claude/agents/rflex-*.md` | As definições reais dos 9 subagentes que o Claude Code carrega (formato nativo). |
| `claude-code/METODOLOGIA.md` | **O documento central.** Explica o padrão de orquestração (blackboard + orquestrador-worker), o ciclo de vida de uma missão e o formato de escrita de cada agente. |
| `claude-code/templates/TEMPLATE_MISSAO.md` | Modelo em branco para abrir um novo documento de missão. |
| `claude-code/memoria/CC-XXXX.md` | Os documentos de missão de fato — um por missão, escritos a várias mãos pelo orquestrador e pelos subagentes acionados. |
| `claude-code/memoria/INDICE.md` | Índice de todas as missões (status, data, agentes envolvidos). |

## Como isso se relaciona com o resto do repositório

- `.agents/` (Antigravity) e `docs/coordenacao/` (protocolo tripartite Usuário↔ChatGPT↔Antigravity)
  **continuam existindo e não são afetados** — são de outra ferramenta, com seu próprio livro-razão
  (`AG-XXXX.md`/`CG-XXXX.md`).
- `claude-code/` é o equivalente funcional disso, mas para quando **o Claude Code** é quem está
  trabalhando no repositório. Se uma missão do Claude Code for relevante para o histórico geral
  do projeto, o orquestrador pode opcionalmente resumi-la também em `docs/coordenacao/` — isso é
  uma decisão pontual, não é automático.

## Por onde começar

Leia `claude-code/METODOLOGIA.md` — ele descreve o ciclo completo. Este README é só o mapa.
