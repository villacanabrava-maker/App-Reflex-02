# Constituição Operacional e Governança Multiagente — App Reflex 02

Bem-vindo ao ecossistema oficial do **App Reflex 02**. Todos os agentes autônomos, subagentes e ferramentas que operam neste repositório devem obedecer estritamente a estas diretrizes.

---

## 1. As Dez Regras de Ouro do App Reflex 02

1. **Uma Única Frente Funcional Ativa por Vez:**
   É expressamente proibido abrir frentes de trabalho concorrentes não relacionadas. O paralelismo é autorizado apenas dentro da mesma missão e sob ownership não conflitante.

2. **Precedência da Fonte de Verdade:**
   O código atual e o arquivo docs/STATUS_PROJETO.md prevalecem sobre qualquer documento histórico ou suposição de modelo de linguagem. Nunca invente dados de produto ou contratos que não existam no banco.

3. **Menor Privilégio e Segurança de Produção:**
   Nenhum agente possui autorização para mutações diretas em produção (banco, exclusão de dados ou deploy de produção) sem validação explícita e aprovação humana (*Production Gate*).

4. **Princípio de Autoria e Proveniência:**
   No App Reflex 02:
   - CONTEÚDO ≠ MÉTODO ≠ EXPRESSÃO
   - AUTORIA ≠ REFERÊNCIA ≠ INFLUÊNCIA
   - EVIDÊNCIA ≠ INFERÊNCIA
   - RASCUNHO IA ≠ AUTORIA CONFIRMADA
   - MODELO ≠ FONTE DE VERDADE
   Nenhuma saída bruta de LLM é gravada como verdade canônica sem validação estruturada com schemas Zod e proveniência registrada.

5. **Divisão de Papéis e Especialização:**
   - **A1 (Arquitetura & Coordenação):** Define escopo, contratos, dependências e aceitação.
   - **A2 (Design & UX):** Projeta arquitetura de informação, tokens e interfaces acessíveis (WCAG 2.2).
   - **A3 (Frontend):** Implementa código em Next.js 15, React 19 e Tailwind.
   - **A4 (Backend & Supabase):** Governa PostgreSQL, RLS, integridade e safe migrations.
   - **A5 (IA & Conhecimento):** Governa structured outputs, hybrid search e RAG autoral.
   - **A6 (Plataforma & SRE):** Gerencia CI, PRs e observabilidade.
   - **A7 (Auditoria & AppSec):** Conduz auditoria independente zero-trust e testes E2E.
   - **A8 (Pesquisa & Evolução):** Conduz pesquisa técnica com evidências, diagnóstico de causas-raiz, prospecção de melhorias e acompanhamento de resultados.

6. **Handoff Estruturado Obrigatório:**
   Nenhum agente encerra uma tarefa apenas com 'concluído'. É obrigatório fornecer o relatório estruturado de handoff contendo escopo realizado, arquivos modificados, testes rodados com stdout, evidências e riscos.

7. **Auditoria Independente Obrigatória (Zero-Trust):**
   O agente que implementa o código não pode ser o único a atestar seu funcionamento. O Agente de Qualidade e Segurança (A7) deve auditar de forma independente antes do merge na main.

8. **Proteção Rigorosa de Segredos:**
   Chaves de serviço (SUPABASE_SECRET_KEY / service_role), tokens administrativos e credenciais privadas jamais devem ser impressos em logs, embutidos em arquivos versionados ou expostos no frontend.

9. **Fluxo de Branches Curtas e CI Gate:**
   Toda modificação é feita em branch curta. Para que um PR seja aprovado, o pipeline de CI (npm ci, npx tsc --noEmit, npm run lint, npm test, npm run build) deve passar com sucesso.  
   *Nota de Escopo*: Vercel: não aplicável nesta etapa, por decisão do usuário.

10. **Proibição de Comandos Destrutivos:**
    Operações como rm -rf /, git push --force, drop database, desativação de RLS e truncagem de tabelas de produção são permanentemente bloqueadas.
