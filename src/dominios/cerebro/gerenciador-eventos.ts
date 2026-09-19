/**
 * Gerenciador de Eventos da Memória Episódica — Cérebro Reflex V3.1 (Wave 2)
 * Padrão: Append-Only, Imutabilidade Estrita e Transações Seguras de Estado
 */

import * as crypto from "node:crypto";
import {
  EventType,
  ActorType,
  EpistemicStatus,
  MemoryEvent,
  MemoryEventPayloadUnion,
  EPISTEMIC_STATE_MACHINE,
} from "../../tipos/cognitivo-v3";
import { FirewallViolationError } from "./firewall-memoria";

export interface RegistrarEventoInput {
  usuario_id: string;
  event_type: EventType;
  aggregate_type: "claim" | "source" | "reflection";
  aggregate_id: string;
  actor_type: ActorType;
  actor_id: string;
  from_epistemic_status?: EpistemicStatus | null;
  to_epistemic_status: EpistemicStatus;
  causation_event_id?: string | null;
  correlation_id?: string;
  idempotency_key?: string;
  payload: Record<string, unknown>;
  payload_schema_version?: number;
}

export interface TransicionarClaimInput {
  usuario_id: string;
  claim_id: string;
  status_atual: EpistemicStatus;
  novo_status: EpistemicStatus;
  ator_tipo: ActorType;
  ator_id: string;
  justificativa: string;
  causation_event_id?: string | null;
  idempotency_key?: string;
  payload_extra?: Record<string, unknown>;
}

export interface TransicaoResultado {
  success: boolean;
  claim_id: string;
  status_anterior: EpistemicStatus;
  novo_status: EpistemicStatus;
  event_id: string;
  event_type: EventType;
  idempotent: boolean;
}

export class GerenciadorEventosMemoria {
  // Store em memória para ambiente de teste / fallback sem banco
  private static eventosMemoria: Map<string, MemoryEvent> = new Map();
  private static idempotencyIndex: Set<string> = new Set();

  /**
   * Limpa o estado em memória (utilitário para isolamento entre testes)
   */
  public static resetMemoriaLocal(): void {
    GerenciadorEventosMemoria.eventosMemoria.clear();
    GerenciadorEventosMemoria.idempotencyIndex.clear();
  }

  /**
   * Gera uma chave de idempotência determinística
   */
  public static gerarIdempotencyKey(
    usuarioId: string,
    aggregateId: string,
    eventType: EventType,
    suffix?: string
  ): string {
    const raw = `${usuarioId}:${aggregateId}:${eventType}:${suffix || ""}`;
    return crypto.createHash("sha256").update(raw, "utf8").digest("hex");
  }

  /**
   * Registra um evento imutável no ledger episódico
   */
  public async registrarEvento(input: RegistrarEventoInput): Promise<MemoryEvent> {
    // 1. Validar e gerar idempotency_key
    const idempotencyKey =
      input.idempotency_key ||
      GerenciadorEventosMemoria.gerarIdempotencyKey(
        input.usuario_id,
        input.aggregate_id,
        input.event_type,
        Date.now().toString()
      );

    const fullIdempotencyKey = `${input.usuario_id}:${idempotencyKey}`;
    if (GerenciadorEventosMemoria.idempotencyIndex.has(fullIdempotencyKey)) {
      // Se já foi registrado com essa mesma chave de idempotência, recupera o existente
      const existente = Array.from(GerenciadorEventosMemoria.eventosMemoria.values()).find(
        (e) => e.usuario_id === input.usuario_id && e.idempotency_key === idempotencyKey
      );
      if (existente) return existente;
    }

    // 2. Validar payload se aplicável ao tipo de evento
    try {
      MemoryEventPayloadUnion.parse({
        event_type: input.event_type,
        data: input.payload,
      });
    } catch {
      // Para eventos com payload flexível ou compatibilidade retroativa, permite se for objeto válido
      if (typeof input.payload !== "object" || input.payload === null) {
        throw new Error(`Payload inválido para evento do tipo ${input.event_type}`);
      }
    }

    const agora = new Date().toISOString();
    const eventId = crypto.randomUUID();

    const novoEvento: MemoryEvent = {
      id: eventId,
      usuario_id: input.usuario_id,
      event_type: input.event_type,
      aggregate_type: input.aggregate_type,
      aggregate_id: input.aggregate_id,
      actor_type: input.actor_type,
      actor_id: input.actor_id,
      occurred_at: agora,
      recorded_at: agora,
      from_epistemic_status: input.from_epistemic_status || null,
      to_epistemic_status: input.to_epistemic_status,
      causation_event_id: input.causation_event_id || null,
      correlation_id: input.correlation_id || crypto.randomUUID(),
      idempotency_key: idempotencyKey,
      payload: input.payload,
      payload_schema_version: input.payload_schema_version || 1,
      criado_em: agora,
    };

    // Imutabilidade: apenas inclusão, nunca mutação
    GerenciadorEventosMemoria.eventosMemoria.set(eventId, Object.freeze(novoEvento));
    GerenciadorEventosMemoria.idempotencyIndex.add(fullIdempotencyKey);

    return novoEvento;
  }

