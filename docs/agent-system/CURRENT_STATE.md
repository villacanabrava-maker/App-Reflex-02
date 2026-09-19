# Current State — Reflex Agent OS V3

**Snapshot verificado:** 2026-09-19 19:22 BRT  
**Natureza:** bootstrap operacional; verificar live antes de decisões críticas.

## GitHub

- Repositório: `villacanabrava-maker/App-Reflex-02`
- Branch canônica: `main`
- HEAD: `0c7f14c41be816ca023d8347984665db60fbc265`
- CI do HEAD: verde.
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
- `GEMINI.md` ainda declarava Vercel adiada.
- `.agents/README.md` ainda classificava observabilidade Vercel como futura.
- `OpenAI ChatGPT/CURRENT_STATE.md` registrava 13 propostas; live possui 23.

## Missão corrente

`OPS-2026-09-19-AGENT-OS-V3`: consolidar a camada runtime-neutral e alinhar adapters sem reformar o Cérebro do produto.
