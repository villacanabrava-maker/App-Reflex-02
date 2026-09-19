/**
 * Motor de Retrieval Híbrido Multi-Sinal V3.1 — Cérebro Reflex (Wave 4)
 * Padrão: RRF Fusion, Sinais Decompostos, Ancoragem SKOS e Abstenção Epistêmica.
 */

import { QueryIntentRouter } from "./intent-router";
import { MotorTaxonomicoSKOS } from "../taxonomia/motor-skos";
import { QueryIntent, EpistemicStatus } from "@/tipos/cognitivo-v3";
import { RETRIEVAL_CONFIG_V1 } from "@/config/retrieval-config";

export interface ItemRecuperado {
  id: string;
  conteudo: string;
  obra_id: string;
  obra_titulo: string;
  obra_natureza: "autoral" | "externa";
  secao_titulo?: string;
  score_final: number;
  individual_scores: {
    dense_sim?: number;
    dense_rank?: number;
    lexical_sim?: number;
    lexical_rank?: number;
    rrf_score?: number;
    taxonomy_bonus?: number;
    temporal_factor?: number;
    authorial_multiplier?: number;
  };
  taxonomy_match: boolean;
  epistemic_status: EpistemicStatus;
  temporal_fit: number;
  counterevidence_flag: boolean;
  retrieval_route: string;
  explanation: string;
}

export interface RetrievalResultV31 {
  query: string;
  intent: QueryIntent;
  route_used: string;
  items: ItemRecuperado[];
  abstained: boolean;
  abstention_reason?: "INSUFFICIENT_EVIDENCE" | "ZERO_RESULTS" | "UNRESOLVED_CONTRADICTION";
  embedding_mode: "REAL_EMBEDDING" | "STRUCTURAL_TEST_ONLY";
  route_candidate_status: "SELECTED_CANDIDATE_FROM_SYNTHETIC_BENCHMARK" | "PROVEN_LIVE_WINNER";
  telemetry: {
    total_candidates: number;
    latency_ms: number;
    rrf_k: number;
    config_version: string;
  };
}

export interface ConfigRetrievalV31 {
  route?: "Route A" | "Route B0" | "Route B1" | "Route C" | "Route D";
  limit?: number;
  rrf_k?: number;
  threshold_abstencao?: number;
  apenas_autorais?: boolean;
  incluir_contraevidencias?: boolean;
}

const STOPWORDS_PT_SET = new Set([
  "a", "o", "as", "os", "de", "da", "do", "das", "dos", "em", "na", "no", "nas", "nos",
  "um", "uma", "uns", "umas", "para", "por", "com", "sem", "sobre", "entre", "que", "se",
  "este", "esta", "estes", "estas", "esse", "essa", "esses", "essas", "aquele", "aquela",
  "e", "ou", "mas", "como", "qual", "quais", "onde", "quando"
]);

export class MotorRetrievalV31 {
  /**
   * Executa a busca multi-sinal simulada ou conectada em isolamento local
   */
  public static buscar(
    corpus: Array<{
      id: string;
      conteudo: string;
      obra_id: string;
      obra_titulo: string;
      obra_natureza: "autoral" | "externa";
      secao_titulo?: string;
      tsv_palavras?: string[];
      vetor_distancia?: number; // 0.0 (perfeito) a 2.0 (oposto)
      tags_conceitos?: string[];
      epistemic_status?: EpistemicStatus;
      data_criacao?: string;
      is_contraevidencia?: boolean;
    }>,
    query: string,
    usuarioId: string,
    config: ConfigRetrievalV31 = {}
  ): RetrievalResultV31 {
    const inicio = Date.now();
    const intentResult = QueryIntentRouter.classificar(query);
    const rota = config.route || (intentResult.suggested_routes[0] as any) || "Route D";
    const limite = config.limit || 10;
    const rrfK = config.rrf_k || RETRIEVAL_CONFIG_V1.rrf_k;
    const thresholdAbstencao = config.threshold_abstencao !== undefined ? config.threshold_abstencao : RETRIEVAL_CONFIG_V1.abstention_threshold;

    const queryTokens = query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOPWORDS_PT_SET.has(t));

