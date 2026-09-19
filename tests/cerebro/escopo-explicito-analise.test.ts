import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function ler(caminho: string) {
  return readFileSync(join(process.cwd(), caminho), "utf8");
}

describe("Cérebro — escopo explícito de análise", () => {
  it("não usa mais amostragem oculta de fragmentos", () => {
    const analisador = ler("src/dominios/cerebro/analisador-dimensoes.ts");
    expect(analisador).not.toContain(".slice(0, 15)");
    expect(analisador).toContain("fragmentos explicitamente selecionados");
  });

  it("exige livro, seção ou fragmento escolhido pelo autor", () => {
    const acoes = ler("src/acoes/cerebro.ts");
    expect(acoes).toContain("escopo: EscopoAnaliseCerebro");
    expect(acoes).toContain("Defina primeiro o escopo da análise");
    expect(acoes).toContain('item.tipo === "obra"');
    expect(acoes).toContain('item.tipo === "secao"');
    expect(acoes).toContain('item.tipo === "fragmento"');
  });

  it("carrega capítulos e fragmentos de uma obra ativa sob demanda", () => {
    const acoes = ler("src/acoes/cerebro.ts");
    expect(acoes).toContain("obterEstruturaObraCerebro");
    expect(acoes).toContain('.from("secoes")');
    expect(acoes).toContain('.from("fragmentos")');
  });

  it("oferece seletor visual de livro, capítulos e fragmentos", () => {
    const seletor = ler("src/componentes/cerebro/seletor-escopo-analise.tsx");
    expect(seletor).toContain("Defina o conteúdo desta análise");
    expect(seletor).toContain("Livro inteiro selecionado");
    expect(seletor).toContain("Capítulos");
    expect(seletor).toContain("Fragmento");
  });

  it("salva a proveniência exata do escopo na proposta", () => {
    const acoes = ler("src/acoes/cerebro.ts");
    expect(acoes).toContain('modo_selecao: "explicito"');
    expect(acoes).toContain("fragmentos_selecionados");
    expect(acoes).toContain("secoes: secoesUsadas");
    expect(acoes).toContain("obras: obrasUsadas");
  });

  it("mostra a origem e as evidências do livro no painel de aprovação", () => {
    const painel = ler("src/componentes/cerebro/painel-propostas-aprendizado.tsx");
    expect(painel).toContain("Fonte da análise");
    expect(painel).toContain("Evidências extraídas do conteúdo");
    expect(painel).toContain("trecho_citado");
  });
});
