import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Cérebro - seleção de corpus e análise segura", () => {
  it("permite selecionar obras autorais processadas para o corpus ativo", () => {
    const source = readFileSync(join(process.cwd(), "src/acoes/cerebro.ts"), "utf8");
    expect(source).toContain("obterCorpusAutoralCerebro");
    expect(source).toContain("definirParticipacaoObraCerebro");
    expect(source).toContain('participa_cerebro: ativa');
    expect(source).toContain('participacao_cerebro: ativa ? "nucleo_autoral" : "excluida"');
  });

  it("analisa somente o corpus autoral ativo", () => {
    const source = readFileSync(join(process.cwd(), "src/acoes/cerebro.ts"), "utf8");
    expect(source).toContain('.eq("participa_cerebro", true)');
    expect(source).toContain("escopo: EscopoAnaliseCerebro");
    expect(source).toContain('item.tipo === "obra"');
    expect(source).toContain('item.tipo === "secao"');
    expect(source).toContain('item.tipo === "fragmento"');
    expect(source).toContain("proporAnaliseDimensaoComIA");
  });

  it("não promove análise automática e cria propostas pendentes", () => {
    const source = readFileSync(join(process.cwd(), "src/acoes/cerebro.ts"), "utf8");
    expect(source).toContain('tipo_proposta: "nova_caracteristica"');
    expect(source).toContain('estado_decisao: "pendente"');
    expect(source).toContain("Requer confirmação humana");
  });

  it("materializa aprendizado somente após decisão humana transacional", () => {
    const action = readFileSync(join(process.cwd(), "src/acoes/cerebro.ts"), "utf8");
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/0039_consolidacao_autoral_wave6.sql"),
      "utf8"
    );

    expect(action).toContain('.rpc("decidir_proposta_atualizacao_atomica"');
    expect(action).toContain("p_usuario_id: usuarioId");
    expect(action).toContain("p_proposta_id: propostaId");
    expect(action).toContain("p_decisao: decisao");

    expect(migration).toContain("FOR UPDATE");
    expect(migration).toContain("IF p_decisao = 'rejeitada' THEN");
    expect(migration).toContain("'confirmacao_humana', true");
    expect(migration).toContain("estado_revisao");
    expect(migration).toContain("'confirmada'");
    expect(migration).toContain("proposta_id");
  });

  it("exibe livros autorais selecionáveis na interface do Cérebro", () => {
    const source = readFileSync(
      join(process.cwd(), "src/componentes/cerebro/seletor-corpus-autoral.tsx"),
      "utf8"
    );
    expect(source).toContain("Corpus autoral ativo");
    expect(source).toContain("Escolha quais obras autorais processadas");
    expect(source).toContain("definirParticipacaoObraCerebro");
  });
});
