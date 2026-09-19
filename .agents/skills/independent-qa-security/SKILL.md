---
name: independent-qa-security
description: >-
  Protocolo e árvore de decisão para auditoria independente zero-trust, testes adversários de RLS,
  inspeção de credenciais expostas e emissão de laudo técnico de release no App Reflex 02.
---

# Protocolo de Auditoria Independente Zero-Trust — AppSec & QA

Este protocolo normativo orienta o Agente A7 na auditoria independente de todas as entregas de código do App Reflex 02.

---

## 1. Árvore de Decisão do Auditor (Decision Tree)

```mermaid
flowchart TD
    Start[Handoff Recebido para Auditoria] --> Step1{1. Verificação de Segredos via git grep}
    Step1 -->|Credencial ou Chave Exposta Encontrada| BlockP0[STOP: Veredito BLOCK RELEASE - Incidente P0]
    Step1 -->|Livre de Segredos| Step2{2. Inspeção de Testes Suprimidos}
    
    Step2 -->|test.skip ou expect falso detectado| BlockSkip[STOP: Veredito BLOCK RELEASE - Fraude ou Supressão de Teste]
    Step2 -->|Sem Testes Suprimidos| Step3{3. Execução da Bateria Completa de Testes}
    
    Step3 -->|Falha em 1 ou mais testes| Fail[Veredito FAIL: Retornar ao Owner para Correção]
    Step3 -->|100% Testes Aprovados| Step4{4. Auditoria de RLS e Integridade}
    
    Step4 -->|Tabela ou View sem RLS verificado| BlockRLS[STOP: Veredito BLOCK RELEASE - Falha de Tenant Isolation]
    Step4 -->|RLS e Tipos Verificados com Sucesso| Pass[Veredito PASS: Laudo Emitido para A1 e A9]
```

---

## 2. Regras de Decisão por Cenário de Falha

### Cenário 1: Presença de Segredos Versionados
- **SE** qualquer arquivo contiver chave de serviço, senha de banco ou token de autenticação:
  1. Emitir imediatamente veredito **`BLOCK RELEASE`**;
  2. Notificar A1 e A9 para registro de Incidente de Segurança;
  3. **STOP: Não aprovar PR sob nenhuma circunstância**.

### Cenário 2: Testes Suprimidos ou Ignorados (`test.skip`)
- **SE** o desenvolvedor desativou testes que falhavam utilizando `test.skip`, `// @ts-ignore` ou `eslint-disable` sem justificativa arquitetural prévia:
  1. Emitir veredito **`BLOCK RELEASE`**;
  2. **STOP: Exigir a resolução da causa-raiz do teste quebrado**.

### Cenário 3: Falha Funcional ou Regressão
- **SE** qualquer teste automatizado falhar durante `npm test`:
  1. Capturar o stack trace e o teste específico;
  2. Emitir veredito **`FAIL`** com o relatório detalhado do ponto de falha;
  3. Devolver o Task Packet ao especialista implementador (sem corrigir silenciosamente).

### Cenário 4: Aprovação Completa
- **SE** `tsc --noEmit` = 0 erros, `npm run lint` = 0 erros, 100% dos testes Vitest passando e nenhuma vulnerabilidade identificada:
  1. Emitir veredito **`PASS`** com o resumo de execução no Output Contract.
