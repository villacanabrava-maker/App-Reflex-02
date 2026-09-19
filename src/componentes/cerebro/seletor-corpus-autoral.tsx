"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, CheckCircle2, Loader2 } from "lucide-react";
import { definirParticipacaoObraCerebro } from "@/acoes/cerebro";
import type { ObraCorpusCerebro } from "@/tipos/cerebro";

export function SeletorCorpusAutoral({ obras }: { obras: ObraCorpusCerebro[] }) {
  const router = useRouter();
  const [processandoId, setProcessandoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function alternar(obra: ObraCorpusCerebro) {
    try {
      setProcessandoId(obra.id);
      setErro(null);
      await definirParticipacaoObraCerebro({
        obraId: obra.id,
        ativa: !obra.participa_cerebro,
      });
      router.refresh();
    } catch (falha: unknown) {
      setErro(
        falha instanceof Error
          ? falha.message
          : "Não foi possível atualizar a participação da obra no Cérebro."
      );
    } finally {
      setProcessandoId(null);
    }
  }

  const ativas = obras.filter((obra) => obra.participa_cerebro).length;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <h2 className="font-serif text-base font-bold text-slate-900">Corpus autoral ativo</h2>
          </div>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Escolha quais obras autorais processadas entram nas próximas análises do Cérebro.
            Você pode manter apenas uma obra ativa ou combinar várias.
          </p>
        </div>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
          {ativas} ativa{ativas === 1 ? "" : "s"}
        </span>
      </div>

      {erro && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {erro}
        </div>
      )}

      {obras.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
          Nenhuma obra autoral processada está disponível ainda.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {obras.map((obra) => {
            const carregando = processandoId === obra.id;
            return (
              <button
                key={obra.id}
                type="button"
                disabled={Boolean(processandoId)}
                onClick={() => void alternar(obra)}
                className={`flex items-start justify-between gap-3 rounded-2xl border p-4 text-left transition-all disabled:opacity-60 ${
                  obra.participa_cerebro
                    ? "border-blue-300 bg-blue-50/70 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {obra.participa_cerebro ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />
                    ) : (
                      <span className="h-4 w-4 shrink-0 rounded-full border-2 border-slate-300" />
                    )}
                    <span className="truncate text-sm font-bold text-slate-900">{obra.titulo}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>{obra.total_fragmentos} fragmentos</span>
                    <span>• {obra.total_palavras.toLocaleString("pt-BR")} palavras</span>
                  </div>
                </div>
                {carregando ? (
                  <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-blue-600" />
                ) : (
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      obra.participa_cerebro
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {obra.participa_cerebro ? "Ativa" : "Inativa"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-xs leading-5 text-slate-400">
        Alterar esta seleção afeta análises futuras. Resultados já confirmados permanecem preservados
        com sua proveniência histórica.
      </p>
    </section>
  );
}
