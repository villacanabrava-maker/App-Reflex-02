# Arquitetura de Consolidação Offline e Replay Computacional V3 — App Reflex 02

**Data:** 18 de setembro de 2026  
**Líder Técnico:** A5 (rflex-ai-knowledge) & A8 (rflex-research-evolution)  
**Revisão de Infraestrutura e Custos:** A4 (rflex-backend-supabase) & A6 (rflex-platform)  

---

## 1. Princípio da Consolidação Assíncrona

A aprendizagem contínua em sistemas cognitivos não pode ocorrer de forma síncrona durante a navegação do usuário (o que causaria lentidão inaceitável na interface) nem através de reindexação global indiscriminada (o que causaria explosão incontrolável de custos de API).

O App Reflex 02 V3 introduz a **Esteira de Consolidação Assíncrona e Replay Incremental**, inspirada no ciclo biológico de vigília-sono:

```
[INGESTÃO DE OBRAS / EDIÇÕES]
            │
            ▼
┌───────────────────────┐
│ Fila de Consolidação  │ ◄─── Armazena eventos pendentes de síntese
└───────────┬───────────┘
            │
            ▼ (Acionado por gatilhos controlados / limites de orçamento)
┌───────────────────────┐
│ Motor de Consolidação │ ───► 1. Deduplicação semântica de conceitos
│  (Replay Específico)  │ ───► 2. Detecção de recorrências transversais
└───────────┬───────────┘ ───► 3. Identificação de contradições e desvios
            │
            ▼
┌───────────────────────┐
│  Fila de Propostas    │ ───► Gera PROPOSTAS estruturadas para o autor,
│  (Human-in-the-Loop)  │      NUNCA verdades automáticas
└───────────────────────┘
```

---

## 2. O Mecanismo de Replay Computacional

### O Que É Replay no App Reflex 02?
O Replay computacional é o processo de **revisitar materiais previamente indexados sob a luz de novos conhecimentos adquiridos**, sem reprocessar todo o acervo do zero.

### Cenários de Disparo do Replay
1. **Evolução de um Conceito Taxonômico:** Quando o autor formaliza um novo conceito raiz (ex: *Transparência Radical*), o replay revisita fragmentos antigos que continham termos similares para associá-los retroativamente ao novo conceito.
2. **Entrada de uma Nova Obra Central:** Quando um livro fundamental é adicionado à Biblioteca, o replay reavalia regras do Cérebro para verificar se a nova obra confirma ou refuta hipóteses metodológicas anteriores.
3. **Acúmulo de Edições Humanas:** Quando 5 ou mais reflexões recebem intervenções editoriais semelhantes pelo autor, o replay correlaciona as edições para propor uma nova regra procedural.

---

## 3. Gestão de Contradições e Ambiguidade

Quando duas passagens do autor parecem expressar ideias opostas (ex: em 2024 o autor defende *estruturas centralizadas* e em 2026 defende *descentralização emergente*), o sistema **NUNCA** apaga a versão antiga nem tenta "harmonizar" forçadamente o texto.

A V3 adota o **Protocolo de Contradição Estruturada**:
1. Ambas as evidências são preservadas na memória episódica com seus respectivos timestamps (`2024` vs `2026`).
2. O sistema classifica a divergência:
   - *Evolução Temporal:* Mudança explícita de visão com o tempo.
   - *Tensão Dialética:* O autor defende um polo em um contexto específico e o outro polo em contexto diverso.
   - *Exceção Contextual:* Regra válida em 90% dos casos, com exceção deliberada.
3. No Dossiê da Tarefa, o sistema expõe: *"Atenção: o autor expressou visões divergentes sobre este ponto em 2024 (Obra A) e 2026 (Obra B). Qual postura adotar para este ensaio?"*.

---

## 4. Política de Orçamento e Controle de Custos de Tokens

Para garantir a viabilidade operacional:
- **Teto de Execuções Diárias:** No máximo 1 lote de consolidação por dia ou acionado manualmente pelo autor no painel.
- **Orçamento por Sessão de Replay:** Limite máximo de **50.000 tokens** de entrada por ciclo de consolidação.
- **Modelos Econômicos:** Tarefas de varredura e agrupamento usam `gpt-4o-mini` ($0.15 / 1M tokens) ou processamento puramente SQL; apenas a síntese final de proposta utiliza `gpt-4o`.
- Custo mensal estimado de consolidação: **inferior a US$ 1,50/mês**.
