/**
 * Tipos e Schemas Canônicos da Arquitetura Cognitiva V3.1 — App Reflex 02
 * Missão: MIS-0007 (Wave 1: Fundação Epistemológica Executável)
 * 
 * Implementa a segregação rigorosa das três dimensões ontológicas:
 * 1. EpistemicStatus (Ciclo de Vida Epistemológico Canônico)
 * 2. ClaimType (Tipologia Proposicional)
 * 3. SourceRole (Papel de Autoria e Autoridade Factual)
 * 
 * Além de Verifiability, NLI, State Machine e Schemas Zod Estritos.
 */

import { z } from "zod";

// ============================================================================
// 1. AS TRÊS DIMENSÕES ONTOLÓGICAS INDEPENDENTES
// ============================================================================

/**
 * Dimensão 1: Ciclo de Vida Epistemológico Canônico (10 Estados V3.1)
 */
export const EpistemicStatusEnum = z.enum([
  "observed",             // Dado bruto textual/áudio observado na ingestão
  "quoted",               // Citação textual direta preservada com span exato
  "extracted",            // Claim atômico extraído com validação de entailment estrito
  "consolidated",         // Conhecimento de longo prazo corroborado por múltiplos episódios
  "confirmed_authorial",  // Posição, regra ou crença explicitamente chancelada pelo autor humano
  "inferred",             // Dedução lógica derivada por LLM (Não é fato de memória)
  "hypothesized",         // Conjectura especulativa aberta para provocação reflexiva
  "proposed",             // Proposta formulada pela IA aguardando decisão deliberada do autor
  "rejected",             // Afirmação ou regra refutada formalmente pelo autor
  "superseded"            // Conhecimento que foi válido no passado, mas foi superado no tempo
]);
export type EpistemicStatus = z.infer<typeof EpistemicStatusEnum>;

/**
 * Dimensão 2: Tipologia Funcional do Claim
 */
export const ClaimTypeEnum = z.enum([
  "SOURCE_CLAIM",          // Asserção documental de obra de terceiro ou documento externo
  "AUTHOR_EXPLICIT_CLAIM", // Afirmação categórica expressa diretamente pelo autor em 1ª pessoa
  "SUMMARY_CLAIM",         // Resumo proposicional condensado sem fatos novos
  "INFERRED_CLAIM",        // Conclusão deduzida logicamente por IA a partir de premissas
  "HYPOTHESIS_CLAIM",      // Hipótese especulativa formulada para reflexão
  "PROCEDURAL_CLAIM"       // Regra prática de método, heurística ou estilo de escrita
]);
export type ClaimType = z.infer<typeof ClaimTypeEnum>;

/**
 * Dimensão 3: Papel de Autoria e Autoridade (Substitui o inseguro is_authorial boolean)
 * Princípio Fundamental: UNKNOWN != AUTHORIAL. Nenhum claim nasce autoral por padrão.
 */
export const SourceRoleEnum = z.enum([
  "AUTHOR_EXPLICIT",   // Texto primário do autor com declaração expressa de autoria
  "EXTERNAL_SOURCE",   // Obra de terceiro, citação de outro pensador, documento de referência
  "SYSTEM_INFERENCE",  // Proposição formulada dedutivamente pela inteligência do sistema
  "HUMAN_CONFIRMED",   // Validado e chancelado pelo usuário através da interface
  "UNKNOWN"            // Papel ainda indeterminado ou sob verificação diagnóstica
]);
export type SourceRole = z.infer<typeof SourceRoleEnum>;

/**
 * Verificabilidade do Claim
 * Regra: AMBIGUOUS -> NÃO PROMOVER.
 */
export const VerifiabilityStatusEnum = z.enum([
  "VERIFIABLE",
  "UNVERIFIABLE",
  "AMBIGUOUS"
]);
export type VerifiabilityStatus = z.infer<typeof VerifiabilityStatusEnum>;

/**
 * Labels Canônicos de Natural Language Inference (NLI)
 */
export const NLILabelEnum = z.enum([
  "ENTAILMENT",
  "NEUTRAL",
  "CONTRADICTION"
]);
export type NLILabel = z.infer<typeof NLILabelEnum>;

/**
 * Valores Permitidos para Feature Flag Cognitiva Canônica
 */
