# PROTOCOLO DAS 18 DIMENSÕES AUTORAIS — ESPECIFICAÇÃO TÉCNICA
### Catálogo Canônico de Extração, Modelagem e Governança por Planos Cognitivos
**Status:** Normativo e Canônico | **Versão:** 1.0.0 | **Data:** 20 de setembro de 2026  
**Documento de Origem:** Missão `NEXT-COGNITIVE-CONSTITUTION-RCMO` (`TP-RCMO-00`)  
**Referência Estrutural:** `supabase/migrations/0002_sistema_e_taxonomia.sql` e `0005_taxonomia_e_cerebro.sql`  

---

## 1. VISÃO GERAL E DIVISÃO EM TRÊS PLANOS

As 18 dimensões metodológicas do Cérebro Autoral constituem o vocabulário formal através do qual a inteligência do App Reflex 02 compreende a singularidade do autor.

Elas estão organizadas em **Três Planos Fundamentais**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    OS TRÊS PLANOS DO CÉREBRO AUTORAL                    │
├───────────────────┬───────────────────────────────┬─────────────────────┤
│ PLANO DE CONTEÚDO │        PLANO DE MÉTODO        │ PLANO DE EXPRESSÃO  │
│ (O que ele pensa) │     (Como ele raciocina)      │ (Como ele escreve)  │
├───────────────────┼───────────────────────────────┼─────────────────────┤
│ 17. Universo      │ 1.  Metodol. de Pensamento    │ 7.  Arq. Narrativa  │
│     Conceitual    │ 2.  Metodol. de Interpretação │ 8.  Arq. Parágrafo  │
│                   │ 3.  Metodol. de Associação    │ 9.  Formas Abertura │
│                   │ 4.  Metodol. Argumentativa    │ 10. Formas Transição│
│                   │ 5.  Metodol. de Escrita       │ 11. Formas Conclusão│
│                   │ 6.  Metodol. de Revisão       │ 12. Recursos Retór. │
│                   │ 14. Rel. Experiência-Conceito │ 13. Ident. Linguíst.│
│                   │ 15. Padrões de Tensão         │                     │
│                   │ 16. Padrões de Síntese        │                     │
│                   │ 18. Evolução Autoral          │                     │
└───────────────────┴───────────────────────────────┴─────────────────────┘
```

---

## 2. CONTRATO UNIVERSAL DE EXTRAÇÃO DE DIMENSÃO (SCHEMA ZOD)

Toda análise de dimensão dentro do ciclo RCMO gera uma estrutura formal estrita, compatível com o schema `cerebro_autoral`:

```typescript
import { z } from "zod";

export const ComponentesConfiancaSchema = z.object({
  support: z.number().min(0).max(1),
  provenance: z.number().min(0).max(1),
  independence: z.number().min(0).max(1),
  author_confirmation: z.number().min(0).max(1).default(0),
  temporal_fit: z.number().min(0).max(1),
  scope_fit: z.number().min(0).max(1),
  retrieval_stability: z.number().min(0).max(1),
  contradiction_load: z.number().min(0).max(1),
  model_agreement: z.number().min(0).max(1),
  historical_utility: z.number().min(0).max(1),
});

export const EvidenciaProposicaoSchema = z.object({
  fragmento_id: z.string().uuid(),
  citacao_literal: z.string().min(10),
  inicio_char: z.number().int().nonnegative(),
  fim_char: z.number().int().positive(),
  explicacao_contexto: z.string(),
});

export const PropostaCaracteristicaSchema = z.object({
  titulo: z.string().min(3).max(120),
  descricao: z.string().min(10),
  confianca: ComponentesConfiancaSchema,
  estado_epistemologico: z.enum([
    "extracted",
    "inferred",
    "hypothesized",
    "proposed"
  ]),
  evidencias: z.array(EvidenciaProposicaoSchema).min(1),
});

export const PropostaRegraSchema = z.object({
  tipo_regra: z.enum(["prescritiva", "proscritiva"]),
  enunciado: z.string().min(10).max(300),
  justificativa: z.string().min(10),
  peso_sugerido: z.number().min(0).max(1),
  evidencias: z.array(EvidenciaProposicaoSchema).min(1),
});

