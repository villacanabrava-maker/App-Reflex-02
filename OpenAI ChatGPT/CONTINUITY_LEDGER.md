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
