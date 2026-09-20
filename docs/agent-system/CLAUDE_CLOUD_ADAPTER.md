# Claude Code Cloud Adapter

## Decisão

Claude Code passa a ser o terceiro adapter oficial do Reflex Agent OS V3, com prioridade para execução em nuvem conectada ao GitHub.

Isso **substitui a ideia de transformar o computador local em centro permanente de supervisão**. O protótipo local do ZIP continua útil como pesquisa, mas sua pilha extensa de hooks não é copiada integralmente para a nuvem.

## O que Claude Cloud faz bem

- sessões isoladas na nuvem ligadas ao repositório;
- trabalho em background;
- subagentes e Skills de projeto;
- Routines acionadas por agenda, API e eventos GitHub suportados;
- criação de branches/PRs para mudanças propostas;
- supervisão R1/R9 e auditoria R6 quando independente do implementador.

## O que ele não é

- não é R10;
- não é autoridade acima de OpenAI ou Antigravity;
- não é fonte de verdade;
- não recebe permissão irrestrita de produção.

## Política para Routines

Routines são consideradas **execução não supervisionada**.

Padrão:
- clonar a branch default;
- ler Constituição/registry/runtime registry;
- escrever somente em branch `claude/*`;
- nunca mergear `main`;
- nunca aplicar migration live;
- usar Supabase somente project-scoped/read-only;
- não anexar Vercel com mutação até existir enforcement mais estreito;
- gerar relatório/evidência e abrir PR quando uma mudança for apropriada.

## Protótipo local do ZIP

Reaproveitado:
- ideia de adapter Claude;
- nove projeções R1-R9;
- Skills finas;
- validação de drift;
- disciplina de least privilege.

Não promovido a canônico cloud nesta etapa:
- `.claude/settings.json` local;
- cadeia extensa de hooks PowerShell/Shell;
- regexes específicas do computador local;
- segredos/configurações de máquina;
- tentativa de fazer Claude controlar interfaces gráficas de outros runtimes.

Motivo: a nuvem já fornece sandbox/branch isolation e Routines; enforcement adicional deve ser pequeno, testável e necessário.
