/**
 * Query Intent Router — Cérebro Reflex V3.1 (Wave 4)
 * Padrão: Classificação Determinística e Semântica de Intenção de Recuperação
 * Não inventa conhecimento; apenas direciona as rotas de busca multi-sinal.
 */

import { QueryIntent } from "@/tipos/cognitivo-v3";

export interface IntentRoutingResult {
  intent: QueryIntent;
  confidence: number;
  explanation: string;
  suggested_routes: string[];
  requires_counterevidence: boolean;
  weights: {
    lexical: number;
    dense: number;
    taxonomy: number;
    temporal: number;
    authorial_priority: number;
  };
}

export class QueryIntentRouter {
  /**
   * Classifica deterministicamente a intenção da consulta a partir de padrões heurísticos e semânticos.
   * Quando a intenção for incerta, retorna INTENT_UNCERTAIN em vez de forçar classificação incorreta.
   */
  public static classificar(query: string): IntentRoutingResult {
    const q = query.toLowerCase().trim();

    if (!q || q.length < 3) {
      return {
        intent: "INTENT_UNCERTAIN",
        confidence: 0.3,
        explanation: "Consulta muito curta ou vazia para determinar intenção segura.",
        suggested_routes: ["Route B1"],
        requires_counterevidence: false,
        weights: { lexical: 0.5, dense: 0.5, taxonomy: 0.1, temporal: 0.1, authorial_priority: 1.0 },
      };
    }

    // 1. CONTRADICTION: busca deliberada por tensões, conflitos ou divergências
    if (
      /\b(contradi[çc]|diverg[eê]|tens[aã]o|oposi[çc]|discord|refut|paradox|conflito|contra-argument)/i.test(q)
    ) {
      return {
        intent: "CONTRADICTION",
        confidence: 0.92,
        explanation: "Consulta focada em dialética, tensões ou contraposições.",
        suggested_routes: ["Route D", "Route C"],
        requires_counterevidence: true,
        weights: { lexical: 0.4, dense: 0.4, taxonomy: 0.3, temporal: 0.2, authorial_priority: 1.2 },
      };
    }

    // 2. TEMPORAL_EVOLUTION: busca por linha do tempo, mudança ou períodos
    if (
      /\b(evolu[çc]|mudou|mudan[çc]|ao longo do tempo|hist[oó]ric|em 20\d\d|entre 20\d\d|passado|anteriormente|antigo|antiga|atual)/i.test(q)
    ) {
      return {
        intent: "TEMPORAL_EVOLUTION",
        confidence: 0.90,
        explanation: "Consulta sobre temporalidade, superação ou trajetória das ideias.",
        suggested_routes: ["Route D"],
        requires_counterevidence: true,
        weights: { lexical: 0.3, dense: 0.4, taxonomy: 0.2, temporal: 0.8, authorial_priority: 1.3 },
      };
    }

    // 3. FACTUAL_LOCAL: citações literais, passagens específicas, obras ou termos entre aspas
    if (
      /".+"/.test(q) ||
      /\b(onde citei|qual p[aá]gina|trecho exato|passagem|cita[çc][aã]o|disse|escreveu|em qual obra|no cap[ií]tulo)/i.test(q)
    ) {
      return {
        intent: "FACTUAL_LOCAL",
        confidence: 0.95,
        explanation: "Consulta léxica e factual de alta precisão.",
        suggested_routes: ["Route B1", "Route B0"],
        requires_counterevidence: false,
        weights: { lexical: 0.8, dense: 0.2, taxonomy: 0.1, temporal: 0.1, authorial_priority: 1.0 },
      };
    }

    // 4. PROCEDURAL: diretrizes de estilo, método, regras de ensaio
    if (
      /\b(como estruturo|como escrevo|meu estilo|regra|m[eé]todo|diretriz|forma de abrir|tom de voz|antirregr|anti-regr)/i.test(q)
    ) {
      return {
        intent: "PROCEDURAL",
        confidence: 0.91,
        explanation: "Consulta sobre procedimentos metodológicos e estilísticos.",
        suggested_routes: ["Route C", "Route B1"],
        requires_counterevidence: false,
        weights: { lexical: 0.4, dense: 0.3, taxonomy: 0.4, temporal: 0.1, authorial_priority: 1.5 },
      };
    }

    // 5. RELATIONAL: conexão explícita entre dois ou mais conceitos
    if (
      /\b(como .+ se relaciona com|articula[çc][aã]o entre|rela[çc][aã]o entre|conex[aã]o entre|v[ií]nculo entre)/i.test(q)
    ) {
      return {
        intent: "RELATIONAL",
        confidence: 0.88,
        explanation: "Consulta sobre articulação ontológica entre conceitos no grafo.",
        suggested_routes: ["Route C", "Route D"],
        requires_counterevidence: false,
        weights: { lexical: 0.3, dense: 0.5, taxonomy: 0.6, temporal: 0.2, authorial_priority: 1.2 },
      };
    }

    // 6. AUTHORIAL: foco exclusivo no posicionamento do autor
    if (
      /\b(minha vis[aã]o|minha posi[çc][aã]o|o que eu defendo|meu pensamento|minha tese|eu acredito|minha teoria)/i.test(q)
    ) {
      return {
        intent: "AUTHORIAL",
        confidence: 0.93,
        explanation: "Consulta com escopo prioritariamente autoral humano.",
        suggested_routes: ["Route D", "Route C"],
        requires_counterevidence: true,
        weights: { lexical: 0.3, dense: 0.5, taxonomy: 0.3, temporal: 0.3, authorial_priority: 1.8 },
      };
    }

    // 7. GLOBAL_CORPUS: sínteses panorâmicas
    if (
      /\b(principais temas|vis[aã]o geral|panorama|em toda a biblioteca|resumo global|transversais)/i.test(q)
    ) {
      return {
        intent: "GLOBAL_CORPUS",
        confidence: 0.85,
        explanation: "Consulta panorâmica e agregada sobre o acervo.",
        suggested_routes: ["Route C", "Route B1"],
        requires_counterevidence: false,
        weights: { lexical: 0.2, dense: 0.6, taxonomy: 0.4, temporal: 0.2, authorial_priority: 1.1 },
      };
    }

    // 8. CONCEPTUAL: definição de conceitos e noções
    if (
      /\b(o que [eé]|qual o significado|defini[çc][aã]o de|conceito de|no[çc][aã]o de|sentido de)/i.test(q)
    ) {
      return {
        intent: "CONCEPTUAL",
        confidence: 0.87,
        explanation: "Consulta conceitual ontológica amparada em taxonomia.",
        suggested_routes: ["Route C", "Route B1"],
        requires_counterevidence: false,
        weights: { lexical: 0.3, dense: 0.5, taxonomy: 0.6, temporal: 0.1, authorial_priority: 1.2 },
      };
    }

    // Fallback Seguro: incerteza honesta
    return {
      intent: "INTENT_UNCERTAIN",
      confidence: 0.5,
      explanation: "A consulta apresenta múltiplos sinais ou escopo genérico; usando combinação balanceada.",
      suggested_routes: ["Route B1", "Route C"],
      requires_counterevidence: false,
      weights: { lexical: 0.5, dense: 0.5, taxonomy: 0.2, temporal: 0.2, authorial_priority: 1.0 },
    };
  }
}
