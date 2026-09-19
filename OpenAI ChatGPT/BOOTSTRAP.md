# Bootstrap obrigatório para nova sessão OpenAI

Use este procedimento sempre que uma nova conversa do ChatGPT/Codex assumir trabalho no App Reflex 02.

## 1. Confirmar identidade do projeto

- Repositório canônico: `villacanabrava-maker/App-Reflex-02`
- Branch canônica: `main`
- Supabase canônico: project ref `xenapowdtfhdwcfthfrn`
- Vercel canônica: projeto `app-reflex-02`
- URL de produção: `https://app-reflex-02.vercel.app`

Não usar App01/Rflex01 ou repositórios Vercel históricos como fallback.

## 2. Reconstruir o estado real

Antes de confiar em documentação histórica:

1. obter HEAD atual da `main`;
2. ler commits recentes;
3. conferir GitHub Actions do HEAD;
4. ler `docs/STATUS_PROJETO.md`, mas tratar divergências com código/runtime como drift documental;
5. se a tarefa envolver banco, consultar o Supabase live;
6. se envolver deploy/runtime, consultar a Vercel live;
7. se envolver UI, verificar visualmente quando houver browser disponível.

## 3. Fonte de verdade por precedência

1. **Instrução humana explícita atual**
2. **Estado live verificado** — GitHub/Supabase/Vercel/runtime
3. **Código em `main`**
4. **Migrations versionadas**
5. **Documentação canônica recente**
6. **Esta pasta de continuidade**
7. **Handoffs e relatórios históricos**
8. **Memória de conversa**

Nunca inverter essa ordem.

## 4. Classificar evidência

Use:

- `[CONFIRMADO-CODIGO]`
- `[CONFIRMADO-TESTE]`
- `[CONFIRMADO-CI]`
- `[CONFIRMADO-RUNTIME]`
- `[CONFIRMADO-EXTERNO]`
- `[RELATADO]`
- `[INFERIDO]`
- `[PENDENTE]`
- `[BLOQUEADO]`

Nunca transformar relato de agente em runtime confirmado.

## 5. Descobrir capacidades antes de agir

Uma nova sessão deve inspecionar as Skills disponíveis antes de improvisar um fluxo complexo.

No Codex, Skills de repositório são descobertas em `.agents/skills`. Para este projeto, as Skills OpenAI começam por `openai-reflex-`.

Conectores esperados quando disponíveis:

- GitHub
- Supabase
- Vercel
- Web
- arquivos do chat/biblioteca
- browser/Computer Use quando necessário

Não afirmar acesso a uma ferramenta sem verificar sua disponibilidade.

## 6. Escolher papel

Use `ORCHESTRATION.md` para escolher O1–O9.

Se subagentes reais não estiverem disponíveis, uma única instância deve **simular os papéis sequencialmente**, mantendo separação entre:
- planejamento;
- implementação;
- auditoria;
- reconciliação.

Auto-revisão não deve ser apresentada como revisão independente.

## 7. Antes de editar

- criar branch curta;
- registrar objetivo e baseline;
- delimitar arquivos e sistemas afetados;
- identificar risco de banco/runtime;
- preservar segredos;
- definir critérios de saída.

## 8. Antes de concluir

No mínimo:

- `npx tsc --noEmit`
- `npm run lint`
- `npm test`
- `npm run build`
- GitHub Actions verde no SHA final;
- runtime verificado quando a tarefa é de runtime;
- Supabase verificado quando a tarefa é de banco;
- atualizar continuidade se o estado real mudou.
