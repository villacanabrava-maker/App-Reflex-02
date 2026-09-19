import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Integração do corpus autoral com o Cérebro", () => {
  it("registra fonte autoral processada no ledger episódico", () => {
    const source = readFileSync(
      join(process.cwd(), "src/dominios/cerebro/registrar-fonte-autoral.ts"),
      "utf8"
    );

    expect(source).toContain('event_type: "SOURCE_INGESTED"');
    expect(source).toContain('actor_type: "EXTRACTOR_PIPELINE"');
    expect(source).toContain('aggregate_type: "source"');
    expect(source).toContain('if (natureza !== "autoral")');
    expect(source).toContain("idempotencyKey");
  });

  it("aciona a ingestão cognitiva após o pipeline documental", () => {
    const pipeline = readFileSync(
      join(process.cwd(), "src/dominios/processamento/pipeline.ts"),
      "utf8"
    );

    expect(pipeline).toContain("registrarFonteProcessadaNoCerebro");
    expect(pipeline).toContain("ETAPA 8: INGESTÃO DA FONTE AUTORAL NO CÉREBRO");
  });

  it("separa corpus disponível de características derivadas na interface", () => {
    const painel = readFileSync(
      join(process.cwd(), "src/componentes/cerebro/painel-cerebro-moderno.tsx"),
      "utf8"
    );

    expect(painel).toContain("Corpus autoral");
    expect(painel).toContain("Corpus autoral sincronizado com o Cérebro");
    expect(painel).toContain("não promove");
  });
});
