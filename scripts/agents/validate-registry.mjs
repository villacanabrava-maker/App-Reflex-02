import { assert, readJson, readText } from "./lib.mjs";

const registry = readJson("docs/agent-system/agent-registry.yaml");
const roles = registry.roles ?? [];
const expected = Array.from({ length: 9 }, (_, i) => `R${i + 1}`);

assert(roles.length === 9, "Registry deve conter exatamente 9 papéis.");
assert(JSON.stringify(roles.map((r) => r.id)) === JSON.stringify(expected), "IDs devem ser R1-R9 em ordem.");
assert(new Set(roles.map((r) => r.name)).size === 9, "Nomes de papéis devem ser únicos.");

for (const role of roles) {
  assert(role.openai?.profile === `O${role.id.slice(1)}`, `${role.id}: perfil OpenAI divergente.`);
  const doc = readText(role.openai.doc);
  assert(doc.length > 0, `${role.id}: doc OpenAI vazio.`);

  const codex = readText(role.openai.codex_file);
  assert(codex.includes(`name = "${role.openai.codex_name}"`), `${role.id}: codex_name divergente.`);
  assert(codex.includes("description ="), `${role.id}: agente Codex sem description.`);
  assert(codex.includes("developer_instructions"), `${role.id}: agente Codex sem developer_instructions.`);

  for (const adapter of role.antigravity?.agents ?? []) {
    const [, name] = adapter.split(":");
    readText(`.agents/agents/${name}/agent.md`);
  }
}

const r6 = roles.find((r) => r.id === "R6");
assert(r6?.independent_review === true, "R6 deve declarar independent_review=true.");
console.log("Agent registry: PASS");
