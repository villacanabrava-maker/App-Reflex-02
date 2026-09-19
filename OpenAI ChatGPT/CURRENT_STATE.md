# Estado Operacional Verificado — OpenAI ChatGPT

**Snapshot:** 2026-09-19 11:40 BRT  
**Regra:** este arquivo é um bootstrap, não uma autoridade permanente. Verifique live antes de decisões críticas.

## GitHub

- Repositório: `villacanabrava-maker/App-Reflex-02`
- Branch canônica: `main`
- HEAD verificado: `d15fdf410e5c0c879196e66e3efba1f5541f7349`
- Commit: `feat: explicit books chapters and fragments scope for Brain analysis`
- GitHub Actions no HEAD: run #52, `success`

A `main` não possui branch protection ativa no momento do snapshot.

## Vercel

Produção está **ativa**. Documentos antigos que ainda dizem “Vercel fora de escopo” estão desatualizados em relação ao runtime atual.

- Projeto: `app-reflex-02`
- Produção READY: `dpl_HuW7bHM6vAYJuyeJV3gDZrW9J9mq`
- SHA da produção: `d15fdf410e5c0c879196e66e3efba1f5541f7349`
- Branch: `main`
- URL canônica: `https://app-reflex-02.vercel.app`

Há previews imutáveis antigos. Nunca diagnosticar produção usando uma URL de preview sem reconciliar branch + SHA.

## Supabase live

Project ref: `xenapowdtfhdwcfthfrn`

### Dados atuais

- usuários Auth: 1
- obras: 1
- versões de obra: 1
- documentos processados: 1
- seções: 20
- fragmentos: 47
- vetores: 47
- sínteses: 22
- evidências de dimensão confirmadas: 0
- claims V3.1: 0
- memory events: 1
- características confirmadas do Cérebro: 0
- regras confirmadas: 0
- propostas de atualização: 13
- reflexões: 0
- dossiês V3.1: 0
- auditorias V3.1: 0
- conceitos SKOS V3.1: 0

### Obra de teste atual

Existe uma obra autoral processada derivada do teste “Pequeno Grande Príncipe…”, com 20 seções e 47 fragmentos. O fluxo do Cérebro permite:
- ativar/desativar a obra no corpus autoral;
- selecionar explicitamente livro inteiro, capítulos/seções ou fragmentos;
- gerar características candidatas;
- revisar evidências antes da confirmação.

### Storage

Buckets privados:
- `originais-biblioteca` — 50 MB
- `fontes-reflexoes` — 50 MB

## Migrations

O repositório contém **38 arquivos SQL versionados**, `0001`–`0038`.

O histórico retornado pelo Supabase MCP e o ledger interno `public._migrations` não usam exatamente a mesma numeração/representação histórica. Não executar `db push` cegamente. Reconciliar antes de qualquer migration.

## Segurança / advisors atuais

Supabase Database Linter reporta:
- tabelas internas com RLS ativo e sem policies diretas;
- duas RPCs de curadoria humana `SECURITY DEFINER` executáveis por `authenticated`;
- leaked-password protection desabilitado;
- MFA com poucas opções;
- FKs sem índices e índices ainda não usados.

Não “corrigir” advisors automaticamente. Primeiro entender modelo de acesso e queries reais.

## Estado funcional recente

Concluído recentemente:
- correção de extração PDF na Vercel usando `pdf-parse@1.1.1` sem worker;
- integração de obra autoral processada ao ledger episódico do Cérebro;
- seletor de corpus autoral ativo;
- análise segura por propostas, sem promoção automática de inferência;
- seleção explícita do escopo da análise por livro/capítulo/fragmento;
- exibição de proveniência/evidências no fluxo de Aprendizados;
- sincronização de branch de preview antiga com a `main`.

## Drift documental conhecido

Alguns arquivos históricos ainda declaram:
- Vercel “fora de escopo”;
- contagens antigas do banco;
- missão MIS-0012 ainda planejada;
- estado pré-deploy.

Trate esses trechos como históricos até reconciliação formal. Código + runtime live prevalecem.
