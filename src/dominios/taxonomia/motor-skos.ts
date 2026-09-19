/**
 * Motor de Taxonomia SKOS e Ancoragem Conceitual — Cérebro Reflex V3.1 (Wave 3)
 * Padrão: Normalização Canônica, Anti-Inflação de Conceitos e Preservação da Soberania Autoral
 */

import * as crypto from "node:crypto";
import {
  SKOSConcept,
  SKOSRelation,
  SKOSRelationType,
  ClaimConceptLink,
  ClaimConceptLinkType,
  SKOSConceptSchema,
  SKOSRelationSchema,
  ClaimConceptLinkSchema,
} from "../../tipos/cognitivo-v3";

export interface SugestaoConceitoInput {
  usuario_id: string;
  pref_label: string;
  alt_labels?: string[];
  definicao?: string;
  dominio_escopo?: string;
}

export interface VinculoClaimConceitoInput {
  usuario_id: string;
  claim_id: string;
  conceito_id: string;
  tipo_vinculo?: ClaimConceptLinkType;
  confianca?: number;
  origem?: "IA_SUGGESTION" | "HUMAN_CURATED";
}

export class MotorTaxonomicoSKOS {
  // Store local em memória para testes e execução isolada
  private static conceitosStore: Map<string, SKOSConcept> = new Map();
  private static relacoesStore: Map<string, SKOSRelation> = new Map();
  private static vinculosStore: Map<string, ClaimConceptLink> = new Map();

  /**
   * Limpa os stores locais (utilitário para isolamento entre testes)
   */
  public static resetStoreLocal(): void {
    MotorTaxonomicoSKOS.conceitosStore.clear();
    MotorTaxonomicoSKOS.relacoesStore.clear();
    MotorTaxonomicoSKOS.vinculosStore.clear();
  }

