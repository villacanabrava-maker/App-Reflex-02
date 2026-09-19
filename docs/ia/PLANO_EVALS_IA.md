# Plano de Avaliação e Benchmark Cognitivo (Evals IA) — App Reflex 02

**Data:** 18 de setembro de 2026  
**Líder Técnico:** A5 (rflex-ai-knowledge) & A7 (rflex-qa-security)  
**Metodologia de Pesquisa:** A8 (rflex-research-evolution)  

---

## 1. Por Que Evals São Essenciais

No App Reflex 02, melhorias em prompts ou modelos não podem se basear em impressões subjetivas momentâneas. É indispensável instituir um arcabouço formal de testes de regressão cognitiva (**LLM Evals**), permitindo mensurar objetivamente se uma alteração arquitetural realmente tornou o sistema mais fiel, explicável e aderente ao estilo do autor.

---

## 2. Dimensões de Avaliação por Módulo

### 1. Extração e Normalização
- **Fidelidade Literal:** Índice de preservação de texto (Character Error Rate e Word Error Rate próximos de 0%).
- **Rejeição de Lixo Binário:** Taxa de 100% de detecção e rejeição de arquivos malformados.
- **Detecção de OCR:** Precisão na sinalização de PDFs que necessitam de camada OCR.

### 2. Taxonomia e Conceitos
- **Precisão Conceitual:** Porcentagem de conceitos propostos pela IA que são aceitos pelo autor (Meta >= 75%).
- **Taxa de Duplicação Semântica:** Proporção de conceitos redundantes sugeridos (Meta <= 5%).
- **Cobertura de Evidências:** Porcentagem de conceitos com citações literais contextuais válidas (Meta: 100%).

### 3. Retrieval e Memória Contextual
- **Recall@K (k=5, 10):** Se as memórias indispensáveis para o tema foram efetivamente recuperadas.
- **Precisão Contextual:** Razão de fragmentos recuperados que são semanticamente pertinentes ao tema.
- **Isolamento Autoral:** Garantia de prioridade e não-contaminação entre Núcleo Autoral e Influências Externas.

### 4. Cérebro Autoral e Regras
- **Calibração de Confiança:** Correlação entre a confiança calculada pelo algoritmo e a aprovação humana.
- **Detecção de Anti-Regras:** Capacidade de extrair proscrições legítimas a partir de contraexemplos no texto.

### 5. Redação e Personalização de Reflexões
- **Não-Caricatura:** Ausência de clichês artificiais de IA.
- **Aderência ao Plano:** Se o texto seguiu estritamente as teses e movimentos argumentativos aprovados.
- **Rastreabilidade de Citações:** Porcentagem de afirmações centrais com citação explícita de fragmentos do Cérebro.

---

## 3. O Golden Dataset Inicial (Corpus Dourado de Calibração)

Propõe-se a criação de um repositório interno de testes de avaliação contendo 10 amostras calibradas:

1. **Amostra 1 (Ensaio Denso):** Texto longo autoral para validar chunking semântico e extração taxonômica.
2. **Amostra 2 (PDF Digitalizado sem Texto):** Arquivo para comprovar o acionamento do alerta de OCR.
3. **Amostra 3 (DOCX com Formatação Complexa):** Documento com tabelas e notas para validar parser XML.
4. **Amostra 4 (Texto com Sinônimos e Aliases):** Conjunto para testar a deduplicação taxonômica.
5. **Amostra 5 (Fragmentos com Regras Prescritivas Claras):** Para testar o extrator de características.
6. **Amostra 6 (Fragmentos com Contraexemplos):** Para testar a penalidade de confiança em regras fracas.
7. **Amostra 7 (Tema sem Fontes no Banco):** Para testar o bloqueio de contexto aleatório no redator.
8. **Amostra 8 (Par de Reflexão v1 e Edição v2 do Autor):** Para validar o diff semântico de aprendizado.
9. **Amostra 9 (Documento Externo com Opiniões Divergentes):** Para testar isolamento autoral vs externo.
10. **Amostra 10 (Buffer Binário Malformado):** Para validação contínua de resiliência e segurança.

Este dataset servirá como o padrão ouro de testes automatizados para todas as evoluções cognitivas a partir da Missão MIS-0004.
