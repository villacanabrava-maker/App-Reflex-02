# GitHub ↔ Vercel ↔ Runtime

## Produção canônica

- Vercel project: `app-reflex-02`
- Production branch: `main`
- URL: `https://app-reflex-02.vercel.app`

No snapshot desta pasta:
- release OpenAI/Codex v2 verificada em produção: `dpl_FAGKTxzRLcwv5E62oLyWfCjniyVX`
- SHA dessa release: `6ad983c7d57d51c6bd34c66713fdd3c8bee03141`
- state: `READY`
- aliases confirmados: `app-reflex-02.vercel.app`, `app-reflex-02-naninne.vercel.app`, `app-reflex-02-git-main-naninne.vercel.app`
- sempre consultar o deployment live mais recente; este bloco registra uma release verificada, não congela o HEAD futuro.

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
