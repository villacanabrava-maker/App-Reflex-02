import { assert, readJson, readText } from "./lib.mjs";

const registry = readJson("docs/agent-system/skill-registry.yaml");
const skills = registry.canonical_skills ?? [];
assert(skills.length >= 8 && skills.length <= 20, "Conjunto canônico de Skills deve permanecer pequeno e composável.");
assert(new Set(skills.map((s) => s.id)).size === skills.length, "IDs de Skills canônicas duplicados.");

for (const skill of skills) {
  assert(Array.isArray(skill.adapters) && skill.adapters.length > 0, `${skill.id}: sem adapter real.`);
  for (const path of skill.adapters) {
    const text = readText(path);
    assert(/(^|\n)name:\s*[^\n]+/.test(text), `${path}: SKILL.md sem name.`);
    assert(/(^|\n)description:\s*/.test(text), `${path}: SKILL.md sem description.`);
  }
}
console.log("Skill registry: PASS");
