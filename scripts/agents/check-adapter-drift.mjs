import { assert, readJson, readText } from "./lib.mjs";

const registry = readJson("docs/agent-system/agent-registry.yaml");
const agentsMd = readText("AGENTS.md");
assert(agentsMd.includes("docs/agent-system/CONSTITUTION.md"), "AGENTS.md não aponta para a Constituição V3.");

for (const role of registry.roles) {
  const openai = readText(role.openai.doc);
  assert(openai.includes(`Papel canônico: ${role.id}`), `${role.openai.profile}: papel canônico ausente.`);

  const codex = readText(role.openai.codex_file);
  assert(codex.includes(`Canonical role: ${role.id}`), `${role.openai.codex_file}: role marker ausente.`);
  assert(codex.includes(`name = "${role.openai.codex_name}"`), `${role.openai.codex_file}: nome divergente.`);
}

const gemini = readText("GEMINI.md");
assert(gemini.includes("docs/agent-system/CONSTITUTION.md"), "GEMINI.md não aponta para a Constituição V3.");
const antigravity = readText(".agents/README.md");
assert(antigravity.includes("docs/agent-system/agent-registry.yaml"), ".agents/README.md não aponta para o registry V3.");

console.log("Adapter drift: PASS");
