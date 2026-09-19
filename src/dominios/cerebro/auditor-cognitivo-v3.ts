/**
 * Auditor Cognitivo Pós-Geração V3.1 — Cérebro Reflex (Wave 5)
 * Padrão: Desmontagem Proposicional, Verificação em Camadas (Tier 1/2/3),
 * Allowed Use como Gate Estrutural, Memory-Inference Firewall e Imutabilidade Pericial.
 */

import * as crypto from "node:crypto";
import {
  AuditReportV31,
  AuditReportV31Schema,
  AuditorStatus,
  ClaimAuditAction,
  ClaimSupportStatus,
  DossierItem,
  DossierV31,
  GeneratedClaimType,
  OutputClaimAudit,
  WriterSupportDeclaration,
  calculateAMR,
  calculateMILR,
} from "@/tipos/cognitivo-v3";
import { MotorAbstencaoHonesta } from "./motor-abstencao";
import { RepositorioDossieContextual } from "./repositorio-dossie";
import { criarClienteAdmin } from "@/infraestrutura/supabase/cliente-admin";

export interface ISupportVerifier {
  verificarSuporte(
    claimText: string,
    evidenciaContent: string
  ): Promise<{
    label: "ENTAILMENT" | "NEUTRAL" | "CONTRADICTION";
    confidence: number;
    reasoning?: string;
  }>;
}

/**
 * Verificador Heurístico e Lexical Padrão (Tier 2 baseline rápido e desacoplado)
 */
export class VerificadorSuporteHeuristico implements ISupportVerifier {
  public async verificarSuporte(
    claimText: string,
    evidenciaContent: string
  ): Promise<{
    label: "ENTAILMENT" | "NEUTRAL" | "CONTRADICTION";
    confidence: number;
    reasoning?: string;
  }> {
    const normClaim = claimText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normEvi = evidenciaContent.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // 1. Detecção de contradição direta
    if (
      (normClaim.includes("nao") || normClaim.includes("rejeita") || normClaim.includes("nega")) &&
      (normEvi.includes("afirma") || normEvi.includes("defende") || normEvi.includes("adota"))
    ) {
      return {
        label: "CONTRADICTION",
        confidence: 0.85,
        reasoning: "Tensão direta entre negação e afirmação detectada no texto.",
      };
    }

    // 2. Extração de palavras-chave significativas
    const palavrasClaim = normClaim
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);

    if (palavrasClaim.length === 0) {
      return { label: "NEUTRAL", confidence: 0.5 };
    }

    let correspondencias = 0;
    for (const p of palavrasClaim) {
      if (normEvi.includes(p)) correspondencias++;
    }

    const razao = correspondencias / palavrasClaim.length;

    if (razao >= 0.6) {
      return {
        label: "ENTAILMENT",
        confidence: Math.min(1.0, 0.7 + razao * 0.3),
        reasoning: `Alta correspondência conceitual (${Math.round(razao * 100)}% de termos coincidentes).`,
      };
    } else if (razao >= 0.3) {
      return {
        label: "NEUTRAL",
        confidence: 0.6,
        reasoning: "Correspondência parcial entre afirmação e evidência.",
      };
    } else {
      return {
        label: "NEUTRAL",
        confidence: 0.8,
        reasoning: "Baixa correspondência entre termos da afirmação e evidência.",
      };
    }
  }
}

export interface InputAuditoriaV31 {
  textoGerado: string;
  dossierSnapshotId: string;
  versaoReflexaoId: string;
  usuarioId: string;
  declaracoesSuporte?: WriterSupportDeclaration[];
  dossieObjeto?: DossierV31;
  configVersion?: string;
  verificadorSemantico?: ISupportVerifier;
}

export class AuditorCognitivoV31 {
  public static readonly VERSAO_AUDITOR = "v3.1-audit-2026-09-19";

