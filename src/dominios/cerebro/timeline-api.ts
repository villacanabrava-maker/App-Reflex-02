/**
 * Timeline Epistêmica & Auditoria da Memória Episódica — Cérebro Reflex V3.1 (Wave 2)
 * Padrão: Cursor-based Pagination, Reconstrução Histórica e Imutabilidade
 */

import {
  EventType,
  ActorType,
  EpistemicStatus,
  MemoryEvent,
} from "../../tipos/cognitivo-v3";

export interface TimelineQueryFiltros {
  usuario_id: string;
  aggregate_id?: string;
  aggregate_type?: "claim" | "source" | "reflection";
  event_type?: EventType;
  actor_type?: ActorType;
  from_timestamp?: string;
  to_timestamp?: string;
  cursor?: string; // Formato: base64(recorded_at:id) ou recorded_at:id
  limit?: number; // Padrão 50, Máximo 100
}

export interface TimelinePagina<T = MemoryEvent> {
  itens: T[];
  proximo_cursor: string | null;
  tem_mais: boolean;
  total_retornado: number;
}

export interface HistoricoClaimAuditado {
  claim_id: string;
  usuario_id: string;
  estado_atual: EpistemicStatus;
  total_eventos: number;
  criado_em: string;
  ultima_atualizacao: string;
  trilha_eventos: Array<{
    event_id: string;
    event_type: EventType;
    actor_type: ActorType;
    actor_id: string | null;
    recorded_at: string;
    from_status: EpistemicStatus | null;
    to_status: EpistemicStatus;
    justificativa?: string;
  }>;
}

export class TimelineEpistemicaAPI {
  /**
   * Codifica cursor a partir de data e ID
   */
  public static codificarCursor(recordedAt: string, id: string): string {
    return Buffer.from(`${recordedAt}#${id}`).toString("base64");
  }

  /**
   * Decodifica cursor
   */
  public static decodificarCursor(cursor: string): { recordedAt: string; id: string } | null {
    try {
      const decoded = Buffer.from(cursor, "base64").toString("utf8");
      const [recordedAt, id] = decoded.split("#");
      if (!recordedAt || !id) return null;
      return { recordedAt, id };
    } catch {
      return null;
    }
  }

  /**
   * Consulta paginada por cursor na timeline de eventos
   */
  public static consultarTimeline(
    eventos: MemoryEvent[],
    filtros: TimelineQueryFiltros
  ): TimelinePagina<MemoryEvent> {
    const limit = Math.min(Math.max(filtros.limit || 50, 1), 100);

    // 1. Filtragem por multi-tenant (usuario_id obrigatório)
    let filtrados = eventos.filter((e) => e.usuario_id === filtros.usuario_id);

    // 2. Filtros específicos
    if (filtros.aggregate_id) {
      filtrados = filtrados.filter((e) => e.aggregate_id === filtros.aggregate_id);
    }
    if (filtros.aggregate_type) {
      filtrados = filtrados.filter((e) => e.aggregate_type === filtros.aggregate_type);
    }
    if (filtros.event_type) {
      filtrados = filtrados.filter((e) => e.event_type === filtros.event_type);
    }
    if (filtros.actor_type) {
      filtrados = filtrados.filter((e) => e.actor_type === filtros.actor_type);
    }
    if (filtros.from_timestamp) {
      filtrados = filtrados.filter((e) => e.recorded_at >= filtros.from_timestamp!);
    }
    if (filtros.to_timestamp) {
      filtrados = filtrados.filter((e) => e.recorded_at <= filtros.to_timestamp!);
    }

    // 3. Ordenação determinística decrescente: recorded_at DESC, id DESC
    filtrados.sort((a, b) => {
      const cmpDate = b.recorded_at.localeCompare(a.recorded_at);
      if (cmpDate !== 0) return cmpDate;
      return b.id.localeCompare(a.id);
    });

    // 4. Aplicação do Cursor
    if (filtros.cursor) {
      const cursorInfo = this.decodificarCursor(filtros.cursor);
      if (cursorInfo) {
        const index = filtrados.findIndex(
          (e) => e.recorded_at < cursorInfo.recordedAt || (e.recorded_at === cursorInfo.recordedAt && e.id < cursorInfo.id)
        );
        if (index !== -1) {
          filtrados = filtrados.slice(index);
        } else {
          filtrados = [];
        }
      }
    }

    // 5. Paginação
    const itens = filtrados.slice(0, limit);
    const temMais = filtrados.length > limit;
    let proximoCursor: string | null = null;

    if (temMais && itens.length > 0) {
      const ultimoItem = itens[itens.length - 1];
      proximoCursor = this.codificarCursor(ultimoItem.recorded_at, ultimoItem.id);
    }

    return {
      itens,
      proximo_cursor: proximoCursor,
      tem_mais: temMais,
      total_retornado: itens.length,
    };
  }

  /**
   * Reconstrói a história evolutiva de um claim a partir do replay de eventos da timeline
   */
  public static reconstruirHistoricoClaim(
    claimId: string,
    eventos: MemoryEvent[]
  ): HistoricoClaimAuditado | null {
    // Filtra eventos do claim e ordena cronologicamente (ASC)
    const eventosClaim = eventos
      .filter((e) => e.aggregate_id === claimId && e.aggregate_type === "claim")
      .sort((a, b) => {
        const cmpDate = a.recorded_at.localeCompare(b.recorded_at);
        if (cmpDate !== 0) return cmpDate;
        return a.id.localeCompare(b.id);
      });

    if (eventosClaim.length === 0) {
      return null;
    }

    const primeiroEvento = eventosClaim[0];
    const ultimoEvento = eventosClaim[eventosClaim.length - 1];

    const trilha = eventosClaim.map((e) => {
      const justificativa =
        typeof e.payload === "object" && e.payload !== null && "justificativa" in e.payload
          ? String((e.payload as Record<string, unknown>).justificativa)
          : undefined;

      return {
        event_id: e.id,
        event_type: e.event_type,
        actor_type: e.actor_type,
        actor_id: e.actor_id,
        recorded_at: e.recorded_at,
        from_status: e.from_epistemic_status,
        to_status: e.to_epistemic_status,
        justificativa,
      };
    });

    return {
      claim_id: claimId,
      usuario_id: primeiroEvento.usuario_id,
      estado_atual: ultimoEvento.to_epistemic_status,
      total_eventos: eventosClaim.length,
      criado_em: primeiroEvento.recorded_at,
      ultima_atualizacao: ultimoEvento.recorded_at,
      trilha_eventos: trilha,
    };
  }
}
