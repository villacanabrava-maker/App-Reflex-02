/**
 * Montador de Working Memory & Dossiê Contextual V3.1 — Cérebro Reflex (Wave 4)
 * Padrão: 9 Compartimentos Estanques, Políticas Rígidas de Allowed Use,
 * Barreira Anti-Prompt-Injection e Orçamento Estrito de Tokens.
 */

import * as crypto from "node:crypto";
import {
  AllowedUsePolicy,
  DossierCompartment,
  DossierItem,
  DossierV31,
  DossierV31Schema,
  QueryIntent,
} from "@/tipos/cognitivo-v3";
import { ItemRecuperado } from "./motor-retrieval-v3";

export interface MontarDossieInput {
  query: string;
  intent: QueryIntent;
  usuarioId: string;
  itemsRecuperados: ItemRecuperado[];
  targetTokenBudget?: 2000 | 4000 | 8000 | 16000;
  regrasProcedurais?: Array<{ id: string; tipo: string; enunciado: string }>;
  conceitosRelacionados?: Array<{ id: string; termo: string; definicao?: string }>;
  abstained?: boolean;
  abstentionReason?: string;
}

export class MontadorDossieContextual {
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
      } else {
        // proposed ou extracted
        policies.push("CAN_INSPIRE_QUESTION");
        policies.push("CANNOT_BE_STATED_AS_MEMORY");
      }
    } else {
      // Obra externa de terceiros
      policies.push("CAN_SUPPORT_EXTERNAL_CLAIM");
      policies.push("CANNOT_SUPPORT_AUTHORIAL_CLAIM");
      policies.push("CAN_BE_CITED_DIRECTLY");
    }

    if (item.counterevidence_flag) {
      policies.push("COUNTEREVIDENCE_ONLY");
    }

    return policies;
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

    // 2. Compartimento PROCEDURAL_MEMORY: Regras ativas
    if (input.regrasProcedurais && input.regrasProcedurais.length > 0) {
      for (const [idx, r] of input.regrasProcedurais.entries()) {
        const costRegra = MontadorDossieContextual.estimarTokens(r.enunciado);
        if (tokensAcumulados + costRegra <= budgetTotal) {
          compartments.procedural_memory.push({
            dossier_item_id: `proc_${r.id || idx}`,
            compartment: "procedural_memory",
            memory_type: "procedural_rule",
            epistemic_status: "confirmed_authorial",
            source_ids: [r.id],
            retrieval_route: "cerebro_autoral_rules",
            individual_scores: {},
            final_rank: idx + 1,
            authorial_scope: "autoral",
            allowed_use: ["CAN_GUIDE_STYLE", "CAN_SUGGEST_STRUCTURE", "CANNOT_SUPPORT_FACT"],
            provenance: {},
            content: `[REGRA ${r.tipo.toUpperCase()}]: ${r.enunciado}`,
            token_cost: costRegra,
            counterevidence_flag: false,
            explanation: "Regra metodológica autoral ativa",
          });
          tokensAcumulados += costRegra;
        }
      }
    }

    // 3. Compartimento CONCEPT_RELATIONS: Grafo SKOS
    if (input.conceitosRelacionados && input.conceitosRelacionados.length > 0) {
      for (const [idx, c] of input.conceitosRelacionados.entries()) {
        const desc = `- Conceito: ${c.termo}${c.definicao ? ` (${c.definicao})` : ""}`;
        const costConceito = MontadorDossieContextual.estimarTokens(desc);
        if (tokensAcumulados + costConceito <= budgetTotal) {
          compartments.concept_relations.push({
            dossier_item_id: `skos_${c.id || idx}`,
            compartment: "concept_relations",
            memory_type: "skos_concept",
            epistemic_status: "consolidated",
            source_ids: [c.id],
            retrieval_route: "skos_ontology",
            individual_scores: {},
            final_rank: idx + 1,
            authorial_scope: "autoral",
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

      if (tokensAcumulados + tokenCost > budgetTotal) {
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

    // 5. Compartimento UNCERTAINTIES (Se houve abstenção ou pouca evidência)
    if (input.abstained) {
      const aviso = `Lacuna de conhecimento detectada: evidências insuficientes para responder com rigor autoral (${input.abstentionReason || "INSUFFICIENT_EVIDENCE"}).`;
      const costAviso = MontadorDossieContextual.estimarTokens(aviso);
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
        content: aviso,
        token_cost: costAviso,
        counterevidence_flag: false,
        explanation: "Sinal precursora de abstenção epistêmica",
      });
      tokensAcumulados += costAviso;
    }

    // Geração do hash SHA-256 do snapshot para reprodutibilidade estrita
    const payloadHash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          query: input.query,
          intent: input.intent,
          budget: budgetTotal,
          items: Object.values(compartments).flat().map((i) => ({
            id: i.dossier_item_id,
            cost: i.token_cost,
            route: i.retrieval_route,
          })),
        })
      )
      .digest("hex");

    const dossie: DossierV31 = {
      id: crypto.randomUUID(),
      query: input.query,
      intent: input.intent,
      target_token_budget: budgetTotal,
      actual_tokens_total: tokensAcumulados,
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