  /**
   * Executa a auditoria pós-geração completa com verificação em camadas e salvaguardas de Allowed Use
   */
  public static async auditar(input: InputAuditoriaV31): Promise<AuditReportV31> {
    const verificador = input.verificadorSemantico || new VerificadorSuporteHeuristico();
    const configVer = input.configVersion || AuditorCognitivoV31.VERSAO_AUDITOR;

    // 1. Obter snapshot congelado (do objeto em memória ou do banco)
    let dossie: DossierV31;
    if (input.dossieObjeto) {
      dossie = input.dossieObjeto;
    } else {
      dossie = await RepositorioDossieContextual.obterSnapshotPorId(
        input.dossierSnapshotId,
        input.usuarioId
      );
    }

    // Mapa indexado de itens do dossiê para consulta imediata por ID
    const todosItens = Object.values(dossie.compartments).flat();
    const mapaItens = new Map<string, DossierItem>();
    todosItens.forEach((item) => mapaItens.set(item.dossier_item_id, item));

    // 2. Desmontagem Proposicional da Saída (Claim Extraction com spans)
    const claimsExtraidos = AuditorCognitivoV31.extrairClaimsSaida(
      input.textoGerado,
      input.declaracoesSuporte
    );

    // 3. Verificação em Camadas para cada Claim
    const claimsAuditados: OutputClaimAudit[] = [];
    const intervencoes: Array<{ original: string; corrigido: string; motivo: string }> = [];

    let totalClaimsMemoria = 0;
    let vazamentosInferencia = 0;
    let totalAtribuicoesAutoria = 0;
    let misatribuicoesAutoria = 0;
    let totalClaimsNaoSuportados = 0;
    let totalClaimsUsoProibido = 0;
    let totalCitacoesValidas = 0;

    for (const c of claimsExtraidos) {
      const declaredIds = c.declared_support_ids;
      const effectiveIds: string[] = [];

      let supportStatus: ClaimSupportStatus = "UNSUPPORTED";
      let action: ClaimAuditAction = "REWRITE";
      let violatesAllowedUse = false;
      let violatesMemoryFirewall = false;
      let justificativa = "";

      // Encontrar os itens de suporte no snapshot
      const itensSuporte = declaredIds
        .map((id) => mapaItens.get(id))
        .filter((item): item is DossierItem => item !== undefined);

      itensSuporte.forEach((item) => effectiveIds.push(item.dossier_item_id));

      if (c.claim_type === "NON_CLAIM" || c.claim_type === "QUESTION") {
        supportStatus = "SUPPORTED";
        action = "PASS";
        justificativa = "Elemento não-asserção ou interrogação reflexiva legítima.";
      } else if (itensSuporte.length === 0) {
        // Sem suporte declarado ou suporte não encontrado no snapshot
        supportStatus = "UNSUPPORTED";
        totalClaimsNaoSuportados++;
        action = c.claim_type === "AUTHORIAL_ASSERTION" ? "BLOCK" : "HEDGE";
        justificativa = "Afirmação carece de item de sustentação no Dossiê Contextual.";

        if (c.claim_type === "AUTHORIAL_ASSERTION") {
          totalClaimsMemoria++;
          vazamentosInferencia++; // Apresentado como autor sem suporte -> vazamento
          totalAtribuicoesAutoria++;
          misatribuicoesAutoria++;
          violatesMemoryFirewall = true;
          intervencoes.push({
            original: c.claim_text,
            corrigido: `[HIPÓTESE A CONFIRMAR]: ${c.claim_text}`,
            motivo: "Afirmação autoral sem lastro no Dossiê congelado.",
          });
        }
      } else {
        // Itens de suporte encontrados -> Verificação Tier 1 (Determinístico & Allowed Use)
        let temViolacaoAllowedUse = false;
        let temViolacaoFirewall = false;

        for (const item of itensSuporte) {
          // GATE ESTRUTURAL INVIOLÁVEL: Fonte externa NÃO pode sustentar afirmação de autoria
          if (c.claim_type === "AUTHORIAL_ASSERTION") {
            totalClaimsMemoria++;
            totalAtribuicoesAutoria++;

            if (
              item.authorial_scope === "externo" ||
              item.allowed_use.includes("CANNOT_SUPPORT_AUTHORIAL_CLAIM")
            ) {
              temViolacaoAllowedUse = true;
              temViolacaoFirewall = true;
              vazamentosInferencia++;
              misatribuicoesAutoria++;
              justificativa = `Violação de Allowed Use: fonte externa "${item.provenance?.obra_titulo || item.dossier_item_id}" foi utilizada para atribuir crença ao autor.`;
              break;
            }

            if (item.epistemic_status === "superseded") {
              temViolacaoAllowedUse = true;
              justificativa = `Violação temporal: item superseded "${item.dossier_item_id}" foi usado como posição presente do autor.`;
              break;
            }
          }

          // Se o item for restrito a contraevidência e o claim o citar como regra ou fato afirmativo
          if (
            item.allowed_use.includes("COUNTEREVIDENCE_ONLY") &&
            c.claim_type !== "INTERPRETIVE_SYNTHESIS" &&
            c.claim_type !== "HYPOTHESIS"
          ) {
            temViolacaoAllowedUse = true;
            justificativa = `Item restrito a contraevidência utilizado como asserção factual positiva.`;
            break;
          }
        }

        if (temViolacaoAllowedUse) {
          supportStatus = "FORBIDDEN_USE";
          action = "BLOCK";
          violatesAllowedUse = true;
          violatesMemoryFirewall = temViolacaoFirewall;
          totalClaimsUsoProibido++;

          intervencoes.push({
            original: c.claim_text,
            corrigido: `Em leituras externas sobre o tema nota-se a posição: "${c.claim_text}". Faz sentido para sua reflexão?`,
            motivo: justificativa,
          });
        } else {
          // Tier 2: Verificação Semântica via ISupportVerifier
          let melhorLabel: "ENTAILMENT" | "NEUTRAL" | "CONTRADICTION" = "NEUTRAL";
          let maxConf = 0;

          for (const item of itensSuporte) {
            const resVerificacao = await verificador.verificarSuporte(c.claim_text, item.content);
            if (resVerificacao.label === "CONTRADICTION") {
              melhorLabel = "CONTRADICTION";
              maxConf = resVerificacao.confidence;
              justificativa = `Contradição semântica detectada com o item "${item.dossier_item_id}": ${resVerificacao.reasoning || ""}`;
              break;
            } else if (resVerificacao.label === "ENTAILMENT" && resVerificacao.confidence > maxConf) {
              melhorLabel = "ENTAILMENT";
              maxConf = resVerificacao.confidence;
              justificativa = `Sustentação semântica comprovada por "${item.dossier_item_id}".`;
            }
          }

          if (melhorLabel === "CONTRADICTION") {
            supportStatus = "CONTRADICTED";
            action = "BLOCK";
          } else if (melhorLabel === "ENTAILMENT") {
            supportStatus = "SUPPORTED";
            action = "PASS";
            totalCitacoesValidas++;
          } else {
            // Tier 3: Incerteza / Parcial
            if (c.claim_type === "HYPOTHESIS") {
              // Se o redator já formulou explicitamente como hipótese/conjectura atenuada, é aceito
              supportStatus = "SUPPORTED";
              action = "PASS";
              justificativa = "Hipótese reflexiva atenuada aceita com sustentação contextual exploratória.";
              totalCitacoesValidas++;
            } else {
              supportStatus = "AMBIGUOUS";
              action = "HEDGE";
              justificativa = "A evidência citada aborda o tema, mas não acarreta formalmente a conclusão.";
              intervencoes.push({
                original: c.claim_text,
                corrigido: `É plausível ponderar que ${c.claim_text.toLowerCase()}`,
                motivo: "Atenuação de afirmação ambígua com marcador de incerteza.",
              });
            }
          }
        }
      }

      claimsAuditados.push({
        claim_id: c.claim_id,
        claim_text: c.claim_text,
        claim_span: c.claim_span,
        claim_type: c.claim_type,
        declared_support_ids: declaredIds,
        effective_support_ids: effectiveIds,
        support_status: supportStatus,
        action_recommended: action,
        violates_allowed_use: violatesAllowedUse,
        violates_memory_firewall: violatesMemoryFirewall,
        justification: justificativa,
        suggested_intervention: intervencoes.find((i) => i.original === c.claim_text)?.corrigido,
      });
    }

    // 4. Cálculo das Métricas Epistêmicas Formais
    const milrResult = calculateMILR(vazamentosInferencia, totalClaimsMemoria);
    const amrResult = calculateAMR(misatribuicoesAutoria, totalAtribuicoesAutoria);

    const totalFactuais = claimsAuditados.filter(
      (c) => c.claim_type !== "NON_CLAIM" && c.claim_type !== "QUESTION"
    ).length;

    const unsupportedRate = totalFactuais > 0 ? (totalClaimsNaoSuportados / totalFactuais) * 100 : 0;
    const forbiddenUseRate = totalFactuais > 0 ? (totalClaimsUsoProibido / totalFactuais) * 100 : 0;
    const citationPrecision = claimsAuditados.length > 0 ? (totalCitacoesValidas / claimsAuditados.length) * 100 : 100;

    // 5. Avaliação do Motor de Abstenção Honesta em Pós-Geração
    const avaliacaoAbstencao = MotorAbstencaoHonesta.avaliarPosGeracao(claimsAuditados, dossie);

    // 6. Determinação do Status Global de Auditoria
    let statusFinal: AuditorStatus = "PASS";

    if (claimsAuditados.some((c) => c.action_recommended === "BLOCK") || forbiddenUseRate > 0) {
      statusFinal = "BLOCK";
    } else if (avaliacaoAbstencao.deve_abster) {
      statusFinal = "ABSTAIN";
    } else if (intervencoes.length > 0 || claimsAuditados.some((c) => c.action_recommended === "HEDGE" || c.action_recommended === "REWRITE")) {
      statusFinal = "PASS_WITH_CORRECTIONS";
    }

    const relatorio: AuditReportV31 = {
      id: crypto.randomUUID(),
      usuario_id: input.usuarioId,
      versao_reflexao_id: input.versaoReflexaoId,
      dossier_snapshot_id: input.dossierSnapshotId,
      snapshot_hash: dossie.snapshot_hash,
      auditor_version: configVer,
      status: statusFinal,
      abstention_category: avaliacaoAbstencao.categoria,
      claims_audit: claimsAuditados,
      milr: milrResult.value !== null ? milrResult.value : 0.0,
      amr: amrResult.value !== null ? amrResult.value : 0.0,
      unsupported_claim_rate: Number(unsupportedRate.toFixed(2)),
      forbidden_use_rate: Number(forbiddenUseRate.toFixed(2)),
      citation_precision: Number(citationPrecision.toFixed(2)),
      intervencoes,
      created_at: new Date().toISOString(),
    };

    AuditReportV31Schema.parse(relatorio);

    // 7. Persistência no PostgreSQL se a versão for válida
    if (input.versaoReflexaoId && input.usuarioId) {
      try {
        const admin = criarClienteAdmin();
        const { error: erroPersistencia } = await admin
          .schema("auditoria")
          .rpc("registrar_relatorio_auditoria_v3_1", {
          p_id: relatorio.id,
          p_usuario_id: input.usuarioId,
          p_versao_reflexao_id: input.versaoReflexaoId,
          p_dossier_snapshot_id: input.dossierSnapshotId,
          p_snapshot_hash: relatorio.snapshot_hash,
          p_auditor_version: relatorio.auditor_version,
          p_status: relatorio.status,
          p_abstention_category: relatorio.abstention_category || null,
          p_claims_audit: relatorio.claims_audit,
          p_milr: relatorio.milr,
          p_amr: relatorio.amr,
          p_unsupported_claim_rate: relatorio.unsupported_claim_rate,
          p_forbidden_use_rate: relatorio.forbidden_use_rate,
          p_citation_precision: relatorio.citation_precision,
          p_intervencoes: relatorio.intervencoes,
        });

        if (erroPersistencia) {
          throw new Error(`Falha ao persistir relatório cognitivo V3.1: ${erroPersistencia.message}`);
        }
      } catch (err) {
        // Objetos em memória são permitidos exclusivamente em testes/avaliações sintéticas.
        // No runtime normal, em que o snapshot é carregado pelo ID persistido, falhar
        // ao gravar o laudo precisa bloquear o fluxo (fail closed).
        if (!input.dossieObjeto) {
          throw err;
        }
        console.warn(
          "Aviso: persistência do relatório omitida em avaliação sintética:",
          (err as Error).message
        );
      }
    }

    return relatorio;
  }

