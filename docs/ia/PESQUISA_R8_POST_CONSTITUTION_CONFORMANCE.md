# PESQUISA R8 — HARDENING DE CONTINUIDADE, CONFORMANCE DE ANCHORS E SUPPLY-CHAIN
### Relatório de Investigação de Engenharia de Conhecimento e Segurança de Plataforma
**Missão:** `R8-2026-09-20-POST-CONSTITUTION-RESEARCH` (`TP-R8-POST-CONSTITUTION-01`)  
**Agente Responsável:** R8 (`rflex-research-evolution`)  
**Baseline Auditado:** `9845a1e0d6fb9ea783b0b60c2cfd6fc61d1213ea` (`main`)  
**Status:** Concluído / Propostas Normativas para R1, R2, R7 e R9  
**Data:** 20 de setembro de 2026  

---

## 1. NATUREZA DA MISSÃO E SUMÁRIO EXECUTIVO

Em cumprimento ao **Mandato Soberano de Pesquisa e Evolução (CONSTITUTION.md, Seção 6)** outorgado pelo Usuário, o agente **R8 (`rflex-research-evolution`)** foi ativado para realizar uma investigação exaustiva na literatura técnica, padrões W3C, melhores práticas de segurança de supply-chain e ecossistemas JavaScript/PostgreSQL.

