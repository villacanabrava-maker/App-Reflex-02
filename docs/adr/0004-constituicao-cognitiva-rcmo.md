# ADR 0004 — Constituição Cognitiva V1, Paradigma RCMO e Separação Ontológica em Quatro Camadas

- **Status:** Aceito (Consolidação Normativa da Arquitetura de Inteligência)
- **Data:** 20 de setembro de 2026
- **Decisores:** R1 (Orchestrator), R2 (Architecture), R3 (Data & Supabase), R4 (Product & Frontend), R5 (Cognitive & Knowledge), R6 (QA, Security & Evals), R7 (Platform & Runtime), R8 (Research & Evolution), R9 (Continuity & Evidence), Usuário Soberano
- **Missão Relacionada:** `NEXT-COGNITIVE-CONSTITUTION-RCMO` (`TP-RCMO-00`)

---

## 1. Contexto e Motivação

O **ADR 0003** estabeleceu os alicerces epistemológicos essenciais para o App Reflex 02 ao introduzir a teoria atômica de *Claims*, os 10 estados epistemológicos, o *Memory-Inference Firewall* e a reclassificação de parâmetros numéricos como *Baseline Experimental*.

Entretanto, uma auditoria aprofundada dos serviços de processamento (`src/dominios/processamento` e `src/dominios/cerebro`) revelou que a implementação de código herdada ainda sofria de acoplamento severo e vulnerabilidades ontológicas:
1. **Acoplamento Indevido de Camadas:** Mistura do texto bruto da obra com fragmentos de indexação e deduções sintéticas no mesmo nível de abstração.
2. **Ausência de um Ciclo Formal de Processamento:** Falta de uma esteira canônica de quatro fases que guie o processamento desde o upload físico até a síntese e abstenção honesta.
3. **Fragilidade Epistêmica na Extração das 18 Dimensões:** A gravação hardcoded de confianças estáticas (ex: 0.92) e de estados confirmados diretamente pela IA sem a validação soberana do autor.
4. **Falta de Governança de Abstenção:** Inexistência de regras estritas que instruam o modelo a silenciar honestamente perante a falta ou contradição de evidências.

Para eliminar definitivamente essas inconsistências antes de qualquer mutação de código ou migração no banco de dados, este **ADR 0004** sanciona a **Constituição Cognitiva V1** e o pipeline **RCMO**.

---

## 2. Decisões Arquiteturais Fundamentais

1. **Instituição da Constituição Cognitiva V1 como Norma Suprema:**
   Fica promulgada a [`docs/ia/CONSTITUICAO_COGNITIVA_V1.md`](file:///E:/APP/Reflex%2002/reflex02/docs/ia/CONSTITUICAO_COGNITIVA_V1.md) como o regulamento magno que rege todas as decisões, serviços, prompts e testes da inteligência do App Reflex 02.

2. **Separação Ontológica Obrigatória em Quatro Camadas:**
   O fluxo de dados do sistema passa a obedecer a fronteiras intransponíveis:
   * **Camada 0 (Obra & Fonte Física):** Imutável, sob custódia criptográfica (SHA-256).
   * **Camada 1 (Estrutura Documental):** Decomposição sintática e determinística (documentos, seções com `heading_path`, fragmentos sem quebra no meio de sentenças).
   * **Camada 2 (Unidades Cognitivas Atômicas):** Proposições atômicas descontextualizadas (*Claims*), taxonomia SKOS W3C, vetores densos contextuais e rastreamento byte-a-byte de proveniência.
   * **Camada 3 (Cérebro Autoral):** As 18 dimensões metodológicas canônicas, características e regras governadas pelo monopólio autoral humano.

3. **Adoção do Paradigma RCMO (Read-Contextualize-Model-Output):**
   Todo o processamento cognitivo passa a ser modelado nas quatro etapas canônicas:
   * **Read:** Leitura higiênica e determinística, rejeitando ativamente arquivos corrompidos ou sem OCR.
   * **Contextualize:** Contextual Retrieval (resumo pai prefixado em cada fragmento) e preservação estrita de parágrafos.
   * **Model:** Fatoração em claims, validação por NLI Entailment, classificação nos 10 estados epistemológicos e cálculo do Vetor de Confiança de 10 dimensões.
   * **Output:** Montagem do Dossiê Contextual sob isolamento de inferências (*Memory-Inference Firewall*) e aplicação mandatória de uma das 7 modalidades de Abstenção Honesta caso o suporte seja insuficiente.

4. **Governança Formal das 18 Dimensões nos Três Planos:**
   Formaliza-se a especificação técnica unificada ([`docs/ia/PROTOCOLO_18_DIMENSOES_ESPECIFICACAO.md`](file:///E:/APP/Reflex%2002/reflex02/docs/ia/PROTOCOLO_18_DIMENSOES_ESPECIFICACAO.md)) organizando o catálogo em **Plano de Conteúdo**, **Plano de Método** e **Plano de Expressão**, vinculados estritamente a propostas (`cerebro_autoral.propostas_atualizacao`).

5. **Consagração do Monopólio Autoral Humano:**
   Nenhum serviço ou modelo tem autoridade para inserir características ou regras como `confirmada`. Toda inferência ou padrão detectado é uma `proposta` pendente de auditoria humana.

---

## 3. Consequências

### Positivas:
- **Imunidade Cognitiva:** O sistema é estruturalmente blindado contra a contaminação da voz do autor por alucinações da máquina.
- **Rastreabilidade e Auditabilidade Total:** Qualquer claim ou reflexão sintetizada pode ser rastreada instantaneamente até o trecho literal exato da fonte física original.
- **Modularidade Limpa:** A separação das 4 camadas permite que melhorias no extrator de texto (Camada 0/1) ou no modelo de NLI (Camada 2) ocorram sem refatorar a base de dados do Cérebro Autoral (Camada 3).
- **Consistência Tripartite:** Os três runtimes (Antigravity 2.0, Claude Code e OpenAI Codex) passam a operar sob a mesma constituição conceitual inequívoca.

### Trade-offs e Mitigações:
- **Sobrecarga de Validação em Ingestão:** O pipeline RCMO exige validações NLI e cálculos de proveniência atômica que aumentam a latência da ingestão.
  *Mitigação:* Processamento em background assíncrono com filas isoladas; descarte preventivo de sentenças ambíguas sem chamada desnecessária de LLM.
- **Disciplina Operacional Rígida:** Desenvolvedores e agentes são impedidos de criar rotas de bypass que salvem deduções diretamente como dados confirmados.
  *Mitigação:* Testes automatizados de segurança e validação contínua via suíte de Evals (MILR).

---

## 4. Relação com Decisões Anteriores

- **ADR 0001 (Fundação Arquitetural):** Preservado. Mantém o PostgreSQL 17 relacional/pgvector e a arquitetura Next.js.
- **ADR 0002 (Arquitetura Cognitiva V3):** Mantido como marco histórico e superado nos aspectos de granularidade e limites heurísticos rígidos.
- **ADR 0003 (Modelo Epistemológico V3.1):** Consolidado e operacionalizado. As decisões de claims e firewall do ADR 0003 tornam-se as cláusulas normativas constitutivas deste ADR 0004 e da Constituição Cognitiva V1.
