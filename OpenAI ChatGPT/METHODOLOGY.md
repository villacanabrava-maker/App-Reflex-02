# Metodologia Operacional OpenAI — App Reflex 02

## 1. Princípio de trabalho

> **Agir somente depois de reconciliar intenção, código, banco, runtime e evidência.**

## 2. Não operar por memória de conversa

Conversas são contexto auxiliar. Antes de alterar o produto:
- conferir `main`;
- conferir código real;
- conferir banco real quando envolvido;
- conferir deployment real quando envolvido.

## 3. Uma frente funcional por vez

Evitar mudanças amplas não relacionadas. Separar:
- correção funcional;
- refatoração;
- migration;
- redesign;
- experimento cognitivo;
- deploy.

## 4. Branch curta + PR

Fluxo preferido:

`main → branch curta → alterações → testes → PR → CI → merge → runtime`

Evitar push direto na `main`.

## 5. Evidência antes de conclusão

Não dizer “resolvido” apenas porque:
- o código compilou;
- a migration existe;
- o deploy foi iniciado;
- outro agente afirmou.

Usar a taxonomia de evidência definida em `BOOTSTRAP.md`.

## 6. Bug investigation

Ordem:
1. reproduzir/identificar versão exata;
2. reconciliar URL/branch/SHA;
3. consultar runtime logs;
4. localizar caminho de código;
5. formular hipótese;
6. corrigir;
7. adicionar regressão;
8. CI;
9. deploy;
10. validar runtime novo.

## 7. Banco

Antes de alterar Supabase:
- ler skill de Supabase;
- consultar docs/changelog atual;
- mapear ownership, RLS, grants e RPCs;
- testar SQL no ambiente apropriado;
- criar migration limpa;
- rodar advisors;
- verificar pós-migration.

Nunca usar `service_role` no cliente.

## 8. IA / Cognição

Toda mudança cognitiva deve preservar:
- Soberania Autoral;
- Memory-Inference Firewall;
- provenance;
- estados epistemológicos;
- human-in-the-loop;
- abstenção honesta;
- Zod/Structured Outputs;
- nenhum claim autoral sem evidência adequada.

## 9. Interface

Ao alterar UI:
- mobile-first;
- acessibilidade;
- estados de loading/error/success;
- semântica clara;
- não esconder decisões importantes;
- mostrar origem/evidência quando a função é epistemológica.

## 10. Deploy

Nunca assumir que a URL aberta é produção.

Reconciliar:
- projeto Vercel;
- target;
- branch;
- SHA;
- deployment ID;
- domínio/alias.

Previews antigos são imutáveis e podem continuar exibindo bugs já corrigidos.

## 11. Atualização de continuidade

Ao final de trabalho real:
- atualizar `CURRENT_STATE.md`;
- registrar evento em `CONTINUITY_LEDGER.md`;
- registrar decisão humana em `DECISIONS.md`;
- não copiar a conversa inteira;
- resumir apenas fatos e decisões úteis para a próxima sessão.
