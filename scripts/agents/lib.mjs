import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export const root = process.cwd();

export function fail(message) {
  throw new Error(message);
}

export function assert(condition, message) {
  if (!condition) fail(message);
}

export function readText(rel) {
  const path = join(root, rel);
  assert(existsSync(path), `Arquivo ausente: ${rel}`);
  return readFileSync(path, "utf8");
}

export function readJson(rel) {
  try {
    return JSON.parse(readText(rel));
  } catch (error) {
    fail(`JSON/JSON-compatible YAML inválido em ${rel}: ${error.message}`);
  }
}

export function walkFiles(relDir, extensions) {
  const start = join(root, relDir);
  if (!existsSync(start)) return [];
  const out = [];
  const visit = (abs) => {
    for (const name of readdirSync(abs)) {
      const path = join(abs, name);
      const stat = statSync(path);
      if (stat.isDirectory()) visit(path);
      else if (!extensions || extensions.some((ext) => name.endsWith(ext))) {
        out.push(relative(root, path).replaceAll("\\", "/"));
      }
    }
  };
  visit(start);
  return out;
}
