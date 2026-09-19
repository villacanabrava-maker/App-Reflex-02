/**
 * Validador de Natural Language Inference (NLI) — Cérebro Reflex V3.1
 * CLASSIFICAÇÃO: HEURISTIC SHADOW VALIDATOR V1
 * NOTA TÉCNICA: Este validador opera como motor de regras determinísticas locais
 * (sobreposição lexical lematizada, inversão de negação e thresholds de segurança)
 * para a fase de Shadow Mode das Waves 1 e 2. Ele NÃO é um modelo NLI semântico completo
 * baseado em transformers ou LLM, o qual será objeto de benchmarking futuro.
 */

import {
  INLIValidator,
  NLIValidationResult,
  NLIConfig,
  DEFAULT_NLI_CONFIG,
  NLIValidationResultSchema,
} from "../../tipos/cognitivo-v3";

export class LocalReflexNLIValidator implements INLIValidator {
  private config: NLIConfig;

  constructor(config: Partial<NLIConfig> = {}) {
    this.config = { ...DEFAULT_NLI_CONFIG, ...config };
  }

  /**
   * Avalia a relação lógica entre premissa textual e hipótese atômica.
   * Regra Central: Ambiguidade / Neutralidade -> NÃO EXTRAI (is_entailed = false).
   */
  public async validate(premise: string, hypothesis: string): Promise<NLIValidationResult> {
    const cleanPremise = premise.normalize("NFC").trim();
    const cleanHypothesis = hypothesis.normalize("NFC").trim();

    if (!cleanPremise || !cleanHypothesis) {
      return NLIValidationResultSchema.parse({
        label: "NEUTRAL",
        confidence: 0.0,
        is_entailed: false,
        threshold_used: this.config.thresholdEntailment,
        model_name: "HEURISTIC_SHADOW_VALIDATOR_V1",
        model_version: this.config.modelVersion,
        prompt_version: this.config.promptVersion,
        reasoning: "Premissa ou hipótese vazia.",
      });
    }

    // Heurística de Entailment Baseada em Sobreposição de Conteúdo e Relações Semânticas
    // Para a Wave 1, opera como validador determinístico em TypeScript sem acoplamento pesado.
    const premiseWords = new Set(
      cleanPremise
        .toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );

    const hypothesisWords = cleanHypothesis
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2);

    // Detecção de Contradição Explícita (negações invertidas)
    const hasPremiseNegation = /\b(não|nunca|jamais|rejeito|recuso)\b/i.test(cleanPremise);
    const hasHypothesisNegation = /\b(não|nunca|jamais|rejeito|recuso)\b/i.test(cleanHypothesis);
    const negationMismatch = hasPremiseNegation !== hasHypothesisNegation;

    let matchingWordsCount = 0;
    for (const hw of hypothesisWords) {
      if (premiseWords.has(hw)) {
        matchingWordsCount++;
      }
    }

    const overlapRatio = hypothesisWords.length > 0 ? matchingWordsCount / hypothesisWords.length : 0;

    // Decisão Lógica
    let label: "ENTAILMENT" | "NEUTRAL" | "CONTRADICTION" = "NEUTRAL";
    let confidence = 0.5;
    let reasoning = "Relação lógica indeterminada / neutra.";

    if (negationMismatch && overlapRatio > 0.6) {
      label = "CONTRADICTION";
      confidence = 0.92;
      reasoning = "Inversão de polaridade ou negação incompatível entre premissa e hipótese.";
    } else if (overlapRatio >= 0.85 && !negationMismatch) {
      label = "ENTAILMENT";
      confidence = Number((0.85 + (overlapRatio - 0.85) * 0.9).toFixed(3));
      reasoning = "Implicação lógica direta sustentada pelo texto de origem.";
    } else if (overlapRatio < 0.4) {
      label = "NEUTRAL";
      confidence = 0.2;
      reasoning = "Informação não sustentada diretamente pelo texto (hipótese desancorada).";
    } else {
      label = "NEUTRAL";
      confidence = Number(overlapRatio.toFixed(3));
      reasoning = "Conexão ambígua ou parcial. Regra de segurança: Ambiguidade -> Não Extrai.";
    }

    const isEntailed = label === "ENTAILMENT" && confidence >= this.config.thresholdEntailment;

    const result: NLIValidationResult = {
      label,
      confidence,
      is_entailed: isEntailed,
      threshold_used: this.config.thresholdEntailment,
      model_name: "HEURISTIC_SHADOW_VALIDATOR_V1",
      model_version: this.config.modelVersion,
      prompt_version: this.config.promptVersion,
      reasoning,
    };

    return NLIValidationResultSchema.parse(result);
  }
}
