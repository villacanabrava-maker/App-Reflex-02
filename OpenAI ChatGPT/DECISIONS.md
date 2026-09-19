# Decisões Vigentes

## Autoridade

O usuário é autoridade final de produto e autoria. IA propõe; usuário decide.

## Cérebro Autoral

1. Obra autoral processada entra como fonte/corpus, não como crença automática.
2. O usuário decide quais obras autorais ficam ativas no corpus do Cérebro.
3. Para cada análise de dimensão, o usuário escolhe explicitamente o escopo:
   - livro inteiro;
   - capítulos/seções;
   - fragmentos específicos.
4. A IA não deve selecionar silenciosamente um subconjunto.
5. Características geradas entram como propostas pendentes.
6. A proposta deve exibir livro, capítulo, fragmento e trecho de sustentação.
7. Somente confirmação humana materializa característica/regra ativa.
8. Desativar uma obra do corpus não deve apagar histórico/provenance.

## Proveniência

Toda característica autoral precisa responder:
- de qual obra veio;
- de qual recorte;
- quais fragmentos sustentam;
- quais trechos literais;
- qual dimensão estava sendo analisada;
- quando e por quem foi confirmada.

## Deployment

Produção é autorizada e está ativa na Vercel. Restrições antigas que diziam “Vercel fora de escopo” pertencem a fases anteriores e não devem ser aplicadas cegamente.

## Continuidade

Esta pasta é o mecanismo de continuidade OpenAI. Novas sessões devem atualizá-la apenas com fatos úteis e verificados.

## Operação OpenAI / Codex

1. `OpenAI ChatGPT/` é a camada persistente de continuidade e playbooks OpenAI do projeto.
2. `.codex/agents/` fornece papéis O1–O9 nativos quando o cliente Codex suporta subagentes de projeto.
3. Skills guardam workflows reutilizáveis; fatos de estado ficam em `CURRENT_STATE.md` e decisões humanas em `DECISIONS.md`.
4. Não persistir transcrições integrais, segredos ou raciocínio privado; persistir apenas contexto útil, decisões, evidências e links.
5. Modelos não são fixados nos agentes do projeto; os papéis herdam a melhor configuração disponível na sessão, salvo decisão técnica futura explícita.
