/**
 * PostToolUse Telemetry Hook para o Reflex Agent OS V3 (Antigravity 2.0)
 * Registra metadados de execução para observabilidade sem persistir dados sensíveis.
 */
let inputData = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    // Processa telemetria de ferramenta se houver payload
    if (inputData.trim()) {
      const payload = JSON.parse(inputData);
      const stepIdx = payload.stepIdx;
      const toolCall = payload.toolCall || {};
      const toolName = toolCall.name || 'unknown';
      const hasError = Boolean(payload.error);

      if (process.env.DEBUG_TELEMETRY === 'true') {
        process.stderr.write(`[Reflex-Telemetry] Step ${stepIdx}: ${toolName} (error: ${hasError})\n`);
      }
    }

    // Contrato oficial PostToolUse exige um objeto JSON vazio na stdout
    console.log(JSON.stringify({}));
  } catch {
    // Fail-safe silencioso retornando objeto JSON válido
    console.log(JSON.stringify({}));
  }
});
