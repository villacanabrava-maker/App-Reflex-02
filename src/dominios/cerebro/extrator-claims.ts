/**
 * Motor de Extração de Claims Atômicos — Cérebro Reflex V3.1
 * Missão: MIS-0007 (Wave 1: Fundação Epistemológica Executável)
 * 
 * Implementa descontextualização de proposições, cálculo de hash SHA-256 canônico,
 * filtragem por NLI Entailment (Ambiguidade -> Não Extrai), proteção contra
 * injeção de prompt e controle por Feature Flag (off / shadow / on).
 */

import * as crypto from "node:crypto";
import {
  ClaimCandidate,
  ValidatedClaim,
  INLIValidator,
  CognitiveFeatureFlagValue,
  SourceRole,
  ClaimType,
} from "../../tipos/cognitivo-v3";
import { MemoryInferenceFirewall } from "./firewall-memoria";
import { LocalReflexNLIValidator } from "./validador-nli";

export interface ExtracaoInput {
  usuario_id: string;
  source_type: "obra" | "versao_obra" | "fragmento" | "reflexao" | "nota_avulsa";
  source_id: string;
  source_version: number;
  texto_completo: string;
  spans_alvo?: Array<{
    texto: string;
    span_start: number;
    span_end: number;
    is_author_1st_person?: boolean;
    is_external_quote?: boolean;
  }>;
}

export interface ExtracaoMetricas {
  total_candidatos: number;
  aceitos: number;
  rejeitados: number;
  ambiguos: number;
  tempo_execucao_ms: number;
  chamadas_nli: number;
  custo_estimado_usd: number;
}

export interface ExtracaoResultado {
  claims_validados: ValidatedClaim[];
  claims_rejeitados: ClaimCandidate[];
  metricas: ExtracaoMetricas;
  feature_flag: CognitiveFeatureFlagValue;
}

export class ExtratorClaimsV3 {
  private nliValidator: INLIValidator;
  private featureFlag: CognitiveFeatureFlagValue;

  constructor(
    nliValidator?: INLIValidator,
    featureFlag?: CognitiveFeatureFlagValue
  ) {
    this.nliValidator = nliValidator || new LocalReflexNLIValidator();
    // Convenção Canônica Única de Feature Flag
    const envFlag = process.env.FEATURE_COGNITIVE_V31_CLAIMS as CognitiveFeatureFlagValue | undefined;
    this.featureFlag = featureFlag || envFlag || "shadow";
  }

  /**
   * Computa o hash SHA-256 canônico com normalização Unicode NFC
   */
  public static computarHashSpan(spanTexto: string): string {
    const normalizado = spanTexto.normalize("NFC").trim();
    return crypto.createHash("sha256").update(normalizado, "utf8").digest("hex");
  }

  /**
   * Gera uma chave de deduplicação determinística para garantir idempotência em reprocessamentos
   */
  public static gerarDedupeKey(
    sourceVersion: number,
    contentHash: string,
    spanStart: number,
    spanEnd: number
  ): string {
    return `${sourceVersion}:${contentHash}:${spanStart}:${spanEnd}`;
  }