export const CognitiveFeatureFlagValueEnum = z.enum([
  "off",
  "shadow",
  "on"
]);
export type CognitiveFeatureFlagValue = z.infer<typeof CognitiveFeatureFlagValueEnum>;

// ============================================================================
// 2. CONFIGURAÇÃO DE NLI & THRESHOLD VERSIONADO
// ============================================================================

/**
 * Configuração explícita do classificador NLI.
 * NOTA: O threshold de 0.85 é um baseline experimental provisório a ser calibrado pelo Golden Dataset.
 */
export interface NLIConfig {
  thresholdEntailment: number;
  modelVersion: string;
  promptVersion: string;
  allowNeutralPromotion: boolean;
}

export const DEFAULT_NLI_CONFIG: NLIConfig = {
  thresholdEntailment: 0.85, // Baseline experimental candidato (NÃO HARDCODAR COMO VERDADE ABSOLUTA)
  modelVersion: "nli_eval_v3_1",
  promptVersion: "nli_entailment_v1.0",
  allowNeutralPromotion: false, // Regra: Ambiguidade / Neutralidade -> NÃO EXTRAI
};

// ============================================================================
// 3. STATE MACHINE DE TRANSIÇÕES EPISTEMOLÓGICAS
// ============================================================================

export interface EpistemicTransition {
  from: EpistemicStatus;
  to: EpistemicStatus;
  actor: "extractor_pipeline" | "nli_validator" | "cognitive_agent" | "human" | "system_worker";
  precondition: string;
  evidenceRequired: boolean;
  reversible: boolean;
}

/**
 * Tabela de Transições Legítimas de Estado Epistemológico
 * Invariant Central: 'inferred' JAMAIS pode transitar para 'confirmed_authorial' diretamente por IA.
 */
export const EPISTEMIC_STATE_MACHINE: EpistemicTransition[] = [
  {
    from: "observed",
    to: "quoted",
    actor: "extractor_pipeline",
    precondition: "Span textual exato e offsets válidos extraídos",
    evidenceRequired: true,
    reversible: false,
  },
  {
    from: "observed",
    to: "extracted",
    actor: "nli_validator",
    precondition: "Entailment comprovado (score >= threshold, label ENTAILMENT)",
    evidenceRequired: true,
    reversible: false,
  },
  {
    from: "extracted",
    to: "inferred",
    actor: "cognitive_agent",
    precondition: "Dedução gerada via LLM conectando premissas",
    evidenceRequired: true,
    reversible: true,
  },
  {
    from: "inferred",
    to: "hypothesized",
    actor: "cognitive_agent",
    precondition: "Extrapolação especulativa formulada para reflexão",
    evidenceRequired: false,
    reversible: true,
  },
  {
    from: "hypothesized",
    to: "proposed",
    actor: "cognitive_agent",
    precondition: "Proposta estruturada enviada para fila de aprovação",
    evidenceRequired: true,
    reversible: true,
  },
  {
    from: "extracted",
    to: "proposed",
    actor: "cognitive_agent",
    precondition: "Sugestão de incorporação ao Cérebro enviada para fila",
    evidenceRequired: true,
    reversible: true,
  },
  {
    from: "proposed",
    to: "confirmed_authorial",
    actor: "human", // SOMENTE HUMANO PODE CONFIRMAR
    precondition: "Aprovação explícita e deliberada do autor na interface",
    evidenceRequired: true,
    reversible: true,
  },
  {
    from: "proposed",
    to: "rejected",
    actor: "human",
    precondition: "Rejeição expressa pelo autor humano",
    evidenceRequired: false,
    reversible: true,
  },
  {
    from: "extracted",
    to: "consolidated",
    actor: "system_worker",
    precondition: "Convergência empírica em múltiplos episódios e períodos distintos",
    evidenceRequired: true,
    reversible: true,
  },
  {
    from: "confirmed_authorial",
    to: "superseded",
    actor: "human",
    precondition: "Autor expressa nova posição ou atualiza visão anterior",
    evidenceRequired: true,
    reversible: false,
  },
  {
    from: "consolidated",
    to: "superseded",
    actor: "system_worker",
    precondition: "Evidência temporal mais recente invalida premissa passada",
    evidenceRequired: true,
    reversible: false,
  },
];

