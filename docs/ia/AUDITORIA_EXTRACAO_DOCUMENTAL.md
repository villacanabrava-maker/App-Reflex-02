# Auditoria Forense da Extração Documental — App Reflex 02

**Data:** 18 de setembro de 2026  
**Auditor Responsável:** A5 (rflex-ai-knowledge) & A7 (rflex-qa-security)  
**Status do Módulo:** Vulnerabilidade crítica corrigida; Proposta de Quality Gate elaborada  

---

## 1. Diagnóstico do Problema Relatado

O usuário reportou que certos livros e textos apresentavam:
- Conteúdo truncado;
- Caracteres binários / símbolos estranhos;
- Texto corrompido que poluía a inteligência do sistema.

### Causa-Raiz Confirmada no Código
A investigação no arquivo `src/dominios/processamento/extrator-texto.ts` revelou duas causas determinantes:

1. **Fallback Binário em Falhas de DOCX:**
   O bloco de tratamento de erro do extrator DOCX continha:
   ```typescript
   } catch (err: any) {
     console.warn("Falha ao extrair docx:", err.message);
     textoBruto = buffer.toString("utf-8"); // <--- VULNERABILIDADE CRÍTICA
   }
   ```
   Um arquivo DOCX é essencialmente um container ZIP contendo arquivos XML comprimidos (`zlib deflate`). Se o descompactador encontrava um cabeçalho truncado, método de compressão alternativo ou erro estrutural, o código executava `buffer.toString("utf-8")`. Isso tentava interpretar bytes de máquina comprimidos como texto legível, injetando milhares de caracteres de controle, símbolos de substituição (`\uFFFD`) e códigos ilegíveis no banco.

2. **Ausência de Rejeição de Binários Arbitrários:**
   Qualquer arquivo enviado que não iniciasse estritamente com a assinatura `%PDF` caía no `else` genérico, sendo decodificado como string UTF-8 mesmo se fosse um arquivo binário corrompido ou EPUB não tratado.

---

## 2. Correção Cirúrgica Aplicada na Missão MIS-0003

Na presente missão, a equipe aplicou as seguintes correções pontuais:
1. **Eliminação do Fallback:** Em caso de falha de descompressão ou leitura DOCX, o extrator lança uma exceção descritiva e interrompe o pipeline, impedindo a injeção de lixo no banco de dados.
2. **Validação Prévia de Bytes Nulos e Magic Bytes:** Arquivos genéricos que contenham bytes nulos (`0x00`) ou assinaturas de arquivos binários comprimidos (`0x504b0304`) são imediatamente rejeitados com erro determinístico.
3. **Teste de Regressão:** Implementado em `tests/processamento/extrator-texto.test.ts`.

---

## 3. Proposta Arquitetural: Extraction Quality Gate (Para V2)

Para a próxima versão da inteligência cognitiva, propõe-se que **nenhum texto seja aceito como Conhecimento Ativo** sem passar por um relatório de qualidade estruturado:

### Métricas de Qualidade Avaliadas
- **Taxa de Caracteres Inválidos:** Porcentagem de caracteres de controle ou caracteres fora do padrão Unicode de escrita natural.
- **Densidade Textual:** Razão entre caracteres alfanuméricos e caracteres especiais/espaços.
- **Detecção de OCR Necessário:** Se um PDF possuir 100 páginas, mas menos de 50 palavras extraídas, classificar como "PDF digitalizado / Requer OCR".
- **Repetição de Cabeçalhos e Rodapés:** Detecção algorítmica de padrões de topo/rodapé repetidos página a página para remoção antes do chunking.

### Estados Canônicos de Extração Propostos
```
extraido ➔ extraido_com_alertas ➔ requer_ocr ➔ requer_revisao ➔ rejeitado
```
Apenas textos com status `extraido` ou aprovados manualmente em `requer_revisao` poderão alimentar o Cérebro Autoral e a geração de embeddings.
