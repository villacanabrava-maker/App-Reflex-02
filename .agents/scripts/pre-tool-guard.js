/**
 * PreToolUse Guard para o Reflex Agent OS V3 (Antigravity 2.0)
 * Bloqueia comandos destrutivos, force push, deploys não autorizados de Vercel e mutações perigosas.
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

      // Bloquear comandos de deploy na Vercel (Gate Humano obrigatório)
      if (/\bvercel\s+(deploy|--prod)\b/i.test(cmd)) {
        console.log(JSON.stringify({
          decision: 'deny',
          reason: 'GATE DE PRODUCAO: A producao esta ativa em app-reflex-02.vercel.app. Deploys via CLI sao permanentemente bloqueados por regra constitucional.'
        }));
        return;
      }

      // Proibir force push em qualquer branch
      if (/git\s+push.*(--force|-f\b)/i.test(cmd)) {
        console.log(JSON.stringify({
          decision: 'deny',
          reason: 'SEGURANCA CONSTITUCIONAL: Force push e estritamente proibido em qualquer branch.'
        }));
        return;
      }

      // Push direto para main: bloqueado por padrão
      if (/git\s+push.*origin\s+main/i.test(cmd)) {
        const allowInitial = process.env.ALLOW_INITIAL_BOOTSTRAP_PUSH === 'true';
        if (!allowInitial) {
          console.log(JSON.stringify({
            decision: 'deny',
            reason: 'SEGURANCA: Push direto para a branch main e bloqueado por padrao. Todo trabalho deve tramitar via branches curtas e PR auditado por R6.'
          }));
          return;
        }
      }

      // Proibir comandos destrutivos de sistema e banco de dados
      if (/rm\s+-rf\s+[/\\]|drop\s+database|drop\s+schema|truncate\s+table|DISABLE\s+ROW\s+LEVEL\s+SECURITY/i.test(cmd)) {
        console.log(JSON.stringify({
          decision: 'deny',
          reason: 'SEGURANCA CONSTITUCIONAL: Comandos destrutivos de sistema ou banco de dados sao permanentemente bloqueados.'
        }));
        return;
      }

      // Exigir confirmacao humana para migracao em banco conectado
      if (/supabase\s+db\s+push\s+--linked/i.test(cmd)) {
        console.log(JSON.stringify({
          decision: 'ask',
          reason: 'GATE DE BANCO: Operacoes de migracao em banco conectado exigem aprovacao humana explicita.'
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