// ============================================================================
// 4. SCHEMAS ZOD ESTRITOS (CICLO DE VIDA DE CLAIMS)
// ============================================================================

/**
 * Suporte Textual e Proveniência (UTF-16 Char Offsets e SHA-256)
 */
export const ClaimProvenanceInputSchema = z.object({
  source_type: z.enum(["obra", "versao_obra", "fragmento", "reflexao", "nota_avulsa"]),
  source_id: z.string().uuid("source_id deve ser um UUID válido"),
  source_version: z.number().int().min(1, "source_version deve ser >= 1"),
  span_texto_original: z.string().min(1, "O span de texto original não pode ser vazio"),
  span_start: z.number().int().min(0, "span_start deve ser >= 0 (índice de caracteres UTF-16)"),
  span_end: z.number().int().min(1, "span_end deve ser > 0"),
  offset_encoding: z.literal("UTF16_CODE_UNIT").default("UTF16_CODE_UNIT"),
  content_hash: z.string().length(64, "content_hash deve ser um hash SHA-256 hexadecimal de 64 caracteres"),
  metadados_localizacao: z.record(z.string(), z.unknown()).default({}),
}).strict();
export type ClaimProvenanceInput = z.infer<typeof ClaimProvenanceInputSchema>;

/**
 * Contrato de Telemetria de Custos (Zero Simulação: provider_cost_usd = 0 para execução local)
 */
export const CostTelemetrySchema = z.object({
  provider_cost_usd: z.number().nullable(),
  estimated_cost_usd: z.number().optional(),
  cost_basis: z.object({
    provider: z.string(),
    model: z.string(),
    pricing_date: z.string(),
    input_tokens: z.number().optional(),
    output_tokens: z.number().optional(),
    is_estimated: z.boolean(),
  }).optional(),
}).strict();
export type CostTelemetry = z.infer<typeof CostTelemetrySchema>;

// ============================================================================
// 3.1 ENUMS E SCHEMAS DA MEMÓRIA EPISÓDICA (WAVE 2: EVENT LEDGER)
// ============================================================================

export const EventTypeEnum = z.enum([
  "CLAIM_CREATED",
  "CLAIM_VALIDATED",
  "CLAIM_REJECTED",
  "CLAIM_PROPOSED",
  "CLAIM_CONFIRMED_BY_AUTHOR",
  "CLAIM_REJECTED_BY_AUTHOR",
  "CLAIM_SUPERSEDED",
  "CONTRADICTION_DETECTED",
  "SOURCE_INGESTED",
  "SOURCE_REPROCESSED",
  "LEGACY_STATE_IMPORTED",
]);
export type EventType = z.infer<typeof EventTypeEnum>;

export const ActorTypeEnum = z.enum([
  "HUMAN",
  "EXTRACTOR_PIPELINE",
  "NLI_VALIDATOR",
  "COGNITIVE_AGENT",
  "SYSTEM_WORKER",
  "IMPORTER",
]);
export type ActorType = z.infer<typeof ActorTypeEnum>;

/**
 * Schemas de Payloads Específicos por Tipo de Evento
 */
export const ClaimCreatedPayloadSchema = z.object({
  declaracao_atomica: z.string(),
  claim_type: ClaimTypeEnum,
  source_role: SourceRoleEnum,
  provenance_summary: z.object({
    source_type: z.string(),
    source_id: z.string(),
    source_version: z.number(),
    span_start: z.number(),
    span_end: z.number(),
    content_hash: z.string(),
  }),
}).strict();

