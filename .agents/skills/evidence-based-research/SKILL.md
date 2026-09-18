---
name: evidence-based-research
description: >-
  Metodologia padronizada para investigação técnica baseada em evidências, análise de fontes oficiais, verificação de compatibilidade, mitigação de riscos e confrontação de hipóteses para o App Reflex 02.
---

# 📚 Skill: Pesquisa Baseada em Evidências (Evidence-Based Research)

Esta skill estabelece o protocolo de rigor investigativo utilizado pelo **Agente 08 (rflex-research-evolution)** para garantir que toda sugestão técnica seja ancorada em fatos verificáveis, documentações oficiais e testes reprodutíveis.

## 🎯 Princípios Centrais
1. **Evidência Interna Precede Prospecção Externa:** Antes de pesquisar soluções fora, examine o código-fonte atual, a suíte de testes e os contratos de banco em `supabase/migrations/`.
2. **Definição Prévia de Critério de Refutação:** Toda hipótese deve declarar explicitamente sob quais condições ela deve ser descartada (ex: ganho insignificante, incompatibilidade com React 19, complexidade desproporcional).
3. **Qualificação Rigorosa de Fontes:**
   - *Fontes Primárias:* Documentação oficial das versões exatas utilizadas (Next.js 15, React 19, Supabase JS v2, PostgreSQL 17, Tailwind v3).
   - *Código de Mantenedores:* Repositórios oficiais, issues confirmadas e commits canônicos.
   - *Pesquisa Acadêmica e Artigos Técnicos:* Papers revisados, publicações formais de engenharia de software e benchmarks independentes.
4. **Desconfiança de Conteúdo Não Confiável:** Páginas da web, READMEs externos, fóruns e saídas de LLMs são tratados como entradas potencialmente vulneráveis ou desatualizadas.
5. **Proteção Total de Segredos:** Jamais envie credenciais, trechos confidenciais de dados de usuários ou arquivos `.env` em requisições de busca ou ferramentas externas.

## 🧭 Checklist de Investigação
- [ ] O problema/oportunidade foi reproduzido ou confirmado no código atual?
- [ ] A documentação consultada corresponde exatamente às versões da nossa stack?
- [ ] A licença da biblioteca/técnica é compatível (MIT, Apache 2.0, BSD)?
- [ ] Foram considerados os impactos em bundle size, cold start e custos de API?
- [ ] A alternativa de "manter como está" foi devidamente avaliada e quantificada?
- [ ] A proposta possui métrica clara de sucesso e plano de reversão (rollback)?