# Metodologia de Orquestração e Memória de Missão — Claude Code / App Reflex 02

Este documento define como a sessão principal do Claude Code (o **orquestrador**) e os 9
subagentes em `.claude/agents/rflex-*.md` trabalham juntos usando um **documento de missão
compartilhado** como única forma de comunicação entre eles — em vez de cada um reportar de
volta só para o orquestrador e o histórico se perder.

## 1. Fundamentação (por que este desenho, e não outro)

Duas referências concretas sustentam este desenho:

1. **Padrão Blackboard** (arquitetura clássica de sistemas multiagente, retomada em vários
   sistemas LLM de 2025-2026): agentes não conversam diretamente entre si — eles leem e escrevem
   em um **estado compartilhado único** ("o quadro-negro"), e um controlador aciona o próximo
   agente relevante quando o estado muda. Isso evita que o contexto de "o que já foi decidido"
   dependa da memória de curto prazo de quem está orquestrando.
2. **Padrão Orquestrador-Worker**, o mesmo que a própria Anthropic usa no seu sistema de
   pesquisa multiagente: um agente líder planeja, aciona subagentes especializados com contexto
   isolado, e cada um devolve um resultado condensado. Um princípio central de lá se aplica
   diretamente aqui: *"o agente líder salva o plano na memória antes que o contexto se encha"* —
   ou seja, o plano e o progresso não podem existir só na cabeça do orquestrador, porque isso se
   perde. Precisam existir como texto persistente, em disco, no repositório.

