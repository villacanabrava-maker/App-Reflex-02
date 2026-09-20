# Current State — Reflex Agent OS V3

**Snapshot verificado:** 2026-09-20 — pós-merge de TP-RCMO-01 e pesquisa R8  
**Natureza:** bootstrap operacional; verificar live antes de decisões críticas.

## GitHub

- Repositório: `villacanabrava-maker/App-Reflex-02`
- Branch canônica: `main`
- Baseline funcional verificado antes desta reconciliação: `2df5940d43a5672ae9028a6b3e408a055af5ee1a` (PR #18).
- **HEAD live não é auto-referenciado neste arquivo**: deve ser consultado no GitHub no bootstrap, porque qualquer commit que atualize este snapshot cria um novo HEAD.
- Agent OS V3: **MERGED / PUBLISHED** via PR #15.
- Constituição Cognitiva V1 / RCMO: **MERGED / PUBLISHED** via PR #18.
- TP-RCMO-01 — Modelo canônico de entidades: **MERGED / PUBLISHED** via PR #22 (`9845a1e0d6fb9ea783b0b60c2cfd6fc61d1213ea`).
- Pesquisa R8 pós-Constituição: **MERGED / PUBLISHED** via PR #23 (`e4d40766a9d386b6bdabc50d9c43ab45dfcae15f`).
- TP-RCMO-02: PR #24 ativo em branch concorrente `feature/rcmo-02-legacy-reconciliation`; trabalho documental apenas, não integrar automaticamente.
- TP-RCMO-01H: issue #25 / branch `chatgpt/rcmo-01h-schema-hardening`, correção dos findings pós-review do PR #22.
- Issue #17: **CLOSED / COMPLETED**.
- PR #19: fechado como superseded após avanço de `main`; não integrar.
- PR #14: draft, antiga Wave 6; não integrar automaticamente.
- PR #8: documentação Claude antiga; revisar antes de integrar.

## Vercel

- Projeto: `app-reflex-02`
- Último deployment de produção verificado nesta reconciliação: `READY`.
- Deployment verificado: `dpl_CNQDEQ7PX4MAkwpwbpXL3V8aCqcu`.
- Target: production
- Branch: `main`
- SHA verificado do deployment: `e4d40766a9d386b6bdabc50d9c43ab45dfcae15f`
- Alias canônico: `app-reflex-02.vercel.app`
- **Deployment/SHA live atuais devem ser consultados na Vercel no bootstrap**; um merge documental posterior pode gerar novo deployment sem alterar o baseline funcional.

## Supabase

- Project ref: `xenapowdtfhdwcfthfrn`
- Estado: `ACTIVE_HEALTHY`
- PostgreSQL: 17
- Ledger `public._migrations`: 38
- Última entrada do ledger do app: `0038_production_readiness_hardening.sql`
- Histórico nativo Supabase e `public._migrations` são trilhas distintas e devem continuar sendo reconciliados separadamente.

### Snapshot cognitivo live

- obras: 1
- versões: 1
- documentos processados: 1
- seções: 20
- fragmentos: 47
- vetores: 47
- sínteses: 22
- características confirmadas: 0
- regras confirmadas: 0
- propostas de atualização: 23
- claims: 0
- claim provenance: 0
- memory events: 1
- dossiês V3.1: 0
- conceitos SKOS: 0
- relações SKOS: 0

## Advisors live observados em 2026-09-20

Security:
- 5 tabelas com RLS ativo e sem policy direta;
- 2 RPCs `SECURITY DEFINER` executáveis por `authenticated`;
- leaked-password protection desabilitada;
- opções MFA insuficientes.

Performance:
- 36 foreign keys sem covering index;
- 10 policies com `auth.*` reavaliado por linha;
- 46 índices sem uso observado no corpus atual;
- Auth DB connection strategy configurada por número absoluto.

Esses achados são diagnóstico. Não autorizam migrations corretivas automáticas.

## Estado do Agent OS V3

- [CONFIRMADO-CODIGO] R1–R9 e adapters OpenAI/Claude/Antigravity estão integrados em `main`.
- [CONFIRMADO-CI] PR #15 foi promovido após revisão independente e gates verdes.
- [CONFIRMADO-RUNTIME] control plane GitHub → router → human gate Antigravity foi smoke-testado na issue #16.
- [CONFIRMADO-CODIGO] missões `OPS-2026-09-19-AGENT-OS-V3` e `OPS-2026-09-20-TRI-RUNTIME-CLOUD` estão encerradas como `DONE`.
- [PENDENTE] pinagem de GitHub Actions por SHA completo e vínculo criptográfico de sessão de handoffs seguem como hardening residual; não bloqueiam o baseline atual.
- [PENDENTE] Routines Claude / Codex Cloud programático permanecem ativações opcionais de conta, não bloqueios da arquitetura atual.
- [BLOQUEADO] automação de escrita em produção permanece fora do padrão sem gate humano.

## Constituição Cognitiva V1 / RCMO

Missão `NEXT-COGNITIVE-CONSTITUTION-RCMO`: **DONE**.

- Issue âncora #17: closed/completed.
- PR #18: merged em `main` como `2df5940d43a5672ae9028a6b3e408a055af5ee1a`.
- [CONFIRMADO-CI] head final do PR: run `35499922714` PASS em validators, TypeScript, lint, testes e build.
- [CONFIRMADO-EXTERNO] R6 final completou no head congelado `cbdd8aae5b90b393d166cbe36600dfdd294b3a36` sem findings adicionais; quatro P1 anteriores foram fechados.
- [DECISÃO-HUMANA] gate de merge aprovado explicitamente.
- [CONFIRMADO-RUNTIME] Vercel produção está READY no SHA do merge.
- [CONFIRMADO-CODIGO] Golden Dataset V4 é aditivo ao V3; gates críticos de integridade não admitem waiver.
- [CONFIRMADO-CODIGO] Evidence Core exige convenção explícita de offset/normalização para compatibilidade Unicode code points ↔ UTF-16.
- [CONFIRMADO-CODIGO] lifecycle de RCMO é separado de `confirmed_authorial`; toda promoção autoral exige decisão humana explícita e auditável.

## Definição canônica de RCMO

**RCMO = Reflex Cognitive Method Object**: objeto cognitivo versionado, produzido por uma execução metodológica explícita sobre evidências ancoradas. RCMO é resultado analítico e não memória autoral confirmada.

Cadeia normativa:

`Source Version → Document Structure → Evidence Anchor/Annotation → Claim → Method Execution → RCMO → Proposal → Human Decision → Confirmed Authorial Projection`

Nenhuma etapa intermediária promove autoria automaticamente.

## Próxima frente

Estado reconciliado dos packets pós-Constituição:

- **TP-RCMO-01:** entregue via PR #22; o packet canônico deve permanecer `DONE`.
- **TP-RCMO-01H:** correção pós-review ativa na issue #25. Fecha oito findings Codex deixados abertos no PR #22 antes de qualquer implementação física.
- **TP-RCMO-02:** PR #24 ativo em runtime concorrente, com reconciliação de legado e plano expand-first apenas documental.
- **TP-RCMO-03+** permanecem não ativados.

### Gate obrigatório antes de migration/backfill

Mesmo que TP-RCMO-02 seja promovido documentalmente, nenhuma migration é autorizada até:
1. TP-RCMO-01H estar canônico;
2. invariantes `XEI-*` terem enforcement verificável no boundary futuro;
3. mapping/backfill ser reavaliado contra o schema endurecido;
4. R6 independente concluir no SHA final;
5. existir gate humano específico para a migration live.

Os findings pós-review que motivam TP-RCMO-01H cobrem: binding de decisões ao subject/tenant/outcome, promoção autoral de claims, provenance ancorada, versão de Method Definition, UUIDs de EntityRef, unidades de offset, corpo semântico de Annotation e abstention reason de Method Execution.

Migrations, replay/reprocessamento, cron Wave 6 e promoção automática de autoria permanecem bloqueados.

## R8 pós-tarefa

Task Packet `R8-2026-09-20-POST-CONSTITUTION-RESEARCH.json`: **DONE**, promovido via PR #23.

Resultados principais: conformance de Evidence Anchors Unicode code points ↔ UTF-16, recomendação de normalização NFC antes de hash/ancoragem, prevenção de snapshots stale e supply-chain pinning. As recomendações subsidiam TP-RCMO-02/03/04, mas não autorizam implementação automática.
