# Decisão — Consolidação Tri-Runtime Cloud

**Data:** 2026-09-20  
**Status:** ACCEPTED BY HUMAN DIRECTION / IMPLEMENTATION IN REVIEW

## Decisão

1. GitHub será o plano de controle durável da engenharia.
2. Claude Code será priorizado em cloud/web, não como supervisor local permanente.
3. OpenAI continuará com ChatGPT/Codex e poderá evoluir para Agents API.
4. Antigravity continuará local, com seis agentes físicos conforme a configuração que está funcionando para o usuário.
5. R1-R9 permanecem as únicas funções canônicas.
6. Supabase poderá ser usado como event bus/scheduler para eventos do produto, não como autoridade de agentes.
7. O protótipo Claude local do ZIP será fonte de padrões, não importado integralmente.
8. Nenhum runtime recebe escrita autônoma em produção por padrão.

## Motivo

A arquitetura anterior corria o risco de criar três sistemas paralelos. O desenho cloud-first preserva a diversidade de motores, mas move estado, ownership, revisão e evidência para o repositório compartilhado.

## Consequência

Próximo trabalho deve ser integração e smoke test dos adapters, não expansão do número de agentes.
