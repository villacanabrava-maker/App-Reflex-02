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

  it("registra as oito Skills OpenAI do projeto", () => {
    const skills = [
      "openai-reflex-bootstrap",
      "openai-reflex-runtime-debug",
      "openai-reflex-supabase-safe",
      "openai-reflex-cognitive-integrity",
      "openai-reflex-continuity",
      "openai-reflex-feature-delivery",
      "openai-reflex-research-evidence",
      "openai-reflex-release-verify",
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

  it("registra configuração e nove subagentes Codex nativos", () => {
    expect(existsSync(join(root, ".codex", "config.toml"))).toBe(true);

    const agents = [
      "reflex-orchestrator",
      "reflex-architecture",
      "reflex-supabase",
      "reflex-frontend",
      "reflex-cognitive",
      "reflex-qa",
      "reflex-platform",
      "reflex-research",
      "reflex-continuity",
    ];

    for (const agent of agents) {
      const rel = join(root, ".codex", "agents", `${agent}.toml`);
      expect(existsSync(rel), agent).toBe(true);
      const text = readFileSync(rel, "utf8");
      expect(text).toContain("name =");
      expect(text).toContain("description =");
      expect(text).toContain("developer_instructions");
    }
  });

  it("liga AGENTS.md à constituição canônica e ao adapter OpenAI", () => {
    const agents = readFileSync(join(root, "AGENTS.md"), "utf8");
    expect(agents).toContain("docs/agent-system/CONSTITUTION.md");
    expect(agents).toContain("docs/agent-system/agent-registry.yaml");
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
