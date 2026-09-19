# Auditoria da Taxonomia e Arquitetura de Retrieval — App Reflex 02

**Data:** 18 de setembro de 2026  
**Líder:** A5 (rflex-ai-knowledge) & A8 (rflex-research-evolution)  
**Revisão:** A1 (rflex-architect) & A7 (rflex-qa-security)  

---

## 1. Diagnóstico do Estado Atual da Taxonomia

A Taxonomia do App Reflex 02 possui uma infraestrutura de código robusta implementada em:
- `src/dominios/taxonomia/motor-taxonomico.ts`
- `src/dominios/taxonomia/aplicador-taxonomia.ts`
- `src/dominios/taxonomia/gerador-relacoes.ts`

### Por que a Taxonomia estava com 0 conceitos no Supabase?
A auditoria forense do banco comprovou a causa exata:
- A migration `0026_motor_taxonomia_automatica.sql` não havia sido executada no novo Supabase.
- Como resultado, as tabelas essenciais `taxonomia.analises` e `taxonomia.conceitos_reflexoes` não existiam materialmente no banco.
- Toda tentativa de execução do `aplicador-taxonomia.ts` falhava ao consultar a tabela inexistente `taxonomia.analises`, abortando silenciosamente a persistência dos conceitos extraídos.

**Status pós-MIS-0003:** Com a aplicação da migration 0026 e a validação das tabelas e RLS, a fundação de dados está 100% desbloqueada para a Taxonomia operar.

---

## 2. Conceito de Enriquecimento Taxonômico (Taxonomic Enrichment)

Na Arquitetura V2, a Taxonomia não é apenas uma lista estática de tags, mas um grafo semântico vivo ancorado no texto original:

### Camadas de Enriquecimento por Fragmento
Cada fragmento de conhecimento deve carregar metadados estruturados:
1. **Conceitos Formais:** Conceitos canônicos com código (`codigo`), definição e termo preferencial.
2. **Aliases e Sinônimos:** Variações léxicas mapeadas que convergem para o conceito raiz.
3. **Relações Hierárquicas e Laterais:** Tipos de relação (`hiperonimo`, `hiponimo`, `antagonista`, `complementar`).
4. **Dimensões do Pensamento:** Vínculo com as 18 dimensões metodológicas do Cérebro Autoral.
5. **Proveniência Indivisível:** Citação literal, número da página, ID da obra e autor.

### Proteção Contra Inflação Taxonômica
Para evitar que a IA converta toda palavra relevante em um "novo conceito", institui-se:
- **Limiar Mínimo de Confiança:** Confiança >= 0.80 para propostas automáticas.
- **Deduplicação Semântica:** Antes de propor novo conceito, o motor consulta conceitos ativos por embeddings e distância trigram.
- **Revisão Humana de Estados:** Conceitos propostos entram em estado `revisao` e só se tornam ativos no grafo após confirmação do autor.

---

## 3. Auditoria do Retrieval Atual e Proposta Híbrida V2

### Retrieval Atual
O sistema atual utiliza primariamente:
- Busca textual por títulos de obras e palavras-chave simples;
- Busca vetorial via `pgvector` (`text-embedding-3-small`, 1536 dimensões) calculando similaridade por cosseno (`<=>`).

### Lacunas Observadas no Retrieval Atual
1. **Falta de Sensibilidade Contextual:** A busca vetorial pura frequentemente recupera fragmentos que usam palavras similares mas tratam de assuntos completamente distintos.
2. **Desconexão com o Cérebro:** O retrieval não filtrava se o fragmento pertencia ao Núcleo Autoral ou a Influências Externas.
3. **Ausência de Re-ranking:** Fragmentos recuperados eram enviados diretamente ao LLM sem ponderação contextual da intenção da reflexão.

### Proposta de Retrieval Híbrido Multidimensional V2
O novo motor de busca cognitiva combinará 5 camadas:
1. **Busca Lexical (FTS PostgreSQL com dicionário em português):** Recuperação exata de termos e nomes próprios.
2. **Busca Semântica Densa (Vetor pgvector):** Captura de nuances temáticas.
3. **Filtro Estrutural de Taxonomia:** Priorização de fragmentos que compartilham os mesmos nós conceituais no grafo.
4. **Priorização Autoral:** Ponderação explícita: memórias do autor possuem peso `1.5x` sobre fontes externas.
5. **Reranking Contextual:** Reordenamento final considerando o plano argumentativo da reflexão antes da redação.
