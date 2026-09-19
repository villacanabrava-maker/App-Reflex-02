# GitHub ↔ Vercel ↔ Runtime

## Produção canônica

- Vercel project: `app-reflex-02`
- Production branch: `main`
- URL: `https://app-reflex-02.vercel.app`

No snapshot desta pasta:
- production deployment: `dpl_HuW7bHM6vAYJuyeJV3gDZrW9J9mq`
- SHA: `d15fdf410e5c0c879196e66e3efba1f5541f7349`
- state: `READY`

## Regra de diagnóstico

Antes de diagnosticar um bug em Vercel:

1. copiar a URL exata usada pelo usuário;
2. resolver deployment ID;
3. identificar branch;
4. identificar SHA;
5. comparar com `main`;
6. só então ler runtime logs.

Um preview antigo pode continuar quebrado depois que produção foi corrigida.

## Caso real

Uma URL de preview antiga da branch `claude/ref-lex-02-analysis-nc30oq` continuava chamando o analisador legado do Cérebro. O erro parecia regressão de produção, mas o runtime correto estava em outro SHA. A branch foi depois sincronizada com `main`.

## Release checklist

- CI verde;
- deployment READY;
- SHA = SHA esperado;
- logs sem erro novo;
- fluxo visual verificado;
- banco compatível;
- alias correto.
