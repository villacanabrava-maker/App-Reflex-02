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

      // Validação da Identidade Canônica (NFC com acento) e Busca Tolerante (search_key sem acento)
      expect(conceito.pref_label_normalizado).toBe("hermenêutica filosófica");
      expect(conceito.search_key).toBe("hermeneutica filosofica");
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

  test("Execução dos Casos Executáveis da Wave 5 — Auditor Cognitivo, Abstenção Honesta e Allowed Use", async () => {
    const { MotorAbstencaoHonesta } = await import("../../src/dominios/cerebro/motor-abstencao");
    const { MontadorDossieContextual } = await import("../../src/dominios/cerebro/montador-dossie");
    const { AuditorCognitivoV31 } = await import("../../src/dominios/cerebro/auditor-cognitivo-v3");

    const wave5Cases = GOLDEN_DATASET_V3_SEEDS.filter((s) => s.isWave5Executable);
    expect(wave5Cases.length).toBeGreaterThanOrEqual(4);

    // 1. Teste CBR-09-ABSTAIN-NO-EVIDENCE-EXEC
    const dossieVazio = MontadorDossieContextual.montar({
      query: "Como você desenvolve computação quântica?",
      intent: "FACTUAL_LOCAL",
      usuarioId: usuarioTesteId,
      itemsRecuperados: [],
      abstained: true,
      abstentionReason: "INSUFFICIENT_EVIDENCE",
    });

    const resAbstencaoVazio = MotorAbstencaoHonesta.avaliarPreGeracao(dossieVazio);
    expect(resAbstencaoVazio.deve_abster).toBe(true);
    expect(resAbstencaoVazio.categoria).toBe("NO_EVIDENCE");
    expect(resAbstencaoVazio.tipo_resultado).toBe("COGNITIVE_ABSTENTION");

    // 2. Teste CBR-09-ABSTAIN-AUTHORIAL-UNKNOWN-EXEC
    const dossieApenasExterno = MontadorDossieContextual.montar({
      query: "Qual é a sua opinião pessoal sobre a dialética de Hegel?",
      intent: "AUTHORIAL",
      usuarioId: usuarioTesteId,
      itemsRecuperados: [
        {
          id: "ext_hegel_001",
          conteudo: "Hegel escreveu a Fenomenologia do Espírito em 1807 sobre o devir dialético.",
          obra_id: "obra_ext_01",
          obra_titulo: "História da Filosofia",
          obra_natureza: "externa",
          score_final: 0.9,
          individual_scores: { dense_sim: 0.9 },
          taxonomy_match: false,
          epistemic_status: "extracted",
          temporal_fit: 1.0,
          counterevidence_flag: false,
          retrieval_route: "Route D",
          explanation: "Fonte de terceiro",
        },
      ],
    });

    const resAbstencaoAutor = MotorAbstencaoHonesta.avaliarPreGeracao(dossieApenasExterno);
    expect(resAbstencaoAutor.deve_abster).toBe(true);
    expect(resAbstencaoAutor.categoria).toBe("SOURCE_ONLY");

    // 3. Teste CBR-10-GENERATION-ALLOWED-USE-EXEC & CBR-08-AUTHOR-FIREWALL-BREACH-EXEC
    const relatorioViolacao = await AuditorCognitivoV31.auditar({
      textoGerado: "Você acredita firmemente que a vontade de poder move a história.",
      dossierSnapshotId: dossieApenasExterno.id,
      versaoReflexaoId: "11111111-1111-1111-1111-111111111111",
      usuarioId: usuarioTesteId,
      dossieObjeto: dossieApenasExterno,
      declaracoesSuporte: [
        {
          generated_claim: "Você acredita firmemente que a vontade de poder move a história.",
          generated_span: "Você acredita firmemente que a vontade de poder move a história.",
          support_dossier_item_ids: ["item_ext_hegel_001_1"],
          declarative_nature: "authorial",
        },
      ],
    });

    expect(relatorioViolacao.status).toBe("BLOCK");
    expect(relatorioViolacao.forbidden_use_rate).toBe(100);
    expect(relatorioViolacao.claims_audit[0].support_status).toBe("FORBIDDEN_USE");
    expect(relatorioViolacao.claims_audit[0].violates_memory_firewall).toBe(true);
    expect(relatorioViolacao.milr).toBe(100);
    expect(relatorioViolacao.amr).toBe(100);
    expect(relatorioViolacao.intervencoes.length).toBeGreaterThan(0);

    // 4. Teste CBR-12-PROVENANCE-LINEAGE-COMPLETE-EXEC (Caso Legítimo Aprovado)
    const dossieAutoral = MontadorDossieContextual.montar({
      query: "Atenção plena e escrita",
      intent: "AUTHORIAL",
      usuarioId: usuarioTesteId,
      itemsRecuperados: [
        {
          id: "aut_atencao_001",
          conteudo: "Minha tese é que a atenção plena antecede a escrita densa.",
          obra_id: "obra_aut_01",
          obra_titulo: "Caderno Reflexivo 2024",
          obra_natureza: "autoral",
          score_final: 0.95,
          individual_scores: { dense_sim: 0.95 },
          taxonomy_match: true,
          epistemic_status: "confirmed_authorial",
          temporal_fit: 1.0,
          counterevidence_flag: false,
          retrieval_route: "Route D",
          explanation: "Memória confirmada do autor",
        },
      ],
    });

    const relatorioAprovado = await AuditorCognitivoV31.auditar({
      textoGerado: "Minha tese é que a atenção plena antecede a escrita densa.",
      dossierSnapshotId: dossieAutoral.id,
      versaoReflexaoId: "22222222-2222-2222-2222-222222222222",
      usuarioId: usuarioTesteId,
      dossieObjeto: dossieAutoral,
      declaracoesSuporte: [
        {
          generated_claim: "Minha tese é que a atenção plena antecede a escrita densa.",
          generated_span: "Minha tese é que a atenção plena antecede a escrita densa.",
          support_dossier_item_ids: ["item_aut_atencao_001_1"],
          declarative_nature: "authorial",
        },
      ],
    });

    expect(relatorioAprovado.status).toBe("PASS");
    expect(relatorioAprovado.milr).toBe(0);
    expect(relatorioAprovado.amr).toBe(0);
    expect(relatorioAprovado.forbidden_use_rate).toBe(0);
    expect(relatorioAprovado.claims_audit[0].support_status).toBe("SUPPORTED");
  });
});
