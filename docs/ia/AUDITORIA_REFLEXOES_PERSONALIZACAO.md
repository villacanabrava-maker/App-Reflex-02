# Auditoria das Reflexões e Personalização Autoral — App Reflex 02

**Data:** 18 de setembro de 2026  
**Líder:** A5 (rflex-ai-knowledge) & A1 (rflex-architect)  
**Revisão:** A8 (rflex-research-evolution) & A7 (rflex-qa-security)  

---

## 1. Causa-Raiz do Comportamento Aleatório / Genérico

O usuário relatou que em certas ocasiões as reflexões geradas pareciam desconexas, genéricas ou introduziam assuntos arbitrários não relacionados ao tema solicitado.

### Diagnóstico Confirmado no Código
Na inspeção de `src/dominios/reflexoes/redator-reflexao.ts`, encontramos a causa determinante nas linhas 74 a 82:

```typescript
// Quando o plano argumentativo não especificou IDs de fontes válidos:
if (fragmentos.length === 0) {
  const { data: fragsRecentes } = await admin
    .from("v_fragmentos_detalhados")
    .select("id, conteudo, obra_titulo")
    .eq("usuario_id", usuarioId)
    .eq("obra_natureza", "autoral")
    .limit(8); // <--- BUSCA OS 8 FRAGMENTOS MAIS RECENTES DO BANCO!
  fragmentos = (fragsRecentes as any) || [];
}
```

E em seguida, no prompt de redação enviado ao `gpt-4o`:
```
"VINCULE EXPLICITAMENTE afirmações cruciais aos fragmentos de memórias autorais de referência fornecidos."
```

### Consequência Factual
Se o autor solicitava uma reflexão sobre *Metafísica ou Teoria do Conhecimento*, e a busca exata não retornava fontes, o redator carregava silenciosamente os 8 fragmentos mais recentes do banco (que poderiam ser sobre *Gestão Financeira, Anotações Pessoais ou Citações Literárias*).
A IA era então forçada por prompt a inventar conexões artificiais entre a Metafísica e esses 8 fragmentos aleatórios, gerando textos bizarros, caricatos e desconexos.

---

## 2. Princípio Epistêmico da V2: Contexto Insuficiente > Contexto Aleatório

Na Arquitetura Cognitiva V2, fica permanentemente estabelecido:

> **REGRA DE OURO:**  
> A ausência de fontes planejadas NUNCA deve ser resolvida silenciosamente carregando memórias arbitrárias.  
> É infinitamente preferível alertar o usuário sobre **CONTEXTO INSUFICIENTE** do que gerar uma reflexão corrompida por **CONTEXTO ALEATÓRIO**.

### Comportamento Exigido na V2
1. Se o planejador não encontrar fontes diretamente correlacionadas ao tema, o sistema deve:
   - Notificar o autor: *"Não foram encontradas memórias autorais suficientemente próximas deste tema no seu Cérebro. Deseja refletir a partir de primeiros princípios ou selecionar obras específicas na Biblioteca?"*;
   - Proibir a injeção oculta de fragmentos desconexos no prompt do redator.

---

## 3. Arquitetura de Macro e Micro Personalização

Para evitar reflexões padronizadas de LLM sem sobrecarregar a janela de contexto, a personalização operará em dois níveis distintos:

### Nível MACRO (Identidade e Estilo Epistêmico do Autor)
Carregado de forma compacta e perene em toda chamada:
- **Arquitetura de Raciocínio Preferida:** Dedução a partir de princípios, analogias estruturais ou dialética tese-antítese.
- **Anti-Regras Estilísticas:** Proibição explícita de clichês modernos de IA ("mergulhar", "cenário em transformação", "em suma").
- **Topologia de Tom:** Cadência sóbria, densidade conceitual, ausência de adjetivação hiperbólica.

### Nível MICRO (Contexto Cirúrgico da Tarefa)
Mobilizado dinamicamente de acordo com o tema da reflexão:
- Apenas os conceitos da Taxonomia diretamente ativados pelo tema;
- Apenas fragmentos comprovadamente pertinentes (via retrieval híbrido);
- Apenas regras do Cérebro associadas às dimensões acionadas no plano.

O sistema **nunca** despejará o Cérebro inteiro no prompt, garantindo foco cognitivo, baixo ruído e máxima fidelidade intelectual.
