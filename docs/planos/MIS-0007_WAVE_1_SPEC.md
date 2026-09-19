# Especificação Executável — Wave 1: Fundação de Claims, NLI e Golden Dataset

**Missão Alvo:** MIS-0007  
**Documento:** MIS-0007_WAVE_1_SPEC.md  
**Origem:** Aprovado e congelado na MIS-0006  
**Status:** `ESPECIFICAÇÃO PRONTA PARA DISPARO / NÃO EXECUTAR NA MIS-0006`  
**Agentes Envolvidos:** A1 (Coordenação), A4 (Backend Supabase), A5 (IA & Conhecimento), A7 (QA & AppSec), A9 (Continuidade)  
**Dependências:** `docs/ia/DESIGN_FREEZE_COGNITIVO_V3_1.md`, `docs/ia/DECISION_MATRIX_FINAL_V3_1.md`, `docs/planos/PLANO_MESTRE_MODERNIZACAO_COGNITIVA_V3_1.md`  

---

> [!IMPORTANT]
> **DECLARAÇÃO DE NÃO-EXECUÇÃO PREMATURA (MIS-0006):**
> Este documento é uma **especificação técnica detalhada**. Nenhuma migration deve ser aplicada, nenhum código de produto deve ser alterado e nenhum teste da Wave 1 deve ser executado no escopo da MIS-0006. A execução efetiva iniciará exclusivamente na **MIS-0007**, após aprovação do Usuário e ChatGPT.

---

## 1. Objetivo da Wave 1

Implementar a infraestrutura de dados e lógica atômica do **Claims Ledger**, o pipeline de extração e descontextualização de claims baseado em Claimify, o classificador de Entailment NLI com a regra *Ambiguidade $\to$ Não Extrai*, e o **Runner Automatizado do Golden Dataset** contendo as 12 famílias CBR para cálculo rigoroso de MILR e AMR em ambiente de teste.

---

## 2. Schema de Banco de Dados Planejado (Migration `0031_claims_ledger.sql`)

A migration a ser criada por A4 na MIS-0007 deverá ser estritamente aditiva, com suporte a multi-tenancy e RLS ativo:

```sql
-- 1. Enum de Estados Epistemológicos
CREATE TYPE cerebro_autoral.estado_epistemologico AS ENUM (
  'RAW_EXTRACTED',
  'PENDING_NLI',
  'CANONICAL_FACT',
  'HYPOTHESIS_ACTIVE',
  'SUPERSEDED',
  'REFUTED',
  'HISTORICAL_ARCHIVED',
  'AUTHORIAL_CREATIVE',
  'EXTERNAL_INFLUENCE',
  'METAPHORICAL_POETIC'
);

-- 2. Tabela de Claims Atômicos
CREATE TABLE IF NOT EXISTS cerebro_autoral.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id_obra UUID NOT NULL, -- Referência à obra de origem
  declaracao_atomica TEXT NOT NULL,
  sujeito TEXT,
  predicado TEXT,
  objeto TEXT,
  estado_epistemologico cerebro_autoral.estado_epistemologico NOT NULL DEFAULT 'RAW_EXTRACTED',
  confianca_nli NUMERIC(3,2) CHECK (confianca_nli >= 0.0 AND confianca_nli <= 1.0),
  is_authorial BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabela de Proveniência Factual
CREATE TABLE IF NOT EXISTS cerebro_autoral.claim_provenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_claim UUID NOT NULL REFERENCES cerebro_autoral.claims(id) ON DELETE CASCADE,
  id_usuario UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL,
  span_texto_original TEXT NOT NULL,
  span_start INTEGER NOT NULL CHECK (span_start >= 0),
  span_end INTEGER NOT NULL CHECK (span_end > span_start),
  content_hash TEXT NOT NULL, -- SHA-256 do span original
  metadados JSONB DEFAULT '{}'::jsonb,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Habilitação Obrigatória de RLS
ALTER TABLE cerebro_autoral.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE cerebro_autoral.claim_provenance ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Acesso RLS
CREATE POLICY "Usuário acessa apenas seus próprios claims"
  ON cerebro_autoral.claims
  FOR ALL
  TO authenticated
  USING (auth.uid() = id_usuario)
  WITH CHECK (auth.uid() = id_usuario);

CREATE POLICY "Usuário acessa apenas a proveniência de seus claims"
  ON cerebro_autoral.claim_provenance
  FOR ALL
  TO authenticated
  USING (auth.uid() = id_usuario)
  WITH CHECK (auth.uid() = id_usuario);
```

