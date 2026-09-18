import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const RAIZ = process.cwd();

describe("Qualificação e Fronteiras do Agente 09 (rflex-continuity-evidence)", () => {
  const agentPath = path.join(RAIZ, ".agents", "agents", "rflex-continuity-evidence", "agent.md");
  const content = fs.existsSync(agentPath) ? fs.readFileSync(agentPath, "utf-8") : "";

  it("o arquivo de especificação do A9 existe no caminho canônico", () => {
    expect(fs.existsSync(agentPath)).toBe(true);
    expect(content.length).toBeGreaterThan(100);
  });

  it("está configurado estritamente como subagente consultivo, sem substituir o coordenador", () => {
    expect(content).toMatch(/subagent:\s*true/i);
    expect(content).toMatch(/mainAgent:\s*false/i);
    expect(content).not.toMatch(/mainAgent:\s*true/i);
  });

  it("define a taxonomia canônica inegociável de evidências", () => {
    expect(content).toContain("[CONFIRMADO-CODIGO]");
    expect(content).toContain("[CONFIRMADO-TESTE]");
    expect(content).toContain("[CONFIRMADO-CI]");
    expect(content).toContain("[CONFIRMADO-RUNTIME]");
    expect(content).toContain("[CONFIRMADO-EXTERNO]");
    expect(content).toContain("[RELATADO]");
    expect(content).toContain("[INFERIDO]");
    expect(content).toContain("[PENDENTE]");
    expect(content).toContain("[BLOQUEADO]");
  });

  it("bloqueia expressamente mutações de produção, segredos e Vercel", () => {
    expect(content).toMatch(/NUNCA.*altere código funcional de produção/i);
    expect(content).toMatch(/NUNCA.*segredos reais/i);
    expect(content).toMatch(/NUNCA.*Vercel/i);
  });

  it("as skills modulares do A9 estão presentes e consistentes", () => {
    const skillState = path.join(RAIZ, ".agents", "skills", "project-state-reconciliation", "SKILL.md");
    const skillLedger = path.join(RAIZ, ".agents", "skills", "evidence-ledger", "SKILL.md");
    const skillBridge = path.join(RAIZ, ".agents", "skills", "external-review-bridge", "SKILL.md");

    expect(fs.existsSync(skillState)).toBe(true);
    expect(fs.existsSync(skillLedger)).toBe(true);
    expect(fs.existsSync(skillBridge)).toBe(true);
  });

  it("a estrutura do protocolo de coordenação documental em docs/coordenacao está íntegra", () => {
    const readmeCoord = path.join(RAIZ, "docs", "coordenacao", "README.md");
    const estado = path.join(RAIZ, "docs", "coordenacao", "ESTADO_COMPARTILHADO.md");
    const missoes = path.join(RAIZ, "docs", "coordenacao", "INDICE_MISSOES.md");
    const auditoria = path.join(RAIZ, "docs", "coordenacao", "AUDITORIA_DOCUMENTAL_APP01_APP02.md");
    const ag0001 = path.join(RAIZ, "docs", "coordenacao", "antigravity-para-chatgpt", "AG-0001.md");

    expect(fs.existsSync(readmeCoord)).toBe(true);
    expect(fs.existsSync(estado)).toBe(true);
    expect(fs.existsSync(missoes)).toBe(true);
    expect(fs.existsSync(auditoria)).toBe(true);
    expect(fs.existsSync(ag0001)).toBe(true);
  });
});
