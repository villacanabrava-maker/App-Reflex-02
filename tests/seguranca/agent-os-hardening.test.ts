import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");
const json = (rel: string) => JSON.parse(read(rel));

describe("Agent OS V3 hardening", () => {
  it("protege ownership de branch nos três runtimes sem fixar contagem física Antigravity", () => {
    const registry = json("docs/agent-system/runtime-registry.yaml");
    const byId = Object.fromEntries(registry.runtimes.map((r: { id: string }) => [r.id, r]));
    expect(byId.openai_cloud.branch_policy).toContain("chatgpt/*");
    expect(byId.claude_cloud.branch_policy).toContain("claude/*");
    expect(byId.antigravity_local.branch_policy).toContain("antigravity/*");
    expect(byId.antigravity_local.physical_agents_current_strategy).toBeUndefined();
  });

  it("exige Evidence formal dentro de Agent Output", () => {
    const schema = json("docs/agent-system/schemas/agent-output.schema.json");
    expect(schema.properties.evidence.items.$ref).toBe("evidence.schema.json");
  });

  it("bloqueia comandos SQL destrutivos no guardrail Antigravity", () => {
    const guard = read(".agents/scripts/pre-tool-guard.js").toLowerCase();
    expect(guard).toContain("truncate\\s+table");
    expect(guard).toContain("disable\\s+row\\s+level\\s+security");
  });
});