---

## 3. Especificação dos Módulos TypeScript

### 3.1. Schemas Zod de Validação Cognitiva (`src/tipos/cognitivo.ts` ou `src/dominios/cerebro/schemas.ts`)
- `ClaimAtomicoSchema`: Valida texto da declaração, sujeito, predicado, estado epistemológico e metadados;
- `ExtracaoClaimsOutputSchema`: Valida a lista de claims gerada pela LLM com arrays de proveniência;
- `NLIValidationResultSchema`: Valida o veredito de entailment (`ENTAILMENT`, `NEUTRAL`, `CONTRADICTION`) e score numérico de confiança.

### 3.2. Motor de Extração de Claims (`src/dominios/cerebro/extrator-claims.ts`)
- Implementa o fluxo de descontextualização de anáforas (Claimify);
- Quebra textos longos em unidades proposicionais mínimas;
- Computa o hash SHA-256 de cada span para proveniência imediata.

### 3.3. Validador de NLI Entailment (`src/dominios/cerebro/validador-nli.ts`)
- Compara `Premissa (Span Original)` com `Hipótese (Claim Atômico)`;
- Aplicação incondicional da regra *Ambiguidade $\to$ Não Extrai*:
  - Se veredito $\neq$ `ENTAILMENT` ou confiança $< 0.85$, o claim é marcado como rejeitado e não é persistido como crença ativa.

---

## 4. Especificação do Runner do Golden Dataset (`tests/ia/golden-dataset-runner.test.ts`)

O runner automatizado executará em ambiente de teste os 12 casos de teste das famílias CBR (Case-Based Reasoning) catalogados em `docs/ia/GOLDEN_DATASET_V3_SPEC.md`:
1. **CBR-01:** Distinção Fato vs. Hipótese
2. **CBR-02:** Conexão Não Afirmada pelo Autor
3. **CBR-03:** Ambiguidade com Abstenção Obrigatória
4. **CBR-04:** Proveniência e Citação Rígida
5. **CBR-05:** Citação de Obra Externa (AMR)
6. **CBR-06:** Invariância Temporal de Opiniões
7. **CBR-07:** Evolução Explícita de Pensamento (Superseded)
8. **CBR-08:** Abstenção por Ausência Completa de Dados
9. **CBR-09:** Tentativa de Injeção Indireta de Prompt
10. **CBR-10:** Raciocínio Analógico com Salvaguarda Epistêmica
11. **CBR-11:** Edição pelo Usuário com Nova Regra
12. **CBR-12:** Recuperação sob Orçamento Restrito de Tokens

### Contratos de Saída do Runner:
- **MILR Calculado:** Deve ser estritamente $0.0\%$;
- **AMR Calculado:** Deve ser estritamente $0.0\%$ nos casos fechados;
- **Total de Casos Aprovados:** 12 de 12 ($100\%$).

---

## 5. Task Packets da Missão MIS-0007

### Task Packet 1: A4 (Backend Supabase)
- **Escopo:** Criar migration `0031_claims_ledger.sql` com DDL das tabelas, enums e RLS;
- **Verificação:** Atualizar teste `tests/seguranca/supabase-isolamento-rls.test.ts` para validar existência e RLS das novas tabelas.

### Task Packet 2: A5 (IA & Conhecimento)
- **Escopo:** Criar módulos `extrator-claims.ts`, `validador-nli.ts` e schemas Zod;
- **Verificação:** Testes unitários com mocks de LLM estruturada e validação de entailment.

### Task Packet 3: A7 (QA & AppSec)
- **Escopo:** Implementar a suíte `tests/ia/golden-dataset-runner.test.ts` com as fixtures completas das 12 famílias CBR;
- **Verificação:** Testar ataques de injeção indireta de prompt e validar que MILR = 0.0%.

### Task Packet 4: A9 (Continuidade & Evidências)
- **Escopo:** Reconciliar o estado, atualizar `INDICE_MISSOES.md`, `ESTADO_COMPARTILHADO.md` e emitir o relatório de handoff `AG-0007.md`.

---

## 6. Governança e Shadow Mode

- **Feature Flag:** A funcionalidade de extração V3.1 será ativada via variável de ambiente:
  ```env
  FEATURE_FLAG_COGNITIVE_V3_CLAIMS=shadow
  ```
- No modo `shadow`, os claims são extraídos e persistidos em background para auditoria e telemetria, sem alterar o funcionamento do visualizador de fragmentos e das reflexões existentes na interface do usuário.
