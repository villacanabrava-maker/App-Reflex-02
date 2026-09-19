# ROADMAP EXECUTÁVEL V3.1 — CÉREBRO REFLEX
### Cronograma Sequencial em 10 Fases Orientadas a Claims e Integridade Epistêmica
**Missão:** MIS-0005 | **Status:** Normativo e Planejamento | **Data:** 2026-09-18

---

## 1. A Nova Ordem Estrutural de Implementação

> [!IMPORTANT]
> **MUDANÇA CRÍTICA DE SEQUÊNCIA:**  
> O roadmap original da V3 propunha criar tabelas e melhorar a busca antes de resolver a proveniência dos fatos.  
> O **Roadmap V3.1 inverte essa lógica**: **Claims, Proveniência e Estados Epistemológicos são pré-requisitos absolutos para todo o resto**. Sem a validação atômica de claims, qualquer otimização de busca (retrieval) serve apenas para recuperar e amplificar inferências espúrias com mais rapidez e convicção.

---

## 2. As 10 Fases Sequenciais da V3.1

```mermaid
flowchart LR
    F1[Fase 1: Claims & Provenance] --> F2[Fase 2: Golden Dataset & MILR]
    F2 --> F3[Fase 3: Episodic Event Ledger]
    F3 --> F4[Fase 4: Retrieval Multi-Rota]
    F4 --> F5[Fase 5: Dossiê Epistemológico]
    F5 --> F6[Fase 6: Auditor Cognitivo]
    F6 --> F7[Fase 7: Consolidação Lenta]
    F7 --> F8[Fase 8: Memória Procedural]
    F8 --> F9[Fase 9: Temporalidade & Contradições]
    F9 --> F10[Fase 10: Interface do Cérebro]
```

---

### Fase 1: Claim, Provenance e Estados Epistemológicos (A Base Epistêmica)
- **Objetivo:** Definir a estrutura atômica de claims, o protocolo de descontextualização de sentenças e a validação por NLI Entailment (*Ambiguidade $\to$ Não Extrai*).
- **Entregáveis:** Validador de NLI isolado, extrator de proposições e modelo lógico dos 10 estados epistêmicos.
- **Critério de Saída:** Extração sem anáforas e sem ambiguidade em amostras reais da biblioteca.

### Fase 2: Framework de Evals e Medição de Memory-Inference Leakage (MILR)
- **Objetivo:** Instalar a régua de medição de vazamento de inferência antes de tocar nos motores de geração.
- **Entregáveis:** As 12 famílias de casos CBR com casos positivos, negativos e ambíguos. Runner automatizado de cálculo de MILR.
- **Critério de Saída:** Linha de base de MILR do sistema legado documentada.

### Fase 3: Livro-Razão de Eventos Episódicos (`memory_events`)
- **Objetivo:** Estabelecer a fonte única e imutável da verdade (append-only ledger) no PostgreSQL 17.
- **Entregáveis:** Migration que cria `memory_events` e funções seguras de gravação de eventos imutáveis com RLS.
- **Critério de Saída:** Todo ato de ingestão ou extração gera um evento auditável com SHA-256.

### Fase 4: Retrieval Multi-Rota com Abstenção Honesta
- **Objetivo:** Implementar as rotas de recuperação (densa, léxica, temporal e relacional) combinadas via RRF.
- **Entregáveis:** Stored Procedure no Postgres para fusão de rankings e mecanismo estruturado de abstenção nas 7 modalidades.
- **Critério de Saída:** 100% de abstenção correta nos casos da família `CBR-ABSTENTION`.

### Fase 5: Dossiê Epistemológico (Working Memory) e Allowed Use
- **Objetivo:** Estruturar os 9 compartimentos da janela de contexto com orçamentos estritos e tags de uso permitido.
- **Entregáveis:** Assembler do Dossiê Contextual respeitando orçamentos dinâmicos (2k a 16k tokens) e regras de `allowed_use`.
- **Critério de Saída:** Nenhuma inferência ou citação externa recebe tag de afirmação autoral no prompt.

### Fase 6: Auditor Cognitivo Pós-Geração (Firewall em Tempo Real)
- **Objetivo:** Interceptar toda saída gerada pelo LLM, desmontar em claims e verificar a correspondência estrita com o Dossiê.
- **Entregáveis:** Pipeline de auditoria NLI pós-geração com bloqueio automático e reformulação atenuada.
- **Critério de Saída:** Zero vazamentos de inferência ($MILR = 0.0\%$) nos testes de stress.

### Fase 7: Consolidação Semântica Lenta e Multi-Gatilho
- **Objetivo:** Sintetizar conhecimentos estáveis a partir de múltiplos episódios e claims sem sobrescrever dados históricos.
- **Entregáveis:** Worker assíncrono acionado por múltiplos gatilhos (volume, novos documentos, clusters semânticos e ação manual).
- **Critério de Saída:** Princípio de Pattern Separation mantido (nenhum merge destrutivo por proximidade de vetor).

### Fase 8: Memória Procedural Longitudinal e Aprendizado por Edição
- **Objetivo:** Aprender rituais, métodos e estilo do autor a partir de suas correções reais, sem sobreajuste.
- **Entregáveis:** Diff semântico categorizado nas 6 dimensões da personalização e controle de convergência (mínimo de 3 evidências).
- **Critério de Saída:** Nenhuma regra vira padrão sem aprovação explícita (*Human-in-the-Loop*).

### Fase 9: Grafo Bitemporal e Gestão de Contradições
- **Objetivo:** Integrar as 12 arestas epistemológicas, o tempo bitemporal (`valid_from` vs `observed_at`) e o objeto de contradição.
- **Entregáveis:** Navegação relacional via SQL recursivo (`WITH RECURSIVE`) e painel de tensões conceituais abertas.
- **Critério de Saída:** Consultas históricas (*"O que eu pensava em 2023?"*) respondidas sem anacronismos.

### Fase 10: Interface do Cérebro Autoral V3.1
- **Objetivo:** Proporcionar ao autor visibilidade total sobre sua mente ampliada, linhagem de afirmações e metamemória.
- **Entregáveis:** Visualizador do grafo relacional, gaveta de evidências auditáveis por frase e painel de regras aprendidas.
- **Critério de Saída:** UX fluida, acessível (WCAG AA), transparente e esteticamente alinhada ao design system.

---

## 3. O Princípio Permanente do Reflex

> **"A inteligência do Reflex será avaliada menos por 'quão impressionante é a resposta' e mais por 'quanto ela sabe separar memória, evidência, inferência, hipótese, contradição e desconhecimento'."**
