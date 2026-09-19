import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("PDF serverless readiness", () => {
  it("configura pdf-parse para execução server-side na Vercel", () => {
    const config = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");
    expect(config).toContain('serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"]');
  });

  it("não entrega Buffer diretamente ao worker do PDF", () => {
    const source = readFileSync(
      join(process.cwd(), "src/dominios/processamento/extrator-texto.ts"),
      "utf8"
    );

    expect(source).toContain("PDFParse.setWorker(workerModule.getData())");
    expect(source).toContain("const dadosPdf = new Uint8Array");
    expect(source).toContain("data: dadosPdf");
    expect(source).not.toContain("new PDFParse({ data: buffer");
  });
});
