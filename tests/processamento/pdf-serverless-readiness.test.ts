import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("PDF serverless readiness", () => {
  it("mantém pdf-parse fora do bundle interno do Next.js", () => {
    const config = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");
    expect(config).toContain('serverExternalPackages: ["pdf-parse"]');
  });

  it("usa o parser 1.x sem worker/structuredClone", () => {
    const source = readFileSync(
      join(process.cwd(), "src/dominios/processamento/extrator-texto.ts"),
      "utf8"
    );

    expect(source).toContain('import { createRequire } from "node:module"');
    expect(source).toContain('requireNode("pdf-parse")');
    expect(source).toContain("await pdfParse(buffer)");
    expect(source).not.toContain("PDFParse.setWorker");
    expect(source).not.toContain('import("pdf-parse/worker")');
  });

  it("mantém a dependência fixada na versão sem worker", () => {
    const pkg = JSON.parse(
      readFileSync(join(process.cwd(), "package.json"), "utf8")
    );

    expect(pkg.dependencies["pdf-parse"]).toBe("1.1.1");
  });
});
