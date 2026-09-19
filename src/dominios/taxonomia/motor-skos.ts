/**
 * Motor de Taxonomia SKOS e Ancoragem Conceitual — Cérebro Reflex V3.1 (Wave 3 & Wave 4)
 * Padrão: Normalização Canônica, Anti-Inflação de Conceitos, Separação de Identidade vs Busca
 * e Preservação Estrita da Soberania Autoral Humana.
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
  metadados?: Record<string, unknown>;
}

export interface VinculoClaimConceitoInput {
  usuario_id: string;
  claim_id: string;
  conceito_id: string;
  tipo_vinculo?: ClaimConceptLinkType;
  confianca?: number | null;
  origem?: "IA_SUGGESTION" | "HUMAN_CURATED";
  metadados?: Record<string, unknown>;
}

export interface CuradoriaConceitoHumanoInput {
  usuario_id: string;
  conceito_id: string;
  acao: "confirm" | "reject" | "deprecate" | "merge" | "rename";
  novo_label?: string;
  merged_into_id?: string;
}

export interface CuradoriaVinculoHumanoInput {
  usuario_id: string;
  link_id: string;
  acao: "confirm" | "reject";
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
   * 1. IDENTIDADE CANÔNICA (identity_key):
   * Preserva distinções semânticas canônicas em português (NFC, lowercase, sem strip de acentos).
   * Exemplo: "não" != "nao", "série" != "serie", "tráfico" != "trafico".
   */
  public static gerarIdentityKey(label: string): string {
    return label
      .normalize("NFC")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "") // Preserva letras Unicode acentuadas
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * 2. BUSCA TOLERANTE (search_key):
   * Normalização com accent-folding (NFD sem diacríticos) para busca permissiva.
   */
  public static gerarSearchKey(label: string): string {
    return label
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove acentos
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Mantido por compatibilidade reversa — aponta para identity_key canônica
   */
  public static normalizarLabel(label: string): string {
    return MotorTaxonomicoSKOS.gerarIdentityKey(label);
  }

  /**
   * Propõe um novo conceito ou resolve contra conceito existente (Anti-Inflação)
   * NOTA DE GATE: Sugestões sistêmicas sempre entram com status = 'proposed' e origem = 'IA_SUGGESTION'
   */
  public static proporConceito(input: SugestaoConceitoInput): SKOSConcept {
    const rawLabel = input.pref_label.trim();
    if (rawLabel.length < 2) {
      throw new Error("O rótulo do conceito (pref_label) deve ter no mínimo 2 caracteres.");
    }

    const identityKey = MotorTaxonomicoSKOS.gerarIdentityKey(rawLabel);
    const searchKey = MotorTaxonomicoSKOS.gerarSearchKey(rawLabel);

    // 1. Anti-Inflação: Verificar se já existe conceito ativo com essa identity_key
    const todosUsuario = Array.from(MotorTaxonomicoSKOS.conceitosStore.values()).filter(
      (c) => c.usuario_id === input.usuario_id
    );

    const existentePorIdentity = todosUsuario.find(
      (c) => c.pref_label_normalizado === identityKey && c.status !== "rejected" && c.status !== "deprecated"
    );

    if (existentePorIdentity) {
      // Incrementa recorrência e adiciona novos aliases sem duplicar nó ontológico
      existentePorIdentity.recorrencia_contagem += 1;
      if (input.alt_labels && input.alt_labels.length > 0) {
        const setAliases = new Set([...existentePorIdentity.alt_labels, ...input.alt_labels]);
        existentePorIdentity.alt_labels = Array.from(setAliases);
      }
      return existentePorIdentity;
    }

    // 2. Anti-Inflação: Verificar se o termo já é alias de outro conceito existente
    const existentePorAlias = todosUsuario.find(
      (c) =>
        c.alt_labels.some((a) => MotorTaxonomicoSKOS.gerarIdentityKey(a) === identityKey) &&
        c.status !== "rejected" &&
        c.status !== "deprecated"
    );

    if (existentePorAlias) {
      existentePorAlias.recorrencia_contagem += 1;
      return existentePorAlias;
    }

    // 3. Criação de Novo Conceito Proposto pelo Sistema
    const novoConceito: SKOSConcept = {
      id: crypto.randomUUID(),
      usuario_id: input.usuario_id,
      pref_label: rawLabel,
      pref_label_normalizado: identityKey,
      search_key: searchKey,
      alt_labels: input.alt_labels ? Array.from(new Set(input.alt_labels.map((a) => a.trim()))) : [],
      idioma: "pt-BR",
      definicao: input.definicao?.trim() || null,
      dominio_escopo: input.dominio_escopo?.trim() || null,
      status: "proposed", // Sistema NUNCA cria como active ou confirmed
      recorrencia_contagem: 1,
      merged_into_id: null,
      metadados: { origem: "IA_SUGGESTION", ...(input.metadados || {}) },
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };

    // Validação estrita via Zod
    SKOSConceptSchema.parse(novoConceito);

    MotorTaxonomicoSKOS.conceitosStore.set(novoConceito.id!, novoConceito);
    return novoConceito;
  }

  /**
   * CURADORIA HUMANA EXPLÍCITA (Gate 0: Separação Curador Humano vs Sistema)
   */
  public static curarConceitoHumano(input: CuradoriaConceitoHumanoInput): SKOSConcept {
    const conceito = MotorTaxonomicoSKOS.conceitosStore.get(input.conceito_id);
    if (!conceito || conceito.usuario_id !== input.usuario_id) {
      throw new Error(`Conceito ${input.conceito_id} não encontrado para o usuário.`);
    }

    if (input.acao === "confirm") {
      conceito.status = "active";
      conceito.metadados = {
        ...conceito.metadados,
        curadoria: { curador: "HUMAN", confirmado_em: new Date().toISOString() },
      };
    } else if (input.acao === "reject") {
      conceito.status = "rejected";
      conceito.metadados = {
        ...conceito.metadados,
        curadoria: { curador: "HUMAN", rejeitado_em: new Date().toISOString() },
      };
    } else if (input.acao === "deprecate") {
      conceito.status = "deprecated";
    } else if (input.acao === "merge") {
      if (!input.merged_into_id || input.merged_into_id === input.conceito_id) {
        throw new Error("Mesclagem inválida: conceito destino deve ser fornecido e diferente da origem.");
      }
      const destino = MotorTaxonomicoSKOS.conceitosStore.get(input.merged_into_id);
      if (!destino || destino.usuario_id !== input.usuario_id) {
        throw new Error("Integridade violada: conceito destino não pertence ao mesmo tenant.");
      }
      conceito.status = "merged";
      conceito.merged_into_id = input.merged_into_id;
      conceito.metadados = {
        ...conceito.metadados,
        curadoria: { curador: "HUMAN", mesclado_em: new Date().toISOString(), destino: input.merged_into_id },
      };
    } else if (input.acao === "rename") {
      if (!input.novo_label || input.novo_label.trim().length < 2) {
        throw new Error("Novo rótulo deve ter no mínimo 2 caracteres.");
      }
      conceito.pref_label = input.novo_label.trim();
      conceito.pref_label_normalizado = MotorTaxonomicoSKOS.gerarIdentityKey(input.novo_label);
      conceito.search_key = MotorTaxonomicoSKOS.gerarSearchKey(input.novo_label);
    }

    conceito.atualizado_em = new Date().toISOString();
    return conceito;
  }

  /**
   * CURADORIA HUMANA DE VÍNCULO CLAIM-CONCEITO
   */
  public static curarVinculoClaimConceitoHumano(input: CuradoriaVinculoHumanoInput): ClaimConceptLink {
    const vinculo = MotorTaxonomicoSKOS.vinculosStore.get(input.link_id);
    if (!vinculo || vinculo.usuario_id !== input.usuario_id) {
      throw new Error(`Vínculo ${input.link_id} não encontrado para o usuário.`);
    }

    if (input.acao === "confirm") {
      vinculo.status = "confirmed";
      vinculo.origem = "HUMAN_CURATED";
    } else if (input.acao === "reject") {
      vinculo.status = "rejected";
    }

    return vinculo;
  }

  /**
   * Promove ou altera o status de curadoria de um conceito (compatibilidade reversa)
   */
  public static atualizarStatusConceito(
    usuarioId: string,
    conceitoId: string,
    novoStatus: "active" | "rejected" | "deprecated"
  ): SKOSConcept {
    const acaoMap: Record<string, "confirm" | "reject" | "deprecate"> = {
      active: "confirm",
      rejected: "reject",
      deprecated: "deprecate",
    };
    return MotorTaxonomicoSKOS.curarConceitoHumano({
      usuario_id: usuarioId,
      conceito_id: conceitoId,
      acao: acaoMap[novoStatus] || "confirm",
    });
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
   * Sem default arbitrário de 0.85: se confianca for omitida, grava null.
   */
  public static vincularClaimConceito(input: VinculoClaimConceitoInput): ClaimConceptLink {
    const conceito = MotorTaxonomicoSKOS.conceitosStore.get(input.conceito_id);
    if (!conceito || conceito.usuario_id !== input.usuario_id) {
      throw new Error("O conceito especificado não existe ou não pertence ao usuário.");
    }

    const linkId = crypto.randomUUID();
    const isHuman = input.origem === "HUMAN_CURATED";

    const novoVinculo: ClaimConceptLink = {
      id: linkId,
      usuario_id: input.usuario_id,
      claim_id: input.claim_id,
      conceito_id: input.conceito_id,
      tipo_vinculo: input.tipo_vinculo || "DISCUSSES_CONCEPT",
      confianca: input.confianca !== undefined ? input.confianca : null, // Sem default mágico 0.85
      origem: input.origem || "IA_SUGGESTION",
      status: isHuman ? "confirmed" : "proposed",
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
    const identityKey = MotorTaxonomicoSKOS.gerarIdentityKey(termo);
    const searchKey = MotorTaxonomicoSKOS.gerarSearchKey(termo);

    const todosUsuario = Array.from(MotorTaxonomicoSKOS.conceitosStore.values()).filter(
      (c) => c.usuario_id === usuarioId && c.status !== "rejected" && c.status !== "deprecated"
    );

    // 1. Tenta correspondência exata de identidade
    const porIdentidade = todosUsuario.find((c) => c.pref_label_normalizado === identityKey);
    if (porIdentidade) return porIdentidade;

    // 2. Tenta por alias exato
    const porAlias = todosUsuario.find((c) =>
      c.alt_labels.some((a) => MotorTaxonomicoSKOS.gerarIdentityKey(a) === identityKey)
    );
    if (porAlias) return porAlias;

    // 3. Fallback para busca tolerante (searchKey)
    return (
      todosUsuario.find(
        (c) =>
          c.search_key === searchKey ||
          c.alt_labels.some((a) => MotorTaxonomicoSKOS.gerarSearchKey(a) === searchKey)
      ) || null
    );
  }
}
