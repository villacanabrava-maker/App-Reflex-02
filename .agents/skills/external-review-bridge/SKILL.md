---
name: external-review-bridge
description: >-
  Protocolo de intercâmbio de mensagens e governança de handoff assíncrono entre ChatGPT,
  Antigravity e o Usuário para o desenvolvimento contínuo do App Reflex 02.
---

# Skill: Ponte de Revisão Externa (External Review Bridge)

## Propósito

O fluxo de trabalho do App Reflex 02 adota uma arquitetura triangular de colaboração:
- **Usuário:** Dono do produto, tomador de decisões e intermediário da execução.
- **ChatGPT:** Arquiteto analítico, consultor de alto nível, redator de prompts estruturados e revisor de entregas.
- **Antigravity (A1 a A9):** Time de engenharia autônoma que implementa código, roda pipelines, executa testes e mantém o repositório.

Esta skill estabelece a estrutura de arquivos e o padrão de intercâmbio dessa ponte.

---

## Estrutura de Diretórios de Coordenação

```
docs/coordenacao/
├── README.md                           # Protocolo geral de governança e continuidade
├── ESTADO_COMPARTILHADO.md             # Visão executiva atualizada do estado do app
├── INDICE_MISSOES.md                   # Tabela histórica e planejamento de missões
├── AUDITORIA_DOCUMENTAL_APP01_APP02.md # Classificação de documentos App 01 vs App 02
├── chatgpt-para-antigravity/           # Ingestão de prompts e diretrizes (GPT-XXXX.md)
│   └── README.md
├── antigravity-para-chatgpt/           # Relatórios de entrega e evidências (AG-XXXX.md)
│   └── README.md
├── missoes/                            # Registros detalhados de cada missão (MIS-XXXX/)
│   └── README.md
└── decisoes/                           # Decisões arquiteturais de coordenação
    └── README.md
```

---

## Ciclo de Vida de uma Missão

1. **Elaboração (ChatGPT):** Usuário e ChatGPT definem escopo, gerando o prompt formal.
2. **Registro (Opcional):** Pode ser salvo em `docs/coordenacao/chatgpt-para-antigravity/GPT-XXXX.md`.
3. **Execução (Antigravity):** O time (A1 a A8) planeja, implementa e valida através do CI gate.
4. **Reconciliação (A9):** O Agente A9 audita o diff, consolida as evidências reais e gera o relatório `docs/coordenacao/antigravity-para-chatgpt/AG-XXXX.md`.
5. **Atualização de Estado:** A9 atualiza `ESTADO_COMPARTILHADO.md` e `INDICE_MISSOES.md`.
6. **Entrega ao Usuário:** O relatório `AG-XXXX.md` é entregue para que o usuário cole de volta no ChatGPT, fechando o ciclo e iniciando a próxima iteração.
