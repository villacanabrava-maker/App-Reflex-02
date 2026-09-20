# Livro-Razão de Continuidade OpenAI

Registre apenas eventos que mudaram o estado real do projeto. Não registrar transcrição integral de conversa.

## 2026-09-19 — Deploy inicial e hardening
- GitHub e Supabase reconciliados.
- dados antigos de teste limpos para recomeço controlado.
- projeto `app-reflex-02` criado na Vercel.
- aplicação publicada em `app-reflex-02.vercel.app`.
- hardening de production readiness aplicado.

## 2026-09-19 — Correção PDF serverless
Problema: `pdf-parse 2.x` falhava na Vercel com `Cannot transfer object of unsupported type`.

Correção:
- Node 22 LTS;
- remoção do caminho de worker;
- `pdf-parse@1.1.1` lazy-loaded;
- CI verde;
- PDF materializou 20 seções / 47 fragmentos.

## 2026-09-19 — Corpus autoral no Cérebro
- `SOURCE_INGESTED` no event ledger;
- UI separa corpus autoral de características derivadas;
- obra de teste retroalimentada no ledger.

## 2026-09-19 — Seleção de corpus
- obras autorais aparecem na aba Cérebro;
- usuário ativa/desativa quais obras participam;
- análise gera propostas, não promove inferências automaticamente.

## 2026-09-19 — Escopo explícito
- selecionar livro inteiro;
- selecionar capítulos/seções;
- selecionar fragmentos específicos;
- remover amostragem oculta;
- salvar proveniência;
- exibir fonte/evidências em Aprendizados.

HEAD associado: `d15fdf410e5c0c879196e66e3efba1f5541f7349`

## 2026-09-19 — Preview antigo confundido com produção
Um preview antigo exibiu erro do analisador legado. Diagnóstico reconciliou URL → deployment → branch → SHA. A branch de preview foi sincronizada com `main`.

Regra permanente: sempre reconciliar URL/branch/SHA antes de diagnosticar Vercel.

## 2026-09-19 — Integração nativa Codex O1–O9
- camada OpenAI revisada contra documentação oficial atual de AGENTS.md, configuração, subagentes, Skills e Agents SDK;
- adicionada configuração de projeto Codex com aprovação on-request e sandbox controlado;
- adicionados 9 papéis nativos em .codex/agents, espelhando O1–O9 com menor privilégio;
- adicionadas Skills de entrega de feature, pesquisa baseada em evidência e verificação de release;
- continuidade continua proibindo segredos, transcrições integrais e chain-of-thought.


### Evidência de fechamento
- PR #12 mesclado no `main`;
- release commit: `6ad983c7d57d51c6bd34c66713fdd3c8bee03141`;
- CI run `35454339376`: success;
- Vercel production deployment `dpl_FAGKTxzRLcwv5E62oLyWfCjniyVX`: READY e associado ao mesmo SHA.

## 2026-09-19 — Reflex Agent OS V3 iniciado
- [CONFIRMADO-CODIGO] `main` reconciliada em `0c7f14c41be816ca023d8347984665db60fbc265`; CI verde.
- [CONFIRMADO-RUNTIME] Supabase `ACTIVE_HEALTHY`, 38 entradas no ledger e 23 propostas no snapshot.
- [CONFIRMADO-RUNTIME] Vercel produção `READY`, deployment `dpl_BvVod4yTYvEpfxT6cGXdTzxoYvEa`, mesmo SHA da `main`.
- [CONFIRMADO-EXTERNO] documentação oficial atual do Codex confirma AGENTS.md hierárquico, config project-scoped, subagentes TOML, MCP e controles de sandbox/aprovação.
- [CONFIRMADO-CODIGO] branch `chatgpt/reflex-agent-os-v3` criada para consolidar R1–R9 e validadores determinísticos.
- [PENDENTE] auditoria R6, CI final e reconciliação R9.
- [BLOQUEADO] nenhuma migration live, deploy manual ou reforma cognitiva está autorizada por esta missão.