Fontes consultadas (19/09/2026):
- [How Anthropic Built a Multi-Agent Research System](https://blog.bytebytego.com/p/how-anthropic-built-a-multi-agent)
- [Anthropic's Multi-Agent Research Architecture Explained](https://theaiengineer.substack.com/p/how-anthropic-built-multi-agent-deep)
- [Exploring Advanced LLM Multi-Agent Systems Based on Blackboard Architecture (arXiv 2507.01701)](https://arxiv.org/pdf/2507.01701)
- [6 Multi-Agent Orchestration Patterns for Production (2026)](https://beam.ai/agentic-insights/multi-agent-orchestration-patterns-production)

O que este projeto já fazia de parecido, e que reaproveitamos: o harness original (`.agents/`)
já tinha o conceito de **Task Packet** (o que o orquestrador manda) e **Output Contract** (o que
o especialista devolve), e A9 (`rflex-continuity-evidence`) já mantinha um "livro-razão de
evidências". A novidade aqui é tornar isso um **documento único, cumulativo e lido por todos**,
em vez de mensagens que só o orquestrador vê.

## 2. O que é um "Documento de Missão"

Um arquivo Markdown único em `claude-code/memoria/CC-XXXX.md`, criado a partir de
`claude-code/templates/TEMPLATE_MISSAO.md`, que funciona como o "quadro-negro" de uma missão:

- É a **única fonte de verdade** sobre o que já foi decidido, feito e encontrado nessa missão.
- É **cumulativo (append-only)**: ninguém edita ou apaga o que outro agente já escreveu — cada
  entrada é uma seção nova, assinada e datada, adicionada ao final.
- **Todo agente acionado nessa missão lê o documento inteiro antes de começar a trabalhar**, e
  **escreve sua própria seção nele antes de terminar** — é assim que um subagente "sabe" o que o
  agente anterior fez, sem depender do orquestrador repetir tudo na instrução.

## 3. Quando abrir um documento novo

- **Abre documento novo:** qualquer pedido que envolva mudança real de código, investigação
  técnica não trivial, criação de artefato (migration, componente, documento formal) ou
  qualquer tarefa que provavelmente vai envolver mais de um subagente.
- **Não abre documento novo:** perguntas conversacionais, esclarecimentos, ou pedidos triviais
  de leitura que não alteram nada e não precisam de handoff entre agentes.
- Uma mesma missão pode se estender por várias interações do usuário — o documento continua
  aberto (`Status: EM ANDAMENTO`) até ser formalmente encerrado (seção 6).

## 4. Ciclo de vida de uma missão, passo a passo

1. **Usuário faz um pedido de trabalho ao Claude Code (orquestrador).**
2. **Orquestrador abre `claude-code/memoria/CC-XXXX.md`** a partir do template, e escreve a
   primeira seção: o que entendeu do pedido, o plano, e quais subagentes pretende acionar e por
   quê (ver template, seção "Entrada do Orquestrador").
3. **Antes de acionar cada subagente**, o orquestrador escreve no documento o Task Packet
   daquele subagente (objetivo, arquivos-alvo, restrições, critério de saída) — e passa o
   caminho do documento de missão na instrução de invocação (`subagent_type` + prompt
   mencionando `claude-code/memoria/CC-XXXX.md`).
4. **O subagente, ao ser acionado, primeiro lê o documento de missão inteiro** (via `Read`) —
   assim tem ciência de tudo que já foi decidido e feito antes dele.
5. **O subagente executa a tarefa** dentro do seu escopo (definido em `.claude/agents/rflex-*.md`).
6. **Antes de terminar, o subagente acrescenta sua própria seção ao final do documento**
   (nunca edita as anteriores), seguindo o **formato de escrita do seu papel** — ver seção 5.
7. **O orquestrador lê a seção nova**, revisa o que foi feito, decide o próximo passo — próximo
   subagente, pedir mais informação ao usuário, ou encerrar — e escreve isso no documento antes
   de agir.
8. Repete os passos 3-7 até a missão estar completa.
9. **Encerramento** (seção 6): a última seção do documento resume o resultado final, atualiza
   `claude-code/memoria/INDICE.md`, e muda `Status` para `CONCLUÍDA` ou `BLOQUEADA`.

## 5. Formato de escrita — uma metodologia própria por agente

Cada subagente já tem, em `.claude/agents/rflex-*.md`, um **Contrato de Saída** (Output
Contract) com campos específicos do seu papel. A regra é simples: **a seção que o agente escreve
no documento de missão usa exatamente esses campos**, em prosa/bullets, não um resumo genérico.
Isso garante que cada agente registre o que é relevante para o seu domínio, não uma narrativa
solta.

| Agente | Campos obrigatórios na sua seção do documento de missão |
|---|---|
| `rflex-architect` | interpretação do pedido · plano · Task Packets emitidos · subagentes acionados e por quê · ADR (se houver) · parecer final |
| `rflex-product-design` | `component_spec` · `tokens_used` · `wcag_aa_compliance` · `interactive_states` · `risks` |
| `rflex-frontend` | `components_created` · `routes_impacted` · `typecheck_status` · `lint_status` · `bundle_impact` · `tests_passing` |
| `rflex-backend-supabase` | `schema_impact` · `migration_created` · `rls_impact` · `rollback_plan` · `performance_impact` · `tests` · `risks` |
| `rflex-ai-knowledge` | `model_or_prompt_changed` · `epistemic_impact` · `zod_schema_enforced` · `evals_run` · `milr_metric` · `amr_metric` · `estimated_cost` · `evidence` |
| `rflex-platform` | `ci_status` · `branch_status` · `secret_hygiene` · `deploy_status` · `evidence` |
| `rflex-qa-security` | `verdict` (PASS / PASS WITH CONDITIONS / FAIL / BLOCK RELEASE) · `tests_run` · `failures` · `security_findings` · `release_blockers` · `evidence` |
| `rflex-research-evolution` | `question` · `sources_evaluated` · `top_source` · `proposal` · `stop_reason` · `evidence` |
| `rflex-continuity-evidence` | `mission_id` · `report_issued` · `diff_reconciliation` · `divergences_detected` · `state_ledger_updated` · `recommended_next_mission` · `evidence` |

Toda seção, de qualquer agente, também traz obrigatoriamente:
- **Cabeçalho:** nome do agente, timestamp, número da rodada.
- **O que li antes de começar:** lista do que foi consultado (incluindo o próprio documento de
  missão e quaisquer arquivos/skills relevantes).
- **Evidência**, usando a mesma taxonomia já usada no projeto original:
  `[CONFIRMADO-CODIGO]` · `[CONFIRMADO-TESTE]` · `[CONFIRMADO-CI]` · `[CONFIRMADO-RUNTIME]` ·
  `[CONFIRMADO-EXTERNO]` · `[RELATADO]` · `[INFERIDO]` · `[PENDENTE]` · `[BLOQUEADO]`.

## 6. Regras invioláveis

1. **Append-only.** Nenhum agente edita ou apaga uma seção escrita por outro. Erros/correções
   viram uma nova seção, nunca uma reescrita silenciosa da história.
2. **Nada de "está pronto" sem evidência.** Toda afirmação de conclusão carrega sua tag
   `[CONFIRMADO-*]`; o que não foi verificado é `[RELATADO]` ou `[INFERIDO]`, nunca apresentado
   como fato.
3. **Bloqueio é uma seção, não um silêncio.** Se um agente não pode terminar, ele escreve
   `[BLOQUEADO]` com o motivo e devolve ao orquestrador — nunca finge que concluiu.
4. **Um documento por missão, um número sequencial (`CC-0001`, `CC-0002`, ...), sempre
   registrado em `claude-code/memoria/INDICE.md`.**
5. **O orquestrador é quem decide abrir e fechar o documento** — subagentes nunca abrem ou
   encerram uma missão sozinhos, só escrevem sua seção dentro de uma já aberta.

## 7. Limite honesto deste desenho

Assim como já registrado em `CLAUDE.md` §8: os subagentes rodam na mesma sessão/modelo do
Claude Code, não como processos isolados de verdade. O documento de missão resolve o problema
de **continuidade de contexto** entre chamadas (o que o padrão blackboard existe para resolver),
mas não cria isolamento de execução — quem impõe a ordem cronológica e decide o que cada agente
pode tocar continua sendo o orquestrador, através de `tools:` no frontmatter de cada subagente e
da disciplina de leitura/escrita descrita aqui.
