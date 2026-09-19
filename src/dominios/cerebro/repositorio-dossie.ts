/**
 * Repositório Canônico de Snapshots de Dossiê Contextual V3.1
 * Missão: MIS-0011 (Wave 5)
 * Padrão: Least Privilege, Imutabilidade Append-Only e Isolamento Multi-Tenant.
 */

import { criarClienteAdmin } from "@/infraestrutura/supabase/cliente-admin";
import { DossierV31, DossierV31Schema } from "@/tipos/cognitivo-v3";

export class RepositorioDossieContextual {
  /**
   * Persiste um Dossiê Contextual imutável no banco via RPC segura
   */
  public static async persistirSnapshot(
    dossie: DossierV31,
    usuarioId: string,
    entradaId?: string | null
  ): Promise<string> {
    // 1. Validação estrita do schema antes do envio
    DossierV31Schema.parse(dossie);

    const admin = criarClienteAdmin();

    // 2. Chamar RPC com SECURITY DEFINER
    const { data: snapshotId, error } = await admin
      .schema("reflexoes")
      .rpc(
      "persistir_dossie_snapshot",
      {
        p_id: dossie.id,
        p_usuario_id: usuarioId,
        p_entrada_id: entradaId || null,
        p_query: dossie.query,
        p_intent: dossie.intent,
        p_target_token_budget: dossie.target_token_budget,
        p_actual_tokens_total: dossie.actual_tokens_total,
        p_snapshot_hash: dossie.snapshot_hash,
        p_dossie_json: dossie,
        p_abstained: dossie.abstained,
      }
    );

    if (error) {
      throw new Error(`Falha ao persistir snapshot de dossiê: ${error.message}`);
    }

    return (snapshotId as string) || dossie.id;
  }

  /**
   * Recupera um snapshot imutável a partir do seu ID e valida a integridade multi-tenant
   */
  public static async obterSnapshotPorId(
    snapshotId: string,
    usuarioId: string
  ): Promise<DossierV31> {
    const admin = criarClienteAdmin();

    const { data, error } = await admin
      .schema("reflexoes")
      .from("dossies_snapshots")
      .select("id, usuario_id, snapshot_hash, dossie_json, criado_em")
      .eq("id", snapshotId)
      .eq("usuario_id", usuarioId)
      .single();

    if (error || !data) {
      throw new Error(
        `Snapshot de dossiê não encontrado ou acesso não autorizado (ID: ${snapshotId}).`
      );
    }

    const parsed = DossierV31Schema.parse(data.dossie_json);

    // Validação defensiva de integridade de hash
    if (parsed.snapshot_hash !== data.snapshot_hash) {
      throw new Error(
        `Alerta de integridade: divergência de hash detectada no snapshot ${snapshotId}.`
      );
    }

    return parsed;
  }
}