## 2026-09-20 — Consolidação tri-runtime cloud
- [DECISÃO-HUMANA] operar Claude Code prioritariamente em cloud/web conectado ao GitHub.
- [DECISÃO-HUMANA] manter Antigravity local com seis agentes físicos; R1–R9 continuam funções canônicas.
- [CONFIRMADO-EXTERNO] Claude Code Routines suportam schedule, API e eventos GitHub e rodam em infraestrutura cloud; são research preview.
- [CONFIRMADO-EXTERNO] Codex Cloud suporta trabalho cloud ligado ao GitHub e revisão automática/manual de PRs; Agents API suporta sessões assíncronas, MCP e webhooks.
- [CONFIRMADO-EXTERNO] Supabase oferece MCP project-scoped/read-only, Cron, Database Webhooks, Queues e Edge Functions; foi classificado como infraestrutura/event bus, não quarto motor.
- [CONFIRMADO-CODIGO] commit `e755b21075f913b8f37e25c20c81dc4b417adb17` adicionou Claude Cloud ao Agent OS V3 sem tocar em `src/**` ou `supabase/**`.
- [CONFIRMADO-CI] run `35488842913` passou validators, TypeScript, lint, testes e build.
- [PENDENTE] setup humano da conta Claude Code web/Routines e Codex Cloud.
- [PENDENTE] smoke test local dos seis agentes Antigravity e auditoria R6 independente.

## 2026-09-20 — Convergência Claude + Codex + Antigravity
- [CONFIRMADO-EXTERNO] Codex review do commit `ffca46f` encontrou secret scan, Skills Claude, branch ownership e Evidence schema.
- [RELATADO] Claude Cloud e Antigravity 2.0 emitiram `PASS WITH CONDITIONS` convergente nesses pontos.
- [DECISÃO-ARQUITETURAL] somente cobertura R1-R9 é canônica; contagem física do Antigravity é estado do adapter/runtime.
- [PENDENTE-HUMANO] proposta Antigravity de acionar R8 obrigatoriamente após toda tarefa não foi promovida sem confirmação humana explícita.
- [CONFIRMADO-CODIGO] hardening incorpora findings convergentes e bloqueios Antigravity de TRUNCATE/DISABLE RLS.



## 2026-09-20 — Agent OS V3 integrado e publicado
- [CONFIRMADO-CODIGO] PR #15 foi integrado em `main`; merge commit `e95861c8c3355642d3e1b7946d40bc1fa6502c18`.
- [CONFIRMADO-CI] Control Room #16 registra CI pós-merge run `35498636333` como PASS.
- [CONFIRMADO-RUNTIME] Vercel production `dpl_HeEpSbasPKtHFAHewQRcWJozPMBv` está `READY`, branch `main`, mesmo SHA.
- [CONFIRMADO-RUNTIME] smoke test `OPS-SMOKE-TRI-RUNTIME` validou GitHub → router → human gate Antigravity.
- [DECISÃO] GitHub permanece o plano de controle durável dos três runtimes.

## 2026-09-20 — Constituição Cognitiva V1 iniciada
- [CONFIRMADO-CODIGO] issue #17 criada para `NEXT-COGNITIVE-CONSTITUTION-RCMO`.
- [CONFIRMADO-CODIGO] branch `chatgpt/cognitive-constitution-v1` criada sobre `e95861c8c3355642d3e1b7946d40bc1fa6502c18`.
- [CONFIRMADO-RUNTIME] baseline Supabase: 1 obra, 20 seções, 47 fragmentos, 47 vetores, 22 sínteses, 0 claims, 0 claim provenance, 0 características, 0 regras, 23 propostas e 1 memory event.
- [CONFIRMADO-EXTERNO] R8 pesquisou Web Annotation, PROV-O, SKOS, Claimify, FActScore, RAGAS e literatura de abstention para fundamentar a especificação.
- [CONFIRMADO-CODIGO] foram preparados Constituição Cognitiva V1, ADR-0004, plano Golden Dataset V4 e Task Packets TP-RCMO-01..10.
- [DECISÃO-ARQUITETURAL-PROPOSTA] RCMO significa `Reflex Cognitive Method Object`: resultado analítico versionado de método explícito sobre evidência ancorada; não é memória autoral confirmada.
- [CONFIRMADO-CI] PR #18 no head `cbc5bad3e86b2006d9d1ca6f9c87f0f8a14a4ced`: run `35499414793` PASS em validators, TypeScript, lint, testes e build; preview Vercel READY.
- [CONFIRMADO-CODIGO] reconciliação com `0031_claims_ledger.sql` detectou drift de nomenclatura em documentos V3.1 históricos; o enum físico versionado foi declarado canônico e o lifecycle de RCMO foi separado de `confirmed_authorial`.
- [CONFIRMADO-RUNTIME] advisors Supabase: 5 RLS sem policy, 2 SECURITY DEFINER autenticadas, 36 FKs sem covering index, 10 auth-RLS initplan e 46 índices sem uso observado; sem correção automática nesta missão.
- [PENDENTE] revisão independente R6 do novo head após hardening conceitual.
- [BLOQUEADO] sem migration live, `src/**`, reprocessamento, cron/replay ou promoção automática de autoria nesta missão.


