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
    expect(schema.properties.agent_role.type).toBe("string");
    expect(schema.properties.evidence.minItems).toBe(1);
    expect(schema.properties.evidence.items.$ref).toBe("evidence.schema.json");
    const evidence = json("docs/agent-system/schemas/evidence.schema.json");
    expect(evidence.properties.responsible_role.type).toBe("string");
    const taskPacket = json("docs/agent-system/schemas/task-packet.schema.json");
    expect(taskPacket.properties.owner_role.type).toBe("string");
  });

  it("amplia secret scan para credenciais nativas dos três runtimes", () => {
    const scan = read("scripts/agents/verify-secrets.mjs");
    expect(scan).toContain("sk-ant-");
    expect(scan).toContain("AIza");
    expect(scan).toContain("PRIVATE KEY");
    expect(scan).toContain("walkFiles(dir)");
    expect(scan).not.toContain("walkFiles(dir, extensions)");
  });

  it("mantém observabilidade Vercel ativa e mutação sob gate humano", () => {
    const skill = read(".agents/skills/vercel-preview-observability/SKILL.md");
    expect(skill).toContain("Vercel está ativa");
    expect(skill).toContain("gate humano");
    expect(skill).not.toContain("ETAPA ADIADA");
  });

  it("bloqueia comandos SQL destrutivos no guardrail Antigravity", () => {
    const guard = read(".agents/scripts/pre-tool-guard.js").toLowerCase();
    expect(guard).toContain("\\btruncate\\b");
    expect(guard).toContain("disable\\s+row\\s+level\\s+security");
  });

  it("elimina escape hatch de bootstrap e proíbe qualquer push para main", () => {
    const guard = read(".agents/scripts/pre-tool-guard.js");
    expect(guard).not.toContain("ALLOW_INITIAL_BOOTSTRAP_PUSH");
    expect(guard).toContain("(?:\\bmain\\b|refs\\/heads\\/main)");
  });

  it("fixa todas as GitHub Actions por commit SHA completo de 40 caracteres", () => {
    const ci = read(".github/workflows/ci.yml");
    const handoff = read(".github/workflows/reflex-agent-handoff.yml");
    expect(ci).toMatch(/uses:\s+actions\/checkout@[0-9a-f]{40}/);
    expect(ci).toMatch(/uses:\s+actions\/setup-node@[0-9a-f]{40}/);
    expect(handoff).toMatch(/uses:\s+actions\/checkout@[0-9a-f]{40}/);
    expect(handoff).toMatch(/uses:\s+openai\/codex-action@[0-9a-f]{40}/);
    expect(handoff).toMatch(/uses:\s+actions\/github-script@[0-9a-f]{40}/);
    expect(handoff).not.toMatch(/uses:\s+actions\/github-script@v7\b/);
  });
});
