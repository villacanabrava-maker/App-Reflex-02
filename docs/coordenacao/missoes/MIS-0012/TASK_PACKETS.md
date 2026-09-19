# TASK PACKETS — MISSÃO MIS-0012
## Wave 6: Consolidação Autoral Noturna, Replay Incremental e Aprendizado por Edição

**Coordenador (Planner):** A1 (`rflex-architect`)  
**Data de Emissão:** 19 de setembro de 2026  
**Branch de Especificação:** `chatgpt/mis-0012-wave6-spec`  
**Baseline:** `0c7f14c41be816ca023d8347984665db60fbc265`  
**Status:** `ESPECIFICAÇÃO NORMATIVA INICIADA — IMPLEMENTAÇÃO E ATIVAÇÃO AINDA NÃO HOMOLOGADAS`  
**Modo de Despacho:** `MULTI-DOMAIN SEQUENTIAL`

---

## 0. Mandato e condição de partida

A MIS-0012 é a próxima missão canônica após a conclusão das Waves 1–5. O handoff AG-0011 encerrou a Wave 5 e deixou explicitamente a Wave 6 não iniciada, aguardando nova instrução formal.

Esta missão começa por reconciliação do estado real e por especificação. Nenhuma mudança de banco live, agendamento noturno ou promoção automática de aprendizado está autorizada apenas por este documento.

---

## 1. Baseline reconciliado

### 1.1 GitHub e CI

- [CONFIRMADO-CODIGO] `main` em `0c7f14c41be816ca023d8347984665db60fbc265`.
- [CONFIRMADO-CI] workflow `ci` do HEAD concluído com sucesso.
- [CONFIRMADO-CODIGO] não existe implementação identificável de cron, scheduler, replay ou consolidação noturna no tree atual.

### 1.2 Vercel

- [CONFIRMADO-RUNTIME] produção `app-reflex-02.vercel.app` está `READY` no mesmo SHA do baseline e responde HTTP 200.
- [CONFIRMADO-RUNTIME] o deployment atual não apresentou warnings/errors nos logs consultados durante a reconciliação.
- [CONFIRMADO-EXTERNAL] Vercel Cron suporta agendamento de rota de produção e autenticação por `Authorization: Bearer <CRON_SECRET>`.

### 1.3 Supabase live

Projeto: `xenapowdtfhdwcfthfrn`.

- [CONFIRMADO-RUNTIME] projeto `ACTIVE_HEALTHY`.
- [CONFIRMADO-RUNTIME] ledger `public._migrations`: 38 migrations.
- [CONFIRMADO-RUNTIME] `cerebro_autoral.propostas_atualizacao`: 13 registros, todos pendentes e oriundos de análises explícitas do corpus autoral; não há proposta live derivada de edição de reflexão no snapshot verificado.
- [CONFIRMADO-RUNTIME] `memory_events`: append-only com idempotency key, correlation/causation e estados epistêmicos.
- [CONFIRMADO-RUNTIME] extensões `pg_cron` e `pg_net` não estão habilitadas no snapshot verificado; apenas `vector` entre as extensões consultadas.
- [CONFIRMADO-RUNTIME] `processamento.execucoes` não deve ser reutilizada diretamente para replay: `versao_obra_id` é obrigatório e acopla essa tabela ao pipeline documental.

---

## 2. Capacidades que já existem e devem ser preservadas

A Wave 6 NÃO parte do zero.

1. [CONFIRMADO-CODIGO] versões de reflexão distinguem `origem_versao = ia | edicao_autor` e preservam `versao_base_id`.
2. [CONFIRMADO-CODIGO] `calcularDiffEdicaoAutor` produz diff estruturado da edição.
3. [CONFIRMADO-CODIGO] `analisador-edicao-autoral.ts`:
   - usa saída estruturada validada por Zod;
   - aceita zero propostas;
   - exige referências a alterações reais do diff;
   - rejeita dimensão inexistente;
   - rejeita candidato com confiança < 0,55;
   - limita a confiança de uma única edição a 0,75;
   - persiste apenas propostas pendentes, sem declarar autoria confirmada.
4. [CONFIRMADO-CODIGO] `painel-propostas-aprendizado.tsx` apresenta evidências, histórico e decisão humana.
5. [CONFIRMADO-CODIGO] `propostas_atualizacao` é a fila canônica já usada pelo Cérebro.
6. [CONFIRMADO-CODIGO] confirmação/rejeição passa por Server Action com validação de ownership e estado pendente.

---

