# Mapa do Projeto — App Reflex 02

## Arquitetura de produto

Fluxo principal:

`Biblioteca → Processamento → Taxonomia → Cérebro Autoral → Reflexões → Auditoria`

## Stack

- Next.js 15.5
- React 19
- TypeScript 5.7
- Tailwind CSS 3.4
- Supabase JS / SSR
- PostgreSQL 17
- OpenAI SDK
- Zod
- Vitest
- Vercel
- GitHub Actions
- pgvector / FTS / HNSW no banco

## Diretórios centrais

### App / UI

- `src/app/**` — App Router, layouts e páginas.
- `src/componentes/**` — componentes visuais.
- `src/acoes/**` — Server Actions e fachadas entre UI e domínio.

### IA

- `src/ia/**` — cliente, orquestração, papéis de IA e utilitários.
- `src/dominios/cerebro/**` — memória autoral, retrieval, dossiê, claims, análise cognitiva.
- `src/dominios/taxonomia/**` — conceitos, relações, SKOS, classificação.
- `src/dominios/processamento/**` — extração, chunking, embeddings, sínteses, pipeline.
- `src/dominios/reflexoes/**` — planejamento, redação, revisão e aprendizado por edição.
- `src/dominios/auditoria/**` — auditoria cognitiva e fidelidade.

### Supabase

- `src/infraestrutura/supabase/**` — clientes browser/server/admin.
- `supabase/migrations/**` — histórico de schema versionado.
- Schemas principais:
  - `biblioteca`
  - `processamento`
  - `taxonomia`
  - `cerebro_autoral`
  - `reflexoes`
  - `auditoria`
  - `sistema`
  - `public`

### Governança

- `AGENTS.md` — constituição multiagente do repositório.
- `.agents/**` — agentes, skills e regras Antigravity/Codex.
- `docs/coordenacao/**` — handoffs, estado compartilhado e missões.
- `docs/ia/**` — arquitetura cognitiva V3.1.
- `docs/adr/**` — decisões arquiteturais.
- `OpenAI ChatGPT/**` — continuidade específica para agentes OpenAI.

## Pontos de atenção

### Biblioteca

Uma obra tem:
- natureza: autoral ou externa;
- participação no Cérebro;
- versões imutáveis;
- storage privado;
- processamento separado por versão.

### Processamento

O pipeline atual inclui:
- extração;
- seções;
- chunking;
- unidades de conhecimento;
- embeddings;
- sínteses;
- taxonomia;
- publicação;
- ingestão episódica autoral.

### Cérebro Autoral

Distinguir:
1. corpus autoral ativo;
2. características candidatas;
3. propostas pendentes;
4. características confirmadas;
5. regras/anti-regras confirmadas;
6. claims e estados epistemológicos;
7. memory events;
8. working memory/dossiê.

Nunca confundir “obra autoral disponível” com “característica confirmada do autor”.

### Reflexões

A geração deve respeitar:
- fontes selecionadas;
- provenance;
- Dossiê V3.1;
- Allowed Use;
- Memory-Inference Firewall;
- auditoria antes da afirmação autoral.

## Comandos de qualidade

```bash
npx tsc --noEmit
npm run lint
npm test
npm run build
```

O CI remoto precisa ficar verde no SHA final.