  /**
   * Normaliza deterministicamente o label de um conceito:
   * 1. Unicode NFC
   * 2. Lowercase
   * 3. Remoção de diacríticos e pontuação irrelevante
   * 4. Compressão de espaços
   */
  public static normalizarLabel(label: string): string {
    return label
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove acentos
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // remove pontuação estranha
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Propõe um novo conceito ou resolve contra conceito existente (Anti-Inflação)
   */
  public static proporConceito(input: SugestaoConceitoInput): SKOSConcept {
    const rawLabel = input.pref_label.trim();
    if (rawLabel.length < 2) {
      throw new Error("O rótulo do conceito (pref_label) deve ter no mínimo 2 caracteres.");
    }

    const normLabel = MotorTaxonomicoSKOS.normalizarLabel(rawLabel);

    // 1. Anti-Inflação: Verificar se já existe conceito ativo com esse rótulo ou alias
    const todosUsuario = Array.from(MotorTaxonomicoSKOS.conceitosStore.values()).filter(
      (c) => c.usuario_id === input.usuario_id
    );

    const existentePorLabel = todosUsuario.find(
      (c) => c.pref_label_normalizado === normLabel && c.status !== "rejected" && c.status !== "deprecated"
    );

    if (existentePorLabel) {
      // Incrementa recorrência e adiciona novos aliases sem duplicar nó ontológico
      existentePorLabel.recorrencia_contagem += 1;
      if (input.alt_labels && input.alt_labels.length > 0) {
        const setAliases = new Set([...existentePorLabel.alt_labels, ...input.alt_labels]);
        existentePorLabel.alt_labels = Array.from(setAliases);
      }
      return existentePorLabel;
    }

    // 2. Anti-Inflação: Verificar se o termo já é alias de outro conceito existente
    const existentePorAlias = todosUsuario.find(
      (c) =>
        c.alt_labels.some((a) => MotorTaxonomicoSKOS.normalizarLabel(a) === normLabel) &&
        c.status !== "rejected" &&
        c.status !== "deprecated"
    );

    if (existentePorAlias) {
      existentePorAlias.recorrencia_contagem += 1;
      return existentePorAlias;
    }

    // 3. Criação de Novo Conceito Proposto
    const novoConceito: SKOSConcept = {
      id: crypto.randomUUID(),
      usuario_id: input.usuario_id,
      pref_label: rawLabel,
      pref_label_normalizado: normLabel,
      alt_labels: input.alt_labels ? Array.from(new Set(input.alt_labels.map((a) => a.trim()))) : [],
      idioma: "pt-BR",
      definicao: input.definicao?.trim() || null,
      dominio_escopo: input.dominio_escopo?.trim() || null,
      status: "proposed",
      recorrencia_contagem: 1,
      merged_into_id: null,
      metadados: {},
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };

    // Validação estrita via Zod
    SKOSConceptSchema.parse(novoConceito);

    MotorTaxonomicoSKOS.conceitosStore.set(novoConceito.id!, novoConceito);
    return novoConceito;
  }

  /**
   * Promove ou altera o status de curadoria de um conceito (Ação Humana ou Supervisão Curatorial)
   */
  public static atualizarStatusConceito(
    usuarioId: string,
    conceitoId: string,
    novoStatus: "active" | "rejected" | "deprecated"
  ): SKOSConcept {
    const conceito = MotorTaxonomicoSKOS.conceitosStore.get(conceitoId);
    if (!conceito || conceito.usuario_id !== usuarioId) {
      throw new Error(`Conceito ${conceitoId} não encontrado para o usuário.`);
    }

    conceito.status = novoStatus;
    conceito.atualizado_em = new Date().toISOString();
    return conceito;
  }

  /**
   * Estabelece relação ontológica SKOS (BROADER, NARROWER, RELATED)
   */
  public static adicionarRelacao(
    usuarioId: string,
    origemId: string,
    destinoId: string,
    tipoRelacao: SKOSRelationType
  ): SKOSRelation {
    if (origemId === destinoId) {
      throw new Error("Um conceito não pode relacionar-se consigo mesmo (auto-relação proibida).");
    }

    const origem = MotorTaxonomicoSKOS.conceitosStore.get(origemId);
    const destino = MotorTaxonomicoSKOS.conceitosStore.get(destinoId);

    if (!origem || origem.usuario_id !== usuarioId || !destino || destino.usuario_id !== usuarioId) {
      throw new Error("Ambos os conceitos devem existir e pertencer ao mesmo usuário.");
    }

    const relacaoId = crypto.randomUUID();
    const novaRelacao: SKOSRelation = {
      id: relacaoId,
      usuario_id: usuarioId,
      conceito_origem_id: origemId,
      conceito_destino_id: destinoId,
      tipo_relacao: tipoRelacao,
      status: "proposed",
      criado_em: new Date().toISOString(),
    };

    SKOSRelationSchema.parse(novaRelacao);
    MotorTaxonomicoSKOS.relacoesStore.set(relacaoId, novaRelacao);
    return novaRelacao;
  }

  /**
   * Ancora um claim atômico a um nó ontológico da taxonomia
   * NOTA CONSTITUCIONAL: A ancoragem semântica NÃO transforma claim de fonte externa em claim autoral!
   */
  public static vincularClaimConceito(input: VinculoClaimConceitoInput): ClaimConceptLink {
    const conceito = MotorTaxonomicoSKOS.conceitosStore.get(input.conceito_id);
    if (!conceito || conceito.usuario_id !== input.usuario_id) {
      throw new Error("O conceito especificado não existe ou não pertence ao usuário.");
    }

    const linkId = crypto.randomUUID();
    const novoVinculo: ClaimConceptLink = {
      id: linkId,
      usuario_id: input.usuario_id,
      claim_id: input.claim_id,
      conceito_id: input.conceito_id,
      tipo_vinculo: input.tipo_vinculo || "DISCUSSES_CONCEPT",
      confianca: input.confianca !== undefined ? input.confianca : 0.85,
      origem: input.origem || "IA_SUGGESTION",
      status: input.origem === "HUMAN_CURATED" ? "confirmed" : "proposed",
      criado_em: new Date().toISOString(),
    };

    ClaimConceptLinkSchema.parse(novoVinculo);
    MotorTaxonomicoSKOS.vinculosStore.set(linkId, novoVinculo);
    return novoVinculo;
  }

  /**
   * Resolução de termos e aliases contra a ontologia do usuário
   */
  public static resolverAlias(usuarioId: string, termo: string): SKOSConcept | null {
    const norm = MotorTaxonomicoSKOS.normalizarLabel(termo);
    const todosUsuario = Array.from(MotorTaxonomicoSKOS.conceitosStore.values()).filter(
      (c) => c.usuario_id === usuarioId && c.status !== "rejected" && c.status !== "deprecated"
    );

    return (
      todosUsuario.find(
        (c) => c.pref_label_normalizado === norm || c.alt_labels.some((a) => MotorTaxonomicoSKOS.normalizarLabel(a) === norm)
      ) || null
    );
  }
}
