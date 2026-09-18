---
name: architecture-audit
description: >-
  Metodologia para análise de impacto, revisão de dependências e documentação de ADRs (Architecture Decision Records).
---

# Análise de Impacto Arquitetural e Governança de Decisões

Ao planejar mudanças arquiteturais, o Arquiteto (A1) deve:

1. **Mapeamento de Dependências:** Identificar módulos acoplados na cadeia de valor (`Biblioteca -> Processamento -> Taxonomia -> Cérebro -> Reflexões -> Auditoria`).
2. **Análise de Custos e Latência:** Avaliar impacto no consumo de tokens LLM e volumetria do banco de dados.
3. **Emissão de ADR (Architecture Decision Record):**
   - **Contexto:** Qual problema motivou a decisão.
   - **Alternativas Consideradas:** Quais abordagens foram descartadas e por quê.
   - **Decisão:** A solução adotada.
   - **Consequências:** Benefícios e trade-offs técnicos.
