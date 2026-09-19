import { describe, test, expect } from "vitest";
import { GOLDEN_DATASET_V3_SEEDS } from "./fixtures/golden-dataset-seeds";
import { ExtratorClaimsV3 } from "../../src/dominios/cerebro/extrator-claims";
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
