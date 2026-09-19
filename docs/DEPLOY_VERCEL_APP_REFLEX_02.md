# Deploy Vercel — App Reflex 02

**Status:** preparação técnica em andamento  
**Repositório canônico:** `villacanabrava-maker/App-Reflex-02`  
**Supabase canônico:** `xenapowdtfhdwcfthfrn` (`https://xenapowdtfhdwcfthfrn.supabase.co`)

## 1. Estratégia de primeiro deploy

O primeiro deploy deve iniciar com todas as features cognitivas V3.1 em `off`. O objetivo é validar a aplicação base, autenticação, Biblioteca, Processamento, Reflexões e integração servidor↔Supabase sem promover experimentalmente módulos cognitivos ainda em shadow.

## 2. Variáveis obrigatórias na Vercel

Configurar em **Production**, **Preview** e **Development** conforme a política do ambiente:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `OPENAI_API_KEY`

Aliases legados são opcionais e não devem substituir as variáveis canônicas em um projeto novo.

## 3. Feature flags iniciais

Usar no primeiro deploy:

- `FEATURE_COGNITIVE_V31_RETRIEVAL=off`
- `FEATURE_COGNITIVE_V31_DOSSIER=off`
- `FEATURE_COGNITIVE_V31_AUDITOR=off`
- `FEATURE_COGNITIVE_V31_ABSTENTION=off`
- `FEATURE_LEGACY_BRAIN_ANALYZER=off`

A promoção de qualquer flag para `shadow` ou `on` exige uma missão/revisão própria e evidência correspondente.

## 4. Production Security Gate

Antes de um deploy que seja considerado **produção real**, executar obrigatoriamente:

1. rotacionar a credencial anteriormente exposta;
2. usar uma nova `SUPABASE_SECRET_KEY` exclusiva do ambiente final;
3. revisar e, se necessário, rotacionar a `OPENAI_API_KEY`;
4. confirmar que nenhum segredo aparece em Git, documentação, logs ou comandos compartilhados;
5. configurar URLs de autenticação/redirect do Supabase para o domínio Vercel definitivo;
6. manter `SECURITY-EXCEPTION-DEV-001` restrita ao ambiente DEV/TEST e encerrá-la para produção.

## 5. Banco de dados

O projeto usa `public._migrations` como ledger operacional histórico. Não executar `supabase db push --linked` de forma cega porque o ledger oficial do CLI Supabase não contém todo o histórico antigo.

Novas migrations devem ser:
- versionadas no GitHub;
- revisadas;
- aplicadas de forma controlada no projeto canônico;
- registradas no ledger do aplicativo;
- verificadas por SQL e pelo Database Linter.

## 6. Critérios antes de conectar o GitHub à Vercel

- CI do HEAD de `main`: **success**;
- nenhuma migration pendente entre GitHub e Supabase DEV/TEST;
- Database Linter sem findings críticos não justificados;
- build Next.js verde;
- variáveis de ambiente configuradas;
- feature flags cognitivas em `off`;
- projeto Vercel novo ligado especificamente a `villacanabrava-maker/App-Reflex-02`.

Não reutilizar projetos Vercel históricos ligados a `reflex-01`, `MEMORIA-REFLEXIMA-` ou outros repositórios.

## 7. Atalho operacional no Windows / Antigravity

O repositório inclui `scripts/deploy-vercel.ps1`. Ele cria/vincula o projeto `app-reflex-02`, tenta conectar o GitHub, configura todas as variáveis necessárias para Production/Preview/Development com as flags cognitivas em `off` e executa o deploy.

Na raiz do repositório:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-vercel.ps1
```

O script pede Vercel token, `SUPABASE_SECRET_KEY` e `OPENAI_API_KEY` como entrada segura e não grava esses valores no Git.

## 8. Validação pós-deploy

Depois do primeiro Preview/Production candidate:

1. abrir página inicial e rotas públicas;
2. criar/testar sessão;
3. verificar redirecionamentos protegidos;
4. Biblioteca: listar, abrir e fazer upload pequeno;
5. Processamento: executar um documento de teste;
6. Reflexões: criar um fluxo mínimo;
7. validar que nenhum módulo cognitivo V3.1 experimental foi ativado por engano;
8. revisar Runtime Logs da Vercel;
9. conferir erros 4xx/5xx;
10. reconciliar SHA GitHub ↔ deployment Vercel.

Somente após essa verificação o deploy pode ser promovido.