export const ClaimValidatedPayloadSchema = z.object({
  status_anterior: EpistemicStatusEnum.optional(),
  novo_status: EpistemicStatusEnum.optional(),
  justificativa: z.string().optional(),
  nli_model: z.string().optional(),
  confidence: z.number().optional(),
  threshold_used: z.number().optional(),
  reasoning: z.string().optional(),
  extra: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const ClaimConfirmedAuthorPayloadSchema = z.object({
  status_anterior: EpistemicStatusEnum.optional(),
  novo_status: z.literal("confirmed_authorial").optional(),
  justificativa: z.string().optional(),
  author_action: z.literal("CONFIRM"),
  notes: z.string().optional(),
  user_interface: z.string().default("web_review"),
  extra: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const ClaimSupersededPayloadSchema = z.object({
  status_anterior: EpistemicStatusEnum.optional(),
  novo_status: z.literal("superseded").optional(),
  justificativa: z.string().optional(),
  superseding_claim_id: z.string().uuid().optional(),
  superseding_reason: z.string().optional(),
  temporal_scope: z.string().optional(),
  extra: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const ClaimRejectedPayloadSchema = z.object({
  status_anterior: EpistemicStatusEnum.optional(),
  novo_status: z.literal("rejected").optional(),
  justificativa: z.string().min(1),
  rejection_reason: z.string().optional(),
  threshold_failed: z.number().optional(),
  confidence_observed: z.number().optional(),
  extra: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const ClaimProposedPayloadSchema = z.object({
  status_anterior: EpistemicStatusEnum.optional(),
  novo_status: z.literal("proposed").optional(),
  justificativa: z.string().min(1),
  proposal_reason: z.string().optional(),
  evidence_score: z.number().optional(),
  extra: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const ClaimRejectedByAuthorPayloadSchema = z.object({
  status_anterior: EpistemicStatusEnum.optional(),
  novo_status: z.literal("rejected").optional(),
  justificativa: z.string().min(1),
  author_notes: z.string().optional(),
  user_interface: z.string().default("web_review"),
  extra: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const ContradictionDetectedPayloadSchema = z.object({
  conflicting_claim_id: z.string().uuid(),
  detection_model: z.string().default("nli_contradiction_eval"),
  contradiction_score: z.number().min(0).max(1),
  justificativa: z.string(),
  extra: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const SourceIngestedPayloadSchema = z.object({
  source_type: z.string(),
  source_id: z.string().uuid(),
  source_version: z.number().int().min(1),
  content_hash: z.string(),
  total_spans: z.number().int().min(0),
  extra: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const SourceReprocessedPayloadSchema = z.object({
  source_type: z.string(),
  source_id: z.string().uuid(),
  source_version: z.number().int().min(1),
  reprocess_reason: z.string(),
  changes_detected: z.boolean(),
  extra: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const LegacyStateImportedPayloadSchema = z.object({
  legacy_source: z.string(),
  legacy_id: z.string(),
  import_batch_id: z.string().uuid(),
  mapped_status: EpistemicStatusEnum,
  metadata_snapshot: z.record(z.string(), z.unknown()).default({}),
}).strict();

export const MemoryEventPayloadUnion = z.discriminatedUnion("event_type", [
  z.object({ event_type: z.literal("CLAIM_CREATED"), data: ClaimCreatedPayloadSchema }),
  z.object({ event_type: z.literal("CLAIM_VALIDATED"), data: ClaimValidatedPayloadSchema }),
  z.object({ event_type: z.literal("CLAIM_REJECTED"), data: ClaimRejectedPayloadSchema }),
  z.object({ event_type: z.literal("CLAIM_PROPOSED"), data: ClaimProposedPayloadSchema }),
  z.object({ event_type: z.literal("CLAIM_CONFIRMED_BY_AUTHOR"), data: ClaimConfirmedAuthorPayloadSchema }),
  z.object({ event_type: z.literal("CLAIM_REJECTED_BY_AUTHOR"), data: ClaimRejectedByAuthorPayloadSchema }),
  z.object({ event_type: z.literal("CLAIM_SUPERSEDED"), data: ClaimSupersededPayloadSchema }),
  z.object({ event_type: z.literal("CONTRADICTION_DETECTED"), data: ContradictionDetectedPayloadSchema }),
  z.object({ event_type: z.literal("SOURCE_INGESTED"), data: SourceIngestedPayloadSchema }),
  z.object({ event_type: z.literal("SOURCE_REPROCESSED"), data: SourceReprocessedPayloadSchema }),
  z.object({ event_type: z.literal("LEGACY_STATE_IMPORTED"), data: LegacyStateImportedPayloadSchema }),
]);

export interface MemoryEvent {
  id: string;
  usuario_id: string;
  event_type: EventType;
  aggregate_type: "claim" | "source" | "reflection";
  aggregate_id: string;
  actor_type: ActorType;
  actor_id: string | null;
  occurred_at: string;
  recorded_at: string;
  from_epistemic_status: EpistemicStatus | null;
  to_epistemic_status: EpistemicStatus;
  causation_event_id: string | null;
  correlation_id: string;
  idempotency_key: string;
  payload: Record<string, unknown>;
  payload_schema_version: number;
  criado_em: string;
}

// ============================================================================
// 3.2 ENUMS E SCHEMAS DA TAXONOMIA SKOS (WAVE 3)
// ============================================================================

export const SKOSConceptStatusEnum = z.enum([
  "proposed",
  "active",
  "merged",
  "rejected",
  "deprecated"
]);
export type SKOSConceptStatus = z.infer<typeof SKOSConceptStatusEnum>;

export const SKOSRelationTypeEnum = z.enum([
  "BROADER",
  "NARROWER",
  "RELATED"
]);
export type SKOSRelationType = z.infer<typeof SKOSRelationTypeEnum>;

export const ClaimConceptLinkTypeEnum = z.enum([
  "EXPRESSES_CONCEPT",
  "DISCUSSES_CONCEPT",
  "CRITICIZES_CONCEPT"
]);
export type ClaimConceptLinkType = z.infer<typeof ClaimConceptLinkTypeEnum>;

export const SKOSConceptSchema = z.object({
  id: z.string().uuid().optional(),
  usuario_id: z.string().uuid(),
  pref_label: z.string().min(2, "pref_label deve ter ao menos 2 caracteres"),
  pref_label_normalizado: z.string().min(2),
  alt_labels: z.array(z.string()).default([]),
  idioma: z.string().default("pt-BR"),
  definicao: z.string().nullable().optional(),
  dominio_escopo: z.string().nullable().optional(),
  status: SKOSConceptStatusEnum.default("proposed"),
  recorrencia_contagem: z.number().int().min(1).default(1),
  merged_into_id: z.string().uuid().nullable().optional(),
  metadados: z.record(z.string(), z.unknown()).default({}),
  criado_em: z.string().optional(),
  atualizado_em: z.string().optional(),
}).strict();
export type SKOSConcept = z.infer<typeof SKOSConceptSchema>;

export const SKOSRelationSchema = z.object({
  id: z.string().uuid().optional(),
  usuario_id: z.string().uuid(),
  conceito_origem_id: z.string().uuid(),
  conceito_destino_id: z.string().uuid(),
  tipo_relacao: SKOSRelationTypeEnum,
  status: z.enum(["proposed", "active", "rejected"]).default("proposed"),
  criado_em: z.string().optional(),
}).strict();
export type SKOSRelation = z.infer<typeof SKOSRelationSchema>;

export const ClaimConceptLinkSchema = z.object({
  id: z.string().uuid().optional(),
  usuario_id: z.string().uuid(),
  claim_id: z.string().uuid(),
  conceito_id: z.string().uuid(),
  tipo_vinculo: ClaimConceptLinkTypeEnum.default("DISCUSSES_CONCEPT"),
  confianca: z.number().min(0.0).max(1.0).default(0.85),
  origem: z.enum(["IA_SUGGESTION", "HUMAN_CURATED"]).default("IA_SUGGESTION"),
  status: z.enum(["proposed", "confirmed", "rejected"]).default("proposed"),
  criado_em: z.string().optional(),
}).strict();
export type ClaimConceptLink = z.infer<typeof ClaimConceptLinkSchema>;

/**
 * 4.1 Schema de Extração Bruta (RawExtraction) gerada pela LLM
 */
export const RawExtractionSchema = z.object({
  declaracao_candidata: z.string().min(5, "Declaração muito curta para constituir proposição atômica"),
  span_origem: z.string().min(1),
  span_start: z.number().int().min(0),
  span_end: z.number().int().min(1),
  sujeito: z.string().optional(),
  predicado: z.string().optional(),
  objeto: z.string().optional(),
  indicacao_papel: z.enum(["autor_1a_pessoa", "fonte_externa", "indeterminado"]),
}).strict();
export type RawExtraction = z.infer<typeof RawExtractionSchema>;

/**
 * 4.2 Schema do Candidato a Claim (ClaimCandidate)
 */
export const ClaimCandidateSchema = z.object({
  declaracao_atomica: z.string().min(5),
  sujeito: z.string().nullable().optional(),
  predicado: z.string().nullable().optional(),
  objeto: z.string().nullable().optional(),
  claim_type: ClaimTypeEnum,
  source_role: SourceRoleEnum,
  verifiability: VerifiabilityStatusEnum,
  provenance: ClaimProvenanceInputSchema,
}).strict();
export type ClaimCandidate = z.infer<typeof ClaimCandidateSchema>;

/**
 * 4.3 Schema do Resultado de Validação NLI
 */
export const NLIValidationResultSchema = z.object({
  label: NLILabelEnum,
  confidence: z.number().min(0.0).max(1.0),
  is_entailed: z.boolean(),
  threshold_used: z.number().min(0.0).max(1.0),
  model_name: z.string(),
  model_version: z.string(),
  prompt_version: z.string().optional(),
  reasoning: z.string().optional(),
}).strict();
export type NLIValidationResult = z.infer<typeof NLIValidationResultSchema>;

/**
 * 4.4 Schema do Claim Validado e Persistível no Claims Ledger
 */
export const ValidatedClaimSchema = z.object({
  id: z.string().uuid().optional(),
  usuario_id: z.string().uuid(),
  declaracao_atomica: z.string().min(5),
  sujeito: z.string().nullable().optional(),
  predicado: z.string().nullable().optional(),
  objeto: z.string().nullable().optional(),
  claim_type: ClaimTypeEnum,
  epistemic_status: EpistemicStatusEnum,
  source_role: SourceRoleEnum,
  verifiability: VerifiabilityStatusEnum,
  idioma: z.string().default("pt-BR"),
  nli_result: NLIValidationResultSchema,
  provenance: ClaimProvenanceInputSchema,
  origin_event_id: z.string().uuid().nullable().optional(), // Event-Ready para Wave 2
  metadados: z.record(z.string(), z.unknown()).default({}),
}).strict();
export type ValidatedClaim = z.infer<typeof ValidatedClaimSchema>;

// ============================================================================
// 5. INTERFACE DO VALIDADOR NLI ABSTRATO
// ============================================================================

export interface INLIValidator {
  validate(premise: string, hypothesis: string): Promise<NLIValidationResult>;
}

// ============================================================================
// 6. MÉTRICAS FORMAIS DE AVALIAÇÃO EPISTÊMICA
// ============================================================================

export interface MetricCalculationResult {
  value: number | null;
  numerator: number;
  denominator: number;
  is_applicable: boolean;
  notes: string;
}

/**
 * Calcula o MILR (Memory-Inference Leakage Rate)
 * Numerador: claims apresentados com autoridade de memória cuja origem era inferência/hipótese
 * Denominador: claims efetivamente apresentados como memória do autor
 */
export function calculateMILR(
  leakedInferencesCount: number,
  totalMemoryPresentedCount: number
): MetricCalculationResult {
  if (totalMemoryPresentedCount === 0) {
    return {
      value: null, // Denominador zero não fabrica 0.0% falsamente
      numerator: leakedInferencesCount,
      denominator: totalMemoryPresentedCount,
      is_applicable: false,
      notes: "Nenhum claim foi apresentado com autoridade de memória (denominador zero).",
    };
  }

  const rate = (leakedInferencesCount / totalMemoryPresentedCount) * 100;
  return {
    value: Number(rate.toFixed(4)),
    numerator: leakedInferencesCount,
    denominator: totalMemoryPresentedCount,
    is_applicable: true,
    notes: `MILR calculado sobre ${totalMemoryPresentedCount} asserções de memória.`,
  };
}

/**
 * Calcula o AMR (Authorial Misattribution Rate)
 * Numerador: claims atribuídos ao autor que provêm de fontes externas ou invenção
 * Denominador: total de claims atribuídos ao autor
 */
export function calculateAMR(
  misattributedCount: number,
  totalAuthorAttributedCount: number
): MetricCalculationResult {
  if (totalAuthorAttributedCount === 0) {
    return {
      value: null,
      numerator: misattributedCount,
      denominator: totalAuthorAttributedCount,
      is_applicable: false,
      notes: "Nenhum claim atribuído ao autor neste conjunto de dados.",
    };
  }

  const rate = (misattributedCount / totalAuthorAttributedCount) * 100;
  return {
    value: Number(rate.toFixed(4)),
    numerator: misattributedCount,
    denominator: totalAuthorAttributedCount,
    is_applicable: true,
    notes: `AMR calculado sobre ${totalAuthorAttributedCount} atribuições de autoria.`,
  };
}
