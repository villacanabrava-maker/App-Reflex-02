import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const RAIZ = process.cwd();

describe("Qualificação e Fronteiras do Agente 08 (rflex-research-evolution)", () => {
  const agentPath = path.join(RAIZ, ".agents", "agents", "rflex-research-evolution", "agent.md");
  const content = fs.existsSync(agentPath) ? fs.readFileSync(agentPath, "utf-8") : "";

  it("o arquivo de especificação do A8 existe no caminho canônico", () => {
    expect(fs.existsSync(agentPath)).toBe(true);
    expect(content.length).toBeGreaterThan(100);
  });

  it("está configurado estritamente como subagente consultivo, sem substituir o coordenador principal", () => {
    expect(content).toMatch(/subagent:\s*true/i);
    expect(content).toMatch(/mainAgent:\s*false/i);
    expect(content).not.toMatch(/mainAgent:\s*true/i);
  });

  it("possui todos os 5 modos de operação definidos", () => {
    expect(content).toContain("Modo Correção");
    expect(content).toContain("Modo Prevenção");
    expect(content).toContain("Modo Potencialização");
    expect(content).toContain("Modo Exploração");
    expect(content).toContain("Modo Aprendizado");
  });

  it("bloqueia expressamente execução de mutações, segredos e Vercel", () => {
    expect(content).toMatch(/NUNCA.*alterações diretas no código de produção ou no banco/i);
    expect(content).toMatch(/NUNCA.*credenciais privadas/i);
    expect(content).toMatch(/NUNCA.*Vercel/i);
  });

  it("as skills modulares do A8 estão presentes e consistentes", () => {
    const skillEvidence = path.join(RAIZ, ".agents", "skills", "evidence-based-research", "SKILL.md");
    const skillState = path.join(RAIZ, ".agents", "skills", "project-state-research", "SKILL.md");
    const skillIdea = path.join(RAIZ, ".agents", "skills", "idea-generator", "SKILL.md");

    expect(fs.existsSync(skillEvidence)).toBe(true);
    expect(fs.existsSync(skillState)).toBe(true);
    expect(fs.existsSync(skillIdea)).toBe(true);
  });

  it("o diretório sanitizado docs/pesquisa-evolucao está configurado com README", () => {
    const docsReadme = path.join(RAIZ, "docs", "pesquisa-evolucao", "README.md");
    expect(fs.existsSync(docsReadme)).toBe(true);
  });
});