# Matriz de RLS, Políticas e Privilégios (Grants) — Supabase

**Data:** 18 de setembro de 2026  
**Ambiente:** Supabase Canônico `xenapowdtfhdwcfthfrn`  
**Auditor Independente:** A7 (rflex-qa-security) & A4 (rflex-backend-supabase)  

---

## 1. Princípio Fundamental de Acesso

1. **`anon` (Anônimo):** Acesso totalmente revogado em todas as tabelas e views de domínio. Apenas rotas públicas de Auth (`/login`, `/cadastro`) interagem com `auth.*`.
2. **`authenticated` (Usuário Logado):** Acesso estritamente restrito aos seus próprios registros via `auth.uid() = usuario_id`. Em catálogos globais canônicos (`cerebro_autoral.dimensoes`, `sistema.modelos_ia`, etc.), possui permissão estritamente de `SELECT` (somente leitura).
3. **`service_role` (Backend / Server Actions):** Acesso administrativo seguro sem contornar as validações de software das Server Actions. Jamais exposto no cliente (browser).

---

## 2. Matriz de RLS por Tabela

| Schema | Tabela | RLS Ativo | Políticas Vigentes | Quem pode SELECT | Quem pode INSERT/UPDATE/DELETE |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `sistema` | `configuracoes_usuario` | **SIM** | Isolamento por `auth.uid()` | Proprietário | Proprietário |
| `sistema` | `modelos_ia` | **SIM** | Somente leitura autenticada | `authenticated`, `service_role` | `service_role` apenas |
| `sistema` | `perfis_embedding` | **SIM** | Somente leitura autenticada | `authenticated`, `service_role` | `service_role` apenas |
| `sistema` | `prompts` | **SIM** | Somente leitura autenticada | `authenticated`, `service_role` | `service_role` apenas |
| `sistema` | `versoes_prompts` | **SIM** | Somente leitura autenticada | `authenticated`, `service_role` | `service_role` apenas |
| `sistema` | `versoes_pipeline` | **SIM** | Somente leitura autenticada | `authenticated`, `service_role` | `service_role` apenas |
| `sistema` | `usuarios` | **SIM** | Sincronizado com `auth.users` | Proprietário | Trigger interno / `service_role` |
| `biblioteca` | `obras` | **SIM** | Isolamento por `auth.uid()` | Proprietário | Proprietário |
| `biblioteca` | `versoes_obras` | **SIM** | Isolamento por `auth.uid()` | Proprietário | Proprietário |
| `biblioteca` | `fontes_obras` | **SIM** | Isolamento por `auth.uid()` | Proprietário | Proprietário |
| `processamento` | `documentos_processados` | **SIM** | Isolamento por `auth.uid()` | Proprietário | Proprietário / `service_role` |
| `processamento` | `secoes` | **SIM** | Isolamento por `auth.uid()` | Proprietário | Proprietário / `service_role` |
| `processamento` | `fragmentos` | **SIM** | Isolamento por `auth.uid()` | Proprietário | Proprietário / `service_role` |
| `processamento` | `vetores` | **SIM** | Isolamento por `auth.uid()` | Proprietário | Proprietário / `service_role` |
| `processamento` | `evidencias` | **SIM** | Isolamento por `auth.uid()` | Proprietário | Proprietário / `service_role` |
| `taxonomia` | `conceitos` | **SIM** | Isolamento por `auth.uid()` | Proprietário | Proprietário |
| `taxonomia` | `termos` | **SIM** | Isolamento via conceito pai | Proprietário | Proprietário |
| `taxonomia` | `relacoes` | **SIM** | Isolamento via conceitos | Proprietário | Proprietário |
| `taxonomia` | `conceitos_fragmentos` | **SIM** | Isolamento por `auth.uid()` | Proprietário | Proprietário |
| `taxonomia` | `conceitos_reflexoes` | **SIM** | Isolamento por `auth.uid()` | Proprietário | Proprietário |
| `taxonomia` | `analises` | **SIM** | Leitura pelo dono, escrita backend | Proprietário | `service_role` apenas |
| `cerebro_autoral`| `dimensoes` | **SIM** | Catálogo canônico global | `authenticated`, `service_role` | `service_role` apenas |
| `cerebro_autoral`| `caracteristicas` | **SIM** | Isolamento por `auth.uid()` | Proprietário | Proprietário / `service_role` |
| `cerebro_autoral`| `regras` | **SIM** | Isolamento por `auth.uid()` | Proprietário | Proprietário / `service_role` |
| `cerebro_autoral`| `propostas_atualizacao` | **SIM** | Acesso backend auditado | `service_role` | `service_role` apenas |
| `cerebro_autoral`| `versoes_cerebro` | **SIM** | Isolamento por `auth.uid()` | Proprietário | Proprietário |
| `reflexoes` | `entradas` | **SIM** | Isolamento por `auth.uid()` | Proprietário | Proprietário |
| `reflexoes` | `planos_reflexao` | **SIM** | Isolamento por `auth.uid()` | Proprietário | Proprietário |
| `reflexoes` | `versoes_reflexao` | **SIM** | Isolamento por `auth.uid()` | Proprietário | Proprietário |
| `reflexoes` | `fontes_entrada` | **SIM** | Isolamento por `auth.uid()` | Proprietário | Proprietário |
| `reflexoes` | `citacoes_evidencias` | **SIM** | Isolamento por `auth.uid()` | Proprietário | Proprietário |
| `auditoria` | `relatorios_auditoria` | **SIM** | Isolamento por `auth.uid()` | Proprietário | Proprietário / `service_role` |
| `auditoria` | `execucoes_ia` | **SIM** | Isolamento por `auth.uid()` | Proprietário | Proprietário / `service_role` |

---

## 3. Views e Proteção Contra Bypasses (`security_invoker`)

Todas as views expostas em `aplicacao.*` e `public.*` foram auditadas e possuem explicitamente a propriedade:
```sql
ALTER VIEW aplicacao.<nome_da_view> SET (security_invoker = true);
ALTER VIEW public.<nome_da_view> SET (security_invoker = true);
```
Isso garante que **nenhuma view atua como security_definer disfarçado** ou executa com permissões elevadas de quem a criou. Toda consulta através de view herda obrigatoriamente as restrições de RLS do usuário solicitante.
