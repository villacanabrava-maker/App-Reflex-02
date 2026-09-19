"use server";

import { revalidatePath } from "next/cache";
import { criarClienteAdmin } from "@/infraestrutura/supabase/cliente-admin";
import { obterUsuarioAtualId } from "@/infraestrutura/auth/usuario-atual";
import { proporAnaliseDimensaoComIA } from "@/dominios/cerebro/analisador-dimensoes";
import type {
  DimensaoCerebro,
  CaracteristicaCerebro,
  RegraCerebro,
  ResumoCerebro,
  PropostaAtualizacaoCerebro,
  ObraCorpusCerebro,
  EstruturaObraCerebro,
  EscopoAnaliseCerebro,
} from "@/tipos/cerebro";

/**
 * Obtém as 18 dimensões canônicas agrupadas pelos 3 Planos (Conteúdo, Método, Expressão).
 */
export async function obterDimensoesCerebro(): Promise<DimensaoCerebro[]> {
  const admin = criarClienteAdmin();

  const { data, error } = await admin
    .from("v_cerebro_dimensoes")
    .select("*")
    .order("ordem", { ascending: true });

  if (error) {
    console.error("Erro ao listar dimensões do cérebro:", error);
    return [];
  }

  return (data as DimensaoCerebro[]) || [];
}

/**
 * Obtém características detalhadas de uma dimensão ou de todo o cérebro.
 */
export async function obterCaracteristicasDimensao(
  dimensaoId?: string
): Promise<CaracteristicaCerebro[]> {
  const usuarioId = await obterUsuarioAtualId();
  const admin = criarClienteAdmin();

  let query = admin
    .from("v_cerebro_caracteristicas_detalhadas")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("confianca_calculada", { ascending: false });

  if (dimensaoId) {
    query = query.eq("dimensao_id", dimensaoId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao obter características da dimensão:", error);
    return [];
  }

  return (data as CaracteristicaCerebro[]) || [];
}

/**
 * Obtém as regras e anti-regras ativas do Cérebro.
 */
export async function obterRegrasCerebro(tipo?: string): Promise<RegraCerebro[]> {
  const usuarioId = await obterUsuarioAtualId();
  const admin = criarClienteAdmin();

  let query = admin
    .from("v_cerebro_regras_ativas")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("peso", { ascending: false });

  if (tipo && tipo !== "todas") {
    query = query.eq("tipo_regra", tipo);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao obter regras do cérebro:", error);
    return [];
  }

  return (data as RegraCerebro[]) || [];
}

/**
 * Obtém o resumo consolidado de métricas do Cérebro Autoral.
 */
export async function obterResumoCerebro(): Promise<ResumoCerebro> {
  const usuarioId = await obterUsuarioAtualId();
  const admin = criarClienteAdmin();

  const [
    { data, error },
    { data: fragmentosAutorais, count: totalFragmentosAutorais },
    { count: totalFontesMemoria },
  ] = await Promise.all([
    admin
      .from("v_cerebro_resumo")
      .select("*")
      .eq("usuario_id", usuarioId)
      .maybeSingle(),
    admin
      .from("v_fragmentos_detalhados")
      .select("obra_id", { count: "exact" })
      .eq("usuario_id", usuarioId)
      .eq("obra_natureza", "autoral")
      .eq("participa_cerebro", true),
    admin
      .schema("cerebro_autoral")
      .from("memory_events")
      .select("id", { count: "exact", head: true })
      .eq("usuario_id", usuarioId)
      .eq("event_type", "SOURCE_INGESTED")
      .eq("aggregate_type", "source"),
  ]);

  const obrasAutorais = new Set(
    (fragmentosAutorais || [])
      .map((fragmento) => fragmento.obra_id as string | null)
      .filter((id): id is string => Boolean(id))
  ).size;

  const base = error || !data
    ? {
        usuario_id: usuarioId,
        total_caracteristicas: 0,
        total_regras: 0,
        total_anti_regras: 0,
        total_nucleo_autoral: 0,
        total_influencias_externas: 0,
        confianca_media_geral: 0,
      }
    : (data as Omit<
        ResumoCerebro,
        | "total_obras_autorais_processadas"
        | "total_fragmentos_autorais"
        | "total_fontes_autorais_memoria"
      >);

  return {
    ...base,
    total_obras_autorais_processadas: obrasAutorais,
    total_fragmentos_autorais: totalFragmentosAutorais || 0,
    total_fontes_autorais_memoria: totalFontesMemoria || 0,
  };
}

/**
 * Lista obras autorais processadas e permite ao usuário controlar quais participam
 * do corpus ativo usado nas análises do Cérebro.
 */
export async function obterCorpusAutoralCerebro(): Promise<ObraCorpusCerebro[]> {
  const usuarioId = await obterUsuarioAtualId();
  const admin = criarClienteAdmin();

  const { data, error } = await admin
    .from("v_obras_detalhadas")
    .select("id, titulo, tipo, estado_processamento, participa_cerebro, total_palavras_estimado")
    .eq("usuario_id", usuarioId)
    .eq("natureza", "autoral")
    .eq("estado_processamento", "processado")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao listar corpus autoral do Cérebro:", error);
    return [];
  }

  const obras = data || [];
  if (obras.length === 0) return [];

  const ids = obras.map((obra) => obra.id);
  const { data: fragmentos } = await admin
    .from("v_fragmentos_detalhados")
    .select("obra_id")
    .eq("usuario_id", usuarioId)
    .in("obra_id", ids);

  const contagemPorObra = new Map<string, number>();
  for (const fragmento of fragmentos || []) {
    if (!fragmento.obra_id) continue;
    contagemPorObra.set(
      fragmento.obra_id,
      (contagemPorObra.get(fragmento.obra_id) || 0) + 1
    );
  }

  return obras.map((obra) => ({
    id: obra.id,
    titulo: obra.titulo,
    tipo: obra.tipo,
    estado_processamento: obra.estado_processamento,
    participa_cerebro: Boolean(obra.participa_cerebro),
    total_fragmentos: contagemPorObra.get(obra.id) || 0,
    total_palavras: Number(obra.total_palavras_estimado || 0),
  }));
}

