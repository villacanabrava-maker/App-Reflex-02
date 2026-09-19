/**
 * Memory-Inference Firewall — Cérebro Reflex V3.1
 * Missão: MIS-0007 (Wave 1: Fundação Epistemológica Executável)
 * 
 * Implementa as barreiras estruturais em código e tipos para impedir
 * a contaminação epistêmica entre inferência do modelo e memória autoral fática.
 */

import {
  EpistemicStatus,
  ClaimCandidate,
  ValidatedClaim,
  EPISTEMIC_STATE_MACHINE,
} from "../../tipos/cognitivo-v3";

export class FirewallViolationError extends Error {
  public readonly code: string;
  public readonly details: Record<string, unknown>;

  constructor(code: string, message: string, details: Record<string, unknown> = {}) {
    super(`[FIREWALL VIOLATION - ${code}]: ${message}`);
    this.name = "FirewallViolationError";
    this.code = code;
    this.details = details;
  }
}

/**
 * Padrões de injeção indireta de prompt que tentam usurpar autoridade epistêmica
 */
const FORBIDDEN_INJECTION_PATTERNS = [
  /ignore (all|todas|as) (instructions|instruções|diretrizes)/i,
  /marque (isto|este|essa proposição) como (verdade|fato|autor)/i,
  /o autor acredita (piamente|cegamente|com certeza) que/i,
  /assuma que o autor/i,
  /system prompt override/i,
  /revele a chave/i,
  /reveal (key|secret|token)/i,
  /set confirmed_authorial/i,
];

export class MemoryInferenceFirewall {
  /**
   * Valida se uma transição de estado epistemológico é permitida pelas regras canônicas
   */
  public static validarTransicao(
    from: EpistemicStatus,
    to: EpistemicStatus,
    actor: "extractor_pipeline" | "nli_validator" | "cognitive_agent" | "human" | "system_worker"
  ): boolean {
    // 1. Invariant Absoluto: Nenhuma IA pode promover para confirmed_authorial
    if (to === "confirmed_authorial" && actor !== "human") {
      throw new FirewallViolationError(
        "AI_CANNOT_CONFIRM_AUTHORSHIP",
        "Apenas o autor humano deliberado pode promover uma unidade de conhecimento para 'confirmed_authorial'.",
        { from, to, actor }
      );
    }

    // 2. Invariant: rejected não pode transitar diretamente para confirmed_authorial sem nova proposta
    if (from === "rejected" && to === "confirmed_authorial") {
      throw new FirewallViolationError(
        "REJECTED_CANNOT_BECOME_CONFIRMED_DIRECTLY",
        "Um claim rejeitado pelo autor não pode se tornar confirmed_authorial sem um novo ciclo de proposta.",
        { from, to, actor }
      );
    }

    // 3. Procura na tabela canônica de transições
    const transitionAllowed = EPISTEMIC_STATE_MACHINE.some(
      (rule) => rule.from === from && rule.to === to && rule.actor === actor
    );

    if (!transitionAllowed) {
      throw new FirewallViolationError(
        "ILLEGAL_EPISTEMIC_TRANSITION",
        `A transição de '${from}' para '${to}' efetuada pelo agente '${actor}' não é permitida pela máquina de estados.`,
        { from, to, actor }
      );
    }

    return true;
  }

  /**
   * Verifica se o texto de um claim ou span contém tentativas de Prompt Injection
   */
  public static sanitizarTentativaInjecao(texto: string): { isInjected: boolean; patternDetected?: string } {
    for (const pattern of FORBIDDEN_INJECTION_PATTERNS) {
      if (pattern.test(texto)) {
        return {
          isInjected: true,
          patternDetected: pattern.source,
        };
      }
    }
    return { isInjected: false };
  }

