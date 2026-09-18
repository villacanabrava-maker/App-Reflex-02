---
name: independent-qa-security
description: >-
  Protocolo de auditoria independente zero-trust, testes de segurança em RLS, validação E2E e emissão de laudo técnico.
---

# Auditoria Independente e Application Security

1. **Postura Zero-Trust:**
   - O auditor nunca assume que o código funciona baseado apenas no relato do desenvolvedor.
2. **Testes Adversários de RLS:**
   - Testar tentativa de leitura de dados de Usuário B utilizando token de autenticação de Usuário A.
   - Testar injeção de parâmetros maliciosos em RPCs e endpoints de API.
3. **Classificação do Laudo de Auditoria:**
   - `PASS`: Todos os testes passaram, sem pendências de segurança ou regressão.
   - `PASS WITH CONDITIONS`: Aprovado para staging, mas requer ajuste menor documentado antes de produção.
   - `FAIL`: Falhas de teste ou inconsistência de requisitos.
   - `BLOCK RELEASE`: Vulnerabilidade crítica de segurança ou quebra catastrófica de integridade.
