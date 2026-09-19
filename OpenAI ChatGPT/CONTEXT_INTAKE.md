# Protocolo de Ingestão de Contexto

Quando o usuário fornecer um documento, pesquisa, imagem, relatório ou longa conversa que afete o projeto:

## Não fazer
- não copiar o material inteiro para esta pasta;
- não transformar pesquisa externa em decisão canônica automaticamente;
- não registrar segredo;
- não registrar chain-of-thought.

## Fazer
1. identificar o material e sua origem;
2. extrair apenas decisões, constraints, findings e questões úteis;
3. marcar o status:
   - fonte do usuário;
   - pesquisa externa;
   - código confirmado;
   - runtime confirmado;
   - hipótese;
4. linkar para o documento original no repo quando ele existir;
5. atualizar `DECISIONS.md` apenas se o usuário tiver tomado uma decisão;
6. atualizar `CURRENT_STATE.md` apenas se o estado real mudou;
7. registrar no `CONTINUITY_LEDGER.md` se houve efeito operacional.

## Regra epistemológica
Documento fornecido pelo usuário é evidência do que o usuário pesquisou ou pediu; não é, por si só, evidência de que o código/runtime já implementa aquilo.
