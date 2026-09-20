# Current State — Reflex Agent OS V3

**Snapshot verificado:** 2026-09-20 02:46 BRT  
**Natureza:** bootstrap operacional; verificar live antes de decisões críticas.

## GitHub

- Repositório: `villacanabrava-maker/App-Reflex-02`
- Branch canônica: `main`
- HEAD: `e95861c8c3355642d3e1b7946d40bc1fa6502c18`
- CI do HEAD: verde (run 35498636333).
- PR #15: MERGED (`infra: consolidate Reflex Agent Operating System V3`).
- Branch ativa de trabalho: `feature/cognitive-constitution-rcmo`.
- Branch protection: não ativa no snapshot.
- PR #14: draft, antiga Wave 6, não integrar automaticamente.
- PR #8: aberto, documentação Claude; revisar antes de integrar.

## Vercel

- Projeto: `app-reflex-02`
- Produção: `READY`
- Deployment: `dpl_BvVod4yTYvEpfxT6cGXdTzxoYvEa`
- Target: production
- Branch: `main`
- SHA: `0c7f14c41be816ca023d8347984665db60fbc265`
- Alias canônico: `app-reflex-02.vercel.app`

## Supabase

- Project ref: `xenapowdtfhdwcfthfrn`
- Estado: `ACTIVE_HEALTHY`
- PostgreSQL: 17
- Ledger `public._migrations`: 38
- Última entrada: `0038_production_readiness_hardening.sql`

### Snapshot de dados

- obras: 1
- versões: 1
- documentos processados: 1
- seções: 20
- fragmentos: 47
- vetores: 47
- sínteses: 22
- evidências: 0
- características confirmadas: 0
- regras confirmadas: 0
- propostas de atualização: 23
- claims: 0
- claim provenance: 0
- memory events: 1

## Advisors observados

Security Advisor:
- 5 tabelas com RLS ativo e sem policy direta;
- 2 RPCs `SECURITY DEFINER` executáveis por `authenticated`;
- leaked-password protection desabilitada;
- poucas opções MFA.

Performance Advisor:
- foreign keys sem covering index;
- policies com chamadas de `auth.*` reavaliadas por linha;
- índices ainda não utilizados no corpus pequeno atual.

Esses achados são diagnóstico, não autorização de correção automática.

## Drift documental confirmado

- `docs/STATUS_PROJETO.md` ainda declarava 37 migrations e Vercel adiada.
- Drift histórico de Vercel em `GEMINI.md` e `.agents/README.md` foi corrigido na branch Agent OS V3.
- `OpenAI ChatGPT/CURRENT_STATE.md` registrava 13 propostas; live possui 23.

## Missão corrente

`NEXT-COGNITIVE-CONSTITUTION-RCMO` (`TP-RCMO-00`): Pesquisar e especificar a Constituição Cognitiva V1 / RCMO antes de reconstruir o pipeline documental ou o Cérebro Autoral.
- Precedente concluído: `OPS-2026-09-19-AGENT-OS-V3` / PR #15 mesclado na `main`.


## Consolidação tri-runtime

- [DECISÃO-HUMANA] Claude Code será operado prioritariamente na nuvem ligado ao GitHub.
- [DECISÃO] Antigravity permanece local; R1–R9 são funções canônicas e a contagem física de agentes é estado do adapter, não invariante constitucional.
- [CONFIRMADO-CODIGO] branch `chatgpt/reflex-agent-os-v3` prepara um terceiro adapter Claude sem alterar `src/**` ou migrations.
- [RELATADO] Claude Code Web está conectado e ativo no repositório; Routines/API ainda dependem de configuração de conta e least privilege.
- [CONFIRMADO-RUNTIME] Codex GitHub Review está habilitado no repositório e revisou o PR #15 em múltiplos heads.
- [RELATADO] auditoria Antigravity de 20/09/2026 smoke-testou nove definições locais; isso não altera R1–R9 como funções canônicas.
- [CONFIRMADO-CI] run `35491921248` passou validators, TypeScript, lint, testes e build no head `43df55c` antes do último hardening residual.
- [BLOQUEADO] automação de escrita em produção continua fora de escopo.
