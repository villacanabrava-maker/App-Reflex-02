import { assert, readText } from "./lib.mjs";

const checks = [
  ["GEMINI.md", /Vercel[^\n]*(ADIADO|NÃO APLICÁVEL|AINDA NÃO DEFINIDO)/i],
  [".agents/README.md", /Vercel[^\n]*(Adiado|Não aplicável)/i],
  ["docs/STATUS_PROJETO.md", /Hospedagem \/ Vercel:\s*\*\*ADIADO/i],
];

for (const [path, banned] of checks) {
  const text = readText(path);
  assert(!banned.test(text), `Drift documental conhecido ainda presente em ${path}: ${banned}`);
}
console.log("Known document drift: PASS");