export async function obterEstruturaObraCerebro(
  obraId: string
): Promise<EstruturaObraCerebro> {
  const usuarioId = await obterUsuarioAtualId();
  const admin = criarClienteAdmin();

  const { data: obra, error: erroObra } = await admin
    .schema("biblioteca")
    .from("obras")
    .select("id, titulo, natureza, participa_cerebro")
    .eq("id", obraId)
    .eq("usuario_id", usuarioId)
    .maybeSingle();

  if (
    erroObra ||
    !obra ||
    obra.natureza !== "autoral" ||
    !obra.participa_cerebro
  ) {
    throw new Error("A obra precisa estar ativa no corpus autoral para definir o escopo.");
  }

  const { data: versao, error: erroVersao } = await admin
    .schema("biblioteca")
    .from("versoes_obras")
    .select("id")
    .eq("obra_id", obraId)
    .eq("usuario_id", usuarioId)
    .eq("estado_processamento", "processado")
    .order("numero_versao", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (erroVersao || !versao) {
    throw new Error("A obra ativa ainda não possui uma versão processada disponível.");
  }

  const { data: documento, error: erroDocumento } = await admin
    .schema("processamento")
    .from("documentos_processados")
    .select("id")
    .eq("versao_obra_id", versao.id)
    .eq("usuario_id", usuarioId)
    .eq("estado_publicacao", "ativo")
    .maybeSingle();

  if (erroDocumento || !documento) {
    throw new Error("O documento processado ativo não foi encontrado.");
  }

  const [{ data: secoes, error: erroSecoes }, { data: fragmentos, error: erroFragmentos }] =
    await Promise.all([
      admin
        .schema("processamento")
        .from("secoes")
        .select("id, titulo, ordem")
        .eq("documento_processado_id", documento.id)
        .eq("usuario_id", usuarioId)
        .order("ordem", { ascending: true }),
      admin
        .schema("processamento")
        .from("fragmentos")
        .select("id, secao_id, ordem, conteudo, total_palavras")
        .eq("documento_processado_id", documento.id)
        .eq("usuario_id", usuarioId)
        .order("ordem", { ascending: true }),
    ]);

  if (erroSecoes || erroFragmentos) {
    throw new Error(
      `Falha ao carregar capítulos e fragmentos: ${erroSecoes?.message || erroFragmentos?.message}`
    );
  }

  return {
    obra_id: obra.id,
    obra_titulo: obra.titulo,
    secoes: (secoes || []).map((secao) => ({
      id: secao.id,
      titulo: secao.titulo,
      ordem: secao.ordem,
      fragmentos: (fragmentos || [])
        .filter((fragmento) => fragmento.secao_id === secao.id)
        .map((fragmento) => ({
          id: fragmento.id,
          ordem: fragmento.ordem,
          conteudo_preview:
            fragmento.conteudo.length > 220
              ? `${fragmento.conteudo.slice(0, 220)}…`
              : fragmento.conteudo,
          total_palavras: fragmento.total_palavras,
        })),
    })),
  };
}

export async function definirParticipacaoObraCerebro({
  obraId,
  ativa,
}: {
  obraId: string;
  ativa: boolean;
}) {
  const usuarioId = await obterUsuarioAtualId();
  const admin = criarClienteAdmin();

  const { data: obra, error: erroObra } = await admin
    .schema("biblioteca")
    .from("obras")
    .select("id, natureza")
    .eq("id", obraId)
    .eq("usuario_id", usuarioId)
    .maybeSingle();

  if (erroObra || !obra) {
    throw new Error("Obra não encontrada.");
  }
  if (obra.natureza !== "autoral") {
    throw new Error("Somente obras autorais podem integrar o núcleo autoral do Cérebro.");
  }

  const { error } = await admin
    .schema("biblioteca")
    .from("obras")
    .update({
      participa_cerebro: ativa,
      participacao_cerebro: ativa ? "nucleo_autoral" : "excluida",
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", obraId)
    .eq("usuario_id", usuarioId);

  if (error) {
    throw new Error(`Falha ao atualizar corpus do Cérebro: ${error.message}`);
  }

  try {
    revalidatePath("/cerebro");
    revalidatePath("/biblioteca");
  } catch {}

  return { sucesso: true, ativa };
}

/**
 * Analisa uma dimensão usando SOMENTE o escopo explicitamente selecionado pelo autor.
 * Não existe amostragem aleatória nem seleção implícita.
 */
export async function acionarAnaliseDimensao(
  dimensaoId: string,
  escopo: EscopoAnaliseCerebro
) {
  const usuarioId = await obterUsuarioAtualId();
  const admin = criarClienteAdmin();

  if (!escopo?.itens?.length) {
    throw new Error(
      "Defina primeiro o escopo da análise: livro inteiro, capítulos/seções ou fragmentos específicos."
    );
  }

  const { data: dimensao, error: errDim } = await admin
    .schema("cerebro_autoral")
    .from("dimensoes")
    .select("*")
    .eq("id", dimensaoId)
    .single();

  if (errDim || !dimensao) {
    throw new Error("Dimensão não encontrada.");
  }

  const { data: obrasAtivas, error: erroObras } = await admin
    .schema("biblioteca")
    .from("obras")
    .select("id, titulo")
    .eq("usuario_id", usuarioId)
    .eq("natureza", "autoral")
    .eq("participa_cerebro", true);

  if (erroObras) {
    throw new Error(`Falha ao carregar o corpus autoral ativo: ${erroObras.message}`);
  }

  if (!obrasAtivas?.length) {
    throw new Error("Nenhuma obra autoral está ativa no Cérebro.");
  }

  const idsObrasAtivas = new Set(obrasAtivas.map((obra) => obra.id));
  const itensObra = escopo.itens.filter((item) => item.tipo === "obra").map((item) => item.id);
  const itensSecao = escopo.itens.filter((item) => item.tipo === "secao").map((item) => item.id);
  const itensFragmento = escopo.itens
    .filter((item) => item.tipo === "fragmento")
    .map((item) => item.id);

  for (const obraId of itensObra) {
    if (!idsObrasAtivas.has(obraId)) {
      throw new Error("O escopo contém uma obra que não está ativa no Cérebro.");
    }
  }

  const query = admin
    .from("v_fragmentos_detalhados")
    .select("id, conteudo, obra_id, obra_titulo, secao_id, secao_titulo, ordem")
    .eq("usuario_id", usuarioId)
    .eq("obra_natureza", "autoral")
    .eq("participa_cerebro", true)
    .order("obra_titulo", { ascending: true })
    .order("ordem", { ascending: true });

  const { data: todosFragmentos, error: errFrags } = await query;
  if (errFrags) {
    throw new Error(`Falha ao carregar os fragmentos elegíveis: ${errFrags.message}`);
  }

  const fragmentosSelecionados = (todosFragmentos || []).filter((fragmento) => {
    if (!idsObrasAtivas.has(fragmento.obra_id)) return false;
    if (itensObra.includes(fragmento.obra_id)) return true;
    if (fragmento.secao_id && itensSecao.includes(fragmento.secao_id)) return true;
    return itensFragmento.includes(fragmento.id);
  });

  if (fragmentosSelecionados.length === 0) {
    throw new Error("O escopo selecionado não contém fragmentos válidos para análise.");
  }

  const totalTokensEstimados = fragmentosSelecionados.reduce(
    (soma, fragmento) => soma + Math.ceil(fragmento.conteudo.length / 3.8),
    0
  );

  if (totalTokensEstimados > 60000) {
    throw new Error(
      `O escopo escolhido contém aproximadamente ${totalTokensEstimados.toLocaleString("pt-BR")} tokens. Reduza a seleção para capítulos ou fragmentos mais específicos.`
    );
  }

  const idsObrasUsadas = Array.from(
    new Set(fragmentosSelecionados.map((fragmento) => fragmento.obra_id))
  );
  const obrasUsadas = obrasAtivas.filter((obra) => idsObrasUsadas.includes(obra.id));
  const secoesUsadas = Array.from(
    new Map(
      fragmentosSelecionados
        .filter((fragmento) => fragmento.secao_id)
        .map((fragmento) => [
          fragmento.secao_id,
          {
            id: fragmento.secao_id,
            titulo: fragmento.secao_titulo,
            obra_id: fragmento.obra_id,
          },
        ])
    ).values()
  );

  const analise = await proporAnaliseDimensaoComIA({
    dimensaoId: dimensao.id,
    dimensaoCodigo: dimensao.codigo,
    dimensaoNome: dimensao.nome,
    dimensaoDescricao: dimensao.descricao,
    usuarioId,
    fragmentos: fragmentosSelecionados.map((fragmento) => ({
      id: fragmento.id,
      conteudo: fragmento.conteudo,
      obra_titulo: fragmento.obra_titulo,
      obra_id: fragmento.obra_id,
    })),
  });

  if (analise.caracteristicas.length === 0) {
    return {
      sucesso: true,
      totalCaracteristicas: 0,
      totalRegras: 0,
      totalEvidencias: 0,
      totalPropostas: 0,
      mensagem:
        "Não foram encontradas evidências suficientemente fortes no conteúdo que você selecionou.",
    };
  }

  let totalPropostas = 0;
  let totalRegras = 0;
  let totalEvidencias = 0;

  for (const caracteristica of analise.caracteristicas) {
    const forcas = caracteristica.evidencias.map((evidencia) => evidencia.forca_evidencia);
    const confianca =
      forcas.length > 0
        ? Math.min(0.99, forcas.reduce((soma, valor) => soma + valor, 0) / forcas.length)
        : 0;

    const { error } = await admin
      .schema("cerebro_autoral")
      .from("propostas_atualizacao")
      .insert({
        usuario_id: usuarioId,
        tipo_proposta: "nova_caracteristica",
        estado_decisao: "pendente",
        dados_propostos: {
          origem: {
            tipo: "analise_dimensao_escopo_explicito",
            entrada_id: dimensao.id,
          },
          dimensao: {
            id: dimensao.id,
            codigo: dimensao.codigo,
            nome: dimensao.nome,
          },
          corpus: {
            modo_selecao: "explicito",
            obras: obrasUsadas.map((obra) => ({ id: obra.id, titulo: obra.titulo })),
            secoes: secoesUsadas,
            fragmentos_selecionados: fragmentosSelecionados.map((fragmento) => ({
              id: fragmento.id,
              secao_id: fragmento.secao_id,
              secao_titulo: fragmento.secao_titulo,
              obra_id: fragmento.obra_id,
              obra_titulo: fragmento.obra_titulo,
              ordem: fragmento.ordem,
            })),
            total_fragmentos: fragmentosSelecionados.length,
            tokens_estimados: totalTokensEstimados,
          },
          aprendizado: {
            titulo: caracteristica.titulo,
            descricao: caracteristica.descricao,
          },
          caracteristica: {
            titulo: caracteristica.titulo,
            descricao: caracteristica.descricao,
            formula_metodologica: caracteristica.formula_metodologica,
            regras: caracteristica.regras,
            evidencias: caracteristica.evidencias,
          },
        },
        justificativa_ia:
          "Característica candidata extraída exclusivamente do escopo escolhido manualmente pelo autor. Requer confirmação humana antes de integrar o perfil ativo.",
        confianca_calculada: Number(confianca.toFixed(2)),
      });

    if (error) {
      throw new Error(`Falha ao registrar proposta de análise: ${error.message}`);
    }

    totalPropostas++;
    totalRegras += caracteristica.regras.length;
    totalEvidencias += caracteristica.evidencias.length;
  }

  try {
    revalidatePath("/cerebro");
  } catch {}

  return {
    sucesso: true,
    totalCaracteristicas: analise.caracteristicas.length,
    totalRegras,
    totalEvidencias,
    totalPropostas,
    mensagem:
      `Análise concluída sobre ${fragmentosSelecionados.length} fragmentos escolhidos por você. As propostas foram enviadas para Aprendizados.`,
  };
}

/**
 * Lista propostas de aprendizado derivadas de edições autorais.
 * Elas permanecem separadas das regras formais até a decisão do autor.
 */
export async function obterPropostasAtualizacaoCerebro(): Promise<PropostaAtualizacaoCerebro[]> {
  const usuarioId = await obterUsuarioAtualId();
  const admin = criarClienteAdmin();

  const { data, error } = await admin
    .schema("cerebro_autoral")
    .from("propostas_atualizacao")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("criado_em", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Erro ao listar propostas de atualização do Cérebro:", error);
    return [];
  }

  return (data as PropostaAtualizacaoCerebro[]) || [];
}

/**
 * Registra a decisão soberana do autor sobre uma proposta.
 * Para propostas de análise do corpus, a confirmação materializa a característica,
 * suas regras e evidências no perfil ativo. A rejeição apenas preserva o histórico.
 */
export interface ResultadoDecisaoPropostaAtualizacao {
  success: boolean;
  idempotent: boolean;
  proposta_id: string;
  estado: "confirmada" | "rejeitada";
  entidade_tipo: "caracteristica" | "regra" | "metodologia" | "nenhuma";
  entidade_id: string | null;
  evento_id: string | null;
}

/**
 * Registra a decisão soberana do autor sobre uma proposta.
 *
 * A materialização ocorre dentro da RPC transacional
 * cerebro_autoral.decidir_proposta_atualizacao_atomica. Assim, proposta,
 * entidade cognitiva e evento de memória são persistidos integralmente ou a
 * transação é revertida por completo.
 */
export async function decidirPropostaAtualizacaoCerebro({
  propostaId,
  decisao,
  notasAutor,
}: {
  propostaId: string;
  decisao: "confirmada" | "rejeitada";
  notasAutor?: string;
}) {
  const usuarioId = await obterUsuarioAtualId();
  const admin = criarClienteAdmin();

  const { data, error } = await admin
    .schema("cerebro_autoral")
    .rpc("decidir_proposta_atualizacao_atomica", {
      p_usuario_id: usuarioId,
      p_proposta_id: propostaId,
      p_decisao: decisao,
      p_notas_autor: notasAutor?.trim() || null,
    });

  if (error) {
    throw new Error(
      `Falha ao decidir/materializar proposta de aprendizado: ${error.message}`
    );
  }

  const resultado = data as ResultadoDecisaoPropostaAtualizacao | null;

  if (!resultado?.success || resultado.estado !== decisao) {
    throw new Error(
      "A decisão da proposta não retornou uma confirmação transacional válida."
    );
  }

  try {
    revalidatePath("/cerebro");
    revalidatePath("/reflexoes");
  } catch {}

  return {
    sucesso: true,
    estado: resultado.estado,
    idempotente: resultado.idempotent,
    entidadeTipo: resultado.entidade_tipo,
    entidadeId: resultado.entidade_id,
    eventoId: resultado.evento_id,
  };
}
