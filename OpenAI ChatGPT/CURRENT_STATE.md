# Estado Operacional Verificado — OpenAI ChatGPT

**Snapshot:** 2026-09-20 — pós-merge PR #18  
**Regra:** este arquivo é um bootstrap, não uma autoridade permanente. Verifique live antes de decisões críticas.

## GitHub

- Repositório: `villacanabrava-maker/App-Reflex-02`
- Branch canônica: `main`
- Baseline funcional verificado antes desta reconciliação: `2df5940d43a5672ae9028a6b3e408a055af5ee1a` (PR #18).
- **HEAD live não é persistido como auto-referência**: consultar GitHub no início de cada sessão.
- Agent OS V3: **MERGED / PUBLISHED** via PR #15.
- Constituição Cognitiva V1 / RCMO: **MERGED / PUBLISHED** via PR #18.
- Issue #17: **CLOSED / COMPLETED**.
- PR #19: fechado como superseded; não integrar.

PRs ainda relevantes:
- #14: draft Wave 6/MIS-0012; não integrar automaticamente.
- #8: documentação Claude antiga; revisar antes de integrar.

## Vercel

Último baseline funcional de produção verificado antes desta reconciliação:

- Projeto: `app-reflex-02`
- Deployment: `dpl_6t5hWLVZ67QTeBCxrcgY1R2THXTZ`
- Estado observado: `READY`
- SHA do baseline: `2df5940d43a5672ae9028a6b3e408a055af5ee1a`
- Branch: `main`
- URL canônica: `https://app-reflex-02.vercel.app`

**Deployment e SHA live atuais devem ser consultados na Vercel.** Nunca diagnosticar produção usando uma URL de preview ou um snapshot persistido sem reconciliar branch + SHA.

## Supabase live

Project ref: `xenapowdtfhdwcfthfrn`

- Estado: `ACTIVE_HEALTHY`
- PostgreSQL 17
- `public._migrations`: 38 entradas

### Dados atuais

- obras: 1
- versões de obra: 1
- documentos processados: 1
- seções: 20
- fragmentos: 47
- vetores: 47
- sínteses: 22
- claims V3.1: 0
- claim provenance: 0
- memory events: 1
- características confirmadas: 0
- regras confirmadas: 0
- propostas de atualização: 23
- dossiês V3.1: 0
- conceitos SKOS V3.1: 0
- relações SKOS V3.1: 0

O histórico retornado pelo Supabase MCP e o ledger interno `public._migrations` continuam usando representações distintas. Não executar `db push` cegamente.

## Advisors Supabase live

Verificados em 2026-09-20:
- Security: 5 tabelas com RLS ativo sem policy direta; 2 RPCs `SECURITY DEFINER` executáveis por `authenticated`; leaked-password protection desabilitada; MFA com poucas opções.
- Performance: 36 FKs sem covering index; 10 policies com `auth.*` reavaliado por linha; 46 índices sem uso observado; Auth DB connection strategy absoluta.

Não corrigir esses advisors automaticamente; entender modelo de acesso e carga real antes de qualquer migration.

## Estado funcional recente

Concluído:
- Reflex Agent Operating System V3 integrado à `main`;
- tri-runtime OpenAI / Claude Cloud / Antigravity sob R1–R9;
- control plane GitHub com handoff finito e smoke test real;
- Constituição Cognitiva V1 / RCMO integrada via PR #18;
- Golden Dataset V4 normativamente aditivo ao V3;
- lifecycle de RCMO separado de autoria confirmada;
- baseline funcional PR #18 foi verificado em produção no mesmo SHA de `main`; estado live posterior deve ser consultado.

## Missão OpenAI corrente

Nenhuma missão de implementação cognitiva foi ativada automaticamente após o fechamento de `NEXT-COGNITIVE-CONSTITUTION-RCMO`.

Missão concluída:
- Issue #17: closed/completed.
- PR #18: merged.
- Task Packet `NEXT-RCMO-TASK-PACKET.json`: `DONE`.

Próximo conjunto disponível:
- `docs/agent-system/missions/NEXT-RCMO-IMPLEMENTATION-TASK-PACKETS.md`.

A ativação de qualquer TP-RCMO-01..10 exige task packet/missão específica, ownership claro e gates proporcionais ao risco.

## Restrições vigentes

- migration live exige gate humano;
- reprocessamento/replay do corpus não está autorizado automaticamente;
- cron/replay Wave 6 não está reativado;
- promoção de autoria exige decisão humana explícita e auditável;
- merge/push direto em `main` exige gate humano;
- V4 não substitui V3: ambos devem permanecer verdes enquanto não houver substituição formal aprovada.

## Drift documental ainda histórico

Arquivos antigos podem conter referências ao App01/Rflex01, estado pré-deploy ou fases pré-Constituição. Código + runtime live prevalecem.
