import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");
const json = (rel: string) => JSON.parse(read(rel));

describe("tri-runtime handoff contract", () => {
  it("mantém hop finito e runtimes explícitos", () => {
    const schema = json("docs/agent-system/schemas/handoff-event.schema.json");
    expect(schema.properties.hop.maximum).toBe(4);
    expect(schema.properties.max_hops.maximum).toBe(4);
    expect(schema.properties.target_runtime.enum).toEqual([
      "openai_cloud",
      "claude_cloud",
      "antigravity_local",
    ]);
  });

  it("não autoriza produção no protocolo de handoff", () => {
    const doc = read("docs/agent-system/AUTONOMOUS_HANDOFF.md");
    expect(doc).toContain("não autoriza merge");
    expect(doc).toContain("human gate");
  });

  it("mantém Claude sob branch ownership e least privilege", () => {
    const prompt = read("docs/agent-system/prompts/CLAUDE_HANDOFF_ROUTINE.md");
    expect(prompt).toContain("claude/*");
    expect(prompt).toContain("Supabase: read-only");
    expect(prompt).toContain("Vercel: read-only");
  });

  it("mantém Antigravity como human gate local", () => {
    const prompt = read("docs/agent-system/prompts/ANTIGRAVITY_WAKE_PROMPT.md");
    expect(prompt).toContain("antigravity/*");
    expect(prompt).toContain("git fetch --all --prune --tags");
  });

  it("workflow usa secrets e não contém credenciais literais", () => {
    const workflow = read(".github/workflows/reflex-agent-handoff.yml");
    expect(workflow).toContain("max_hops");
    expect(workflow).toContain("CLAUDE_ROUTINE_TOKEN");
    expect(workflow).toContain("OPENAI_API_KEY");
    expect(workflow).toContain("TWILIO_API_SECRET");
    expect(workflow).toContain('permission-profile: ":read-only"');
    expect(workflow).toContain("safety-strategy: drop-sudo");
    expect(workflow).toContain("repos.createDispatchEvent");
    expect(workflow).toContain('parsed?.handoff?.needed === true');
    expect(workflow).toContain("hop < maxHops");
    expect(workflow).not.toMatch(/sk-ant-[A-Za-z0-9_-]{20,}/);
  });
});
