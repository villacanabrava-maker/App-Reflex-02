"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Layers3,
  Loader2,
  Square,
  SquareCheckBig,
} from "lucide-react";
import { obterEstruturaObraCerebro } from "@/acoes/cerebro";
import type {
  EscopoAnaliseCerebro,
  EstruturaObraCerebro,
  ItemEscopoAnaliseCerebro,
  ObraCorpusCerebro,
} from "@/tipos/cerebro";

interface Props {
  obras: ObraCorpusCerebro[];
  valor: EscopoAnaliseCerebro;
  onChange: (escopo: EscopoAnaliseCerebro) => void;
}

function chave(item: ItemEscopoAnaliseCerebro) {
  return `${item.tipo}:${item.id}`;
}

export function SeletorEscopoAnalise({ obras, valor, onChange }: Props) {
  const ativas = obras.filter((obra) => obra.participa_cerebro);
  const [estruturas, setEstruturas] = useState<Record<string, EstruturaObraCerebro>>({});
  const [expandida, setExpandida] = useState<Record<string, boolean>>({});
  const [secoesAbertas, setSecoesAbertas] = useState<Record<string, boolean>>({});
  const [carregando, setCarregando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const selecionados = useMemo(
    () => new Set(valor.itens.map(chave)),
    [valor.itens]
  );

  function definirItens(itens: ItemEscopoAnaliseCerebro[]) {
    const unicos = Array.from(new Map(itens.map((item) => [chave(item), item])).values());
    onChange({ itens: unicos });
  }

  function estaSelecionado(tipo: ItemEscopoAnaliseCerebro["tipo"], id: string) {
    return selecionados.has(`${tipo}:${id}`);
  }

  function toggleItem(item: ItemEscopoAnaliseCerebro, estrutura?: EstruturaObraCerebro) {
    const jaSelecionado = estaSelecionado(item.tipo, item.id);
    let itens = valor.itens.filter((atual) => chave(atual) !== chave(item));

    if (!jaSelecionado) {
      if (item.tipo === "obra") {
        if (estrutura) {
          const idsSecoes = new Set(estrutura.secoes.map((secao) => secao.id));
          const idsFragmentos = new Set(
            estrutura.secoes.flatMap((secao) => secao.fragmentos.map((fragmento) => fragmento.id))
          );
          itens = itens.filter(
            (atual) =>
              !(atual.tipo === "secao" && idsSecoes.has(atual.id)) &&
              !(atual.tipo === "fragmento" && idsFragmentos.has(atual.id))
          );
        }
      } else if (estrutura && estaSelecionado("obra", estrutura.obra_id)) {
        itens = itens.filter(
          (atual) => !(atual.tipo === "obra" && atual.id === estrutura.obra_id)
        );
      }

      if (item.tipo === "secao" && estrutura) {
        const secao = estrutura.secoes.find((atual) => atual.id === item.id);
        if (secao) {
          const idsFragmentos = new Set(secao.fragmentos.map((fragmento) => fragmento.id));
          itens = itens.filter(
            (atual) => !(atual.tipo === "fragmento" && idsFragmentos.has(atual.id))
          );
        }
      }

      itens.push(item);
    }

    definirItens(itens);
  }

  async function alternarObra(obraId: string) {
    const abrindo = !expandida[obraId];
    setExpandida((atual) => ({ ...atual, [obraId]: abrindo }));
    if (!abrindo || estruturas[obraId]) return;

    try {
      setCarregando(obraId);
      setErro(null);
      const estrutura = await obterEstruturaObraCerebro(obraId);
      setEstruturas((atual) => ({ ...atual, [obraId]: estrutura }));
    } catch (falha: unknown) {
      setErro(falha instanceof Error ? falha.message : "Falha ao carregar capítulos.");
    } finally {
      setCarregando(null);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wide text-blue-800">
          Defina o conteúdo desta análise
        </h4>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Selecione exatamente o que a IA pode ler: livro inteiro, capítulos/seções ou
          fragmentos específicos. Nada fora desta seleção será usado.
        </p>
      </div>

      {erro && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {erro}
        </div>
      )}

      {ativas.length === 0 ? (
        <p className="rounded-xl bg-white p-3 text-xs text-slate-500">
          Ative pelo menos uma obra autoral na aba Visão geral.
        </p>
      ) : (
        <div className="space-y-2">
          {ativas.map((obra) => {
            const estrutura = estruturas[obra.id];
            const livroInteiro = estaSelecionado("obra", obra.id);
            const aberto = Boolean(expandida[obra.id]);

            return (
              <div key={obra.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => toggleItem({ tipo: "obra", id: obra.id }, estrutura)}
                    className="text-blue-600"
                    aria-label={livroInteiro ? "Remover livro inteiro" : "Selecionar livro inteiro"}
                  >
                    {livroInteiro ? (
                      <SquareCheckBig className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-900">{obra.titulo}</p>
                    <p className="text-[11px] text-slate-400">
                      {livroInteiro
                        ? "Livro inteiro selecionado"
                        : `${obra.total_fragmentos} fragmentos disponíveis`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void alternarObra(obra.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600"
                  >
                    {carregando === obra.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : aberto ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                    Capítulos
                  </button>
                </div>

                {aberto && estrutura && (
                  <div className="border-t border-slate-100 bg-slate-50/60 p-2">
                    {estrutura.secoes.map((secao) => {
                      const secaoSelecionada = estaSelecionado("secao", secao.id);
                      const secaoAberta = Boolean(secoesAbertas[secao.id]);

                      return (
                        <div key={secao.id} className="mb-1 rounded-lg bg-white last:mb-0">
                          <div className="flex items-center gap-2 px-2 py-2">
                            <button
                              type="button"
                              onClick={() =>
                                toggleItem({ tipo: "secao", id: secao.id }, estrutura)
                              }
                              className="text-amber-600"
                            >
                              {secaoSelecionada ? (
                                <SquareCheckBig className="h-4 w-4" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                            <Layers3 className="h-3.5 w-3.5 text-slate-400" />
                            <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-700">
                              {secao.ordem}. {secao.titulo}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {secao.fragmentos.length} frag.
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setSecoesAbertas((atual) => ({
                                  ...atual,
                                  [secao.id]: !atual[secao.id],
                                }))
                              }
                              className="text-slate-400"
                            >
                              {secaoAberta ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>

                          {secaoAberta && (
                            <div className="space-y-1 border-t border-slate-100 p-2">
                              {secao.fragmentos.map((fragmento) => {
                                const selecionado = estaSelecionado("fragmento", fragmento.id);
                                return (
                                  <button
                                    key={fragmento.id}
                                    type="button"
                                    onClick={() =>
                                      toggleItem(
                                        { tipo: "fragmento", id: fragmento.id },
                                        estrutura
                                      )
                                    }
                                    className={`flex w-full items-start gap-2 rounded-lg border p-2 text-left ${
                                      selecionado
                                        ? "border-blue-200 bg-blue-50"
                                        : "border-slate-100 bg-white"
                                    }`}
                                  >
                                    {selecionado ? (
                                      <SquareCheckBig className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                                    ) : (
                                      <Square className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />
                                    )}
                                    <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                                    <span className="text-[10px] leading-4 text-slate-600">
                                      <strong className="text-slate-700">
                                        Fragmento {fragmento.ordem}
                                      </strong>{" "}
                                      — {fragmento.conteudo_preview}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-500">
        {valor.itens.length === 0
          ? "Nenhum conteúdo selecionado ainda."
          : `${valor.itens.length} item(ns) de escopo selecionado(s). A análise respeitará exatamente esta seleção.`}
      </div>
    </div>
  );
}
