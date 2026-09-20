---
description: Regras invioláveis de segurança, proteção de credenciais e integridade de dados do App Reflex 02.
---

# Regras de Fronteira de Segurança (Security Boundaries)

1. **Proteção de Segredos e Credenciais:**
   - Jamais exiba ou versione chaves service_role, tokens da OpenAI/Vercel, senhas, cookies ou chaves privadas.
   - Se um agente identificar vazamento potencial de credencial, a execução deve ser pausada imediatamente.

2. **Isolamento de Ambiente e Banco de Dados:**
   - Nenhum agente possui autorização autônoma para aplicar migrations diretamente no ambiente de produção.
   - Comandos de alteração estrutural no banco (ALTER TABLE, DROP, CREATE POLICY) devem ser versionados em scripts idempotentes em supabase/migrations/.

3. **Bloqueio de Comandos Destrutivos:**
   - Proibido uso de git push --force, git reset --hard não aprovado, m -rf indiscriminado e truncagem de tabelas.
