# Golden Dataset V4 — Plano para Constituição Cognitiva V1

**Status:** proposta para revisão R6  
**Objetivo:** fornecer release gates para Document Structure V2, Evidence Core, Claims, RCMO, métodos e projeções autorais.

## 1. Princípio

O dataset deve testar **erros que o sistema precisa evitar**, não apenas casos felizes. Cada família inclui positivos, negativos, ambíguos e adversariais quando aplicável.

Nenhuma migration/reprocessamento da nova arquitetura deve ser considerada pronta para produção sem um runner reprodutível e fixtures versionadas.

## 2. Unidade de caso

Cada caso deve declarar:
- `case_id`;
- família;
- source fixture/version/hash;
- expected anchors;
- expected claims;
- allowed/forbidden states;
- method version;
- expected RCMO ou abstention;
- allowed use;
- authorial attribution expectation;
- adversarial flags;
- evaluator assertions.

## 3. Famílias

### F1 — Anchoring exact
Span, quote, offset e hash consistentes.

### F2 — Re-anchoring
Mudança de whitespace/markup não deve transformar evidência em outra passagem.

### F3 — Orphan detection
Alteração material que remove o trecho deve marcar âncora como não resolvida.

### F4 — Atomic claims
Claim deve conter uma proposição verificável; compostos devem ser divididos ou rejeitados.

### F5 — Entailment
Claim extraído precisa ser sustentado pelo span; implicação fraca/ambígua abstém.

### F6 — Counterevidence
Síntese deve preservar oposição material e não colapsar conflito em falsa unanimidade.

### F7 — Source role
Fonte externa não pode gerar atribuição autoral sem decisão humana adequada.

### F8 — MILR
Inferência nunca é recuperada como memória confirmada sem transição permitida.

### F9 — AMR
Frases do tipo "você acredita/defende/prefere" exigem âncora autoral adequada.

### F10 — Retrieval epistemic isolation
Item top-1 relevante, porém externo/inferido, não pode ganhar autoridade pela posição no ranking.

### F11 — No evidence abstention
Pergunta sem suporte retorna categoria de abstention.

### F12 — Ambiguous scope abstention
Duas interpretações razoáveis e conflitantes exigem clarificação/abstention.

### F13 — Method versioning
Mesmos inputs em versões metodológicas diferentes preservam lineage e não sobrescrevem execução anterior.

### F14 — Supersession/replay
RCMO antigo pode ser superseded sem apagar evidência, execução ou decisão anterior.

### F15 — Prompt injection in source
Texto da obra contendo instruções ao modelo deve permanecer conteúdo não executável.

### F16 — Tenant isolation
Nenhuma evidência/claim/RCMO de outro usuário pode aparecer em retrieval, lineage ou evaluator.

## 4. Métricas

Obrigatórias:
- Anchor Resolution Precision;
- Anchor Orphan Detection Recall;
- Claim Atomicity Error Rate;
- Unsupported Claim Rate;
- Counterevidence Preservation Rate;
- MILR;
- AMR;
- Abstention Precision;
- Abstention Recall em casos não respondíveis;
- Retrieval Evidence Recall;
- Forbidden Use Rate;
- Tenant Leakage Rate.

Gates críticos:
- MILR gate = 0;
- AMR gate = 0;
- Tenant Leakage Rate = 0;
- Forbidden Use Rate = 0 em famílias críticas;
- prompt-injection execution = 0.

Demais thresholds devem ser calibrados em benchmark real; não inventar percentuais sem corpus medido.

## 5. Estratificação

Fixtures devem cobrir:
- obra autoral;
- fonte externa;
- reflexão autoral;
- texto misto com citação externa;
- contradição temporal;
- edição de source version;
- português com anáfora;
- ambiguidade sintática;
- negação;
- ironia/citação indireta;
- textos longos com evidência distante;
- injection adversarial.

## 6. Runner

O runner futuro deve:
1. carregar fixtures imutáveis;
2. executar versão explícita do método;
3. persistir/emitir Evidence;
4. calcular métricas por família;
5. mostrar casos falhos;
6. impedir média global de ocultar falha crítica;
7. produzir artifact versionado no CI.

## 7. Golden vs live

Golden Dataset é determinístico e versionado.  
Amostragem live é complementar e nunca substitui o release gate.

## 8. Aprovação

Antes de promover um novo método/prompt/modelo:
- suite V4 verde;
- R6 revisa famílias críticas;
- diferenças contra versão anterior são registradas;
- regressões aceitas exigem decisão humana explícita documentada.
