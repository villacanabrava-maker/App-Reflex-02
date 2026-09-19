import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const required = [
  "OpenAI ChatGPT/README.md",
  "OpenAI ChatGPT/BOOTSTRAP.md",
  "OpenAI ChatGPT/CURRENT_STATE.md",
  "OpenAI ChatGPT/METHODOLOGY.md",
  "OpenAI ChatGPT/PROJECT_MAP.md",
  "OpenAI ChatGPT/CONTINUITY_LEDGER.md",
  "OpenAI ChatGPT/DECISIONS.md",
];

const skills = [
  "openai-reflex-bootstrap",
  "openai-reflex-runtime-debug",
  "openai-reflex-supabase-safe",
  "openai-reflex-cognitive-integrity",
  "openai-reflex-continuity",
];

const secretPatterns = [
  /sk-proj-[A-Za-z0-9_-]{20,}/g,
  /vcp_[A-Za-z0-9_-]{20,}/g,
  /sb_secret_[A-Za-z0-9_-]{12,}/g,
  /postgres(?:ql)?:\/\/[^\s:@]+:[^\s@]+@/gi,
];

const failures = [];

for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) {
    failures.push(`missing: ${rel}`);
  }
}

for (const name of skills) {
  const rel = `.agents/skills/${name}/SKILL.md`;
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    failures.push(`missing skill entrypoint: ${rel}`);
    continue;
  }

  const text = fs.readFileSync(abs, "utf8");
  if (
    !/^---\s*[\s\S]*?name:\s*[^\n]+[\s\S]*?description:\s*[^\n]+[\s\S]*?---/m.test(
      text
    )
  ) {
    failures.push(`invalid skill frontmatter: ${rel}`);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const abs = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(abs) : [abs];
  });
}

for (const file of walk(path.join(root, "OpenAI ChatGPT"))) {
  if (!/\.(md|json|ya?ml|mjs|js|ts|tsx)$/i.test(file)) continue;

  const text = fs.readFileSync(file, "utf8");
  for (const pattern of secretPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) {
      failures.push(
        `possible secret in ${path.relative(root, file)} (${pattern})`
      );
    }
  }
}

if (failures.length) {
  console.error("OpenAI context validation FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("OpenAI context validation PASS");
console.log(`required files: ${required.length}`);
console.log(`registered skills: ${skills.length}`);
