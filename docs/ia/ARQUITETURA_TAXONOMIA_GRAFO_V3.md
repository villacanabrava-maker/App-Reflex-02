# Arquitetura da Taxonomia e Grafo Cognitivo V3 — App Reflex 02

**Data:** 18 de setembro de 2026  
**Líder Técnico:** A5 (rflex-ai-knowledge) & A8 (rflex-research-evolution)  
**Revisão de Dados:** A4 (rflex-backend-supabase) & A1 (rflex-architect)  

---

## 1. Fundamentação e Princípios SKOS

A Taxonomia do App Reflex 02 não é uma simples lista de tags planas ("etiquetas"). Na versão V3, ela é formalizada como um **Grafo Cognitivo Semântico** aderente aos princípios do padrão internacional **SKOS (Simple Knowledge Organization System)** da W3C:

```text
CONCEITO CANÔNICO (skos:Concept)
├── Termo Preferencial (skos:prefLabel)
├── Sinônimos / Aliases (skos:altLabel)
├── Termos Ocultos / Variações Léxicas (skos:hiddenLabel)
├── Definição Epistêmica (skos:definition)
├── Nota de Escopo (skos:scopeNote)
├── Domínio Cognitivo (skos:inScheme)
├── Conceito Mais Amplo (skos:broader)
├── Conceito Mais Específico (skos:narrower)
├── Relações Associativas (skos:related)
└── Oposições / Antagonismos (skos:antagonist)
```

---

## 2. Tipologia de Relações do Grafo Cognitivo

Para modelar o raciocínio complexo do autor sobre o PostgreSQL, definimos a seguinte ontologia de arestas entre nós:

| Tipo de Relação | Semântica | Exemplo no Domínio |
| :--- | :--- | :--- |
| `HIERARQUICA_AMPLA` (`broader`) | Relação de hiperonímia (gênero ➔ espécie) | *Ética* é mais amplo que *Deontologia* |
| `HIERARQUICA_ESTRITA` (`narrower`)| Relação de hiponímia | *Liberdade Negativa* é mais estrito que *Liberdade* |
| `COMPLEMENTAR` (`related`) | Conceitos interdependentes na mesma tese | *Liberdade* relaciona-se a *Responsabilidade* |
| `ANTAGONISTA` (`contradicts`) | Tensão dialética direta ou refutação mútua | *Determinismo Rígido* opõe-se a *Agência Moral* |
| `DERIVA_DE` (`derived_from`) | Genealogia conceitual de um pensamento | *Biopolítica* deriva de *Poder Disciplinar* |
| `EXEMPLIFICA` (`exemplifies`) | Evidência empírica ou histórica concreta | *Julgamento de Sócrates* exemplifica *Tensão Indivíduo-Estado*|
| `USA_METODO` (`applies_method`) | Aplicação de uma das 18 dimensões | *Conceito X* é analisado via *Dimensão Dialética* |

Todas as arestas registradas no banco contêm obrigatoriamente metadados de proveniência:
```sql
-- Em taxonomia.relacoes:
origem TEXT NOT NULL CHECK (origem IN ('autoral', 'ia_proposta', 'canonica')),
confianca NUMERIC(3,2) NOT NULL CHECK (confianca >= 0 AND confianca <= 1),
estado TEXT NOT NULL CHECK (estado IN ('ativo', 'revisao', 'rejeitado')),
evidencia_trecho TEXT,
obra_id UUID REFERENCES biblioteca.obras(id)
```

---

## 3. Mecanismos Anti-Inflação Taxonômica

Um vício comum em sistemas de IA é transformar cada substantivo expressivo em um novo conceito, poluindo a base com milhares de nós duplicados ou triviais (ex: criar separadamente "liberdade humana", "liberdades individuais", "liberdade do homem").

Para barrar a inflação taxonômica, a V3 institui 4 barreiras determinísticas:

1. **Deduplicação Léxica e Trigram:** Antes de qualquer proposta, o sistema calcula a distância de similaridade trigram (`similarity(termo_proposto, termo_existente) > 0.75`). Se detectada convergência, converte automaticamente em alias (`taxonomia.termos`) em vez de criar um novo conceito.
2. **Deduplicação Semântica Vetorial:** Busca de similaridade de cosseno nos embeddings dos conceitos existentes. Se a similaridade for >= 0.88, o sistema força a reutilização ou questiona o autor sobre sinonímia.
3. **Mínimo de Recorrência Factual:** Um termo novo só é elegível a se tornar conceito formal se aparecer em pelo menos **2 fragmentos distintos** ou se for explicitamente criado pelo autor.
4. **Estado Proposto Obrigatório:** A IA jamais cria um conceito diretamente como `ativo`. Ele nasce como `revisao` e só ganha status de nó ativo no grafo quando confirmado pelo autor.
