import { assert, readJson } from "./lib.mjs";

const schemas = [
  "docs/agent-system/schemas/task-packet.schema.json",
  "docs/agent-system/schemas/agent-output.schema.json",
  "docs/agent-system/schemas/evidence.schema.json",
  "docs/agent-system/schemas/mission.schema.json",
  "docs/agent-system/schemas/handoff-event.schema.json",
];

for (const path of schemas) {
  const schema = readJson(path);
  assert(schema.$schema?.includes("json-schema.org"), `${path}: $schema ausente.`);
  assert(schema.type === "object", `${path}: root type deve ser object.`);
  assert(Array.isArray(schema.required) && schema.required.length > 0, `${path}: required ausente.`);
  assert(schema.additionalProperties === false, `${path}: additionalProperties deve ser false.`);
}
console.log("Schemas: PASS");
