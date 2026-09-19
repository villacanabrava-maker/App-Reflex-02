/**
 * Configuração Central de Feature Flags Cognitivas — Cérebro Reflex V3.1
 * Padrão: Fail-Safe, Default-Off, Shadow Mode Controlado.
 */

export type FeatureFlagState = "off" | "shadow" | "on";

export interface CognitiveFeatureFlags {
  FEATURE_COGNITIVE_V31_RETRIEVAL: FeatureFlagState;
  FEATURE_COGNITIVE_V31_DOSSIER: FeatureFlagState;
  FEATURE_COGNITIVE_V31_AUDITOR: FeatureFlagState;
  FEATURE_COGNITIVE_V31_ABSTENTION: FeatureFlagState;
}

export const COGNITIVE_FEATURE_FLAGS: CognitiveFeatureFlags = {
  // Default Off absoluto por governança; configurável via variáveis de ambiente
  FEATURE_COGNITIVE_V31_RETRIEVAL:
    (process.env.FEATURE_COGNITIVE_V31_RETRIEVAL as FeatureFlagState) || "off",
  FEATURE_COGNITIVE_V31_DOSSIER:
    (process.env.FEATURE_COGNITIVE_V31_DOSSIER as FeatureFlagState) || "off",
  FEATURE_COGNITIVE_V31_AUDITOR:
    (process.env.FEATURE_COGNITIVE_V31_AUDITOR as FeatureFlagState) || "off",
  FEATURE_COGNITIVE_V31_ABSTENTION:
    (process.env.FEATURE_COGNITIVE_V31_ABSTENTION as FeatureFlagState) || "off",
};

export function obterFeatureFlag(
  flag: keyof CognitiveFeatureFlags
): FeatureFlagState {
  return COGNITIVE_FEATURE_FLAGS[flag] || "off";
}

export function isFlagAtiva(flag: keyof CognitiveFeatureFlags): boolean {
  const estado = obterFeatureFlag(flag);
  return estado === "shadow" || estado === "on";
}