## 3. Gaps verificados que a Wave 6 deve fechar

### G1 — Confirmação de proposta de edição não materializa o aprendizado

[CONFIRMADO-CODIGO] `gerarPropostasAprendizadoDaEdicao` grava o candidato em `dados_propostos.aprendizado`. Já `decidirPropostaAtualizacaoCerebro` materializa apenas `nova_caracteristica` quando existe `dados_propostos.caracteristica`.

Consequência: uma proposta derivada de edição pode ser marcada como `confirmada` sem criar a regra, característica ou metodologia correspondente.

**Gate:** confirmação deve produzir efeito material explícito e auditável para cada tipo suportado, ou falhar atomicamente sem alterar o estado da proposta.

### G2 — Decisão/materialização não é transacional

[CONFIRMADO-CODIGO] a implementação atual insere característica, regras e evidências em chamadas separadas e somente ao final atualiza a proposta.

Consequência: uma falha intermediária pode deixar materialização parcial.

**Gate:** mover a transição crítica para uma operação transacional no banco (RPC/função canônica), idempotente e owner-scoped.

### G3 — Não há consolidação multi-edição / anti-overfitting operacional

[CONFIRMADO-CODIGO] o analisador atual trabalha uma edição por vez. Não há mecanismo verificado que exija recorrência independente, diversidade de contexto ou agregação semântica antes de propor uma regra geral.

**Gate:** distinguir `sinal de edição` de `regra generalizável`; regra global não pode nascer silenciosamente de um único episódio.

### G4 — Não há replay incremental noturno

[CONFIRMADO-CODIGO/RUNTIME] não há runner de replay, scheduler ou job noturno ativo.

**Gate:** consolidar incrementalmente somente novidades desde o último watermark válido, sem reprocessar o acervo inteiro.

### G5 — Não há ledger de execução específico para consolidação

`processamento.execucoes` é documental e exige `versao_obra_id`.

**Gate:** criar um ledger mínimo de execução de consolidação com idempotência, trigger (`manual` / `scheduled`), watermark, budget, métricas, resultado e erro sanitizado.

### G6 — Ciclo de propostas não está integrado ao Event Ledger

[CONFIRMADO-CODIGO] a decisão atual em `propostas_atualizacao` não registra evento correspondente em `memory_events`.

**Gate:** proposta, confirmação, rejeição e materialização relevantes devem deixar evento append-only com `actor_type`, correlação, idempotência e estado epistêmico apropriado.

---

## 4. Invariantes não negociáveis

1. **Autoridade humana:** replay e IA só geram sinais/propostas; nunca ativam regra, característica ou metodologia sem decisão humana.
2. **Sem falsa autoria:** fonte externa ou inferência de máquina não pode se converter em crença autoral.
3. **Sem apagamento histórico:** contradição preserva ambas as evidências e registra temporalidade/contexto.
4. **Fail closed:** payload inválido, ownership ambíguo, ausência de evidência ou budget excedido encerra o item sem promover estado.
5. **Idempotência:** repetir o mesmo run ou a mesma confirmação não pode duplicar proposta, regra ou evento.
6. **Isolamento:** todas as operações são `usuario_id`-scoped e testadas contra cross-tenant.
7. **Budget explícito:** consolidação possui teto de itens/tokens/tempo por execução; o teto é configuração versionada, não constante escondida.
8. **Shadow first:** runner manual e observável precede qualquer cron de produção.
9. **Sem modelo hardcoded:** seleção de modelo continua centralizada no orquestrador/configuração canônica.
10. **Sem secretos em Git:** `CRON_SECRET` e credenciais permanecem apenas no provedor de ambiente.

---

## 5. Arquitetura alvo da Wave 6

```text
EDIÇÃO AUTORAL
   |
   v
DIFF ESTRUTURADO + SINAL VALIDADO
   |
   v
FILA/LEDGER DE SINAIS DE EDIÇÃO
   |
   |  replay incremental (manual primeiro)
   v
CONSOLIDADOR
   |- recorrência e diversidade de contexto
   |- contradições / sinergias
   |- escopo candidato: local / tipo / taxonomia / global
   |- budget + idempotência + watermark
   v
PROPOSTA ESTRUTURADA
   |
   v
DECISÃO HUMANA
   |
   v
RPC TRANSACIONAL DE MATERIALIZAÇÃO
   |- regra / característica / metodologia
   |- atualização da proposta
   |- memory_event append-only
   v
PERFIL ATIVO
```

O cron apenas dispara o mesmo runner já homologado manualmente. O scheduler não contém lógica cognitiva própria.

