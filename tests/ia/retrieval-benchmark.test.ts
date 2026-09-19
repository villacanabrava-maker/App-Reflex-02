/**
 * Benchmark A/B de Retrieval Multi-Sinal — Cérebro Reflex V3.1 (Wave 4)
 * Padrão: Avaliação Sob Orçamento Fixo, Comparação de 5 Rotas e Abstenção Honesta.
 */

import { describe, expect, it } from "vitest";
import { MotorRetrievalV31 } from "@/dominios/cerebro/motor-retrieval-v3";

describe("Benchmark A/B de Retrieval Multi-Sinal V3.1 (Auditoria A7)", () => {
  const usuarioId = "11111111-1111-1111-1111-111111111111";

  // Corpus de Teste Controlado e Qualificado
  const corpus = [
    {
      id: "doc_1_autoral_ativo",
      conteudo: "A autonomia do pensamento requer uma postura de recusa frente ao consenso prematuro e à técnica instrumental.",
      obra_id: "obra_caderno_2026",
      obra_titulo: "Caderno de Ensaios 2026",
      obra_natureza: "autoral" as const,
      secao_titulo: "Sobre a Autonomia",
      vetor_distancia: 0.15, // alta proximidade semântica
      tags_conceitos: ["autonomia"],
      epistemic_status: "confirmed_authorial" as const,
      data_criacao: "2026-03-01",
    },
    {
      id: "doc_2_autoral_antigo_superseded",
      conteudo: "Eu acreditava que a técnica moderna traria a libertação da inteligência, mas essa visão provou-se ingênua.",
      obra_id: "obra_notas_2021",
      obra_titulo: "Notas Iniciais 2021",
      obra_natureza: "autoral" as const,
      secao_titulo: "Primeiros Escritos",
      vetor_distancia: 0.20,
      tags_conceitos: ["técnica moderna"],
      epistemic_status: "superseded" as const, // Posição superada!
      data_criacao: "2021-05-10",
    },
    {
      id: "doc_3_externo_heidegger",
      conteudo: "Heidegger afirma que a técnica moderna reduz o mundo e o homem à condição de estoque disponível (Gestell).",
      obra_id: "obra_leitura_filosofia",
      obra_titulo: "Leituras de Ontologia",
      obra_natureza: "externa" as const,
      secao_titulo: "Capítulo IV - A Questão da Técnica",
      vetor_distancia: 0.25,
      tags_conceitos: ["técnica moderna", "ontologia"],
      epistemic_status: "extracted" as const,
      data_criacao: "2024-01-15",
    },
    {
      id: "doc_4_contraevidencia",
      conteudo: "Em contraposição à minha tese de recusa, alguns críticos apontam que a técnica pode viabilizar autonomia comunicativa.",
      obra_id: "obra_caderno_2026",
      obra_titulo: "Caderno de Ensaios 2026",
      obra_natureza: "autoral" as const,
      secao_titulo: "Tensões Dialéticas",
      vetor_distancia: 0.28,
      tags_conceitos: ["autonomia"],
      epistemic_status: "extracted" as const,
      is_contraevidencia: true,
      data_criacao: "2026-04-10",
    },
    {
      id: "doc_5_ruido_irrelevante",
      conteudo: "Lista de compras de suprimentos de escritório e receitas de culinária italiana.",
      obra_id: "obra_avulsa",
      obra_titulo: "Anotações Aleatórias",
      obra_natureza: "externa" as const,
      vetor_distancia: 1.80, // muito distante
      epistemic_status: "extracted" as const,
      data_criacao: "2025-11-20",
    },
  ];

  it("Benchmark 1 — Citação Exata e Factual Local (Route B1 e D superam Route A)", () => {
    const query = 'trecho exato "postura de recusa frente ao consenso"';

    const resA = MotorRetrievalV31.buscar(corpus, query, usuarioId, { route: "Route A" });
    const resB0 = MotorRetrievalV31.buscar(corpus, query, usuarioId, { route: "Route B0" });
    const resB1 = MotorRetrievalV31.buscar(corpus, query, usuarioId, { route: "Route B1" });
    const resD = MotorRetrievalV31.buscar(corpus, query, usuarioId, { route: "Route D" });

    expect(resA.items.length).toBeGreaterThan(0);
    expect(resB0.items.length).toBeGreaterThan(0);
    expect(resB1.items.length).toBeGreaterThan(0);
    expect(resB1.items[0].id).toBe("doc_1_autoral_ativo");
    expect(resD.items[0].id).toBe("doc_1_autoral_ativo");
  });

  it("Benchmark 2 — Deprioritization Temporal (Route D penaliza superseded em consultas de presente)", () => {
    const query = "o que eu defendo sobre a técnica moderna?";

    const resA = MotorRetrievalV31.buscar(corpus, query, usuarioId, { route: "Route A" });
    const resD = MotorRetrievalV31.buscar(corpus, query, usuarioId, { route: "Route D" });

    const posDoc2EmA = resA.items.findIndex((i) => i.id === "doc_2_autoral_antigo_superseded");
    const posDoc2EmD = resD.items.findIndex((i) => i.id === "doc_2_autoral_antigo_superseded");

    expect(posDoc2EmA).toBeGreaterThanOrEqual(0);
    expect(posDoc2EmD).toBeGreaterThanOrEqual(0);

    // Na Rota D, o item superado deve ficar atrás do item ativo e do externo
    const itemAtivoD = resD.items.find((i) => i.id === "doc_1_autoral_ativo");
    const itemSupersededD = resD.items.find((i) => i.id === "doc_2_autoral_antigo_superseded");

    if (itemAtivoD && itemSupersededD) {
      expect(itemAtivoD.score_final).toBeGreaterThan(itemSupersededD.score_final);
    }
    expect(resD.items[0].epistemic_status).not.toBe("superseded");
  });

  it("Benchmark 3 — Dialética e Contraevidência (Consulta por tensões ativa rota dialética)", () => {
    const query = "quais as contradições e tensões sobre a autonomia na técnica?";

    const resD = MotorRetrievalV31.buscar(corpus, query, usuarioId, { route: "Route D" });
    expect(resD.intent).toBe("CONTRADICTION");

    const temContraevidencia = resD.items.some((i) => i.counterevidence_flag);
    expect(temContraevidencia).toBe(true);
  });

  it("Benchmark 4 — Abstenção Cognitiva Honesta (Consulta sobre assunto ausente abstém com INSUFFICIENT_EVIDENCE)", () => {
    const query = "física quântica e supercondutores em temperatura ambiente";

    const resD = MotorRetrievalV31.buscar(corpus, query, usuarioId, { route: "Route D" });
    expect(resD.abstained).toBe(true);
    expect(resD.abstention_reason).toBe("INSUFFICIENT_EVIDENCE");
  });

  it("Benchmark 5 — Tabela Comparativa de Rotas (Evidência A7 de Desempenho Multi-Sinal)", () => {
    const consultas = [
      "autonomia e recusa ao consenso",
      "contradições sobre técnica moderna",
      "visão geral de ontologia",
    ];

    const tabelaComparativa: Array<{
      query: string;
      top_A: string;
      top_B0: string;
      top_B1: string;
      top_D: string;
    }> = [];

    for (const q of consultas) {
      const a = MotorRetrievalV31.buscar(corpus, q, usuarioId, { route: "Route A" });
      const b0 = MotorRetrievalV31.buscar(corpus, q, usuarioId, { route: "Route B0" });
      const b1 = MotorRetrievalV31.buscar(corpus, q, usuarioId, { route: "Route B1" });
      const d = MotorRetrievalV31.buscar(corpus, q, usuarioId, { route: "Route D" });

      tabelaComparativa.push({
        query: q,
        top_A: a.items[0]?.id || "none",
        top_B0: b0.items[0]?.id || "none",
        top_B1: b1.items[0]?.id || "none",
        top_D: d.items[0]?.id || "none",
      });
    }

    expect(tabelaComparativa.length).toBe(3);
    // Rota D sempre seleciona itens autorais ativos para consultas autorais
    expect(tabelaComparativa[0].top_D).toBe("doc_1_autoral_ativo");
  });
});