    // 1. Scoring Léxico (FTS PT-BR Lematizado e sem Stopwords)
    const pontuadosLexicos = corpus.map((doc) => {
      const docTextoNorm = doc.conteudo
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const docWords = new Set(
        docTextoNorm
          .replace(/[^\w\s]/g, "")
          .split(/\s+/)
          .filter((t) => t.length > 2 && !STOPWORDS_PT_SET.has(t))
      );

      let matches = 0;
      for (const token of queryTokens) {
        if (docWords.has(token)) matches++;
      }
      const score = matches > 0 ? matches / (queryTokens.length || 1) : 0;
      return { doc, score };
    });

    const ordenadosLexicos = [...pontuadosLexicos]
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score);

    const rankLexicoMap = new Map<string, { rank: number; score: number }>();
    ordenadosLexicos.forEach((item, idx) => {
      rankLexicoMap.set(item.doc.id, { rank: idx + 1, score: item.score });
    });

    // 2. Scoring Denso (Vetores Cosseno)
    const pontuadosDensos = corpus.map((doc) => {
      // Simulação de proximidade vetorial
      let dist = doc.vetor_distancia !== undefined ? doc.vetor_distancia : 1.0;
      const lexicoInfo = rankLexicoMap.get(doc.id);
      // Em simulação estrutural, se não há nenhum match léxico e os termos não constam no documento,
      // a distância vetorial é ajustada para cima para não fabricar falso positivo em consultas desconexas
      if (!lexicoInfo && queryTokens.length >= 2) {
        dist = Math.max(dist, 0.98);
      }
      const sim = Math.max(0, 1 - dist);
      return { doc, sim };
    });

    const ordenadosDensos = [...pontuadosDensos]
      .filter((p) => p.sim > 0.1)
      .sort((a, b) => b.sim - a.sim);

    const rankDensoMap = new Map<string, { rank: number; sim: number }>();
    ordenadosDensos.forEach((item, idx) => {
      rankDensoMap.set(item.doc.id, { rank: idx + 1, sim: item.sim });
    });

    // 3. Resolução de SKOS Taxonomia
    const conceitoIdentificado = MotorTaxonomicoSKOS.resolverAlias(usuarioId, query);
    const termoSKOS = conceitoIdentificado?.pref_label_normalizado;

    // 4. Fusão por Rota
    const candidatosUnicos = Array.from(new Set(corpus.map((d) => d.id)));

    const resultados: ItemRecuperado[] = [];

    for (const docId of candidatosUnicos) {
      const doc = corpus.find((d) => d.id === docId)!;
      if (config.apenas_autorais && doc.obra_natureza !== "autoral") continue;

      const denso = rankDensoMap.get(docId);
      const lexico = rankLexicoMap.get(docId);

      const hasTaxonomy = !!(
        termoSKOS &&
        (doc.tags_conceitos?.some((t) => t.toLowerCase() === termoSKOS) ||
          doc.conteudo.toLowerCase().includes(termoSKOS))
      );

      const epistemicStatus = doc.epistemic_status || "extracted";
      const isContraevidencia = !!doc.is_contraevidencia;

      let scoreFinal = 0;
      let explanation = "";

      if (rota === "Route A") {
        // Dense Only
        scoreFinal = denso ? denso.sim : 0;
        explanation = `Recuperado puramente via proximidade vetorial (sim: ${scoreFinal.toFixed(3)})`;
      } else if (rota === "Route B0") {
        // Legacy 0.65 vetorial + 0.35 textual
        const vScore = denso ? denso.sim : 0;
        const lScore = lexico ? lexico.score : 0;
        scoreFinal = vScore * 0.65 + lScore * 0.35;
        explanation = `Recuperado via ponderação legada (vetorial: ${(vScore * 0.65).toFixed(3)}, textual: ${(lScore * 0.35).toFixed(3)})`;
      } else {
        // Rotas baseadas em RRF (B1, C, D)
        const rrfDense = denso ? 1.0 / (rrfK + denso.rank) : 0;
        const rrfLexical = lexico ? 1.0 / (rrfK + lexico.rank) : 0;
        let rrfScore = rrfDense + rrfLexical;

        let taxBonus = 0;
        if ((rota === "Route C" || rota === "Route D") && hasTaxonomy) {
          taxBonus = 0.015; // Bônus ontológico
          rrfScore += taxBonus;
        }

        let temporalFactor = 1.0;
        let authorialMultiplier = 1.0;

        if (rota === "Route D") {
          // Deprioritization de posições superadas para queries de presente
          if (epistemicStatus === "superseded" && intentResult.intent !== "TEMPORAL_EVOLUTION") {
            temporalFactor = 0.2; // Forte penalidade
          }

          // Priorização de autoridade autoral
          if (doc.obra_natureza === "autoral") {
            authorialMultiplier = 1.35;
          }

          // Inclusão de contraevidências se a consulta exigir dialética
          if (isContraevidencia && (intentResult.requires_counterevidence || config.incluir_contraevidencias)) {
            rrfScore += 0.02; // Bônus dialético
          }
        }

        scoreFinal = (rrfScore * temporalFactor * authorialMultiplier);

        const detalhesExpl: string[] = [];
        if (lexico) detalhesExpl.push(`léxico rank #${lexico.rank}`);
        if (denso) detalhesExpl.push(`vetorial rank #${denso.rank}`);
        if (hasTaxonomy) detalhesExpl.push(`ancoragem SKOS ativa`);
        if (doc.obra_natureza === "autoral") detalhesExpl.push(`peso autoral 1.35x`);
        if (isContraevidencia) detalhesExpl.push(`sinal de contraevidência`);
        if (epistemicStatus === "superseded") detalhesExpl.push(`posiçâo superada (penalizada)`);

        explanation = `RRF Fusão (${detalhesExpl.join(", ")})`;
      }

      if (scoreFinal > 0) {
        resultados.push({
          id: doc.id,
          conteudo: doc.conteudo,
          obra_id: doc.obra_id,
          obra_titulo: doc.obra_titulo,
          obra_natureza: doc.obra_natureza,
          secao_titulo: doc.secao_titulo,
          score_final: Number(scoreFinal.toFixed(6)),
          individual_scores: {
            dense_sim: denso?.sim,
            dense_rank: denso?.rank,
            lexical_sim: lexico?.score,
            lexical_rank: lexico?.rank,
            taxonomy_bonus: hasTaxonomy ? 0.015 : 0,
            temporal_factor: epistemicStatus === "superseded" ? 0.2 : 1.0,
            authorial_multiplier: doc.obra_natureza === "autoral" ? 1.35 : 1.0,
          },
          taxonomy_match: hasTaxonomy,
          epistemic_status: epistemicStatus,
          temporal_fit: epistemicStatus === "superseded" ? 0.3 : 1.0,
          counterevidence_flag: isContraevidencia,
          retrieval_route: rota,
          explanation,
        });
      }
    }

    resultados.sort((a, b) => b.score_final - a.score_final);
    const selecionados = resultados.slice(0, limite);

    // Abstenção Cognitiva Honesta:
    // Se o melhor resultado não atinge o limiar mínimo de confiança, sinaliza abstenção
    const melhorScore = selecionados.length > 0 ? selecionados[0].score_final : 0;
    const abstained = selecionados.length === 0 || melhorScore < thresholdAbstencao;

    return {
      query,
      intent: intentResult.intent,
      route_used: rota,
      items: selecionados,
      abstained,
      abstention_reason: abstained ? "INSUFFICIENT_EVIDENCE" : undefined,
      embedding_mode: "STRUCTURAL_TEST_ONLY",
      route_candidate_status: "SELECTED_CANDIDATE_FROM_SYNTHETIC_BENCHMARK",
      telemetry: {
        total_candidates: corpus.length,
        latency_ms: Date.now() - inicio,
        rrf_k: rrfK,
        config_version: RETRIEVAL_CONFIG_V1.versao_config,
      },
    };
  }
}
