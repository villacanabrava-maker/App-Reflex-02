import { existsSync } from "node:fs";
import { assert, readJson, readText } from "./lib.mjs";

const runtimes = readJson("docs/agent-system/runtime-registry.yaml");
const ids = (runtimes.runtimes ?? []).map((r) => r.id);
assert(JSON.stringify(ids) === JSON.stringify(["openai_cloud","claude_cloud","antigravity_local"]), "Runtime registry deve conter os três runtimes canônicos.");
assert(runtimes.control_plane === "github", "GitHub deve ser o control plane.");

const claude = runtimes.runtimes.find((r) => r.id === "claude_cloud");
assert(claude.branch_policy.includes("claude/*"), "Claude Cloud deve preservar branch claude/*.");
assert(!claude.recommended_unattended_connectors.includes("vercel_write"), "Vercel write não pode ser connector unattended recomendado.");
assert(claude.prohibited_unattended_connectors.includes("supabase_write"), "Supabase write deve ser proibido unattended.");

const ag = runtimes.runtimes.find((r) => r.id === "antigravity_local");
assert(ag.physical_agents_current_strategy === 6, "Estratégia Antigravity atual deve registrar seis agentes físicos.");

const claudeMd = readText("CLAUDE.md");
assert(claudeMd.includes("docs/agent-system/CONSTITUTION.md"), "CLAUDE.md não aponta para a Constituição.");
assert(claudeMd.includes("docs/agent-system/runtime-registry.yaml"), "CLAUDE.md não aponta para runtime-registry.");
assert(claudeMd.includes("não existe R10"), "CLAUDE.md deve impedir a criação de R10.");

assert(!existsSync(".claude/settings.json"), "Não versionar o stack local de settings/hooks como padrão cloud nesta etapa.");
assert(!existsSync(".mcp.json"), "MCP com credenciais/escopo não deve ser versionado antes do setup humano.");

console.log("Tri-runtime control plane: PASS");
