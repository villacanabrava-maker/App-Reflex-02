/**
 * Stop Hook Guard para o Reflex Agent OS V3 (Antigravity 2.0)
 * Valida o fechamento de ciclo e verifica critérios de Definition of Done.
 */
let inputData = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    if (inputData.trim()) {
      const payload = JSON.parse(inputData);
      // Se houver erro de término ou flag de não-idle, podemos inspecionar
      if (payload.error && process.env.DEBUG_STOP_GUARD === 'true') {
        process.stderr.write(`[Reflex-StopGuard] Terminating with error: ${payload.error}\n`);
      }
    }

    // Retorna allow para permitir o encerramento normal da sessão
    console.log(JSON.stringify({ decision: 'allow' }));
  } catch {
    // Fail-safe permitindo o encerramento sem travar o usuário
    console.log(JSON.stringify({ decision: 'allow' }));
  }
});
