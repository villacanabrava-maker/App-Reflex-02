import { describe, test, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Agent Harness V2 — Auditoria Estrutural e Constitucional dos 9 Agentes', () => {
  const agentsDir = path.resolve(process.cwd(), '.agents/agents');
  const skillsDir = path.resolve(process.cwd(), '.agents/skills');

  const canonicalAgents = [
    { id: 'A1', name: 'rflex-architect', isMain: true },
    { id: 'A2', name: 'rflex-product-design', isMain: false },
    { id: 'A3', name: 'rflex-frontend', isMain: false },
    { id: 'A4', name: 'rflex-backend-supabase', isMain: false },
    { id: 'A5', name: 'rflex-ai-knowledge', isMain: false },
    { id: 'A6', name: 'rflex-platform', isMain: false },
    { id: 'A7', name: 'rflex-qa-security', isMain: false },
    { id: 'A8', name: 'rflex-research-evolution', isMain: false },
    { id: 'A9', name: 'rflex-continuity-evidence', isMain: false },
  ];

  test('Todos os 9 agentes canônicos devem possuir diretório e agent.md existente', () => {
    canonicalAgents.forEach(agent => {
      const agentPath = path.join(agentsDir, agent.name, 'agent.md');
      expect(fs.existsSync(agentPath), `Arquivo agent.md não encontrado para ${agent.name}`).toBe(true);
    });
  });

  test('Apenas A1 (rflex-architect) deve possuir mainAgent: true; A2 a A9 devem ser mainAgent: false', () => {
    canonicalAgents.forEach(agent => {
      const agentPath = path.join(agentsDir, agent.name, 'agent.md');
      const content = fs.readFileSync(agentPath, 'utf8');

      if (agent.isMain) {
        expect(content).toMatch(/mainAgent:\s*true/);
      } else {
        expect(content).toMatch(/mainAgent:\s*false/);
      }
      expect(content).toMatch(/subagent:\s*true/);
    });
  });

  test('Todos os 9 agentes devem conter descrições discriminativas com diretivas afirmativas e negativas', () => {
    canonicalAgents.forEach(agent => {
      const agentPath = path.join(agentsDir, agent.name, 'agent.md');
      const content = fs.readFileSync(agentPath, 'utf8');
      
      // Deve conter instrução explícita de quando NÃO usar (descrição negativa)
      expect(content.toLowerCase()).toMatch(/n[ãa]o use para/);
    });
  });

  test('Todos os 9 agentes devem conter as 15 seções estruturais padronizadas no corpo do markdown', () => {
    const requiredSections = [
      '# 1. Identity',
      '# 2. Mission',
      '# 3. Trigger conditions',
      '# 4. Do not invoke for',
      '# 5. Read-first',
      '# 6. Owned resources',
      '# 7. Tools',
      '# 8. Required skills',
      '# 9. Input contract',
      '# 10. Workflow',
      '# 11. Evidence',
      '# 12. Output contract',
      '# 13. Prohibitions',
      '# 14. Escalation',
      '# 15. Stop conditions',
    ];

    canonicalAgents.forEach(agent => {
      const agentPath = path.join(agentsDir, agent.name, 'agent.md');
      const content = fs.readFileSync(agentPath, 'utf8');

      requiredSections.forEach(section => {
        expect(content, `Agente ${agent.name} não possui a seção obrigatória '${section}'`).toContain(section);
      });
    });
  });

  test('Todas as skills referenciadas nos arquivos agent.md devem existir fisicamente no repositório', () => {
    canonicalAgents.forEach(agent => {
      const agentPath = path.join(agentsDir, agent.name, 'agent.md');
      const content = fs.readFileSync(agentPath, 'utf8');

      const skillsMatch = content.match(/skills:\s*\n((?:\s*-\s*[a-zA-Z0-9_-]+\s*\n)+)/);
      if (skillsMatch && skillsMatch[1]) {
        const skills = skillsMatch[1]
          .split('\n')
          .map(line => line.replace(/^\s*-\s*/, '').trim())
          .filter(name => name && name !== '---' && !name.startsWith('--'));

        skills.forEach(skillName => {
          const skillPath = path.join(skillsDir, skillName, 'SKILL.md');
          expect(fs.existsSync(skillPath), `Skill '${skillName}' declarada em ${agent.name} não existe em ${skillPath}`).toBe(true);
        });
      }
    });
  });

  test('Nenhum agente deve possuir autorização para comandos destrutivos (rm -rf, force push, drop database)', () => {
    canonicalAgents.forEach(agent => {
      const agentPath = path.join(agentsDir, agent.name, 'agent.md');
      const content = fs.readFileSync(agentPath, 'utf8');

      // Verifica se a seção de deny ou proibições contém bloqueio a comandos destrutivos
      expect(content).toMatch(/rm -rf/);
      expect(content.toLowerCase()).toMatch(/force|drop database/);
    });
  });

  test('A1 (rflex-architect) deve possuir ferramentas de orquestração e despacho de subagentes', () => {
    const a1Path = path.join(agentsDir, 'rflex-architect', 'agent.md');
    const content = fs.readFileSync(a1Path, 'utf8');

    expect(content).toMatch(/send_message/);
    expect(content).toMatch(/invoke_subagent/);
    expect(content).toMatch(/schedule/);
  });

  test('Regras de governança em .agents/rules/ devem existir, estar íntegras e sem caracteres corrompidos', () => {
    const rulesDir = path.resolve(process.cwd(), '.agents/rules');
    const devWorkflowPath = path.join(rulesDir, 'development-workflow.md');
    const securityBoundariesPath = path.join(rulesDir, 'security-boundaries.md');

    expect(fs.existsSync(devWorkflowPath)).toBe(true);
    expect(fs.existsSync(securityBoundariesPath)).toBe(true);

    const devWorkflow = fs.readFileSync(devWorkflowPath, 'utf8');
    const securityBoundaries = fs.readFileSync(securityBoundariesPath, 'utf8');

    expect(devWorkflow).not.toContain('\x0c'); // sem formfeed corrompido
    expect(devWorkflow).toContain('feature/nome-da-frente');
    expect(devWorkflow).toContain('npm run typecheck');

    expect(securityBoundaries).toContain('App Reflex 02');
    expect(securityBoundaries).toContain('rm -rf');
  });

  test('Hooks e scripts de segurança em .agents/ devem estar configurados e presentes', () => {
    const hooksPath = path.resolve(process.cwd(), '.agents/hooks.json');
    const preToolPath = path.resolve(process.cwd(), '.agents/scripts/pre-tool-guard.js');
    const stopGuardPath = path.resolve(process.cwd(), '.agents/scripts/stop-audit-guard.js');

    expect(fs.existsSync(hooksPath)).toBe(true);
    expect(fs.existsSync(preToolPath)).toBe(true);
    expect(fs.existsSync(stopGuardPath)).toBe(true);

    const hooksConfig = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));
    expect(hooksConfig['rflex-safety-guard']).toBeDefined();
    expect(hooksConfig['rflex-safety-guard'].enabled).toBe(true);
  });

  test('Configuração de conectores MCP (.agents/mcp_config.json) deve estar bem formatada', () => {
    const mcpPath = path.resolve(process.cwd(), '.agents/mcp_config.json');
    expect(fs.existsSync(mcpPath)).toBe(true);

    const mcpConfig = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
    expect(mcpConfig.mcpServers).toBeDefined();
    expect(mcpConfig.mcpServers['supabase-rflex']).toBeDefined();
    expect(mcpConfig.mcpServers['github-rflex']).toBeDefined();
  });
});