  /**
   * Decompõe o texto gerado em orações proposicionais atômicas e classifica seus tipos
   */
  public static extrairClaimsSaida(
    texto: string,
    declaracoesWriter?: WriterSupportDeclaration[]
  ): Array<{
    claim_id: string;
    claim_text: string;
    claim_span: string;
    claim_type: GeneratedClaimType;
    declared_support_ids: string[];
  }> {
    if (!texto || texto.trim().length === 0) return [];

    // Se o redator já forneceu declarações explícitas de sustentação (Contrato V3.1)
    if (declaracoesWriter && declaracoesWriter.length > 0) {
      return declaracoesWriter.map((decl, idx) => {
        let claimType: GeneratedClaimType = "INTERPRETIVE_SYNTHESIS";
        if (decl.declarative_nature === "authorial" || /\b(voc[eê] (acredita|defende|prefere|decidiu|sustenta)|minha posi[çc][aã]o)\b/i.test(decl.generated_claim)) {
          claimType = "AUTHORIAL_ASSERTION";
        } else if (decl.declarative_nature === "external" || /\b(afirma|escreve|publicou|segundo)\b/i.test(decl.generated_claim)) {
          claimType = "EXTERNAL_ASSERTION";
        } else if (decl.declarative_nature === "hypothetical" || /\b(talvez|plaus[ií]vel|pode ser que)\b/i.test(decl.generated_claim)) {
          claimType = "HYPOTHESIS";
        }

        return {
          claim_id: `claim_out_${idx + 1}`,
          claim_text: decl.generated_claim,
          claim_span: decl.generated_span,
          claim_type: claimType,
          declared_support_ids: decl.support_dossier_item_ids,
        };
      });
    }

    // Decomposição automática por sentenças
    const sentencas = texto
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10 && !s.startsWith("#"));

    return sentencas.map((s, idx) => {
      let claimType: GeneratedClaimType = "FACTUAL_ASSERTION";

      if (s.endsWith("?")) {
        claimType = "QUESTION";
      } else if (/\b(voc[eê] (acredita|defende|prefere|decidiu|costuma|sempre|sustenta)|sua vis[aã]o [eé]|voc[eê] rejeita)\b/i.test(s)) {
        claimType = "AUTHORIAL_ASSERTION";
      } else if (/\b(segundo|afirma|conforme|escreveu|argumenta)\b/i.test(s)) {
        claimType = "EXTERNAL_ASSERTION";
      } else if (/\b(talvez|plaus[ií]vel|[eé] poss[ií]vel que|conjectur|sugere-se)\b/i.test(s)) {
        claimType = "HYPOTHESIS";
      } else if (/\b(primeiramente|em seguida|estruturamos|para este ensaio)\b/i.test(s)) {
        claimType = "PROCEDURAL_STATEMENT";
      }

      return {
        claim_id: `claim_out_${idx + 1}`,
        claim_text: s,
        claim_span: s,
        claim_type: claimType,
        declared_support_ids: [],
      };
    });
  }
}
