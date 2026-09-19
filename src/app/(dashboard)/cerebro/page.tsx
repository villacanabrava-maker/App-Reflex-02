import { Metadata } from "next";
import {
  obterDimensoesCerebro,
  obterCaracteristicasDimensao,
  obterRegrasCerebro,
  obterResumoCerebro,
  obterPropostasAtualizacaoCerebro,
  obterCorpusAutoralCerebro,
} from "@/acoes/cerebro";
import { PainelCerebroModerno } from "@/componentes/cerebro/painel-cerebro-moderno";

export const metadata: Metadata = {
  title: "Cérebro Autoral | Rflex01",
  description:
    "Características, regras e dimensões autorais identificadas a partir do acervo processado.",
};

export const dynamic = "force-dynamic";

export default async function PaginaCerebro() {
  const [resumo, dimensoes, caracteristicas, regras, propostas, corpusAutoral] = await Promise.all([
    obterResumoCerebro(),
    obterDimensoesCerebro(),
    obterCaracteristicasDimensao(),
    obterRegrasCerebro(),
    obterPropostasAtualizacaoCerebro(),
    obterCorpusAutoralCerebro(),
  ]);

  return (
    <PainelCerebroModerno
      resumo={resumo}
      dimensoes={dimensoes}
      caracteristicas={caracteristicas}
      regras={regras}
      propostas={propostas}
      corpusAutoral={corpusAutoral}
    />
  );
}
