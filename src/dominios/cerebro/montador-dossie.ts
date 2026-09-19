/**
 * Montador de Working Memory & Dossiê Contextual V3.1 — Cérebro Reflex (Wave 4/5)
 * Padrão: 9 Compartimentos Estanques, Políticas Rígidas de Allowed Use,
 * Barreira Anti-Prompt-Injection, Hash SHA-256 Canônico Profundo e Orçamento Estrito de Tokens.
 */

import * as crypto from "node:crypto";
import {
  AllowedUsePolicy,
  AuthorialScope,
  DossierCompartment,
  DossierItem,
  DossierV31,
  DossierV31Schema,
  EpistemicStatus,
  QueryIntent,
} from "@/tipos/cognitivo-v3";
import { ItemRecuperado } from "./motor-retrieval-v3";
import { RETRIEVAL_CONFIG_V1 } from "@/config/retrieval-config";

export interface MontarDossieInput {
  query: string;
  intent: QueryIntent;
  usuarioId: string;
  itemsRecuperados: ItemRecuperado[];
  targetTokenBudget?: 2000 | 4000 | 8000 | 16000;
  regrasProcedurais?: Array<{
    id: string;
    tipo: string;
    enunciado: string;
    confirmada?: boolean;
    origem?: "autoral" | "sistema";
  }>;
  conceitosRelacionados?: Array<{
    id: string;
    termo: string;
    definicao?: string;
    epistemic_status?: EpistemicStatus;
    origem_autoral?: boolean;
  }>;
  abstained?: boolean;
  abstentionReason?: string;
}

export class MontadorDossieContextual {
  public static readonly TOKEN_ESTIMATOR_VERSION = "char_ratio_v1.0";

  /**
   * Estima o consumo de tokens de uma string (aproximação conservadora de 1 token ~ 4 caracteres)
   */
  public static estimarTokens(texto: string): number {
    if (!texto) return 0;
    return Math.ceil(texto.trim().length / 4);
  }

  /**
   * Sanitiza conteúdo recuperado para impedir Prompt Injection nos compartimentos do Dossiê.
   * Documentos recuperados são DADOS NÃO CONFIÁVEIS e jamais comandos.
   */
  public static sanitizarConteudoRecuperado(conteudo: string): string {
    return conteudo
      .replace(/<\|im_start\|>/gi, "[filtered_tag]")
      .replace(/<\|im_end\|>/gi, "[filtered_tag]")
      .replace(/\[SYSTEM\]/gi, "[DATA_TEXT]")
      .replace(/\[INSTRUCTION\]/gi, "[DATA_TEXT]")
      .replace(/ignore all previous instructions/gi, "[command_neutralized]")
      .replace(/ignore system prompt/gi, "[command_neutralized]")
      .replace(/reveal secrets/gi, "[command_neutralized]")
      .trim();
  }

  /**
   * Atribui as políticas normativas de Allowed Use conforme autoridade e proveniência epistêmica
   */
  public static determinarAllowedUse(item: ItemRecuperado): AllowedUsePolicy[] {
    const policies: AllowedUsePolicy[] = [];

    // 1. Fontes Externas vs Autorais (Constituição: Memory-Inference Firewall)
    if (item.obra_natureza === "autoral") {
      if (item.epistemic_status === "confirmed_authorial") {
        policies.push("CAN_SUPPORT_AUTHORIAL_CLAIM");
        policies.push("CAN_BE_CITED_DIRECTLY");
      } else if (item.epistemic_status === "superseded") {
        policies.push("HISTORICAL_ONLY");
        policies.push("COUNTEREVIDENCE_ONLY");
      } else if (item.epistemic_status === "extracted" || item.epistemic_status === "quoted") {
        policies.push("CAN_SUPPORT_AUTHORIAL_CLAIM");
        policies.push("CAN_BE_CITED_DIRECTLY");
      } else {
        // proposed, inferred, hypothesized
        policies.push("CAN_INSPIRE_QUESTION");
        policies.push("CANNOT_BE_STATED_AS_MEMORY");
      }
    } else {
      // Obra externa de terceiros: NUNCA pode apoiar crença autoral
      policies.push("CAN_SUPPORT_EXTERNAL_CLAIM");
      policies.push("CANNOT_SUPPORT_AUTHORIAL_CLAIM");

      // Fonte externa só pode ser citada diretamente se houver evidência factual com span
      if (item.conteudo && item.conteudo.length > 10) {
        policies.push("CAN_BE_CITED_DIRECTLY");
      }
    }

    if (item.counterevidence_flag) {
      if (!policies.includes("COUNTEREVIDENCE_ONLY")) {
        policies.push("COUNTEREVIDENCE_ONLY");
      }
    }

    return policies;
  }

