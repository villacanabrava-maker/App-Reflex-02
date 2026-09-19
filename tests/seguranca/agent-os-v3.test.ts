import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const readJson = (rel: string) => JSON.parse(readFileSync(join(root, rel), "utf8"));

describe("Reflex Agent Operating System V3", () => {
  it("mantém a constituição e contratos canônicos", () => {
    for (const rel of [
      "docs/agent-system/CONSTITUTION.md",
      "docs/agent-system/SOURCE_OF_TRUTH.md",
      "docs/agent-system/CURRENT_STATE.md",
      "docs/agent-system/agent-registry.yaml",
      "docs/agent-system/permissions.yaml",
      "docs/agent-system/orchestration-modes.yaml",
      "docs/agent-system/schemas/task-packet.schema.json",
      "docs/agent-system/schemas/agent-output.schema.json",
      "docs/agent-system/schemas/evidence.schema.json",
      "docs/agent-system/schemas/mission.schema.json",
    ]) expect(existsSync(join(root, rel)), rel).toBe(true);
  });

  it("define R1-R9 uma única vez no registry e mapeia O1-O9", () => {
    const registry = readJson("docs/agent-system/agent-registry.yaml");
    expect(registry.roles.map((r: { id: string }) => r.id)).toEqual(
      Array.from({ length: 9 }, (_, i) => `R${i + 1}`)
    );
    expect(registry.roles.map((r: { openai: { profile: string } }) => r.openai.profile)).toEqual(
      Array.from({ length: 9 }, (_, i) => `O${i + 1}`)
    );
  });

  it("preserva independência formal de R6", () => {
    const registry = readJson("docs/agent-system/agent-registry.yaml");
    expect(registry.roles.find((r: { id: string }) => r.id === "R6").independent_review).toBe(true);
  });

  it("executa validadores determinísticos do Agent OS", () => {
    execFileSync(process.execPath, ["scripts/agents/validate-registry.mjs"], { cwd: root });
    execFileSync(process.execPath, ["scripts/agents/validate-skills.mjs"], { cwd: root });
    execFileSync(process.execPath, ["scripts/agents/validate-schemas.mjs"], { cwd: root });
    execFileSync(process.execPath, ["scripts/agents/validate-task-packet.mjs"], { cwd: root });
  });
});
