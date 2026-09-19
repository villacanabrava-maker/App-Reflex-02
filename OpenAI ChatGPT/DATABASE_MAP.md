# Mapa Supabase — Snapshot Live

**Project ref:** `xenapowdtfhdwcfthfrn`  
**Snapshot:** 2026-09-19

## Schemas

### biblioteca
- `obras`
- `versoes_obras`
- `fontes_obras`

Responsável por identidade do acervo, versões imutáveis, natureza autoral/externa e participação no Cérebro.

### processamento
- `unidades_conhecimento`
- `documentos_processados`
- `secoes`
- `fragmentos`
- `sinteses`
- `vetores`
- `elementos`
- `evidencias`
- `execucoes`
- `etapas_execucao`

Responsável por materialização, chunking, embeddings, sínteses, evidências e observabilidade.

### taxonomia
- `conceitos`
- `termos`
- `relacoes`
- `conceitos_fragmentos`
- `conceitos_reflexoes`
- `analises`
- `skos_conceitos`
- `skos_relacoes`
- `claim_conceitos`

### cerebro_autoral
- `dimensoes`
- `caracteristicas`
- `regras`
- `versoes_cerebro`
- `propostas_atualizacao`
- `metodologias`
- `etapas_metodologia`
- `claims`
- `claim_provenance`
- `memory_events`

### reflexoes
- `entradas`
- `fontes_entrada`
- `contextos`
- `planos_reflexao`
- `versoes_reflexao`
- `citacoes_evidencias`
- `citacoes_verificadas`
- `revisoes_autor`
- `dossies_snapshots`

### auditoria
- `relatorios_auditoria`
- `execucoes_ia`
- `relatorios_auditoria_v3_1`

### sistema
- `usuarios`
- `modelos_ia`
- `prompts`
- `versoes_prompts`
- `versoes_pipeline`
- `configuracoes_usuario`
- `perfis_embedding`

## RPCs relevantes

- `public.buscar_fragmentos_hibrido`
- `public.buscar_multi_sinal_v3_1`
- `public.cadastrar_obra_com_versao`
- `public.curar_conceito_skos_humano`
- `public.curar_vinculo_claim_conceito_humano`
- `public.propor_conceito_skos_sistema`
- `public.propor_vinculo_claim_conceito_sistema`
- `cerebro_autoral.transicionar_estado_claim*`
- `reflexoes.persistir_dossie_snapshot`
- `reflexoes.incorporar_reflexao_como_obra`
- `auditoria.registrar_relatorio_auditoria_v3_1`

## Buckets

- `originais-biblioteca` — privado — 50 MB
- `fontes-reflexoes` — privado — 50 MB

## Regras

1. Consultar schema live antes de escrever SQL.
2. Não inferir colunas pela memória.
3. Não criar policy genérica só para eliminar lint.
4. Não aplicar migration sem reconciliar histórico.
5. Após mudanças: advisors + query de verificação.
6. `service_role` somente no servidor.

## Migration history

O repo possui 38 migrations numeradas. O histórico MCP do Supabase contém migrations timestampadas e o projeto também mantém `public._migrations`. Essa divergência histórica deve ser reconciliada antes de qualquer operação automatizada de push/pull.