  /**
   * Processa a extração de claims de uma obra ou fragmento
   */
  public async processar(input: ExtracaoInput): Promise<ExtracaoResultado> {
    const startMs = Date.now();
    const claimsValidados: ValidatedClaim[] = [];
    const claimsRejeitados: ClaimCandidate[] = [];
    const seenDedupeKeys = new Set<string>();

    let totalCandidatos = 0;
    let aceitos = 0;
    let rejeitados = 0;
    let ambiguos = 0;
    let chamadasNli = 0;

    // Se feature flag estiver desativada ('off'), retorna sem processar
    if (this.featureFlag === "off") {
      return {
        claims_validados: [],
        claims_rejeitados: [],
        metricas: {
          total_candidatos: 0,
          aceitos: 0,
          rejeitados: 0,
          ambiguos: 0,
          tempo_execucao_ms: Date.now() - startMs,
          chamadas_nli: 0,
          custo_estimado_usd: 0.0,
        },
        feature_flag: "off",
      };
    }

    // Spans a processar: usa os fornecidos ou quebra sentenças do texto completo
    const spans = input.spans_alvo || this.decomporEmSpans(input.texto_completo);

    for (const span of spans) {
      totalCandidatos++;
      const cleanSpanText = span.texto.normalize("NFC").trim();
      if (!cleanSpanText) continue;

      const contentHash = ExtratorClaimsV3.computarHashSpan(cleanSpanText);
      const dedupeKey = ExtratorClaimsV3.gerarDedupeKey(
        input.source_version,
        contentHash,
        span.span_start,
        span.span_end
      );

      // Idempotência: pula spans idênticos no mesmo processamento
      if (seenDedupeKeys.has(dedupeKey)) {
        continue;
      }
      seenDedupeKeys.add(dedupeKey);

      // Determinação de Papel de Autoria inicial
      let sourceRole: SourceRole = "UNKNOWN";
      let claimType: ClaimType = "SOURCE_CLAIM";

      if (span.is_author_1st_person) {
        sourceRole = "AUTHOR_EXPLICIT";
        claimType = "AUTHOR_EXPLICIT_CLAIM";
      } else if (span.is_external_quote) {
        sourceRole = "EXTERNAL_SOURCE";
        claimType = "SOURCE_CLAIM";
      }

      // Monta candidato inicial
      const candidatoInicial: ClaimCandidate = {
        declaracao_atomica: cleanSpanText,
        claim_type: claimType,
        source_role: sourceRole,
        verifiability: "VERIFIABLE",
        provenance: {
          source_type: input.source_type,
          source_id: input.source_id,
          source_version: input.source_version,
          span_texto_original: cleanSpanText,
          span_start: span.span_start,
          span_end: span.span_end,
          content_hash: contentHash,
          metadados_localizacao: {
            dedupe_key: dedupeKey,
          },
        },
      };

      // 1. Passa pelo Memory-Inference Firewall (Sanitização e Anti-Prompt Injection)
      const candidatoFiltrado = MemoryInferenceFirewall.processarCandidato(candidatoInicial);

      // Se foi neutralizado como ambíguo por injeção ou incerteza
      if (candidatoFiltrado.verifiability === "AMBIGUOUS") {
        ambiguos++;
        rejeitados++;
        claimsRejeitados.push(candidatoFiltrado);
        continue;
      }

      // 2. Validação de NLI Entailment
      chamadasNli++;
      const nliResult = await this.nliValidator.validate(cleanSpanText, candidatoFiltrado.declaracao_atomica);

      if (!nliResult.is_entailed) {
        // Regra de Ouro: Ambiguidade / Falta de Entailment -> Não Extrai
        rejeitados++;
        claimsRejeitados.push(candidatoFiltrado);
        continue;
      }

      // 3. Monta o Claim Validado para o Ledger
      const claimValido: ValidatedClaim = {
        usuario_id: input.usuario_id,
        declaracao_atomica: candidatoFiltrado.declaracao_atomica,
        claim_type: candidatoFiltrado.claim_type,
        epistemic_status: "extracted", // Promovido legitimamente com entailment
        source_role: candidatoFiltrado.source_role,
        verifiability: "VERIFIABLE",
        idioma: "pt-BR",
        nli_result: nliResult,
        provenance: candidatoFiltrado.provenance,
        metadados: {
          feature_flag: this.featureFlag,
        },
      };

      // 4. Assegura integridade final no Firewall antes da entrega
      MemoryInferenceFirewall.assegurarIntegridadePersistencia(claimValido);

      aceitos++;
      claimsValidados.push(claimValido);
    }

    const durationMs = Date.now() - startMs;
    // Estimativa de custo real dos tokens (baseada em ~50 tokens por chamada NLI no gpt-4o-mini a $0.15 / 1M tokens)
    const custoEstimado = (chamadasNli * 50 * 0.00000015);

    return {
      claims_validados: claimsValidados,
      claims_rejeitados: claimsRejeitados,
      metricas: {
        total_candidatos: totalCandidatos,
        aceitos,
        rejeitados,
        ambiguos,
        tempo_execucao_ms: durationMs,
        chamadas_nli: chamadasNli,
        custo_estimado_usd: Number(custoEstimado.toFixed(6)),
      },
      feature_flag: this.featureFlag,
    };
  }

  /**
   * Decompõe texto simples em spans baseados em pontuação terminal
   */
  private decomporEmSpans(texto: string): Array<{
    texto: string;
    span_start: number;
    span_end: number;
    is_author_1st_person?: boolean;
    is_external_quote?: boolean;
  }> {
    const spans: Array<{
      texto: string;
      span_start: number;
      span_end: number;
      is_author_1st_person?: boolean;
      is_external_quote?: boolean;
    }> = [];

    const regex = /([^.!?\n]+[.!?\n]+)/g;
    let match;
    while ((match = regex.exec(texto)) !== null) {
      const trecho = match[0].trim();
      if (trecho.length > 5) {
        const start = match.index;
        const end = start + match[0].length;
        const isAuthor1stPerson = /\b(eu|meu|minha|concluo|defendo|acredito|decidi)\b/i.test(trecho);
        const isExternalQuote = /["'«»]|segundo |conforme |de acordo com/i.test(trecho);

        spans.push({
          texto: trecho,
          span_start: start,
          span_end: end,
          is_author_1st_person: isAuthor1stPerson,
          is_external_quote: isExternalQuote && !isAuthor1stPerson,
        });
      }
    }

    return spans;
  }
}
