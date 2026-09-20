import { readText, walkFiles, fail } from "./lib.mjs";

const roots = ["docs/agent-system", ".codex", "OpenAI ChatGPT", ".claude", ".agents"];
const rootFiles = ["AGENTS.md", "CLAUDE.md", "GEMINI.md"];
const extensions = [".md",".json",".yaml",".toml",".mjs",".js",".ts",".yml"];
const files = [...new Set([
  ...roots.flatMap((dir) => walkFiles(dir, extensions)),
  ...rootFiles,
])];
const patterns = [
  /sk-proj-[A-Za-z0-9_-]{24,}/g,
  /sb_secret_[A-Za-z0-9_-]{16,}/g,
  /vcp_[A-Za-z0-9_-]{20,}/g,
  /ghp_[A-Za-z0-9]{30,}/g,
];

const hits = [];
for (const path of files) {
  const text = readText(path);
  for (const pattern of patterns) {
    if (pattern.test(text)) hits.push(`${path}: ${pattern}`);
    pattern.lastIndex = 0;
  }
}
if (hits.length) fail(`Possíveis segredos detectados:\n${hits.join("\n")}`);
console.log(`Secret scan: PASS (${files.length} files)`);