O objetivo é fundamentar empiricamente os contratos do **TP-RCMO-01** (recém-mesclado na `main` via PR #22) e fornecer as especificações exatas de conversão e proteção para os próximos Task Packets (**TP-RCMO-02**, **TP-RCMO-03** e **TP-RCMO-04**).

### Principais Conclusões da Pesquisa:
1. **W3C Web Annotation Conformance:** O padrão normativo do W3C para `TextPositionSelector` exige contagem por **Unicode code points** (posição de caractere abstrato), enquanto JavaScript manipula nativamente **UTF-16 code units** (16 bits) e PostgreSQL calcula `char_length` em code points e `octet_length` em bytes. Sem um algoritmo canônico de tradução, caracteres fora do BMP (Basic Multilingual Plane, $U+10000$ a $U+10FFFF$, como emojis e caracteres especiais) causam drift silencioso de seleção de texto.
2. **Normalização Unicode Determinística:** O padrão `NFC` (Canonical Composition) deve ser adotado obrigatoriamente no momento da ingestão da `Source Version`, antes do cálculo do SHA-256 e dos seletores de evidência.
3. **Imunidade a Snapshots Stale em Concorrência Tripartite:** Erradica-se a auto-referência de HEAD em arquivos de documentação estática, consolidando o princípio de `baseline_sha` imutável com verificação dinâmica de HEAD no bootstrap via GitHub CLI / Git.
4. **Supply-Chain Hardening (OpenSSF Scorecards / SLSA):** Confirmação da pinagem por commit SHA completo de 40 dígitos em GitHub Actions como padrão inegociável, acompanhado de automação via Dependabot.

---

## 2. EIXO 1: CONFORMANCE DE EVIDENCE ANCHORS (OFFSETS & NORMALIZAÇÃO)

### 2.1. O Conflito Tridimensional de Offsets

A integridade atômica da proveniência exige que um claim aponte para um trecho exato de texto. Contudo, diferentes camadas do sistema mensuram texto sob unidades distintas:

| Ambiente / Tecnologia | Função de Medição | Unidade Real | Comportamento com Caracteres Astrais (ex: 🧠, 📖, 🏛️) |
| :--- | :--- | :---: | :---: |
| **W3C Web Annotation** | `TextPositionSelector` | `unicode_code_point` | 1 caractere = 1 unidade de incremento. |
| **JavaScript / Node.js** | `str.length`, `str.slice(start, end)` | `utf16_code_unit` | Caractere astral ocupa 2 unidades (Surrogate Pair: `\uD83E\uDDE0`). |
| **PostgreSQL 17** | `char_length(text)`, `substring()` | `unicode_code_point` | 1 caractere = 1 unidade. |
| **PostgreSQL 17** | `octet_length(text)` | `byte` (UTF-8) | Caractere astral ocupa 4 bytes; acentuados ocupam 2 bytes. |

> [!WARNING]
> **Risco de Corrupção Semântica Identificado:**
> Se o extrator em Node.js registrar offsets usando `str.indexOf()` ou `regex.exec().index` (que são offsets UTF-16) e o banco ou frontend tentar resolver via `substring()` do SQL ou manipulação por code points, haverá um descompasso progressivo a cada caractere fora do BMP presente no texto, fatiando palavras ao meio ou quebrando surrogate pairs.

### 2.2. Algoritmo Canônico de Conversão Bidirecional

O R8 pesquisou e desenvolveu o algoritmo determinístico de referência para o **TP-RCMO-04**, com complexidade $O(N)$ e sem dependências externas de pacotes npm:

```typescript
/**
 * Converte um offset de Unicode Code Point para o índice correspondente em UTF-16 Code Units (JavaScript string index).
 */
export function codePointToUtf16Index(text: string, codePointIndex: number): number {
  if (codePointIndex <= 0) return 0;
  let cpCount = 0;
  let u16Index = 0;
  const len = text.length;

  while (u16Index < len && cpCount < codePointIndex) {
    const code = text.codePointAt(u16Index)!;
    u16Index += code > 0xFFFF ? 2 : 1;
    cpCount++;
  }

  return u16Index;
}

/**
 * Converte um índice UTF-16 (JavaScript string index) para o offset correspondente em Unicode Code Points.
 */
export function utf16ToCodePointIndex(text: string, utf16Index: number): number {
  if (utf16Index <= 0) return 0;
  let cpCount = 0;
  let u16Cursor = 0;
  const target = Math.min(utf16Index, text.length);

  while (u16Cursor < target) {
    const code = text.codePointAt(u16Cursor)!;
    u16Cursor += code > 0xFFFF ? 2 : 1;
    cpCount++;
  }

  return cpCount;
}

/**
 * Extrai o trecho exato de texto garantindo conformidade com a unidade declarada no Evidence Anchor.
 */
export function extractAnchorSlice(
  text: string,
  start: number,
  end: number,
  unit: "unicode_code_point" | "utf16_code_unit"
): string {
  if (unit === "utf16_code_unit") {
    return text.slice(start, end);
  }
  
  const u16Start = codePointToUtf16Index(text, start);
  const u16End = codePointToUtf16Index(text, end);
  return text.slice(u16Start, u16End);
}
```

### 2.3. Normalização Unicode Canônica (`NFC`)

Conforme a especificação do **W3C Character Model for the World Wide Web: String Matching and Searching**:
- Diferentes sistemas operacionais ou softwares de OCR gravam caracteres acentuados em formas distintas:
  - Forma Composta (`NFC`): `é` é representado pelo caractere atômico `\u00E9` (1 code point, 1 code unit UTF-16, 2 bytes UTF-8).
  - Forma Decomposta (`NFD`): `é` é representado por `e` (`\u0065`) seguido do caractere combinante acento agudo `\u0301` (2 code points, 2 code units UTF-16, 3 bytes UTF-8).
- **Diretriz Normativa para TP-RCMO-03/04:**
  Toda `Source Version` deve passar por `text.normalize("NFC")` no momento exato de criação da versão, antes de qualquer hashing ou ancoragem. O campo `normalization_profile` da entidade `source_version` deve ser preenchido explicitamente como `"NFC"`.

---

## 3. EIXO 2: HARDENING DE CONTINUIDADE EM ARQUITETURA TRIPARTITE

### 3.1. A Resolução do Problema de Snapshots Stale

A operação simultânea de múltiplos runtimes (**Antigravity Local ↔ Claude Code Cloud ↔ ChatGPT/Codex**) expôs um desafio clássico de sistemas distribuídos:
* Se um agente atualiza `CURRENT_STATE.md` fixando o HEAD com o hash do commit atual, esse próprio commit gera um novo SHA de git, tornando o documento stale no exato instante em que é salvo.
* Se um PR concorrente é aprovado na `main` enquanto outro agente redige um handoff, o HEAD registrado fica obsoleto.

### 3.2. Mecanismo de Prevenção Adotado (Imutabilidade de Baseline)

1. **Separação entre Baseline e HEAD Vivo:**
   * Documentos de estado e task packets registram `baseline_sha` (o ancestral imutável a partir do qual a tarefa foi gerada).
   * O HEAD vivo **nunca é escrito como invariante estática** em arquivos versionados; ele é verificado dinamicamente no boot pelo comando:
     ```bash
     git rev-parse HEAD
     ```
2. **Monotonicidade Estrita de Handoffs:**
   * O fluxo `reflex-agent-handoff.yml` valida que cada salto (`hop`) satisfaz a relação de ordem estrita: $\text{hop}_{t} = \text{hop}_{t-1} + 1$.
   * A verificação de monotonicidade bloqueia qualquer processamento fora de ordem ou reexecução de saltos antigos.

---

## 4. EIXO 3: SEGURANÇA DE SUPPLY-CHAIN DE AUTOMAÇÃO

### 4.1. Pinagem por SHA de 40 Caracteres (SLSA / OpenSSF)

A pesquisa confirmou que referências de tags no GitHub Actions (como `@v4` ou `@v7`) são **ponteiros mutáveis** sujeitos a ataques de substituição caso uma conta de mantenedor de action seja comprometida.

O hardening implementado no commit `cc2cfa2` e consolidado no `Agent OS V3` atinge a conformidade com as diretrizes do **OpenSSF Scorecard (Pinned-Dependencies)**:
- Todas as actions oficiais de terceiros e do GitHub estão pinadas por SHA completo de 40 caracteres hexadecimais:
  - `actions/checkout@fbc6f3992d24b796d5a048ff273f7fcc4a7b6c09`
  - `actions/setup-node@820762786026740c76f36085b0efc47a31fe5020`
  - `actions/github-script@f28e40c7f34bde8b3046d885e986cb6290c5673b`
  - `openai/codex-action@86365089eb2b84e0a8fb0717b304f8bdcb13b20e`
- A versão semântica é mantida como comentário final na linha para auditabilidade humana e compatibilidade com o Dependabot.

### 4.2. Vínculo de Sessão para Disparos Cloud

A proteção de comentários de handoff via GitHub Actions introduzida em `reflex-agent-handoff.yml`:
* Exige que dispatches de `claude[bot]` comprovem a existência de um comentário prévio do workflow contendo a tag `[REFLEX-CLAUDE-DISPATCHED]` para a mesma `mission_id` e o `hop - 1`.
* Recomenda-se para o futuro a inclusão de um HMAC-SHA256 ou nonce efêmero calculado com segredo de repositório caso seja necessário maior nível de isolamento entre sessões de branch.

---

## 5. RECOMENDAÇÕES PRIORIZADAS PARA OS PAPÉIS R1, R2, R7 E R9

O R8 submete ao colegiado tripartite as seguintes recomendações arquiteturais estruturadas:

| ID | Papel Destinatário | Escopo | Recomendação Normativa | Prioridade |
| :--- | :---: | :--- | :--- | :---: |
| **REC-01** | **R2 / R5** | `TP-RCMO-04` (Evidence Core) | Adotar `unicode_code_point` como a unidade padrão do `offset_unit` nas âncoras de evidência canônicas, implementando a função `extractAnchorSlice` para interoperabilidade com o runtime Node.js. | **ALTA** |
| **REC-02** | **R2 / R3** | `TP-RCMO-03` (Document Structure) | Aplicar `String.prototype.normalize("NFC")` obrigatoriamente no pipeline de ingestão antes de calcular o hash SHA-256 e gerar seções estruturais. | **ALTA** |
| **REC-03** | **R7 / SRE** | GitHub Actions | Configurar `dependabot.yml` para monitorar atualizações de GitHub Actions preservando a pinagem por SHA e atualizando o comentário com a nova tag. | **MÉDIA** |
| **REC-04** | **R9 / Continuity** | Tri-Runtime Handoffs | Manter a regra de consultar o HEAD dinamicamente no boot e rejeitar a inclusão de auto-hashes estáticos em documentações de governança. | **ALTA** |
| **REC-05** | **R6 / QA** | Golden Dataset CBR | Adicionar à família `CBR-PROVENANCE` casos de teste específicos com strings contendo caracteres acentuados mistos (NFC vs NFD) e caracteres do plano astral (emojis) para validar que não ocorra drift de seleção. | **ALTA** |

---

## 6. CONCLUSÃO DA MISSÃO R8

A missão de pesquisa **`TP-R8-POST-CONSTITUTION-01`** atendeu integralmente aos seus objetivos normativos. 

Nenhum código de produto foi modificado, nenhuma migração foi executada e os fundamentos teóricos e matemáticos necessários para as missões **TP-RCMO-02**, **TP-RCMO-03** e **TP-RCMO-04** foram estabelecidos com evidências verificáveis.
