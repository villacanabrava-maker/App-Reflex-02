# Workflow — Fechamento de Sessão

Se houve mudança real:

1. registrar SHA final;
2. registrar CI;
3. registrar deployment se houve;
4. registrar migration/live verification se houve;
5. atualizar `../CURRENT_STATE.md`;
6. acrescentar item em `../CONTINUITY_LEDGER.md`;
7. atualizar `../DECISIONS.md` se o usuário tomou nova decisão;
8. não guardar segredos;
9. não guardar chain-of-thought;
10. escrever apenas contexto necessário para a próxima sessão.