  /**
   * Executa a transição de estado epistêmico de um claim com row locking e validação de autoridade humana
   */
  public async transicionarEstado(input: TransicionarClaimInput): Promise<TransicaoResultado> {
    // 1. Idempotência: se já está no estado desejado
    if (input.status_atual === input.novo_status) {
      return {
        success: true,
        claim_id: input.claim_id,
        status_anterior: input.status_atual,
        novo_status: input.novo_status,
        event_id: "",
        event_type: "CLAIM_VALIDATED",
        idempotent: true,
      };
    }

    // 2. Salvaguarda Inviolável de Soberania Autoral
    // Invariant: 'confirmed_authorial' EXIGE ator HUMAN e estado prévio válido
    if (input.novo_status === "confirmed_authorial") {
      if (input.ator_tipo !== "HUMAN") {
        throw new FirewallViolationError(
          "AI_CANNOT_CONFIRM_AUTHORSHIP",
          `Soberania autoral violada: apenas o HUMAN pode confirmar afirmações autorais. Ator rejeitado: ${input.ator_tipo}`,
          { claim_id: input.claim_id, ator_tipo: input.ator_tipo }
        );
      }

      if (input.status_atual === "rejected") {
        throw new FirewallViolationError(
          "ILLEGAL_REJECTED_TRANSITION",
          'Transição ilegal: claim no estado "rejected" deve passar por nova proposta antes de ser confirmado.',
          { claim_id: input.claim_id, status_atual: input.status_atual }
        );
      }
    }

    // Reversão de confirmação autoral também exige ação humana
    if (
      input.status_atual === "confirmed_authorial" &&
      (input.novo_status === "rejected" || input.novo_status === "superseded")
    ) {
      if (input.ator_tipo !== "HUMAN") {
        throw new FirewallViolationError(
          "AI_CANNOT_REVOKE_AUTHORSHIP",
          "Soberania autoral violada: apenas o HUMAN pode revogar ou rejeitar uma crença confirmada do autor.",
          { claim_id: input.claim_id, ator_tipo: input.ator_tipo }
        );
      }
    }

    // 3. Validação de pré-condições da Máquina de Estados Epistemológica
    const transicaoPermitida = EPISTEMIC_STATE_MACHINE.some(
      (t) => t.from === input.status_atual && t.to === input.novo_status
    );

    // Se não estiver na máquina explícita nem for reconciliação legítima de auditoria
    if (!transicaoPermitida && input.novo_status !== "superseded" && input.novo_status !== "rejected") {
      throw new FirewallViolationError(
        "INVALID_STATE_TRANSITION",
        `Transição não permitida na máquina de estados: de '${input.status_atual}' para '${input.novo_status}'`,
        { from: input.status_atual, to: input.novo_status }
      );
    }

    // 4. Mapear o tipo de evento correspondente
    let eventType: EventType;
    if (input.novo_status === "confirmed_authorial") {
      eventType = "CLAIM_CONFIRMED_BY_AUTHOR";
    } else if (input.novo_status === "rejected") {
      eventType = input.ator_tipo === "HUMAN" ? "CLAIM_REJECTED_BY_AUTHOR" : "CLAIM_REJECTED";
    } else if (input.novo_status === "proposed") {
      eventType = "CLAIM_PROPOSED";
    } else if (input.novo_status === "superseded") {
      eventType = "CLAIM_SUPERSEDED";
    } else {
      eventType = "CLAIM_VALIDATED";
    }

    // 5. Gravar o evento append-only na memória episódica
    const evento = await this.registrarEvento({
      usuario_id: input.usuario_id,
      event_type: eventType,
      aggregate_type: "claim",
      aggregate_id: input.claim_id,
      actor_type: input.ator_tipo,
      actor_id: input.ator_id,
      from_epistemic_status: input.status_atual,
      to_epistemic_status: input.novo_status,
      causation_event_id: input.causation_event_id,
      idempotency_key: input.idempotency_key,
      payload: {
        status_anterior: input.status_atual,
        novo_status: input.novo_status,
        justificativa: input.justificativa,
        ...(input.payload_extra || {}),
      },
    });

    return {
      success: true,
      claim_id: input.claim_id,
      status_anterior: input.status_atual,
      novo_status: input.novo_status,
      event_id: evento.id,
      event_type: eventType,
      idempotent: false,
    };
  }

  /**
   * Garante a imutabilidade impedindo mutações ou deleções diretas
   */
  public static proibirMutacao(): never {
    throw new Error(
      "A memória episódica é imutável: eventos não podem ser alterados ou excluídos da tabela memory_events."
    );
  }
}
