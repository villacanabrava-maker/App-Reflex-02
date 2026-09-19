# Registro de Incidente de Segurança — 18 de setembro de 2026

**Identificador do Incidente:** INC-SEC-20260918-01  
**Severidade:** P0 (Credencial exposta em repositório público)  
**Equipe de Resposta:** A7 (rflex-qa-security), A4 (rflex-backend-supabase), A6 (rflex-platform), A9 (rflex-continuity-evidence)  
**Status:** `MITIGADO NO REPOSITÓRIO / AGUARDANDO ROTAÇÃO PELO USUÁRIO NO DASHBOARD SUPABASE`  

---

## 1. Descrição do Evento

Durante a implementação do teste de validação de isolamento do Supabase (`tests/seguranca/supabase-isolamento-rls.test.ts`), foi incluída no código-fonte uma string de conexão com a senha do banco PostgreSQL do projeto canônico `xenapowdtfhdwcfthfrn`.
Como o repositório no GitHub é público, a credencial foi exposta em commits do histórico recente (`ea0b985`, `ed69be1`, `1b64552`).

---

## 2. Ações Imediatas de Contenção

1. **Remoção Imediata do Código:**
   O arquivo `tests/seguranca/supabase-isolamento-rls.test.ts` foi refatorado cirurgicamente para remover qualquer credencial ou referência explícita a senhas.
2. **Parametrização Segura:**
   O teste agora depende exclusivamente de variáveis de ambiente opcionais locais (`SUPABASE_DB_URL` ou `TEST_DATABASE_URL`), operando em modo estático de verificação de migrations quando a conexão direta não estiver configurada.
3. **Auditoria Geral do Repositório:**
   Foi executada uma busca em todo o repositório (`git grep`) confirmando que nenhum outro arquivo possui credenciais de banco ou tokens (`sb_secret`) versionados.

---

## 3. Ações Obrigatórias de Rotação (Ação Humana Requerida)

Como o Antigravity opera localmente no repositório do usuário e não possui acesso administrativo ao console de infraestrutura cloud do Supabase, o usuário deve:
1. Acessar o Dashboard do Supabase: [https://supabase.com/dashboard/project/xenapowdtfhdwcfthfrn/settings/database](https://supabase.com/dashboard/project/xenapowdtfhdwcfthfrn/settings/database)
2. Ir em **Project Settings ➔ Database ➔ Database Password**.
3. Clicar em **Reset Database Password** e gerar uma nova senha forte.
4. Caso utilize scripts de conexão direta no ambiente local, atualizar a nova senha no arquivo local `.env.local` (que permanece devidamente ignorado pelo Git).

---

## 4. Avaliação sobre o Histórico Git

Uma vez rotacionada a senha no Supabase, a credencial exposta no histórico do commit torna-se um artefato inerte e sem validade. Como a reescrita destrutiva do histórico Git (`git filter-repo` / `git push --force`) quebraria os commits canônicos do protocolo de continuidade e as referências cruzadas entre agentes e o ChatGPT, recomenda-se manter o histórico e concluir a rotação da credencial no painel do Supabase.
