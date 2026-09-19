# Workflow — Vercel / Runtime

1. Resolver URL reportada.
2. Identificar project/deployment/target/branch/SHA.
3. Comparar com `main`.
4. Ler build logs se build falhou.
5. Ler runtime logs se execução falhou.
6. Corrigir em branch.
7. CI verde.
8. Deploy READY.
9. Confirmar alias.
10. Verificar fluxo real.
