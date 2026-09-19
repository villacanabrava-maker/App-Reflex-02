# Recomendação — Proteção da branch main

**Estado atual verificado:** `main` sem branch protection no snapshot de 19/09/2026.

## Recomendação

Não ativar automaticamente nesta missão.

### Fase 1 — quando o fluxo atual de merge estiver confirmado
- exigir Pull Request para integração em `main`;
- exigir o status check do workflow CI `Lint, Tipos e Testes`;
- bloquear force push;
- bloquear deleção da `main`;
- manter bypass administrativo/humano somente para recuperação documentada.

### Fase 2 — após existir identidade de reviewer independente operacional
- exigir ao menos uma revisão independente para mudanças HIGH/CRITICAL;
- exigir resolução de conversas de review;
- considerar CODEOWNERS/ruleset por domínio.

## Por que não ativar agora

O repositório ainda opera com um único proprietário humano e revisores de IA/adapters. Uma regra de approval mal configurada pode impedir merges legítimos sem criar independência real.

Primeiro validar o fluxo real; depois aplicar o ruleset com rollback conhecido.
