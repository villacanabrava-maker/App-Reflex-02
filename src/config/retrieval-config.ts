/**
 * Configuração Versionada de Ranking e Retrieval Multi-Sinal — Cérebro Reflex V3.1
 * Missão: MIS-0011 (Wave 5)
 * 
 * Centraliza os hiperparâmetros de busca, fusão RRF, penalidades temporais e bônus.
 * Status: BASELINE_UNCALIBRATED_V1 (Parâmetros empíricos iniciais a serem calibrados por benchmark contínuo).
 */

export interface RetrievalHyperparameters {
  versao_config: string;
  status_calibracao: "BASELINE_UNCALIBRATED" | "CALIBRATED_BENCHMARK";
  rrf_k: number;
  taxonomy_bonus_confirmed: number;
  taxonomy_bonus_proposed: number;
  authorial_multiplier: number;
  superseded_factor: number;
  counterevidence_bonus: number;
  abstention_threshold: number;
}

export const RETRIEVAL_CONFIG_V1: RetrievalHyperparameters = {
  versao_config: "v3.1-uncalibrated-2026-09-19",
  status_calibracao: "BASELINE_UNCALIBRATED",
  rrf_k: 60,
  taxonomy_bonus_confirmed: 0.015,
  taxonomy_bonus_proposed: 0.005,
  authorial_multiplier: 1.35,
  superseded_factor: 0.20,
  counterevidence_bonus: 0.02,
  abstention_threshold: 0.012,
};
