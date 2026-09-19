import crypto from "node:crypto";
import { criarClienteAdmin } from "@/infraestrutura/supabase/cliente-admin";

export interface RegistrarFonteAutoralInput {
  usuarioId: string;
  obraId: string;
  versaoObraId: string;
  documentoProcessadoId: string;
  titulo: string;
  natureza: string;
  hashSha256: string;
  totalFragmentos: number;
  totalSecoes: number;
}

export async function registrarFonteProcessadaNoCerebro({
  usuarioId,
  obraId,
  versaoObraId,
  documentoProcessadoId,
  titulo,
  natureza,
  hashSha256,
  totalFragmentos,
  totalSecoes,
}: RegistrarFonteAutoralInput): Promise<{ registrada: boolean; eventoId?: string }> {
  if (natureza !== "autoral") {
    return { registrada: false };
  }

  const admin = criarClienteAdmin();
  const idempotencyKey = `source_ingested:${versaoObraId}:${hashSha256}`;

  const { data: existente, error: erroBusca } = await admin
    .schema("cerebro_autoral")
    .from("memory_events")
    .select("id")
    .eq("usuario_id", usuarioId)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (erroBusca) {
    throw new Error(`Falha ao verificar ingestão cognitiva da fonte: ${erroBusca.message}`);
  }

  if (existente?.id) {
    return { registrada: false, eventoId: existente.id };
  }

  const correlationId = crypto.randomUUID();

  const { data: evento, error: erroEvento } = await admin
    .schema("cerebro_autoral")
    .from("memory_events")
    .insert({
      usuario_id: usuarioId,
      event_type: "SOURCE_INGESTED",
      actor_type: "EXTRACTOR_PIPELINE",
      actor_id: "pipeline_documental_v1_2",
      aggregate_type: "source",
      aggregate_id: versaoObraId,
      correlation_id: correlationId,
      idempotency_key: idempotencyKey,
      payload: {
        source_type: "versao_obra",
        source_id: versaoObraId,
        source_version: 1,
        content_hash: hashSha256,
        total_spans: totalFragmentos,
        extra: {
          obra_id: obraId,
          documento_processado_id: documentoProcessadoId,
          titulo,
          natureza,
          total_fragmentos: totalFragmentos,
          total_secoes: totalSecoes,
          papel_no_cerebro: "corpus_autoral_processado",
        },
      },
      payload_schema_version: 1,
    })
    .select("id")
    .single();

  if (erroEvento || !evento) {
    throw new Error(
      `Falha ao registrar a fonte autoral no Cérebro: ${erroEvento?.message || "evento ausente"}`
    );
  }

  return { registrada: true, eventoId: evento.id };
}
