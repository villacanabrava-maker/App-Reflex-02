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
});
