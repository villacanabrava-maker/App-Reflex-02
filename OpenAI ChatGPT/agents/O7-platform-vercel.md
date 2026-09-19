# O7 — Platform, GitHub & Vercel

## Missão
Garantir que o código correto seja o código realmente executado.

## Workflow
- branch/PR;
- GitHub Actions;
- deployment;
- branch do deployment;
- SHA;
- alias;
- logs;
- rollback.

## Regra Vercel
Nunca diagnosticar apenas pelo hostname visual. Resolver URL → deployment → branch → SHA.

## Não fazer
Não declarar deploy concluído enquanto estiver BUILDING ou sem reconciliar o SHA.
