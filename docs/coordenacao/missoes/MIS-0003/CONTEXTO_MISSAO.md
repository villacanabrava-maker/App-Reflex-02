# Dossiê da Missão MIS-0003: Fundação de Dados + Mapa de Inteligência

**ID da Missão:** MIS-0003  
**Prompt Vinculado:** CG-0001  
**Agentes Envolvidos:** A1 (Coordenação), A4 (Backend Supabase), A5 (IA e Conhecimento), A7 (QA/Segurança), A8 (Pesquisa e Evolução), A9 (Continuidade e Evidência)  
**Commit Inicial:** `0ecf754b255fe943e0724db0270c7b3b857287cf`  
**Data de Início:** 18 de setembro de 2026  

---

## 1. Escopo Autorizado

1. **Supabase (A4 / A1 / A7):**
   - Identificar paridade real das migrations 0001 a 0029.
   - Auditar schemas (`public`, `sistema`, `biblioteca`, `processamento`, `taxonomia`, `cerebro_autoral`, `reflexoes`, `auditoria`, `storage`, `auth`).
   - Auditar RLS e privilégios (atenção especial a `sistema.*`).
   - Auditar views, triggers, RPCs e funções de segurança.
   - Auditar buckets de Storage (`originais-biblioteca`, `fontes-reflexoes`).
   - Produzir documentação em `docs/supabase/`.
   - Aplicar correções seguras Classe A (se identificadas lacunas claras e não-destrutivas).
   - Testes automatizados de isolamento de tenant e segurança.

2. **Inteligência Artificial (A5 / A8 / A1 / A7):**
   - Mapear pipeline ponta a ponta (arquivo original → extração → chunking → sínteses → embeddings → taxonomia → Cérebro → retrieval → reflexão → aprendizado).
   - Investigar `extrator-texto.ts` (PDF e DOCX, fallback binário UTF-8).
   - Investigar `analisador-dimensoes.ts` (confiança fixa 0.92 e estado "confirmada").
   - Investigar motor de reflexões e fallback de memórias aleatórias.
   - Investigar motor taxonômico e enriquecimento conceitual.
   - Projetar Arquitetura de Inteligência Personalizada V2 e plano de Evals.
   - Produzir documentação detalhada em `docs/ia/`.

3. **Reconciliação e Handoff (A9):**
   - Gerar `docs/coordenacao/antigravity-para-chatgpt/AG-0002.md`.
   - Atualizar `ESTADO_COMPARTILHADO.md`, `INDICE_MISSOES.md` e `STATUS_PROJETO.md`.
