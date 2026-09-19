# Índice da Documentação — App Reflex 02

**Objetivo:** permitir que qualquer desenvolvedor ou agente abra o repositório e saiba rapidamente qual documento consultar, sem confundir estado atual, histórico e instruções auxiliares.

---

## Ordem de Confiança (Precedência da Fonte da Verdade)

Quando houver divergência, adote estritamente esta ordem:

1. Estado real de `main` no repositório GitHub (`villacanabrava-maker/App-Reflex-02`);
2. Projeto Supabase canônico (`xenapowdtfhdwcfthfrn`);
3. `docs/STATUS_PROJETO.md` e `docs/coordenacao/ESTADO_COMPARTILHADO.md`;
4. Laudo de auditoria `docs/coordenacao/AUDITORIA_DOCUMENTAL_APP01_APP02.md`;
5. Documentação histórica e relatórios de etapas anteriores.

*Nota de Escopo*: Hospedagem Vercel permanece **estritamente adiada** e fora do escopo desta etapa.

---

## Documentos Operacionais Vigentes (Canônicos)

| Documento | Papel Canônico |
|---|---|
| `docs/STATUS_PROJETO.md` | Estado canônico consolidado do produto, banco de dados, stack e integrações. |
| `docs/coordenacao/README.md` | Protocolo da governança triangular (Usuário ↔ ChatGPT ↔ Antigravity). |
| `docs/coordenacao/ESTADO_COMPARTILHADO.md` | Quadro vivo e auditado de infraestrutura, agentes e bloqueios. |
| `docs/coordenacao/INDICE_MISSOES.md` | Rastreabilidade de missões executadas, ativas e planejadas. |
| `docs/coordenacao/AUDITORIA_DOCUMENTAL_APP01_APP02.md` | Classificação formal do acervo herdado do App 01. |
| `AGENTS.md` | Constituição Operacional Multiagente (Regras de Ouro dos 9 Agentes). |
| `README.md` | Documentação técnica mestre do repositório (arquitetura, testes, instalação). |
| `ESCOPO_DO_APLICATIVO.md` | Tese funcional de produto, Memória Reflexiva e Cérebro Autoral. |
| `docs/MAPA_REPOSITORIO.md` | Cartografia detalhada de arquivos, componentes, libs e migrations. |
| `docs/supabase/` | Acervo da auditoria forense, paridade de migrations, RLS e reconciliação do banco. |
| `docs/ia/` | Acervo da arquitetura cognitiva V2, mapa cognitivo, auditorias e plano de Evals. |
| `docs/pesquisa-evolucao/README.md` | Diretório de relatórios técnicos e propostas do Agente 08. |
| `GEMINI.md` | Diretrizes auxiliares para agentes de IA no ambiente Antigravity. |

---

## Documentos Históricos de Fases Anteriores

| Documento | Classificação | Observação |
|---|---|---|
| `docs/RELATORIO_ETAPA_2_ORGANIZACAO.md` | Histórico | Relatório de organização de diretórios da baseline da etapa 2. |
| `docs/RELATORIO_ENCERRAMENTO_ETAPA_2026-09-18.md` | Histórico | Fechamento da fase pré-migração do App 01. |
| `docs/PLANO_ACAO_RELATO_NAVEGACAO.md` | Histórico | Checklist de ações de telas já absorvidas ou encerradas. |

Esses arquivos são preservados para fins de auditoria e proveniência; não representam demandas em aberto.

---

## Diretórios Operacionais Auxiliares

- `.agents/`: Especificações dos 9 agentes (`agents/`), skills modulares (`skills/`) e hooks de segurança (`hooks.json`).
- `docs/coordenacao/chatgpt-para-antigravity/`: Prompts mestres gerados pelo ChatGPT (`GPT-XXXX.md`).
- `docs/coordenacao/antigravity-para-chatgpt/`: Relatórios formais de handoff do Antigravity (`AG-XXXX.md`).
- `supabase/migrations/`: Migrations SQL idempotentes aplicadas no Supabase canônico.
- `tests/`: Suítes automatizadas de testes (domínio, segurança, guardrails).
- `.github/workflows/ci.yml`: Pipeline de integração contínua (CI gate sem deploy).

---

## Diretrizes para Novos Documentos

1. Consulte se o tópico já está coberto por um documento canônico ativo.
2. Prefira enriquecer documentos vivos existentes a proliferar arquivos duplicados.
3. Todo relatório de conclusão de missão deve ser emitido pelo A9 em `docs/coordenacao/antigravity-para-chatgpt/AG-XXXX.md`.
4. Jamais exponha dados sensíveis, tokens de autenticação ou credenciais privadas.
