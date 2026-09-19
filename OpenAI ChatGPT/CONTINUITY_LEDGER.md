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

## 2026-09-19 — Bootstrap live reconciliado e MIS-0012 iniciada
- [CONFIRMADO-CODIGO] `main` reconciliada no SHA `0c7f14c41be816ca023d8347984665db60fbc265`; CI do HEAD verde.
- [CONFIRMADO-RUNTIME] Vercel produção `app-reflex-02.vercel.app` em `READY`, mesmo SHA do baseline, HTTP 200; sem warnings/errors no deployment atual na janela consultada.
- [CONFIRMADO-RUNTIME] Supabase `xenapowdtfhdwcfthfrn` em `ACTIVE_HEALTHY`, com 38 migrations no ledger; snapshot observado: 1 usuário, 1 obra, 20 seções, 47 fragmentos, 47 vetores, 22 sínteses e 13 propostas de atualização.
- [CONFIRMADO-RUNTIME] buckets relevantes permanecem privados e limitados a 50 MB.
- [DRIFT-DOCUMENTAL] `docs/STATUS_PROJETO.md` ainda registrava Vercel adiada, domínio indefinido e 37 migrations; o status foi atualizado na branch da missão para refletir o live verificado.
- [CONFIRMADO-CODIGO] o aprendizado por edição já gera propostas com diff/evidência real e decisão humana, mas a confirmação de payload `dados_propostos.aprendizado` não materializa hoje a regra/metodologia correspondente; esse é um gap prioritário da Wave 6.
- [CONFIRMADO-CODIGO/RUNTIME] não há replay/scheduler noturno ativo; `pg_cron`/`pg_net` não estavam habilitados no snapshot verificado.
- [PLANO] criada a especificação normativa `docs/coordenacao/missoes/MIS-0012/TASK_PACKETS.md` na branch `chatgpt/mis-0012-wave6-spec`.
- [STOP-CONDITION] nenhuma migration da Wave 6, cron ou mutação de produção foi aplicada nesta abertura de missão.