## 2026-09-20 — Primeiro R6 do PR #18 e fechamento de findings
- [CONFIRMADO-EXTERNO] Codex R6 revisou o head `cbc5bad3e86b2006d9d1ca6f9c87f0f8a14a4ced` e abriu 4 findings P1.
- [CONFIRMADO-CODIGO] finding de independência: TP-RCMO-09 passou a ter R5+R7 como implementadores e R6 somente como reviewer independente.
- [CONFIRMADO-CODIGO] finding de compatibilidade: Golden Dataset V4 foi declarado estritamente aditivo; V3 + V4 permanecem obrigatórios até substituição formal aprovada.
- [CONFIRMADO-CODIGO] finding de waivers: MILR, AMR, tenant leakage, forbidden use, prompt injection e promoção epistêmica indevida são gates críticos não renunciáveis.
- [CONFIRMADO-CODIGO] finding de autoria: C10 passou a exigir decisão humana explícita e auditável para toda promoção a memória autoral confirmada, sem exceção por domínio/método.
- [PENDENTE] novo CI, preview e nova revisão R6 do head pós-correções.


## 2026-09-20 — R8 valida semântica de offsets do Evidence Core
- [CONFIRMADO-EXTERNO] W3C Web Annotation define TextQuoteSelector com exact/prefix/suffix e TextPositionSelector com posições contadas em Unicode code points.
- [CONFIRMADO-CODIGO] legado V3.1 do Reflex documenta spans em UTF-16/JavaScript; os espaços de coordenadas não são tratados como equivalentes.
- [CONFIRMADO-CODIGO] Constituição, pesquisa, Golden V4 e TP-RCMO-04 passaram a exigir `offset_unit`/normalização explícitos e testes de conversão com emoji/caracteres suplementares.
- [PENDENTE] novo CI/preview e R6 final sobre o head que contém essa reconciliação.


## 2026-09-20 — R8 corrige referência de abstention
- [CONFIRMADO-EXTERNO] o paper “Do LLMs Know When to NOT Answer?” está em ACL Anthology `2025.coling-main.627`; a referência `.368` usada na primeira redação estava incorreta.
- [CONFIRMADO-EXTERNO] o survey TACL `2025.tacl-1.26` reforça abstention como capacidade de confiabilidade com métodos, benchmarks e métricas próprios.
- [CONFIRMADO-CODIGO] a pesquisa R8 foi corrigida antes do gate final; nenhuma decisão arquitetural depende da referência errada.


## 2026-09-20 — Constituição Cognitiva V1 integrada e missão encerrada
- [CONFIRMADO-CODIGO] PR #18 foi promovido por squash para `main` como `2df5940d43a5672ae9028a6b3e408a055af5ee1a`.
- [CONFIRMADO-CI] run `35499922714` no head final do PR passou validators, TypeScript, lint, testes e build.
- [CONFIRMADO-EXTERNO] Codex R6 final completou sobre `cbdd8aae5b90b393d166cbe36600dfdd294b3a36` sem findings adicionais; quatro P1 anteriores foram corrigidos e resolvidos.
- [DECISÃO-HUMANA] gate de merge da Constituição Cognitiva V1 foi aprovado explicitamente.
- [CONFIRMADO-RUNTIME] Vercel produção `dpl_6t5hWLVZ67QTeBCxrcgY1R2THXTZ` ficou READY em `main@2df5940d...`.
- [CONFIRMADO-CODIGO] issue #17 foi fechada como completed; `NEXT-RCMO-TASK-PACKET.json` deve permanecer `DONE`.
- [CONFIRMADO-CODIGO] PR #19 foi fechado como superseded porque ficou não mergeável e seu snapshot de CURRENT_STATE regrediria o estado cognitivo pós-PR #18.
- [BLOQUEADO] a conclusão da especificação não ativa automaticamente migrations, corpus replay/reprocessamento, cron Wave 6 ou promoção autoral.
- [PENDENTE] implementação RCMO permanece apenas como conjunto de task packets disponíveis, sem missão ativada.
