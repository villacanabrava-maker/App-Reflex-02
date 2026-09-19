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
 * Analisa a dimensão usando somente o corpus autoral selecionado pelo usuário.
 * O resultado entra como PROPOSTA pendente; nada é promovido automaticamente
 * ao perfil ativo do Cérebro.
 */
export async function acionarAnaliseDimensao(dimensaoId: string) {
  const usuarioId = await obterUsuarioAtualId();
  const admin = criarClienteAdmin();

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

  if (!obrasAtivas || obrasAtivas.length === 0) {
    throw new Error(
      "Nenhuma obra autoral está ativa no Cérebro. Selecione ao menos uma obra na seção Corpus Autoral."
    );
  }

  const idsObrasAtivas = obrasAtivas.map((obra) => obra.id);
  const { data: fragmentosBrutos, error: errFrags } = await admin
    .from("v_fragmentos_detalhados")
    .select("id, conteudo, obra_id, obra_titulo, ordem")
    .eq("usuario_id", usuarioId)
    .eq("obra_natureza", "autoral")
    .eq("participa_cerebro", true)
    .in("obra_id", idsObrasAtivas)
    .order("ordem", { ascending: true })
    .limit(180);

  if (errFrags || !fragmentosBrutos || fragmentosBrutos.length === 0) {
    throw new Error(
      "As obras selecionadas ainda não possuem fragmentos autorais processados disponíveis para análise."
    );
  }

  // Amostragem balanceada: evita que uma obra longa domine o perfil quando
  // várias obras estiverem ativas simultaneamente.
  const porObra = new Map<string, typeof fragmentosBrutos>();
  for (const fragmento of fragmentosBrutos) {
    const grupo = porObra.get(fragmento.obra_id) || [];
    grupo.push(fragmento);
    porObra.set(fragmento.obra_id, grupo);
  }

  const fragmentosSelecionados = Array.from(porObra.values())
    .flatMap((grupo) => grupo.slice(0, 8))
    .slice(0, 24);

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
        "Não foram encontradas evidências suficientemente fortes nesta dimensão para o corpus selecionado.",
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
            tipo: "analise_dimensao_corpus_autoral",
            entrada_id: dimensao.id,
          },
          dimensao: {
            id: dimensao.id,
            codigo: dimensao.codigo,
            nome: dimensao.nome,
          },
          corpus: {
            obras: obrasAtivas.map((obra) => ({ id: obra.id, titulo: obra.titulo })),
            total_fragmentos_amostrados: fragmentosSelecionados.length,
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
          "Característica candidata extraída exclusivamente do corpus autoral ativo, com evidências literais. Requer confirmação humana antes de integrar o perfil ativo.",
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
      "Análise concluída. As características candidatas foram enviadas para Aprendizados e aguardam sua confirmação.",
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
 * Confirmar torna o aprendizado elegível para dossiês futuros;
 * rejeitar preserva o histórico sem influenciar novas reflexões.
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

  const { data: proposta, error: erroBusca } = await admin
    .schema("cerebro_autoral")
    .from("propostas_atualizacao")
    .select("id, estado_decisao")
    .eq("id", propostaId)
    .eq("usuario_id", usuarioId)
    .single();

  if (erroBusca || !proposta) {
    throw new Error("Proposta de aprendizado não encontrada.");
  }

  if (proposta.estado_decisao !== "pendente") {
    throw new Error("Esta proposta já recebeu uma decisão e foi preservada no histórico.");
  }

  const { error: erroAtualizacao } = await admin
    .schema("cerebro_autoral")
    .from("propostas_atualizacao")
    .update({
      estado_decisao: decisao,
      decidido_em: new Date().toISOString(),
      notas_autor: notasAutor?.trim() || null,
    })
    .eq("id", propostaId)
    .eq("usuario_id", usuarioId)
    .eq("estado_decisao", "pendente");

  if (erroAtualizacao) {
    throw new Error(`Falha ao registrar decisão sobre o aprendizado: ${erroAtualizacao.message}`);
  }

  try {
    revalidatePath("/cerebro");
    revalidatePath("/reflexoes");
  } catch {
    // Ignorado fora do ciclo de requisição HTTP.
  }

  return { sucesso: true, estado: decisao };
}
