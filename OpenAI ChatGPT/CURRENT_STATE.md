# Estado Operacional Verificado — OpenAI ChatGPT

**Snapshot:** 2026-09-20  
**Regra:** este arquivo é um bootstrap, não uma autoridade permanente. Verifique live antes de decisões críticas.

## GitHub

- Repositório: `villacanabrava-maker/App-Reflex-02`
- Branch canônica: `main`
- HEAD live verificado: `e95861c8c3355642d3e1b7946d40bc1fa6502c18`
- Agent OS V3: **MERGED / PUBLISHED** via PR #15.
- CI pós-merge: **PASS** (run `35498636333`, registrado na Control Room #16).
- Regra: obter novamente o HEAD live no início de cada nova sessão.

PRs ainda relevantes:
- #14: draft Wave 6/MIS-0012; não integrar automaticamente.
- #8: documentação Claude antiga; revisar antes de integrar.

## Vercel

Produção está ativa e reconciliada com `main`.

- Projeto: `app-reflex-02`
- Deployment de produção: `dpl_HeEpSbasPKtHFAHewQRcWJozPMBv`
- Estado: `READY`
- SHA: `e95861c8c3355642d3e1b7946d40bc1fa6502c18`
- Branch: `main`
- URL canônica: `https://app-reflex-02.vercel.app`

Nunca diagnosticar produção usando uma URL de preview sem reconciliar branch + SHA.

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

## Estado funcional recente

Concluído:
- Reflex Agent Operating System V3 integrado à `main`;
- tri-runtime OpenAI / Claude Cloud / Antigravity sob R1–R9;
- control plane GitHub com handoff finito e smoke test real;
- produção Vercel no mesmo SHA da `main`.

## Missão OpenAI corrente

`NEXT-COGNITIVE-CONSTITUTION-RCMO`

- Issue âncora: #17.
- Branch: `chatgpt/cognitive-constitution-v1`.
- Task Packet: `docs/agent-system/missions/NEXT-RCMO-TASK-PACKET.json`.
- Status do Task Packet: `REVIEW`.
- Próximo handoff: R6 independente.

Artefatos preparados:
- `docs/ia/PESQUISA_CONSTITUICAO_COGNITIVA_V1.md`;
- `docs/ia/CONSTITUICAO_COGNITIVA_V1.md`;
- `docs/adr/0004-constituicao-cognitiva-rcmo.md`;
- `docs/ia/GOLDEN_DATASET_V4_PLAN.md`;
- `docs/agent-system/missions/NEXT-RCMO-IMPLEMENTATION-TASK-PACKETS.md`.

Definição proposta:
**RCMO = Reflex Cognitive Method Object**, objeto cognitivo versionado produzido por um método explícito sobre evidências ancoradas. RCMO não é memória confirmada e não pode promover autoria sozinho.

## Restrições da missão

- nenhuma migration live;
- nenhum reprocessamento do corpus;
- nenhuma alteração em `src/**`;
- nenhum deploy manual;
- nenhum cron/replay Wave 6;
- nenhuma promoção automática de autoria.

## Drift documental ainda histórico

Arquivos antigos podem conter referências ao App01/Rflex01, estado pré-deploy ou Agent OS ainda em implantação. Código + runtime live prevalecem.
