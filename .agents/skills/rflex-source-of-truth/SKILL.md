---
name: rflex-source-of-truth
description: >-
  Ensina o procedimento padrão para consultar a fonte de verdade do Rflex01
  antes de iniciar qualquer tarefa ou proposta técnica.
---

# Procedimento Padrão — Fonte de Verdade (Rflex01)

Todo agente deve seguir estes passos estritos antes de propor ou executar qualquer modificação:

1. **Leitura do Status Operacional:**
   - Inspecione `docs/STATUS_PROJETO.md`.
   - Verifique a frente funcional ativa e os limites estabelecidos.
2. **Precedência do Código Canônico:**
   - O código real existente no repositório prevalece sobre memórias ou suposições.
   - Em caso de conflito entre documentação antiga e código em execução, o código reflete a realidade do sistema.
3. **Confirmação de Escopo:**
   - Nunca assuma contratos ou campos no banco de dados que não estejam formalmente definidos nas migrations do Supabase.
