/**
 * PreToolUse Guard para o Sistema Multiagente do App Reflex 02
 * Bloqueia comandos destrutivos, execuções não autorizadas de Vercel e mutações perigosas.
 */
let inputData = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    if (!inputData.trim()) {
      console.log(JSON.stringify({
        decision: 'deny',
        reason: 'SEGURANCA: Payload de verificacao vazio ou nao reconhecido.'
      }));
      return;
    }

    const payload = JSON.parse(inputData);
    const toolCall = payload.toolCall || {};
    const name = toolCall.name || '';
    const args = toolCall.args || {};

    if (name === 'run_command') {
      const cmd = (args.CommandLine || '').trim();

      // Vercel: qualquer deploy/promote/rollback/--prod e permanentemente bloqueado.
      if (/\bvercel\s+(deploy|promote|rollback)\b/i.test(cmd) || /\bvercel\b.*--prod\b/i.test(cmd)) {
        console.log(JSON.stringify({
          decision: 'deny',
          reason: 'GATE DE PRODUCAO: Deploys, promotes e rollbacks Vercel via CLI exigem gate humano.'
        }));
        return;
      }

      // Vercel: qualquer outro subcomando que nao seja comprovadamente somente-leitura exige aprovacao.
      const vercelMatch = cmd.match(/\bvercel\s+([a-z][a-z-]*)/i);
      if (vercelMatch) {
        const readOnlyVercelVerbs = new Set([
          'ls', 'list', 'inspect', 'logs', 'whoami', 'help',
          '--version', '-v', '--help'
        ]);
        const verb = vercelMatch[1].toLowerCase();
        if (!readOnlyVercelVerbs.has(verb)) {
          console.log(JSON.stringify({
            decision: 'ask',
            reason: 'GATE DE PRODUCAO: Comando Vercel fora da lista somente-leitura (ls/list/inspect/logs/whoami/help/--version) exige aprovacao explicita do usuario.'
          }));
          return;
        }
      }

      // Proibir force push em qualquer branch
      if (/git\s+push.*(--force|-f\b)/i.test(cmd)) {
        console.log(JSON.stringify({
          decision: 'deny',
          reason: 'SEGURANCA: Force push e estritamente proibido.'
        }));
        return;
      }

      // Proibir push direto para main (qualquer refspec ou sintaxe)
      if (/git\s+push.*(?:\bmain\b|refs\/heads\/main)/i.test(cmd)) {
        console.log(JSON.stringify({
          decision: 'deny',
          reason: 'SEGURANCA: Push direto para a branch main e permanentemente bloqueado. Todas as alteracoes devem tramitar por branch isolada e PR com revisao independente de R6.'
        }));
        return;
      }

      // Proibir comandos destrutivos de sistema e banco
      if (/rm\s+-rf\s+[/\\]|drop\s+database|drop\s+schema|\btruncate\b|disable\s+row\s+level\s+security/i.test(cmd)) {
        console.log(JSON.stringify({
          decision: 'deny',
          reason: 'SEGURANCA: Comandos destrutivos de sistema ou banco de dados sao permanentemente bloqueados.'
        }));
        return;
      }

      // Exigir confirmacao para migracao em banco conectado
      if (/supabase\s+db\s+push\s+--linked/i.test(cmd)) {
        console.log(JSON.stringify({
          decision: 'ask',
          reason: 'GATE DE PRODUCAO: Operacoes de migracao em banco conectado exigem aprovacao explicita do usuario.'
        }));
        return;
      }
    }

    // Permitir se nenhuma regra de seguranca foi violada
    console.log(JSON.stringify({ decision: 'allow' }));
  } catch {
    console.log(JSON.stringify({
      decision: 'deny',
      reason: 'SEGURANCA: Falha ao validar comando pelo guardrail (dados invalidos ou corrompidos).'
    }));
  }
});
