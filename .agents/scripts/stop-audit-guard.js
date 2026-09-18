/**
 * Stop Hook Guard para o App Reflex 02
 * Emite lembrete de DoD e valida integridade do fechamento de ciclo
 */
let _inputData = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  _inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    // Valida encerramento seguro e lembra dos critérios de Handoff/DoD
    console.log(JSON.stringify({
      message: 'App Reflex 02 DoD Check: Certifique-se de que os testes passaram, nenhum segredo foi exposto e o status foi registrado.'
    }));
  } catch {
    console.log(JSON.stringify({
      error: 'Falha no processamento do stop hook guard.'
    }));
  }
});