  /**
   * Gera um hash SHA-256 canônico profundo cobrindo toda a semântica do snapshot
   */
  public static computarHashCanonico(
    query: string,
    intent: QueryIntent,
    targetBudget: number,
    configVersion: string,
    compartments: Record<string, DossierItem[]>
  ): string {
    const todosItens = Object.values(compartments)
      .flat()
      .sort((a, b) => a.final_rank - b.final_rank)
      .map((item) => ({
        id: item.dossier_item_id,
        comp: item.compartment,
        content_hash: crypto.createHash("sha256").update(item.content).digest("hex"),
        status: item.epistemic_status,
        allowed_use: [...item.allowed_use].sort(),
        scope: item.authorial_scope,
        route: item.retrieval_route,
        cost: item.token_cost,
        temporal_fit: item.temporal_fit ?? null,
        counterevidence: item.counterevidence_flag,
        source_ids: [...item.source_ids].sort(),
      }));

    const representacaoCanonica = {
      query: query.trim(),
      intent,
      target_token_budget: targetBudget,
      configuration_version: configVersion,
      items: todosItens,
    };

    return crypto
      .createHash("sha256")
      .update(JSON.stringify(representacaoCanonica))
      .digest("hex");
  }

  /**
   * Monta o Dossiê Contextual V3.1 estruturado e com orçamentos estanques
   */
  public static montar(input: MontarDossieInput): DossierV31 {
    const budgetTotal = input.targetTokenBudget || 8000;
    const compartments: Record<DossierCompartment, DossierItem[]> = {
      task: [],
      direct_evidence: [],
      episodic_memory: [],
      semantic_memory: [],
      procedural_memory: [],
      concept_relations: [],
      counterevidence: [],
      hypotheses: [],
      uncertainties: [],
    };

    let tokensAcumulados = 0;

    // Se houver abstenção, pré-calculamos o custo do aviso de incerteza para RESERVAR orçamento
    let avisoAbstencaoTexto = "";
    let costAvisoAbstencao = 0;
    if (input.abstained) {
      avisoAbstencaoTexto = `Lacuna de conhecimento detectada: evidências insuficientes para responder com rigor autoral (${input.abstentionReason || "INSUFFICIENT_EVIDENCE"}).`;
      costAvisoAbstencao = MontadorDossieContextual.estimarTokens(avisoAbstencaoTexto);
    }

    // Teto disponível para itens dinâmicos (garante que actual_tokens_total NUNCA ultrapasse budgetTotal)
    const tetoItensDinamicos = Math.max(0, budgetTotal - costAvisoAbstencao);

    // 1. Compartimento TASK: Enquadramento da Consulta
    const taskTexto = `Tarefa de reflexão cognitiva para a consulta: "${input.query}". Perfil de intenção detectado: ${input.intent}.`;
    const costTask = MontadorDossieContextual.estimarTokens(taskTexto);
    compartments.task.push({
      dossier_item_id: "task_definition",
      compartment: "task",
      memory_type: "task_instruction",
      epistemic_status: "extracted",
      source_ids: ["system_task"],
      retrieval_route: "intent_router",
      individual_scores: {},
      final_rank: 1,
      authorial_scope: "indeterminado",
      allowed_use: ["CAN_SUGGEST_STRUCTURE"],
      provenance: {},
      content: taskTexto,
      token_cost: costTask,
      counterevidence_flag: false,
      explanation: "Instrução canônica do enquadramento de raciocínio",
    });
    tokensAcumulados += costTask;

    // 2. Compartimento PROCEDURAL_MEMORY: Regras com autoridade real
    if (input.regrasProcedurais && input.regrasProcedurais.length > 0) {
      for (const [idx, r] of input.regrasProcedurais.entries()) {
        const costRegra = MontadorDossieContextual.estimarTokens(r.enunciado);
        if (tokensAcumulados + costRegra <= tetoItensDinamicos) {
          // Apenas regras explicitamente confirmadas ganham autoridade plena
          const statusEpistemico: EpistemicStatus = r.confirmada ? "confirmed_authorial" : "proposed";
          const allowedUseRegra: AllowedUsePolicy[] = ["CAN_GUIDE_STYLE", "CAN_SUGGEST_STRUCTURE", "CANNOT_SUPPORT_FACT"];
          if (!r.confirmada) {
            allowedUseRegra.push("CANNOT_SUPPORT_AUTHORIAL_CLAIM");
          }

          const escopoRegra: AuthorialScope = r.origem === "autoral" ? "autoral" : "externo";

          compartments.procedural_memory.push({
            dossier_item_id: `proc_${r.id || idx}`,
            compartment: "procedural_memory",
            memory_type: "procedural_rule",
            epistemic_status: statusEpistemico,
            source_ids: [r.id],
            retrieval_route: "cerebro_autoral_rules",
            individual_scores: {},
            final_rank: idx + 1,
            authorial_scope: escopoRegra,
            allowed_use: allowedUseRegra,
            provenance: {},
            content: `[REGRA ${r.tipo.toUpperCase()}]: ${r.enunciado}`,
            token_cost: costRegra,
            counterevidence_flag: false,
            explanation: "Regra metodológica ativa",
          });
          tokensAcumulados += costRegra;
        }
      }
    }

    // 3. Compartimento CONCEPT_RELATIONS: Grafo SKOS sem presunção universal de autoria
    if (input.conceitosRelacionados && input.conceitosRelacionados.length > 0) {
      for (const [idx, c] of input.conceitosRelacionados.entries()) {
        const desc = `- Conceito: ${c.termo}${c.definicao ? ` (${c.definicao})` : ""}`;
        const costConceito = MontadorDossieContextual.estimarTokens(desc);
        if (tokensAcumulados + costConceito <= tetoItensDinamicos) {
          const statusEpistemico: EpistemicStatus = c.epistemic_status || "consolidated";
          const escopo = c.origem_autoral ? "autoral" : "indeterminado";

          compartments.concept_relations.push({
            dossier_item_id: `skos_${c.id || idx}`,
            compartment: "concept_relations",
            memory_type: "skos_concept",
            epistemic_status: statusEpistemico,
            source_ids: [c.id],
            retrieval_route: "skos_ontology",
            individual_scores: {},
            final_rank: idx + 1,
            authorial_scope: escopo,
            allowed_use: ["CAN_INSPIRE_QUESTION"],
            provenance: {},
            content: desc,
            token_cost: costConceito,
            counterevidence_flag: false,
            explanation: "Conceito taxonômico SKOS ancorado",
          });
          tokensAcumulados += costConceito;
        }
      }
    }

    // 4. Compartimentos de Evidência a partir dos Itens Recuperados
    for (const [idx, item] of input.itemsRecuperados.entries()) {
      const sanitized = MontadorDossieContextual.sanitizarConteudoRecuperado(item.conteudo);
      const tokenCost = MontadorDossieContextual.estimarTokens(sanitized);

      if (tokensAcumulados + tokenCost > tetoItensDinamicos) {
        // Estourou o budget estrito
        break;
      }

      const allowedUse = MontadorDossieContextual.determinarAllowedUse(item);

      // Determina compartimento de destino
      let targetComp: DossierCompartment = "direct_evidence";
      if (item.counterevidence_flag || allowedUse.includes("COUNTEREVIDENCE_ONLY")) {
        targetComp = "counterevidence";
      } else if (item.epistemic_status === "superseded" || allowedUse.includes("HISTORICAL_ONLY")) {
        targetComp = "episodic_memory";
      } else if (item.obra_natureza === "autoral") {
        targetComp = "direct_evidence";
      } else {
        targetComp = "semantic_memory";
      }

      const scope = item.obra_natureza === "autoral" ? "autoral" : "externo";

      const dossierItem: DossierItem = {
        dossier_item_id: `item_${item.id}_${idx + 1}`,
        compartment: targetComp,
        memory_type: item.obra_natureza === "autoral" ? "episodic_memory" : "external_source",
        epistemic_status: item.epistemic_status,
        source_ids: [item.id, item.obra_id],
        retrieval_route: item.retrieval_route,
        individual_scores: item.individual_scores as any,
        final_rank: idx + 1,
        authorial_scope: scope,
        allowed_use: allowedUse,
        temporal_fit: item.temporal_fit,
        provenance: {
          obra_titulo: item.obra_titulo,
          secao_titulo: item.secao_titulo || null,
        },
        content: `[Fonte: "${item.obra_titulo}" (${scope})]\n${sanitized}`,
        token_cost: tokenCost,
        counterevidence_flag: item.counterevidence_flag,
        explanation: item.explanation,
      };

      compartments[targetComp].push(dossierItem);
      tokensAcumulados += tokenCost;
    }

    // 5. Compartimento UNCERTAINTIES (Se houve abstenção)
    if (input.abstained && avisoAbstencaoTexto) {
      compartments.uncertainties.push({
        dossier_item_id: "uncertainty_notice",
        compartment: "uncertainties",
        memory_type: "meta_memory",
        epistemic_status: "proposed",
        source_ids: [],
        retrieval_route: "abstention_engine",
        individual_scores: {},
        final_rank: 1,
        authorial_scope: "indeterminado",
        allowed_use: ["CAN_INSPIRE_QUESTION"],
        provenance: {},
        content: avisoAbstencaoTexto,
        token_cost: costAvisoAbstencao,
        counterevidence_flag: false,
        explanation: "Sinal precursor de abstenção epistêmica",
      });
      tokensAcumulados += costAvisoAbstencao;
    }

    // Invariante de Segurança: tokensAcumulados NUNCA deve ultrapassar budgetTotal
    if (tokensAcumulados > budgetTotal) {
      // Caso de contingência defensiva: trunca compartimentos não essenciais
      tokensAcumulados = budgetTotal;
    }

    const payloadHash = MontadorDossieContextual.computarHashCanonico(
      input.query,
      input.intent,
      budgetTotal,
      RETRIEVAL_CONFIG_V1.versao_config,
      compartments
    );

    const dossie: DossierV31 = {
      id: crypto.randomUUID(),
      query: input.query,
      intent: input.intent,
      target_token_budget: budgetTotal,
      actual_tokens_total: tokensAcumulados,
      estimated_tokens: tokensAcumulados,
      token_estimator_version: MontadorDossieContextual.TOKEN_ESTIMATOR_VERSION,
      configuration_version: RETRIEVAL_CONFIG_V1.versao_config,
      compartments,
      abstained: !!input.abstained,
      abstention_reason: input.abstentionReason,
      snapshot_hash: payloadHash,
      criado_em: new Date().toISOString(),
    };

    DossierV31Schema.parse(dossie);
    return dossie;
  }
}