export const AnaliseDimensaoOutputSchema = z.object({
  dimensao_codigo: z.string(),
  plano: z.enum(["conteudo", "metodo", "expressao"]),
  abster: z.boolean(),
  motivo_abstencao: z.enum([
    "ABST_NO_EVIDENCE",
    "ABST_CONFLICTING",
    "ABST_ONLY_INFERRED",
    "ABST_OUT_OF_SCOPE",
    "ABST_LOW_CONFIDENCE",
    "ABST_DIRECTIVE_RISK",
    "ABST_CLARIFICATION_REQUIRED"
  ]).optional(),
  caracteristicas_propostas: z.array(PropostaCaracteristicaSchema).default([]),
  regras_propostas: z.array(PropostaRegraSchema).default([]),
});
```

---

## 3. PLANO DE CONTEÚDO (O QUE ELE PENSA)

### Dimensão 17: Universo Conceitual (`universo_conceitual`)
* **Código:** `universo_conceitual` | **Ordem:** 17 | **Plano:** `conteudo`
* **Definição Epistêmica:** Mapeamento da constelação de temas nucleares, ontologias fundamentais, conceitos recorrentes e obsessões intelectuais do autor.
* **Perguntas Heurísticas de Detecção:**
  1. *Quais são os conceitos nucleares em torno dos quais toda a reflexão gravita?*
  2. *Existem conceitos importados de outros autores que foram ressignificados com sentido próprio?*
  3. *Quais são as dicotomias e polaridades temáticas constantes na obra?*
* **Requisitos de Evidência:** Exige ao menos duas citações literais demonstrando uso sistemático do conceito em momentos ou seções distintas.
* **Critério de Abstenção:** Se o tema for mencionado incidentalmente como exemplo passageiro, abster-se de gerar proposta conceitual (`ABST_NO_EVIDENCE`).

---

## 4. PLANO DE MÉTODO (COMO ELE RACIOCINA)

### Dimensão 1: Metodologia de Pensamento (`metodologia_de_pensamento`)
* **Código:** `metodologia_de_pensamento` | **Ordem:** 1 | **Plano:** `metodo`
* **Definição Epistêmica:** Como o autor formula problemas, progride do concreto ao abstrato, decompõe complexidades e atinge formulações axiomáticas.
* **Perguntas Heurísticas:** *Ele parte de um fato particular para extrair uma lei universal? Utiliza dedução formal ou raciocínio indutivo fenomenológico?*
* **Abstenção:** Abster se o texto for meramente descritivo sem desdobramento epistemológico.

### Dimensão 2: Metodologia de Interpretação (`metodologia_de_interpretacao`)
* **Código:** `metodologia_de_interpretacao` | **Ordem:** 2 | **Plano:** `metodo`
* **Definição Epistêmica:** A hermenêutica do autor: como ele lê acontecimentos cotidianos, notícias, comportamentos humanos e atribui camadas ocultas de sentido.
* **Perguntas Heurísticas:** *Ele interpreta os fatos com desconfiança crítica (hermenêutica da suspeita) ou por acolhimento fenomenológico?*

### Dimensão 3: Metodologia de Associação (`metodologia_de_associacao`)
* **Código:** `metodologia_de_associacao` | **Ordem:** 3 | **Plano:** `metodo`
* **Definição Epistêmica:** Conexões transdisciplinares: como o autor liga experiências vividas a conceitos filosóficos, referências literárias, eventos históricos e teorias científicas.
* **Perguntas Heurísticas:** *Quais são as pontes analógicas preferenciais? Ele cruza biologia com política, ou literatura clássica com psicologia moderna?*

### Dimensão 4: Metodologia Argumentativa (`metodologia_argumentativa`)
* **Código:** `metodologia_argumentativa` | **Ordem:** 4 | **Plano:** `metodo`
* **Definição Epistêmica:** Estratégia de persuasão racional: formulação de teses, sustentações lógicas, antecipação de objeções e contra-ataques a premissas opostas.
* **Perguntas Heurísticas:** *Ele constrói argumentos por redução ao absurdo, por acumulação de evidências ou por refutação de contrafactuais?*

### Dimensão 5: Metodologia de Escrita (`metodologia_de_escrita`)
* **Código:** `metodologia_de_escrita` | **Ordem:** 5 | **Plano:** `metodo`
* **Definição Epistêmica:** Estruturação do fluxo de ideias: densidade informacional, cadência da prosa, respiração do leitor e equilíbrio entre narrativa e ensaio.
* **Perguntas Heurísticas:** *O autor prefere períodos longos e hipotáticos ou frases curtas e contundentes (estilo paratático)?*

### Dimensão 6: Metodologia de Revisão (`metodologia_de_revisao`)
* **Código:** `metodologia_de_revisao` | **Ordem:** 6 | **Plano:** `metodo`
* **Definição Epistêmica:** Aprendizado extraído do diff entre versões: o que o autor corta, o que acrescenta e como depura os rascunhos da IA.
* **Perguntas Heurísticas:** *Ele corta adjetivos supérfluos? Altera o tom emocional? Torna afirmações categóricas mais nuançadas?*
* **Critério Operacional:** Esta dimensão é alimentada exclusivamente pelo ciclo de **Aprendizado por Edição** (`diff-edicao`).

### Dimensão 14: Relação Experiência-Conceito (`relacao_experiencia_conceito`)
* **Código:** `relacao_experiencia_conceito` | **Ordem:** 14 | **Plano:** `metodo`
* **Definição Epistêmica:** O ponto de contato entre vida vivida e teoria abstrata: como uma cena do cotidiano é transmutada em insight filosófico.
* **Perguntas Heurísticas:** *A experiência serve apenas de ilustração didática ou é a gênese real do conceito?*

### Dimensão 15: Padrões de Tensão (`padroes_de_tensao`)
* **Código:** `padroes_de_tensao` | **Ordem:** 15 | **Plano:** `metodo`
* **Definição Epistêmica:** Sustentação de dilemas e paradoxos sem concessão a soluções fáceis ou harmonizações prematuras.
* **Perguntas Heurísticas:** *Quais tensões inconciliáveis o autor recusa resolver? (ex: liberdade vs segurança).*

### Dimensão 16: Padrões de Síntese (`padroes_de_sintese`)
* **Código:** `padroes_de_sintese` | **Ordem:** 16 | **Plano:** `metodo`
* **Definição Epistêmica:** Como o autor conclui raciocínios dialéticos complexos quando decide reconciliar ideias antagônicas.
* **Perguntas Heurísticas:** *Ele sintetiza por superação (Aufhebung), por coexistência ou por paradoxo mantido?*

### Dimensão 18: Evolução Autoral (`evolucao_autoral`)
* **Código:** `evolucao_autoral` | **Ordem:** 18 | **Plano:** `metodo`
* **Definição Epistêmica:** O vetor temporal da obra: transformações metodológicas, quebras epistemológicas e revisões de pensamento do autor ao longo dos anos.
* **Perguntas Heurísticas:** *Ele abandonou premissas antigas? O tom tornou-se mais austero ou mais lírico com o passar do tempo?*

---

## 5. PLANO DE EXPRESSÃO (COMO ELE ESCREVE)

### Dimensão 7: Arquitetura Narrativa (`arquitetura_narrativa`)
* **Código:** `arquitetura_narrativa` | **Ordem:** 7 | **Plano:** `expressao`
* **Definição Epistêmica:** Estruturação cênica e dramática: construção de arcos narrativos, viradas de perspectiva e ritmo de revelação da história.

### Dimensão 8: Arquitetura de Parágrafo (`arquitetura_de_paragrafo`)
* **Código:** `arquitetura_de_paragrafo` | **Ordem:** 8 | **Plano:** `expressao`
* **Definição Epistêmica:** A anatomia funcional do parágrafo: extensão média, papel da frase-tópico de abertura, desenvolvimento interior e fecho reflexivo.

### Dimensão 9: Formas de Abertura (`formas_de_abertura`)
* **Código:** `formas_de_abertura` | **Ordem:** 9 | **Plano:** `expressao`
* **Definição Epistêmica:** Padrões estilísticos do primeiro parágrafo: início por anedota pessoal, provocação polêmica, imagem sensorial ou citação aforística.

### Dimensão 10: Formas de Transição (`formas_de_transicao`)
* **Código:** `formas_de_transicao` | **Ordem:** 10 | **Plano:** `expressao`
* **Definição Epistêmica:** Mecanismos de transição entre blocos argumentativos: uso de perguntas retóricas, quebras bruscas com elipse ou conectores analíticos.

### Dimensão 11: Formas de Conclusão (`formas_de_conclusao`)
* **Código:** `formas_de_conclusao` | **Ordem:** 11 | **Plano:** `expressao`
* **Definição Epistêmica:** Como o autor encerra ensaios: pergunta provocativa ao leitor, retorno cíclico à imagem inicial ou projeção existencial.

### Dimensão 12: Recursos Retóricos (`recursos_retoricos`)
* **Código:** `recursos_retoricos` | **Ordem:** 12 | **Plano:** `expressao`
* **Definição Epistêmica:** Figuras de estilo recorrentes: metáforas conceituais, antíteses, paralelismos sintáticos, aliterações e ironia refinada.

### Dimensão 13: Identidade Linguística (`identidade_linguistica`)
* **Código:** `identidade_linguistica` | **Ordem:** 13 | **Plano:** `expressao`
* **Definição Epistêmica:** O timbre vocabular do autor: termos prediletos, neologismos aceitos, construções sintáticas preferenciais e vocabulário evitado.

---

## 6. REGRAS PRESCRITIVAS E ANTI-REGRAS PROSCRITIVAS

Toda dimensão pode gerar propostas de dois tipos de regras:

1. **Regras Prescritivas (`tipo_regra: 'prescritiva'`):**
   * *O que o modelo DEVE fazer ao emular a voz autoral.*
   * Exemplo: *"Nas aberturas, sempre ancorar o primeiro parágrafo em uma imagem concreta antes de generalizar o conceito."*
2. **Anti-Regras Proscritivas (`tipo_regra: 'proscritiva'`):**
   * *O que o modelo NUNCA PODE fazer ao redigir pelo autor.*
   * Exemplo: *"Nunca utilizar jargões corporativos de autoajuda (ex: 'mentalidade vencedora', 'mindset') ou analogias clínicas rasas."*

---

## 7. INTEGRAÇÃO NO CICLO RCMO E GOVERNANÇA

1. **Geração Exclusiva de Propostas:** A execução do motor analítico sobre estas 18 dimensões grava estritamente em `cerebro_autoral.propostas_atualizacao`.
2. **Nenhuma Ativação Automática:** Nenhuma característica ou regra tem seu campo `confirmada` preenchido pela IA.
3. **Revisão Visual do Autor:** O autor avalia na interface cada proposta, podendo chancelar (`confirmada`), descartar (`rejeitada`) ou ajustar o texto livremente.
