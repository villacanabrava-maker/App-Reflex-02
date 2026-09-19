# Arquitetura de Inteligência Personalizada V2 — App Reflex 02

**Data:** 18 de setembro de 2026  
**Líder Técnico:** A5 (rflex-ai-knowledge)  
**Coordenação Geral:** A1 (rflex-architect)  
**Pesquisa e Estado da Arte:** A8 (rflex-research-evolution)  
**Auditoria de Segurança:** A7 (rflex-qa-security)  
**Reconciliação e Continuidade:** A9 (rflex-continuity-evidence)  

---

## 1. Visão Geral e Princípios Fundamentais

A **Arquitetura Cognitiva V2** do App Reflex 02 tem por objetivo transformar o sistema de um simples executor de chamadas de LLM em uma verdadeira **Memória Reflexiva e Cérebro Autoral Explicável**.

### Princípios Inegociáveis
1. **Fidelidade Epistêmica sobre Criatividade Genérica:** O sistema não busca impressionar com figuras de linguagem artificiais; busca refletir fielmente o método e o pensamento do autor.
2. **Proveniência Inquebrável:** Todo argumento, regra ou conceito gerado deve apontar para o fragmento textual original do qual se originou.
3. **Contexto Insuficiente > Contexto Aleatório:** Eliminação de qualquer fallback silencioso para memórias desconexas.
4. **Confiança Explicável e Human-in-the-Loop:** A IA sugere e calcula evidências; somente o autor confirma regras do seu próprio cérebro.
5. **Enriquecimento Taxonômico Não Inflacionário:** Grafo conceitual vivo com deduplicação semântica e limiares rigorosos de ativação.

---

## 2. As Sete Camadas da Arquitetura V2

```
┌─────────────────────────────────────────────────────────────┐
│ 7. Loop de Aprendizado por Edição (Diff Semântico e Regras) │
├─────────────────────────────────────────────────────────────┤
│ 6. Motor Redator de Reflexões (Com Contexto Cirúrgico)     │
├─────────────────────────────────────────────────────────────┤
│ 5. Planejador Cognitivo (Tese / Antítese / Síntese)         │
├─────────────────────────────────────────────────────────────┤
│ 4. Retrieval Híbrido Multidimensional (FTS + Vetor + Grafo) │
├─────────────────────────────────────────────────────────────┤
│ 3. Cérebro Autoral & Taxonomia Viva (Grafo de Conceitos)    │
├─────────────────────────────────────────────────────────────┤
│ 2. Chunking Estrutural Semântico (Parent-Child)             │
├─────────────────────────────────────────────────────────────┤
│ 1. Extraction Quality Gate (Inspeção Prévia de Saúde)       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Matriz de Perfis de IA (AI Task Profiles)

| Perfil de Tarefa | Modelo Recomendado | Temperatura | Schema Zod | Estratégia de Fallback | Critério de Avaliação |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Extração Semântica** | `gpt-4o-mini` | 0.0 | `EsquemaExtracaoZod` | Erro explícito | Precisão literal |
| **Classificação Taxonômica** | `gpt-4o` | 0.1 | `EsquemaTaxonomiaZod` | Manter estado anterior | Deduplicação semântica |
| **Análise de Dimensões** | `gpt-4o` | 0.2 | `EsquemaDimensoesZod` | Proposta em revisão | Cobertura de evidências |
| **Planejamento de Ensaio** | `gpt-4o` | 0.3 | `EsquemaPlanoZod` | Pedir refinamento ao autor | Coerência argumentativa |
| **Redação Autoral** | `gpt-4o` | 0.3 | `EsquemaRedacaoZod` | Alerta de falta de contexto | Não-caricatura e estilo |
| **Diff Semântico de Edição** | `gpt-4o-mini` | 0.0 | `EsquemaDiffEdicaoZod` | Log de auditoria | Detecção de tensão real |
| **Embeddings Vetoriais** | `text-embedding-3-small`| N/A | Vetor 1536 dim | Retry com backoff | Similaridade de cosseno |

---

## 4. Roteiro de Implementação para as Próximas Missões

A implementação completa da Arquitetura V2 ocorrerá em ciclos progressivos orquestrados pelo protocolo triangular:
- **Ciclo 1 (MIS-0004):** Implementação do *Extraction Quality Gate* e do novo *Chunking Estrutural Parent-Child*.
- **Ciclo 2 (MIS-0005):** Ativação em produção do *Motor Taxonômico com Deduplicação* e *Retrieval Híbrido FTS + Vetor + Grafo*.
- **Ciclo 3 (MIS-0006):** Reformulação do *Analisador de Dimensões* com a fórmula explicável de confiança e eliminação definitiva de fallbacks aleatórios no redator.
- **Ciclo 4 (MIS-0007):** Ativação da *Fila de Aprendizado Autoral por Diff Semântico* e consolidação do Golden Dataset.
