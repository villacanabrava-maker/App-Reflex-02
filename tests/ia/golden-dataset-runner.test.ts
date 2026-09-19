import { describe, test, expect } from "vitest";
import { GOLDEN_DATASET_V3_SEEDS } from "./fixtures/golden-dataset-seeds";
import { ExtratorClaimsV3 } from "../../src/dominios/cerebro/extrator-claims";
import { GerenciadorEventosMemoria } from "../../src/dominios/cerebro/gerenciador-eventos";
import { MotorTaxonomicoSKOS } from "../../src/dominios/taxonomia/motor-skos";
import { calculateMILR, calculateAMR } from "../../src/tipos/cognitivo-v3";

describe("Golden Dataset V3 Runner — Avaliação Epistêmica das 12 Famílias CBR (Wave 1)", () => {
  const extrator = new ExtratorClaimsV3(undefined, "shadow");
  const usuarioTesteId = "11111111-2222-3333-4444-555555555555";

  test("Todas as 12 famílias CBR devem possuir sementes válidas e estruturadas", () => {
    const families = new Set(GOLDEN_DATASET_V3_SEEDS.map((s) => s.family));
    expect(families.size).toBe(12);

    const requiredFamilies = [
      "INGEST",
      "CLAIM",
      "MEMORY",
      "TEMPORAL",
      "TAXONOMY",
      "RETRIEVAL",
      "CONTRADICTION",
      "AUTHOR",
      "ABSTENTION",
      "GENERATION",
      "LEARNING",
      "PROVENANCE",
    ];

    for (const fam of requiredFamilies) {
      expect(families.has(fam as any), `Família ${fam} deve estar presente no Golden Dataset`).toBe(true);
    }
  });

  test("Execução dos Casos Executáveis da Wave 1 — Ingestão, Claims, Firewall e Proveniência", async () => {
    const wave1Cases = GOLDEN_DATASET_V3_SEEDS.filter((s) => s.isWave1Executable);
    expect(wave1Cases.length).toBeGreaterThanOrEqual(6);

    let totalExtractionsAttempted = 0;
    let successfulExtractions = 0;
    let leakedInferencesCount = 0;
    let memoryPresentedClaimsCount = 0;
    let misattributedAuthorCount = 0;
    let totalAuthorAttributedCount = 0;

    for (const testCase of wave1Cases) {
      totalExtractionsAttempted++;

      const resultado = await extrator.processar({
        usuario_id: usuarioTesteId,
        source_type: testCase.sourceInput.sourceType,
        source_id: testCase.sourceInput.sourceId,
        source_version: testCase.sourceInput.sourceVersion,
        texto_completo: testCase.sourceInput.text,
      });

      // 1. Caso de Extração Limpa Esperada
      if (testCase.expectedBehavior.shouldExtract) {
        expect(
          resultado.claims_validados.length,
          `Caso ${testCase.id} deveria extrair claims com sucesso`
        ).toBeGreaterThanOrEqual(testCase.expectedBehavior.expectedClaimCount || 1);

        successfulExtractions++;

        const claim = resultado.claims_validados[0];

        // Status Epistemológico
        if (testCase.expectedBehavior.expectedEpistemicStatus) {
          expect(claim.epistemic_status).toBe(testCase.expectedBehavior.expectedEpistemicStatus);
        }

        // Papel de Autoria (Soberania Autoral e Princípio UNKNOWN != AUTHORIAL)
        if (testCase.expectedBehavior.expectedAuthorialRole) {
          expect(claim.source_role).toBe(testCase.expectedBehavior.expectedAuthorialRole);
        }

        // Tipologia do Claim
        if (testCase.expectedBehavior.expectedClaimType) {
          expect(claim.claim_type).toBe(testCase.expectedBehavior.expectedClaimType);
        }

        // Integridade de Proveniência e Hash SHA-256
        if (testCase.expectedBehavior.mustContainHashMatching) {
          expect(claim.provenance.content_hash).toBeDefined();
          expect(claim.provenance.content_hash.length).toBe(64);
          const computedHash = ExtratorClaimsV3.computarHashSpan(claim.provenance.span_texto_original);
          expect(claim.provenance.content_hash).toBe(computedHash);
        }

        // Rastreamento para cálculo de AMR
        if (claim.source_role === "AUTHOR_EXPLICIT") {
          totalAuthorAttributedCount++;
          // Se fosse de fonte externa mas tivesse sido atribuído como autor: violação!
          if (testCase.sourceInput.text.toLowerCase().includes("kant")) {
            misattributedAuthorCount++;
          }
        }

        // Rastreamento para cálculo de MILR
        if (claim.epistemic_status === "extracted" || claim.epistemic_status === "confirmed_authorial") {
          memoryPresentedClaimsCount++;
          // Se o claim nasceu de mera hipótese ou incerteza: vazamento!
          if (testCase.sourceInput.text.toLowerCase().includes("talvez")) {
            leakedInferencesCount++;
          }
        }
      }

      // 2. Caso de Abstenção Esperada (Ambiguidade -> Não Extrai)
      if (testCase.expectedBehavior.shouldAbstain) {
        expect(
          resultado.claims_validados.length,
          `Caso ${testCase.id} deveria abster-se e não gerar claims válidos`
        ).toBe(0);
      }

      // 3. Caso de Firewall Violation (Incerteza / Injeção)
      if (testCase.expectedBehavior.mustRejectFirewallViolation) {
        expect(
          resultado.claims_validados.length,
          `Caso ${testCase.id} com incerteza não deveria ter claims promovidos a memória`
        ).toBe(0);
      }
    }

    // 4. Medição Formal de MILR (Memory-Inference Leakage Rate)
    const milrResult = calculateMILR(leakedInferencesCount, memoryPresentedClaimsCount);
    expect(milrResult.is_applicable).toBe(true);
    expect(
      milrResult.value,
      `MILR no Golden Dataset fechado deve ser rigorosamente 0.0% (Leakage Zero). Observado: ${milrResult.value}%`
    ).toBe(0.0);

    // 5. Medição Formal de AMR (Authorial Misattribution Rate)
    const amrResult = calculateAMR(misattributedAuthorCount, totalAuthorAttributedCount);
    expect(amrResult.is_applicable).toBe(true);
    expect(
      amrResult.value,
      `AMR no Golden Dataset fechado deve ser 0.0%. Observado: ${amrResult.value}%`
    ).toBe(0.0);

    // 6. Anti-Abstention-Collapse Gate: Garantir que o sistema não respondeu 'não sei' para tudo!
    expect(totalExtractionsAttempted).toBe(wave1Cases.length);
    const coverageRatio = successfulExtractions / wave1Cases.filter((c) => c.expectedBehavior.shouldExtract).length;
    expect(
      coverageRatio,
      `Taxa de cobertura/extração deve ser de 100% nos casos afirmativos válidos (Anti-Abstention Collapse). Observado: ${coverageRatio * 100}%`
    ).toBe(1.0);
  });

  test("Validação Estrutural dos Contratos de Waves Futuras (Waves 2 a 6)", () => {
    const futureCases = GOLDEN_DATASET_V3_SEEDS.filter((s) => !s.isWave1Executable);
    expect(futureCases.length).toBeGreaterThanOrEqual(5);

    // Garante que os casos de Waves futuras possuem schema e contratos válidos sem executar testes falsos
    for (const fc of futureCases) {
      expect(fc.id).toBeDefined();
      expect(fc.family).toBeDefined();
      expect(fc.sourceInput.text.length).toBeGreaterThan(5);
      expect(fc.notes.length).toBeGreaterThan(5);
    }
  });

  test("Execução dos Casos Executáveis da Wave 2 — Superação Temporal e Event Ledger", async () => {
    const wave2Cases = GOLDEN_DATASET_V3_SEEDS.filter((s) => s.isWave2Executable);
    expect(wave2Cases.length).toBeGreaterThanOrEqual(1);

    const gerenciador = new GerenciadorEventosMemoria();

    for (const _testCase of wave2Cases) {
      // Simula a existência prévia de uma tese no estado 'confirmed_authorial'
      const claimId = "33333333-3333-3333-3333-333333333333";

      // Transição para superseded autorizada pelo autor humano
      const resultadoTransicao = await gerenciador.transicionarEstado({
        usuario_id: usuarioTesteId,
        claim_id: claimId,
        status_atual: "confirmed_authorial",
        novo_status: "superseded",
        ator_tipo: "HUMAN",
        ator_id: usuarioTesteId,
        justificativa: "Revendo tese no tempo: abandonei a abordagem positivista.",
      });

      expect(resultadoTransicao.success).toBe(true);
      expect(resultadoTransicao.novo_status).toBe("superseded");
      expect(resultadoTransicao.event_type).toBe("CLAIM_SUPERSEDED");
      expect(resultadoTransicao.event_id).toBeDefined();
    }
  });

  test("Execução dos Casos Executáveis da Wave 3 — Taxonomia SKOS, Anti-Inflação e Ancoragem", async () => {
    const wave3Cases = GOLDEN_DATASET_V3_SEEDS.filter((s) => s.isWave3Executable);
    expect(wave3Cases.length).toBeGreaterThanOrEqual(1);

    MotorTaxonomicoSKOS.resetStoreLocal();

    for (const testCase of wave3Cases) {
      // 1. Extração do Claim da Fonte
      const extracao = await extrator.processar({
        usuario_id: usuarioTesteId,
        source_type: testCase.sourceInput.sourceType,
        source_id: testCase.sourceInput.sourceId,
        source_version: testCase.sourceInput.sourceVersion,
        texto_completo: testCase.sourceInput.text,
      });

      expect(extracao.claims_validados.length).toBeGreaterThanOrEqual(1);
      const claim = extracao.claims_validados[0];
      expect(claim.source_role).toBe("UNKNOWN"); // Não autoral

      // 2. Proposição de Conceito SKOS
      const conceito = MotorTaxonomicoSKOS.proporConceito({
        usuario_id: usuarioTesteId,
        pref_label: "Hermenêutica Filosófica",
        alt_labels: ["Hermenêutica", "Interpretação Textual"],
        definicao: "Teoria e metodologia de interpretação e compreensão de textos filosóficos.",
      });

      expect(conceito.pref_label_normalizado).toBe("hermeneutica filosofica");
      expect(conceito.recorrencia_contagem).toBe(1);

      // 3. Teste de Anti-Inflação: Propor variação idêntica/normalizada incrementa recorrência
      const conceitoRepetido = MotorTaxonomicoSKOS.proporConceito({
        usuario_id: usuarioTesteId,
        pref_label: "  hermenêutica filosófica  ",
      });
      expect(conceitoRepetido.id).toBe(conceito.id);
      expect(conceitoRepetido.recorrencia_contagem).toBe(2);

      // 4. Teste de Resolução de Aliases
      const aliasResolvido = MotorTaxonomicoSKOS.resolverAlias(usuarioTesteId, "Hermenêutica");
      expect(aliasResolvido).not.toBeNull();
      expect(aliasResolvido?.id).toBe(conceito.id);

      // 5. Teste de Relações Ontológicas SKOS (BROADER)
      const conceitoPai = MotorTaxonomicoSKOS.proporConceito({
        usuario_id: usuarioTesteId,
        pref_label: "Filosofia",
      });
      const relacao = MotorTaxonomicoSKOS.adicionarRelacao(
        usuarioTesteId,
        conceito.id!,
        conceitoPai.id!,
        "BROADER"
      );
      expect(relacao.tipo_relacao).toBe("BROADER");

      // 6. Teste de Ancoragem Conceitual Claim <-> Conceito
      const link = MotorTaxonomicoSKOS.vincularClaimConceito({
        usuario_id: usuarioTesteId,
        claim_id: "55555555-5555-5555-5555-555555555555",
        conceito_id: conceito.id!,
        tipo_vinculo: "DISCUSSES_CONCEPT",
        confianca: 0.92,
      });
      expect(link.tipo_vinculo).toBe("DISCUSSES_CONCEPT");
      expect(link.confianca).toBe(0.92);

      // 7. Salvaguarda do Firewall: O claim original permanece com seu papel inalterado
      expect(claim.source_role).toBe("UNKNOWN");
    }
  });

  test("Cálculo formal de MILR e AMR deve tratar adequadamente denominador zero", () => {
    // Zero claims apresentados como memória -> métrica is_applicable deve ser false
    const zeroMilr = calculateMILR(0, 0);
    expect(zeroMilr.is_applicable).toBe(false);
    expect(zeroMilr.value).toBeNull();

    const zeroAmr = calculateAMR(0, 0);
    expect(zeroAmr.is_applicable).toBe(false);
    expect(zeroAmr.value).toBeNull();
  });
});
