# Estado Real do Supabase — App Reflex 02

**Data da Auditoria:** 18 de setembro de 2026  
**Ambiente:** Supabase Canônico App Reflex 02  
**Project Ref:** `xenapowdtfhdwcfthfrn`  
**URL:** `https://xenapowdtfhdwcfthfrn.supabase.co`  
**Host PostgreSQL:** `db.xenapowdtfhdwcfthfrn.supabase.co:5432`  
**Versão do PostgreSQL:** 17.6 (Ubuntu 17.6-1.pgdg24.04+1)  
**Auditor:** A4 (rflex-backend-supabase) & A7 (rflex-qa-security)  
**Status de Reconciliação:** `TOTALMENTE RECONCILIADO`

---

## 1. Identidade e Isolamento do Banco

- **Projeto:** `App Reflex 02` (Totalmente desacoplado do antigo App 01 / `cqavdefyelarhyjqmahi`).
- **Credenciais:** Gerenciadas estritamente em ambiente local (`.env.local`, protegido por `.gitignore`). Nenhuma chave ou senha versionada.
- **Extensions Instaladas:**
  - `uuid-ossp` (v1.1) — Geração de UUIDs v4;
  - `pgcrypto` (v1.3) — Hashing e criptografia;
  - `vector` (v0.8.2) — Suporte a pgvector (1536 dimensões para embeddings).

---

## 2. Schemas Presentes e Responsabilidade

| Schema | Finalidade Operacional | Quantidade de Tabelas | Quantidade de Views |
| :--- | :--- | :--- | :--- |
| `public` | Ponto de entrada padrão PostgREST e views públicas para frontend. | 1 (`_migrations`) | 12 views com `security_invoker=true` |
| `sistema` | Catálogos operacionais, modelos, prompts e configurações de usuário. | 7 tabelas | 0 |
| `biblioteca` | Obras, versões de obras e fontes originais (textos, áudios, uploads). | 3 tabelas | 2 views com `security_invoker=true` |
| `processamento` | Documentos, seções, fragmentos, vetores e evidências extraídas. | 10 tabelas | 3 views com `security_invoker=true` |
| `taxonomia` | Conceitos, termos, relações, análises e vínculos conceituais. | 7 tabelas | 2 views com `security_invoker=true` |
| `cerebro_autoral` | Dimensões canônicas, características, regras e propostas de atualização. | 7 tabelas | 4 views com `security_invoker=true` |
| `reflexoes` | Entradas, planos cognitivos, versões, citações e fontes mobilizadas. | 8 tabelas | 1 view com `security_invoker=true` |
| `auditoria` | Relatórios de auditoria e execuções de IA auditáveis. | 2 tabelas | 1 view com `security_invoker=true` |
| `storage` | Buckets de arquivos binários e metadados de objetos. | 8 tabelas internas | 0 |
| `auth` | Gestão de identidade, sessões e usuários autenticados. | 27 tabelas internas | 0 |

---

## 3. Estado dos Buckets de Storage

| Bucket | Public | File Size Limit | MIME Types Autorizados |
| :--- | :--- | :--- | :--- |
| `originais-biblioteca` | **false** (Privado) | **50 MB** (`52428800` bytes) | PDF, EPUB, DOCX, TXT, MD, WEBM, MPEG, MP4, M4A, WAV, X-WAV |
| `fontes-reflexoes` | **false** (Privado) | **50 MB** (`52428800` bytes) | PDF, DOCX, TXT, MD, WEBM, WAV, X-WAV, MPEG, MP4, M4A |

Ambos os buckets possuem políticas ativas em `storage.objects`:
- Leitura, inserção, atualização e exclusão permitidas a usuários autenticados exclusivamente sobre sua própria pasta: `(storage.foldername(name))[1] = auth.uid()::text`.
- Acesso total administrativo garantido ao role `service_role`.
