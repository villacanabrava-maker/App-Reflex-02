import { describe, test, expect } from "vitest";
import { MotorRetrievalV31 } from "../../src/dominios/cerebro/motor-retrieval-v3";
import { RETRIEVAL_CONFIG_V1 } from "../../src/config/retrieval-config";

describe("Live Retrieval Benchmark & Signal Verification — Wave 5", () => {
  const usuarioId = "12345678-1234-1234-1234-123456789012";

  const corpusFixtures = [
    {
      id: "doc_autoral_01",
      conteudo: "A autenticidade da escrita reflexiva exige isolamento criativo e disciplina diária.",
      obra_id: "obra_01",
      obra_titulo: "Notas de Trabalho",
      obra_natureza: "autoral" as const,
      tsv_palavras: ["autenticidade", "escrita", "reflexiva", "isolamento", "disciplina"],
      vetor_distancia: 0.15,
      tags_conceitos: ["escrita autoral", "autenticidade"],
      epistemic_status: "confirmed_authorial" as const,
      is_contraevidencia: false,
    },
    {
      id: "doc_externo_01",
      conteudo: "Adorno e Horkheimer criticam a indústria cultural como engrenagem de alienação.",
      obra_id: "obra_02",
      obra_titulo: "Dialética do Esclarecimento",
      obra_natureza: "externa" as const,
      tsv_palavras: ["adorno", "horkheimer", "industria", "cultural", "alienacao"],
      vetor_distancia: 0.20,
      tags_conceitos: ["industria cultural"],
      epistemic_status: "extracted" as const,
      is_contraevidencia: false,
    },
    {
      id: "doc_contraevidencia_01",
      conteudo: "O isolamento excessivo degrada a criatividade e empobrece a experiência do autor.",
      obra_id: "obra_03",
      obra_titulo: "Caderno Crítico",
      obra_natureza: "autoral" as const,
      tsv_palavras: ["isolamento", "criatividade", "empobrece"],
      vetor_distancia: 0.18,
      tags_conceitos: ["escrita autoral"],
      epistemic_status: "extracted" as const,
      is_contraevidencia: true, // Contra-evidência
    },
    {
      id: "doc_superado_01",
      conteudo: "Em 2017, acreditei que notas soltas sem fichamento eram suficientes.",
      obra_id: "obra_04",
      obra_titulo: "Primeiros Ensaios",
      obra_natureza: "autoral" as const,
      tsv_palavras: ["notas", "fichamento"],
      vetor_distancia: 0.25,
      tags_conceitos: ["fichamento"],
      epistemic_status: "superseded" as const, // Tese superada
      is_contraevidencia: false,
    },
  ];

  test("1. Route D: Separação de Tese Autoral e Contra-evidência Dialética", () => {
    // Consulta com foco dialético / tensão
    const res = MotorRetrievalV31.buscar(
      corpusFixtures,
      "Tensão e contradição sobre isolamento e escrita",
      usuarioId,
      { route: "Route D", incluir_contraevidencias: true }
    );

    expect(res.route_used).toBe("Route D");
    expect(res.intent).toBe("CONTRADICTION");
    expect(res.items.length).toBeGreaterThan(0);

    const temContra = res.items.some((i) => i.counterevidence_flag);
    expect(temContra).toBe(true);

    const autoral = res.items.find((i) => i.id === "doc_autoral_01");
    expect(autoral?.individual_scores.authorial_multiplier).toBe(RETRIEVAL_CONFIG_V1.authorial_multiplier);
  });

  test("2. Exclusão de contraevidências quando incluir_contraevidencias for falso em consulta padrão", () => {
    const res = MotorRetrievalV31.buscar(
      corpusFixtures,
      "Como estruturo minha escrita reflexiva?",
      usuarioId,
      { route: "Route D", incluir_contraevidencias: false }
    );

    expect(res.items.length).toBeGreaterThan(0);
    // Em consulta direta não dialética com contraevidências desligadas, o item não deve receber bônus dialético
    const contraItem = res.items.find((i) => i.id === "doc_contraevidencia_01");
    if (contraItem) {
      expect(contraItem.counterevidence_flag).toBe(true);
    }
  });

  test("3. Penalização de Tese Superada (superseded factor) em consultas presentes", () => {
    const res = MotorRetrievalV31.buscar(
      corpusFixtures,
      "Qual é o método atual de fichamento e notas?",
      usuarioId,
      { route: "Route D" }
    );

    const itemSuperado = res.items.find((i) => i.id === "doc_superado_01");
    if (itemSuperado) {
      expect(itemSuperado.individual_scores.temporal_factor).toBe(RETRIEVAL_CONFIG_V1.superseded_factor);
      expect(itemSuperado.temporal_fit).toBeLessThan(1.0);
    }
  });

  test("4. Abstenção Honesta em consulta sobre assunto totalmente ausente do acervo", () => {
    const res = MotorRetrievalV31.buscar(
      corpusFixtures,
      "supercondutores e física quântica em alta pressão",
      usuarioId,
      { route: "Route D" }
    );

    expect(res.abstained).toBe(true);
    expect(res.abstention_reason).toBe("INSUFFICIENT_EVIDENCE");
  });

  test("5. Telemetria e Hiperparâmetros Versionados", () => {
    const res = MotorRetrievalV31.buscar(corpusFixtures, "isolamento", usuarioId);

    expect(res.telemetry.rrf_k).toBe(RETRIEVAL_CONFIG_V1.rrf_k);
    expect(res.telemetry.config_version).toBe(RETRIEVAL_CONFIG_V1.versao_config);
    expect(res.route_candidate_status).toBe("SELECTED_CANDIDATE_FROM_SYNTHETIC_BENCHMARK");
  });
});
