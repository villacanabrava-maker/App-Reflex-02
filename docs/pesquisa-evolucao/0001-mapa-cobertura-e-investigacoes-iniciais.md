# Relatório de Pesquisa & Evolução — 0001
## Mapeamento de Cobertura, Soluções a Preservar e Investigações Prioritárias

**Autor:** Agente 08 (`rflex-research-evolution`)  
**Destinatário:** Arquiteto de Software (A1) e Especialistas (A2 a A7)  
**Data:** 18 de setembro de 2026  
**Status da Proposta:** Proposta Formal Submetida a A1  
**Snapshot Analisado:** Commit `6a0f6da742c0e5e9faa1fe3a78cb9532b39652ac` (Branch `main`)  
**Raiz Operacional Canônica:** `e:\APP\Reflex 02\reflex02`

---

### 1. Confirmação de Contexto e Fronteiras
- **Raiz do Aplicativo:** `e:\APP\Reflex 02\reflex02` (`APP_DIR`), com Git apontando para `https://github.com/villacanabrava-maker/App-Reflex-02.git`.
- **Supabase Canônico:** Projeto `xenapowdtfhdwcfthfrn` (`https://xenapowdtfhdwcfthfrn.supabase.co`).
- **Estado dos Agentes:** Equipe com 8 agentes (A1 a A8) e 16 skills modulares catalogadas.
- **Restrições Estritas:**
  - Vercel permanece expressamente fora de escopo / adiado por decisão humana.
  - Nenhuma alteração direta em dados ou migrations de produção sem aprovação formal.
  - Nenhum segredo ou chave privada registrado em arquivos versionados.

---

### 2. Mapa de Cobertura Funcional e Arquitetural

| Módulo Canônico | Estado Concreto | Evidência no Código / Testes |
| :--- | :--- | :--- |
| **Biblioteca** | Operacional | Rotas `/biblioteca` e `/biblioteca/[id]`; upload TUS em `src/infraestrutura/storage/cliente-tus.ts`; validações em `tests/biblioteca/`. |
| **Processamento** | Operacional | Pipeline em `src/dominios/processamento/pipeline.ts`; extrator de texto, chunker e gerador de sínteses validados em `tests/processamento/`. |
| **Taxonomia** | Operacional | Grafo taxonômico em `/taxonomia`; motor de relações e classificação autoral em `src/dominios/taxonomia/`; dimensões canônicas fixadas pela migration 0028. |
| **Cérebro Autoral** | Operacional | Painel em `/cerebro`; analisador de dimensões e edições autorais em `src/dominios/cerebro/`; isolamento entre Núcleo Autoral e referências externas. |
| **Reflexões** | Operacional | Rotas `/reflexoes`, `/reflexoes/criar` e estúdio de edição com diff e detector de conflitos em `src/dominios/reflexoes/`. |
| **Infraestrutura / Auth** | Operacional | Next.js 15 Server Actions, cookies SSR em `cliente-servidor.ts`, cliente admin isolado, middleware de proteção de rotas com testes em `tests/auth/`. |
| **Qualidade & AppSec** | Operacional | 61 testes automatizados passando no Vitest, tipagem TypeScript estrita, ESLint com 0 erros/0 warnings e guardrails de segredos ativos. |

---

### 3. Boas Soluções a Preservar (Não Refatorar Sem Necessidade)

1. **Upload Direto via TUS (Browser-to-Storage):**
   - *Por que preservar:* O upload nunca trafega pelo servidor Next.js. O arquivo vai diretamente do navegador para o Supabase Storage via `tus-js-client`. Isso evita limitações de body size de funções serverless e garante suporte a arquivos grandes com transmissão resumível.
2. **Camadas Desacopladas com Domínios Puros:**
   - *Por que preservar:* As regras em `src/dominios/` (como taxonomia, diff de edição, detector de conflitos) são funções puras com alta testabilidade unitária, independentes de React ou HTTP.
3. **Guardrails de Configuração Automatizados:**
   - *Por que preservar:* O teste `guardrails-config.test.ts` assegura programaticamente que nem a URL do projeto anterior nem do projeto novo fiquem chumbadas no código-fonte de runtime.
4. **Governança Multiagente com Hooks Determinísticos:**
   - *Por que preservar:* O `pre-tool-guard.js` impede preventivamente comandos perigosos e protege a branch main sem depender da memória volátil do LLM.