---

## 6. Task Packets sequenciais

### TP1 — Contratos canônicos e golden tests
**Owners:** A1 + A5  
**Escopo:**
- formalizar tipos/Zod para sinal de edição, candidato consolidado, escopo de aprendizado e resultado de run;
- congelar configuração de thresholds/budget em módulo versionado;
- adicionar golden cases para recorrência, contradição, sinal fraco e zero-proposal;
- preservar compatibilidade com propostas históricas.

**Done:** contratos compilam e testes demonstram fail-closed.

### TP2 — Data Engineering e atomicidade
**Owner:** A4  
**Migration planejada:** `0039_consolidacao_autoral_wave6.sql`

**Escopo mínimo:**
- ledger dedicado de execuções de consolidação, sem acoplamento a `versao_obra_id`;
- armazenamento normalizado ou vínculo verificável dos sinais de edição usados por uma proposta consolidada;
- constraints de idempotência/ownership;
- RPC transacional para confirmar/rejeitar e materializar propostas suportadas;
- integração append-only com `memory_events`;
- RLS/grants seguindo o padrão service-role-write + owner-read quando aplicável;
- rollback documentado.

**Done:** migration idempotente em ambiente de teste e nenhuma mutação parcial possível em caso de erro.

### TP3 — Motor de consolidação e replay incremental
**Owner:** A5  
**Escopo:**
- consumir apenas sinais ainda não consolidados ou posteriores ao watermark;
- agrupar recorrências semânticas sem transformar similaridade em autoria;
- detectar contradições e sinergias com regras/claims vigentes;
- produzir propostas com proveniência completa e escopo explícito;
- registrar execução, custo/budget e motivo de abstenção;
- nunca promover estado humano.

**Done:** runner manual determinístico e idempotente em shadow mode.

### TP4 — Aprendizado por edição end-to-end
**Owners:** A3 + A5  
**Escopo:**
- corrigir a lacuna de materialização das propostas de edição;
- apresentar ao autor evidências independentes usadas pela consolidação;
- permitir confirmar/rejeitar e, quando aplicável, delimitar/refinar escopo antes da ativação;
- manter histórico auditável.

**Done:** confirmação humana cria exatamente um efeito material canônico; rejeição não cria regra.

### TP5 — Scheduler de produção
**Owner:** A6  
**Estratégia preferida:** Vercel Cron sobre rota Next.js protegida por `CRON_SECRET`.

**Pré-condições obrigatórias:**
- TP1–TP4 verdes;
- runner manual homologado;
- rota cron idempotente e autenticada;
- timeout/budget compatíveis com limites de runtime;
- horário/cadência registrados como configuração operacional;
- nenhuma dependência em `pg_cron`/`pg_net` sem decisão explícita posterior.

**Done:** cron dispara o runner homologado e uma segunda execução do mesmo ciclo não duplica efeitos.

### TP6 — Auditoria independente A7
**Owner:** A7  
**Testes mínimos:**
- cross-tenant;
- replay repetido;
- corrida entre manual e cron;
- confirmação duplicada;
- falha no meio da materialização;
- uma única edição tentando virar regra global;
- contraevidência temporal;
- fonte externa tentando virar autoria;
- payload malformado/injeção indireta;
- budget exhaustion;
- spoof de cron sem `CRON_SECRET`;
- ledger imutável.

**Gates:** `REPLAY GATE`, `EDIT LEARNING GATE`, `ATOMIC MATERIALIZATION GATE`, `SCHEDULER SECURITY GATE`.

### TP7 — Continuidade e handoff
**Owner:** A9  
**Escopo:**
- reconciliar diff real, Supabase live, Vercel live e CI;
- atualizar `docs/STATUS_PROJETO.md` onde estiver stale;
- atualizar `OpenAI ChatGPT/CURRENT_STATE.md` e `CONTINUITY_LEDGER.md`;
- emitir `AG-0012.md` somente após os gates e a reconciliação final.

---

## 7. Ordem de ativação

1. Spec normativa.
2. Implementação local/branch.
3. Migration em ambiente controlado + testes.
4. Runner manual em shadow mode.
5. Materialização humana transacional.
6. Auditoria independente A7.
7. Cron de produção.
8. Reconciliação live e handoff A9.

**Stop condition atual:** este pacote autoriza a engenharia da MIS-0012 na branch da missão, mas NÃO autoriza merge na `main`, aplicação live da migration, habilitação do cron nem declaração de conclusão sem os gates correspondentes.
