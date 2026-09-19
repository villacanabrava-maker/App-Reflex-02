import { assert, readJson } from "./lib.mjs";

const path = process.argv[2] || "docs/agent-system/missions/NEXT-RCMO-TASK-PACKET.json";
const packet = readJson(path);
const required = [
  "mission_id","task_id","created_at","objective","baseline_sha","target_branch","owner_role",
  "dependencies","in_scope","out_of_scope","allowed_tools","write_scope","risk_level",
  "acceptance_criteria","required_evidence","expected_artifacts","status","blocked_by","next_handoff"
];

for (const key of required) assert(Object.hasOwn(packet, key), `${path}: campo obrigatório ausente: ${key}`);
assert(/^R[1-9]$/.test(packet.owner_role), `${path}: owner_role inválido.`);
assert(["LOW","MEDIUM","HIGH","CRITICAL"].includes(packet.risk_level), `${path}: risk_level inválido.`);
assert(["PROPOSED","READY","IN_PROGRESS","BLOCKED","REVIEW","REJECTED","DONE","ABSTAINED"].includes(packet.status), `${path}: status inválido.`);
assert(Array.isArray(packet.acceptance_criteria) && packet.acceptance_criteria.length > 0, `${path}: acceptance_criteria vazio.`);
console.log(`Task Packet: PASS (${path})`);
