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

      // Bloquear deploy Vercel; observação read-only permanece permitida.
      if (/\bvercel\s+(deploy|--prod)\b/i.test(cmd)) {
        console.log(JSON.stringify({
          decision: 'deny',
          reason: 'GATE DE PRODUCAO: Deploys Vercel via CLI exigem gate humano.'
        }));
        return;
      }

      // Proibir force push em qualquer branch
      if (/git\s+push.*(--force|-f\b)/i.test(cmd)) {
        console.log(JSON.stringify({
          decision: 'deny',
          reason: 'SEGURANCA: Force push e estritamente proibido.'
        }));
        return;
      }

      // Push direto para main: permitir apenas se bootstrap inicial autorizado
      if (/git\s+push.*origin\s+main/i.test(cmd)) {
        const allowInitial = process.env.ALLOW_INITIAL_BOOTSTRAP_PUSH === 'true';
        if (!allowInitial) {
          console.log(JSON.stringify({
            decision: 'deny',
            reason: 'SEGURANCA: Push direto para a branch main e bloqueado por padrao. Para bootstrap inicial autorizado no repositorio novo vazio, defina ALLOW_INITIAL_BOOTSTRAP_PUSH=true.'
          }));
          return;
        }
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
