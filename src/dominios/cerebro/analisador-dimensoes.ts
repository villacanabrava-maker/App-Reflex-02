import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { obterClienteOpenAI } from "@/ia/cliente";
import { criarClienteAdmin } from "@/infraestrutura/supabase/cliente-admin";

export const analiseDimensaoSchema = z.object({
  caracteristicas: z.array(
    z.object({
      titulo: z.string().describe("Título preciso da característica metodológica"),
      descricao: z.string().describe("Descrição densa e analítica de como o autor opera nesta dimensão"),
      formula_metodologica: z.string().describe("Fórmula sequencial do pensamento (ex: Ponto A -> Tensão -> Ponto B)"),
      regras: z.array(
        z.object({
          tipo: z.enum(["prescritiva", "proscritiva", "preferencia", "restricao_estilo"]),
          enunciado: z.string().describe("Comando claro da regra ou anti-regra"),
          explicacao: z.string().describe("Fundamentação epistêmica da regra"),
        })
      ),
      evidencias: z.array(
        z.object({
          fragmento_id: z.string().describe("ID exato do fragmento textual analisado"),
          trecho_citado: z.string().describe("Citação literal exata contida no fragmento"),
          explicacao: z.string().describe("Como este trecho sustenta a característica candidata"),
          forca_evidencia: z.number().min(0).max(1).describe("Peso comprobatório de 0 a 1"),
        })
      ),
    })
  ),
});

export type AnaliseDimensaoEstruturada = z.infer<typeof analiseDimensaoSchema>;

export interface ParametrosAnaliseDimensao {
  dimensaoId: string;
  dimensaoCodigo: string;
  dimensaoNome: string;
  dimensaoDescricao: string;
  usuarioId: string;
  fragmentos: { id: string; conteudo: string; obra_titulo: string; obra_id?: string }[];
}

async function executarAnaliseEstruturada({
  dimensaoCodigo,
  dimensaoNome,
  dimensaoDescricao,
  fragmentos,
}: ParametrosAnaliseDimensao): Promise<AnaliseDimensaoEstruturada> {
  if (fragmentos.length === 0) {
    throw new Error("Nenhum fragmento fornecido para análise da dimensão.");
  }

  const openai = obterClienteOpenAI();

  const fragmentosFormatados = fragmentos
    .slice(0, 15)
    .map(
      (f) => `[FRAGMENTO_ID: ${f.id}] (Obra: ${f.obra_titulo})\n${f.conteudo}\n---`
    )
    .join("\n");

  const promptSistema = `
Você é o Analista Metodológico Central do Cérebro Autoral.
Sua função é produzir CANDIDATOS de análise, nunca confirmar automaticamente uma crença, preferência ou regra do autor.

Dimensão: "${dimensaoNome}" (${dimensaoCodigo})
Escopo Canônico: "${dimensaoDescricao}"

Regras obrigatórias:
1. Trabalhe SOMENTE com os fragmentos fornecidos e com as obras selecionadas pelo usuário para o corpus ativo.
2. Identifique características específicas e distintivas apenas quando houver sustentação textual.
3. Extraia regras PRESCRITIVAS e PROSCRITIVAS / ANTI-REGRAS apenas como propostas candidatas.
4. Cada característica deve conter evidências literais exatas e o [FRAGMENTO_ID] correspondente.
5. Não atribua ao autor uma crença, intenção ou preferência que não esteja sustentada pelos trechos.
6. Se a evidência for insuficiente, omita a característica em vez de completar lacunas.
7. O resultado será submetido à confirmação humana antes de entrar no perfil ativo do Cérebro.
`.trim();

  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o",
    messages: [
      { role: "system", content: promptSistema },
      {
        role: "user",
        content: `Analise exclusivamente os fragmentos abaixo e gere candidatos para a dimensão "${dimensaoNome}":\n\n${fragmentosFormatados}`,
      },
    ],
    response_format: zodResponseFormat(analiseDimensaoSchema, "analise_dimensao_candidata"),
    temperature: 0.15,
  });

  const parsed = response.choices[0].message.parsed;
  if (!parsed) {
    throw new Error("Falha ao analisar a dimensão: resposta estruturada vazia.");
  }

  return parsed;
}

/**
 * Caminho V3.1 seguro: retorna candidatos sustentados por evidência.
 * Nenhuma característica, regra ou crença é promovida automaticamente.
 */
export async function proporAnaliseDimensaoComIA(
  parametros: ParametrosAnaliseDimensao
): Promise<AnaliseDimensaoEstruturada> {
  return executarAnaliseEstruturada(parametros);
}

/**
 * Caminho legado mantido apenas para compatibilidade histórica.
 * A Server Action principal não utiliza mais esta função.
 */
export async function analisarDimensaoComIA(parametros: ParametrosAnaliseDimensao) {
  const {
    dimensaoId,
    usuarioId,
  } = parametros;
  const parsed = await executarAnaliseEstruturada(parametros);
  const admin = criarClienteAdmin();

  let totalCaracteristicasCriadas = 0;
  let totalRegrasCriadas = 0;
  let totalEvidenciasCriadas = 0;

  for (const carac of parsed.caracteristicas) {
    const { data: novaCarac, error: errCarac } = await admin
      .schema("cerebro_autoral")
      .from("caracteristicas")
      .insert({
        dimensao_id: dimensaoId,
        usuario_id: usuarioId,
        titulo: carac.titulo,
        descricao: carac.descricao,
        formula_metodologica: carac.formula_metodologica,
        origem: "nucleo_autoral",
        confianca_calculada:
          carac.evidencias.length > 0
            ? Math.min(
                0.99,
                carac.evidencias.reduce((soma, evidencia) => soma + evidencia.forca_evidencia, 0) /
                  carac.evidencias.length
              )
            : 0,
        total_evidencias: carac.evidencias.length,
        total_contraevidencias: 0,
        total_obras_distintas: 1,
        estado_revisao: "confirmada",
      })
      .select()
      .single();

    if (errCarac || !novaCarac) {
      console.error("Erro ao persistir característica legada:", errCarac);
      continue;
    }

    totalCaracteristicasCriadas++;

    for (const regra of carac.regras) {
      const { error } = await admin
        .schema("cerebro_autoral")
        .from("regras")
        .insert({
          usuario_id: usuarioId,
          dimensao_id: dimensaoId,
          caracteristica_id: novaCarac.id,
          tipo_regra: regra.tipo,
          enunciado: regra.enunciado,
          explicacao: regra.explicacao,
          peso: 1.0,
          ativa: true,
        });
      if (!error) totalRegrasCriadas++;
    }

    for (const evid of carac.evidencias) {
      const { error } = await admin
        .schema("processamento")
        .from("evidencias")
        .insert({
          usuario_id: usuarioId,
          fragmento_id: evid.fragmento_id,
          dimensao_id: dimensaoId,
          trecho_citado: evid.trecho_citado,
          explicacao: evid.explicacao,
          forca_evidencia: evid.forca_evidencia,
          estado_revisao: "confirmada",
        });
      if (!error) totalEvidenciasCriadas++;
    }
  }

  return {
    sucesso: true,
    totalCaracteristicas: totalCaracteristicasCriadas,
    totalRegras: totalRegrasCriadas,
    totalEvidencias: totalEvidenciasCriadas,
  };
}