---

### 4. Três Investigações Prioritárias para as Pendências Desta Fase

#### 📌 PROP-001: Plano de Paridade Segura das Migrations no Clone Supabase
- **Categoria:** Prevenção / Alinhamento de Banco
- **Problema:** A inspeção do banco clonado (`xenapowdtfhdwcfthfrn`) revelou 15 migrations aplicadas (até `0015_incorporacao_reingestao_storage.sql`), ao passo que o repositório contém 29 migrations (até `0029_limite_upload_biblioteca_50mb.sql`).
- **Hipótese:** As migrations 16 a 29 trazem views otimizadas (`0016`, `0017`), índices de performance (`0019`), isolamento RLS aprimorado (`0025`), motor automático de taxonomia (`0026`) e limite de 50MB (`0029`), sendo essenciais para a integridade completa das novas features sem quebrar dados existentes.
- **Forma de Refutação:** Se a aplicação de qualquer migration intermediária acusar conflito de tipo de dados ou descartar dados dos usuários existentes no clone.
- **Fontes Consultadas:**
  - *PostgreSQL 17 Documentation: Transactional DDL (`BEGIN ... COMMIT`).*
  - *Supabase CLI Safe Migrations Best Practices (2026).*
- **Recomendação:** Elaborar um script assistido de migração incremental (16 a 29) em bloco transacional idempotente, submetido para validação prévia de A4 e aprovação formal do usuário antes da execução.
- **Responsável Sugerido:** A4 (Back-End & Supabase) com revisão de A7 (Segurança).

---

#### 📌 PROP-002: Validação de Segurança das Views com `security_invoker` no PostgreSQL 17
- **Categoria:** Prevenção & AppSec
- **Problema:** As rotas do aplicativo consultam frequentemente views expostas no schema `public` (`v_documentos_processados`, `v_reflexoes_resumo`, `v_obras_detalhadas`).
- **Hipótese:** No PostgreSQL 15+, views sem a cláusula `WITH (security_invoker = on)` executam com os privilégios do criador da view, o que pode contornar o RLS do usuário logado se não for devidamente parametrizado.
- **Forma de Refutação:** Se as views já tiverem a opção `security_invoker = true` declarada nas migrations `0017` e `0018`.
- **Fontes Consultadas:**
  - *PostgreSQL Official Docs: CREATE VIEW security_invoker.*
  - *Supabase Security Advisory: RLS in Views.*
- **Recomendação:** Auditar as DDLs das views nas migrations `0016` e `0017` para confirmar que todas utilizam `WITH (security_invoker = on)`.
- **Responsável Sugerido:** A4 (Back-End) e A7 (Qualidade & AppSec).

---

#### 📌 PROP-003: Validação Sintática Offline para Structured Outputs de IA
- **Categoria:** Potencialização & Resiliência
- **Problema:** Testes de IA que acionam a API OpenAI não podem rodar em CI ou gastar tokens desnecessariamente durante o desenvolvimento local.
- **Hipótese:** Criar um conjunto de fixtures com payloads simulados com falhas propositais (edge cases de prompt injection, respostas truncadas, campos faltando) para testar os schemas Zod de `src/dominios/` e `src/ia/` de forma 100% offline e determinística.
- **Forma de Refutação:** Se os schemas Zod atuais já possuírem cobertura de testes para todos os casos de borda sem dependência externa.
- **Fontes Consultadas:**
  - *Zod 3.24 Documentation: SafeParse e Error Handling.*
  - *OpenAI Structured Outputs Guidelines (JSON Schema).*
- **Recomendação:** A5 e A7 implementarem fixtures unitárias que testem a validação de respostas antes da gravação no banco, sem custos de API.
- **Responsável Sugerido:** A5 (IA & Conhecimento) e A7 (Qualidade).

---

### 5. Registro de Oportunidades Futuras (Fora Desta Fase)
- **Hospedagem & Vercel:** Será pesquisada detalhadamente no momento em que o usuário autorizar a etapa de publicação na internet.
- **Exportação Multiformato:** Pesquisa de exportação de reflexões para Markdown padrão, Obsidian Vault e JSON-LD.
- **Visualização Grafos com Canvas/WebGL:** Avaliação de bibliotecas para visualização de grandes redes conceituais (acima de 500 nós).