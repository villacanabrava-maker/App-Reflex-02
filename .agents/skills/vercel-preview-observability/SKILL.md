---
name: vercel-preview-observability
description: Verifique previews, produção, branch, SHA, aliases e logs Vercel sem promover ou alterar produção sem gate humano.
---

# Observabilidade e Release Gate na Vercel

Vercel está ativa no App Reflex 02.

## Uso permitido

1. Resolver projeto → deployment → target → branch → SHA → alias.
2. Ler status de deployment e logs quando a ferramenta estiver disponível.
3. Comparar preview, `main` e produção para detectar drift.
4. Registrar evidência de runtime sem tratar preview como produção.

## Gates

- Não executar deploy manual, promoção para produção, alteração de domínio ou environment variables sem gate humano.
- Não versionar tokens ou credenciais.
- Não diagnosticar uma URL isoladamente; sempre reconciliar deployment, target, branch e SHA.
- Se a ferramenta Vercel não estiver disponível, marcar a verificação como `[BLOQUEADO]` em vez de inferir estado.

## Evidência mínima

Registre, quando aplicável:
- project id/name;
- deployment id;
- target;
- branch;
- commit SHA;
- aliases;
- ready state;
- timestamp da verificação.
