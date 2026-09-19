import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function ler(caminho: string): string {
  return readFileSync(join(process.cwd(), caminho), "utf8");
}

describe("Deploy readiness — trust boundaries e fail-safe", () => {
  it("restringe snapshots e laudos cognitivos ao backend service_role", () => {
    const sql = ler("supabase/migrations/0038_production_readiness_hardening.sql");

    expect(sql).toContain("FROM PUBLIC, anon, authenticated");
    expect(sql).toContain("TO service_role");
    expect(sql).toContain("ALTER FUNCTION public.buscar_multi_sinal_v3_1");
    expect(sql).toContain("SET search_path");
  });

  it("usa RPCs dos schemas canônicos e falha fechado no runtime do auditor", () => {
    const repositorio = ler("src/dominios/cerebro/repositorio-dossie.ts");
    const auditor = ler("src/dominios/cerebro/auditor-cognitivo-v3.ts");

    expect(repositorio).toContain('.schema("reflexoes")');
    expect(repositorio).toContain('"persistir_dossie_snapshot"');

    expect(auditor).toContain('.schema("auditoria")');
    expect(auditor).toContain('"registrar_relatorio_auditoria_v3_1"');
    expect(auditor).toContain("if (!input.dossieObjeto)");
    expect(auditor).toContain("throw err");
  });

  it("mantém o analisador legado desligado por padrão", () => {
    const flags = ler("src/config/feature-flags.ts");
    const acoes = ler("src/acoes/cerebro.ts");

    expect(flags).toContain("FEATURE_LEGACY_BRAIN_ANALYZER");
    expect(flags).toContain('(process.env.FEATURE_LEGACY_BRAIN_ANALYZER as FeatureFlagState) || "off"');
    expect(acoes).toContain("proporAnaliseDimensaoComIA");
    expect(acoes).not.toContain("analisarDimensaoComIA");
    expect(acoes).not.toContain('isFlagAtiva("FEATURE_LEGACY_BRAIN_ANALYZER")');
  });

  it("usa o valor de citação externa aceito pelo contrato live do banco", () => {
    const redator = ler("src/dominios/reflexoes/redator-reflexao.ts");

    expect(redator).toContain('"influencia_externa"');
    expect(redator).not.toContain('"fonte_externa"');
  });
});