  /**
   * Aplica o Memory-Inference Firewall sobre um candidato a claim antes da validação NLI.
   * Regras Invioláveis:
   * 1. Se a fonte de origem for externa (obra de terceiro), source_role NUNCA pode ser AUTHOR_EXPLICIT.
   * 2. Se houver injeção indireta, neutraliza a autoridade rebaixando para UNKNOWN / AMBIGUOUS.
   */
  public static processarCandidato(candidato: ClaimCandidate): ClaimCandidate {
    // 1. Checagem de Injeção Indireta no texto e no span
    const checkDeclaracao = this.sanitizarTentativaInjecao(candidato.declaracao_atomica);
    const checkSpan = this.sanitizarTentativaInjecao(candidato.provenance.span_texto_original);

    if (checkDeclaracao.isInjected || checkSpan.isInjected) {
      // Degrada preventivamente: nunca permite que uma injeção promova autoridade
      return {
        ...candidato,
        source_role: "UNKNOWN",
        verifiability: "AMBIGUOUS",
        claim_type: "SOURCE_CLAIM",
      };
    }

    // 2. Detecção de Marcadores Epistêmicos de Incerteza / Hipótese (Inference / Especulação)
    const UNCERTAINTY_PATTERNS = /\b(talvez|pode ser que|provavelmente|possivelmente|supostamente|aparentemente|em tese|não se sabe se)\b/i;
    if (
      UNCERTAINTY_PATTERNS.test(candidato.declaracao_atomica) ||
      UNCERTAINTY_PATTERNS.test(candidato.provenance.span_texto_original)
    ) {
      // Regra de Ouro: Proposição especulativa/incerta não pode ingressar como memória factual ativa
      return {
        ...candidato,
        verifiability: "AMBIGUOUS",
        claim_type: "HYPOTHESIS_CLAIM",
        source_role: "SYSTEM_INFERENCE",
      };
    }

    // 3. Barreira de Obra Externa: se a proveniência declara fonte externa, proíbe AUTHOR_EXPLICIT
    if (candidato.source_role === "EXTERNAL_SOURCE" && candidato.claim_type === "AUTHOR_EXPLICIT_CLAIM") {
      throw new FirewallViolationError(
        "EXTERNAL_CANNOT_BE_AUTHOR_EXPLICIT",
        "Uma asserção originada de fonte externa não pode ser tipada como AUTHOR_EXPLICIT_CLAIM.",
        { candidate: candidato.declaracao_atomica }
      );
    }

    return candidato;
  }

  /**
   * Valida um claim já estruturado para persistência no banco.
   * Assegura que nenhum claim com status inferido ou hipotético receba autoridade de fato autoral.
   */
  public static assegurarIntegridadePersistencia(claim: ValidatedClaim): void {
    // 1. Invariant: inferred nunca é persistido como confirmed_authorial
    if (
      (claim.epistemic_status === "inferred" || claim.epistemic_status === "hypothesized") &&
      (claim.source_role === "HUMAN_CONFIRMED" || claim.source_role === "AUTHOR_EXPLICIT")
    ) {
      throw new FirewallViolationError(
        "INFERRED_CANNOT_HAVE_AUTHORIAL_AUTHORITY",
        "Claims com status 'inferred' ou 'hypothesized' não podem ser registrados com source_role 'AUTHOR_EXPLICIT' ou 'HUMAN_CONFIRMED'.",
        { id: claim.id, epistemic_status: claim.epistemic_status, source_role: claim.source_role }
      );
    }

    // 2. Invariant: Um claim ambíguo NUNCA pode ter status 'extracted', 'consolidated' ou 'confirmed_authorial'
    if (
      claim.verifiability === "AMBIGUOUS" &&
      ["extracted", "consolidated", "confirmed_authorial"].includes(claim.epistemic_status)
    ) {
      throw new FirewallViolationError(
        "AMBIGUOUS_CANNOT_BE_ACTIVE_MEMORY",
        "Um claim classificado como AMBIGUOUS não pode possuir status epistemológico ativo de memória factual.",
        { id: claim.id, verifiability: claim.verifiability, epistemic_status: claim.epistemic_status }
      );
    }
  }
}
