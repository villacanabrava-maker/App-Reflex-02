import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

describe("OpenAI ChatGPT continuity layer", () => {
  const required = [
    "OpenAI ChatGPT/README.md",
    "OpenAI ChatGPT/BOOTSTRAP.md",
    "OpenAI ChatGPT/CURRENT_STATE.md",
    "OpenAI ChatGPT/METHODOLOGY.md",
    "OpenAI ChatGPT/PROJECT_MAP.md",
    "OpenAI ChatGPT/CONTINUITY_LEDGER.md",
    "OpenAI ChatGPT/DECISIONS.md",
    "OpenAI ChatGPT/ORCHESTRATION.md",
    "OpenAI ChatGPT/DATABASE_MAP.md",
    "OpenAI ChatGPT/DEPLOYMENT_MAP.md",
  ];

  it("mantém os arquivos essenciais de continuidade", () => {
    for (const rel of required) {
      expect(existsSync(join(root, rel)), rel).toBe(true);
    }
  });

  it("registra as cinco Skills OpenAI do projeto", () => {
    const skills = [
      "openai-reflex-bootstrap",
      "openai-reflex-runtime-debug",
      "openai-reflex-supabase-safe",
      "openai-reflex-cognitive-integrity",
      "openai-reflex-continuity",
    ];

    for (const skill of skills) {
      const entry = join(root, ".agents", "skills", skill, "SKILL.md");
      expect(existsSync(entry), skill).toBe(true);

      const text = readFileSync(entry, "utf8");
      expect(text).toContain(`name: ${skill}`);
      expect(text).toContain("description:");
      expect(text).toContain(`OpenAI ChatGPT/skills/${skill}/SKILL.md`);
    }
  });

  it("liga AGENTS.md à camada OpenAI", () => {
    const agents = readFileSync(join(root, "AGENTS.md"), "utf8");
    expect(agents).toContain("Camada de Continuidade OpenAI / Codex");
    expect(agents).toContain("OpenAI ChatGPT/BOOTSTRAP.md");
  });

  it("não contém segredos conhecidos na documentação OpenAI criada", () => {
    const files = [
      "OpenAI ChatGPT/README.md",
      "OpenAI ChatGPT/BOOTSTRAP.md",
      "OpenAI ChatGPT/CURRENT_STATE.md",
      "OpenAI ChatGPT/SECURITY_AND_SECRETS.md",
      "OpenAI ChatGPT/CONTINUITY_LEDGER.md",
    ];

    const patterns = [
      /sk-proj-[A-Za-z0-9_-]{20,}/,
      /vcp_[A-Za-z0-9_-]{20,}/,
      /sb_secret_[A-Za-z0-9_-]{12,}/,
    ];

    for (const rel of files) {
      const text = readFileSync(join(root, rel), "utf8");
      for (const pattern of patterns) {
        expect(text, `${rel} must not contain ${pattern}`).not.toMatch(pattern);
      }
    }
  });
});
