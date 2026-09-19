import { describe, test, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Reflex Agent Operating System V3 — Auditoria Estrutural e Anti-Drift', () => {
  const root = process.cwd();
  const agentSystemDir = path.join(root, 'docs', 'agent-system');
  const schemasDir = path.join(agentSystemDir, 'schemas');
  const missionsDir = path.join(agentSystemDir, 'missions');
  const skillsDir = path.join(root, '.agents', 'skills');
  const agentsDir = path.join(root, '.agents', 'agents');
  const codexAgentsDir = path.join(root, '.codex', 'agents');

  test('A camada runtime-neutral em docs/agent-system/ deve conter todos os documentos fundamentais', () => {
    const requiredDocs = [
      'CONSTITUTION.md',
      'SOURCE_OF_TRUTH.md',
      'CURRENT_STATE.md',
      'agent-registry.yaml',
      'permissions.yaml',
      'orchestration-modes.yaml',
    ];

    requiredDocs.forEach(doc => {
      const filePath = path.join(agentSystemDir, doc);
      expect(fs.existsSync(filePath), `Documento obrigatório '${doc}' não encontrado em docs/agent-system/`).toBe(true);
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content.length).toBeGreaterThan(50);
    });
  });

  test('Os schemas JSON canônicos e o Mission Lock devem ser válidos e completos', () => {
    const schemas = [
      'task-packet.schema.json',
      'output-contract.schema.json',
      'mission-lock.schema.json',
    ];

    schemas.forEach(schemaFile => {
      const filePath = path.join(schemasDir, schemaFile);
      expect(fs.existsSync(filePath), `Schema '${schemaFile}' não existe`).toBe(true);
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      expect(parsed.type).toBe('object');
      expect(parsed.required).toBeDefined();
    });

    const lockFile = path.join(missionsDir, 'MISSION_LOCK.json');
    expect(fs.existsSync(lockFile), 'MISSION_LOCK.json deve existir').toBe(true);
    const lock = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
    expect(lock.mission_id).toBeDefined();
    expect(lock.owner_runtime).toBeDefined();
    expect(lock.owner_role).toBeDefined();
    expect(lock.status).toBeDefined();
  });

  test('O registry agent-registry.yaml deve mapear estritamente os 9 papéis R1 a R9', () => {
    const registryPath = path.join(agentSystemDir, 'agent-registry.yaml');
    const content = fs.readFileSync(registryPath, 'utf8');

    const expectedRoles = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9'];
    expectedRoles.forEach(role => {
      expect(content).toContain(`id: "${role}"`);
    });

    // R1 deve ser o único main_agent: true
    expect(content).toMatch(/R1:[\s\S]*?main_agent:\s*true/);
    expect(content).toMatch(/R2:[\s\S]*?main_agent:\s*false/);
    expect(content).toMatch(/R3:[\s\S]*?main_agent:\s*false/);
    expect(content).toMatch(/R4:[\s\S]*?main_agent:\s*false/);
    expect(content).toMatch(/R5:[\s\S]*?main_agent:\s*false/);
    expect(content).toMatch(/R6:[\s\S]*?main_agent:\s*false/);
    expect(content).toMatch(/R7:[\s\S]*?main_agent:\s*false/);
    expect(content).toMatch(/R8:[\s\S]*?main_agent:\s*false/);
    expect(content).toMatch(/R9:[\s\S]*?main_agent:\s*false/);
  });

  test('Todos os 9 agentes Antigravity canônicos (R1 a R9) devem possuir agent.md íntegro', () => {
    const canonicalR1toR9 = [
      { id: 'R1', agent: 'rflex-orchestrator', isMain: true },
      { id: 'R2', agent: 'rflex-architecture', isMain: false },
      { id: 'R3', agent: 'rflex-data-supabase', isMain: false },
      { id: 'R4', agent: 'rflex-product-frontend', isMain: false },
      { id: 'R5', agent: 'rflex-cognitive-knowledge', isMain: false },
      { id: 'R6', agent: 'rflex-qa-security', isMain: false },
      { id: 'R7', agent: 'rflex-platform-runtime', isMain: false },
      { id: 'R8', agent: 'rflex-research-evolution', isMain: false },
      { id: 'R9', agent: 'rflex-continuity-evidence', isMain: false },
    ];

    canonicalR1toR9.forEach(({ id, agent, isMain }) => {
      const agentFile = path.join(agentsDir, agent, 'agent.md');
      expect(fs.existsSync(agentFile), `Agente Antigravity para ${id} (${agent}) não encontrado em ${agentFile}`).toBe(true);

      const content = fs.readFileSync(agentFile, 'utf8');
      if (isMain) {
        expect(content).toMatch(/mainAgent:\s*true/);
      } else {
        expect(content).toMatch(/mainAgent:\s*false/);
      }
      expect(content).toMatch(/subagent:\s*true/);
      expect(content.toLowerCase()).toMatch(/n[ãa]o use para/);
    });
  });

  test('Paridade isomórfica com a camada OpenAI Codex: os 9 agentes .codex devem existir', () => {
    const expectedCodex = [
      'reflex-orchestrator.toml',
      'reflex-architecture.toml',
      'reflex-supabase.toml',
      'reflex-frontend.toml',
      'reflex-cognitive.toml',
      'reflex-qa.toml',
      'reflex-platform.toml',
      'reflex-research.toml',
      'reflex-continuity.toml',
    ];

    expectedCodex.forEach(toml => {
      const filePath = path.join(codexAgentsDir, toml);
      expect(fs.existsSync(filePath), `Agente Codex '${toml}' não encontrado`).toBe(true);
    });
  });

  test('Todas as 12 Shared Skills com prefixo reflex-* devem existir e possuir SKILL.md válido', () => {
    const expectedSkills = [
      'reflex-bootstrap-reconcile',
      'reflex-task-routing',
      'reflex-handoff',
      'reflex-git-safe-worktree',
      'reflex-supabase-safe-change',
      'reflex-cognitive-integrity',
      'reflex-rcmo',
      'reflex-ui-runtime-verify',
      'reflex-independent-qa',
      'reflex-release-verify',
      'reflex-research',
      'reflex-continuity-close',
    ];

    expectedSkills.forEach(skill => {
      const skillPath = path.join(skillsDir, skill, 'SKILL.md');
      expect(fs.existsSync(skillPath), `Skill '${skill}' não encontrada`).toBe(true);

      const content = fs.readFileSync(skillPath, 'utf8');
      expect(content).toContain(`name: ${skill}`);
      expect(content).toContain('description:');
    });
  });

  test('Hooks em .agents/hooks.json devem cobrir PreToolUse, PostToolUse e Stop com scripts válidos', () => {
    const hooksFile = path.join(root, '.agents', 'hooks.json');
    expect(fs.existsSync(hooksFile)).toBe(true);

    const hooks = JSON.parse(fs.readFileSync(hooksFile, 'utf8'));
    const safetyGuard = hooks['rflex-safety-guard'];
    expect(safetyGuard).toBeDefined();
    expect(safetyGuard.enabled).toBe(true);
    expect(safetyGuard.PreToolUse).toBeDefined();
    expect(safetyGuard.PostToolUse).toBeDefined();
    expect(safetyGuard.Stop).toBeDefined();

    expect(fs.existsSync(path.join(root, '.agents', 'scripts', 'pre-tool-guard.js'))).toBe(true);
    expect(fs.existsSync(path.join(root, '.agents', 'scripts', 'post-tool-telemetry.js'))).toBe(true);
    expect(fs.existsSync(path.join(root, '.agents', 'scripts', 'stop-audit-guard.js'))).toBe(true);
  });

  test('GEMINI.md e CURRENT_STATE.md devem estar reconciliados com a Vercel de produção ativa', () => {
    const gemini = fs.readFileSync(path.join(root, 'GEMINI.md'), 'utf8');
    const currentState = fs.readFileSync(path.join(agentSystemDir, 'CURRENT_STATE.md'), 'utf8');

    // Não deve conter declaração obsoleta de que a Vercel está adiada ou fora de escopo
    expect(gemini).toContain('app-reflex-02.vercel.app');
    expect(gemini).toContain('Gate Humano Obrigatório');
    expect(currentState).toContain('app-reflex-02.vercel.app');
    expect(currentState).toContain('38 migrations');
  });
});
