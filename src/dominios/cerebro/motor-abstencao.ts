/**
 * Motor de Abstenção Honesta — Cérebro Reflex V3.1 (Wave 5)
 * Padrão: 7 Modalidades Formais, Avaliação Pré e Pós-Geração, Mensagens Templated Determinísticas.
 * Princípio: "Saber o que não sabe é a mais alta virtude epistemológica."
 */

import {
  AbstentionCategory,
  DossierV31,
  OutputClaimAudit,
} from "@/tipos/cognitivo-v3";
import { RETRIEVAL_CONFIG_V1 } from "@/config/retrieval-config";

export interface ResultadoAbstencao {
  deve_abster: boolean;
  categoria?: AbstentionCategory;
  tipo_resultado: "COGNITIVE_ABSTENTION" | "NORMAL_EXECUTION" | "TECHNICAL_ERROR";
  mensagem_usuario?: string;
  resumo_evidencias_disponiveis?: string;
  acoes_sugeridas?: string[];
  detalhes_tecnicos?: string;
}

export class MotorAbstencaoHonesta {
  /**
   * Avaliação de Pré-Geração:
   * Intercepta consultas antes da chamada ao modelo redator se o Dossiê já demonstrar insuficiência.
   * Evita gasto de tokens com geração que seria inevitavelmente rejeitada.
   */
  public static avaliarPreGeracao(dossie: DossierV31): ResultadoAbstencao {
    // 1. Caso: Dossiê já sinalizado como abstido pelo Retrieval
    if (dossie.abstained) {
      return MotorAbstencaoHonesta.gerarTemplateAbstencao(
        "NO_EVIDENCE",
        "Nenhuma evidência relevante ou lastro documental foi encontrado no acervo para fundamentar esta indagação.",
        "0 fragmentos relevantes localizados.",
        [
          "Cadastre anotações, fichamentos ou reflexões sobre o tema na Biblioteca.",
          "Reformule a consulta utilizando termos mais próximos ao vocabulário dos seus textos.",
        ]
      );
    }

    const todosItens = Object.values(dossie.compartments).flat();
    const itensEvidencia = todosItens.filter(
      (i) => i.compartment === "direct_evidence" || i.compartment === "semantic_memory" || i.compartment === "episodic_memory"
    );

    // 2. Caso: Total de evidências recuperadas é zero
    if (itensEvidencia.length === 0) {
      return MotorAbstencaoHonesta.gerarTemplateAbstencao(
        "NO_EVIDENCE",
        "Não foram encontradas notas, memórias ou passagens textuais que respondam à sua consulta.",
        "Nenhum fragmento de evidência disponível no Dossiê.",
        ["Adicione documentos pertinentes ou tente uma busca mais abrangente."]
      );
    }

    // 3. Caso: Consulta de crença ou autoria pessoal (AUTHORIAL) sem lastro autoral
    if (dossie.intent === "AUTHORIAL") {
      const temMemoriaAutoral = itensEvidencia.some(
        (i) => i.authorial_scope === "autoral" && (i.epistemic_status === "confirmed_authorial" || i.epistemic_status === "extracted")
      );

      if (!temMemoriaAutoral) {
        const apenasExterno = itensEvidencia.every((i) => i.authorial_scope === "externo");
        const categoria: AbstentionCategory = apenasExterno ? "SOURCE_ONLY" : "AUTHORIAL_UNKNOWN";

        return MotorAbstencaoHonesta.gerarTemplateAbstencao(
          categoria,
          "Você indagou sobre uma posição, preferência ou tese autoral sua, porém seu acervo não contém registros que confirmem sua posição sobre esse ponto.",
          `${itensEvidencia.length} fonte(s) externa(s) encontrada(s), mas nenhuma memória do autor.`,
          [
            "Registre um áudio ou nota com sua perspectiva própria antes de solicitar um ensaio.",
            "Solicite uma análise comparativa ou expositiva em vez de uma atribuição de autoria.",
          ]
        );
      }
    }

    // 4. Caso: Baixo suporte empírico generalizado (todos os itens abaixo do threshold de confiança)
    const pontuacoes = itensEvidencia.map((i) => {
      const score = (i.individual_scores as any)?.rrf_score || (i.individual_scores as any)?.dense_sim || 0;
      return score;
    });
    const maxScore = pontuacoes.length > 0 ? Math.max(...pontuacoes) : 0;

    if (maxScore > 0 && maxScore < RETRIEVAL_CONFIG_V1.abstention_threshold) {
      return MotorAbstencaoHonesta.gerarTemplateAbstencao(
        "LOW_SUPPORT",
        "O material localizado possui aderência muito fraca à sua indagação, insuficiente para garantir fidelidade epistemológica.",
        `Score máximo de relevância: ${maxScore.toFixed(4)} (abaixo do limiar ${RETRIEVAL_CONFIG_V1.abstention_threshold}).`,
        ["Refine a pergunta especificando conceitos ou autores centrais."]
      );
    }

    return {
      deve_abster: false,
      tipo_resultado: "NORMAL_EXECUTION",
    };
  }

  /**
   * Avaliação de Pós-Geração:
   * Avalia a saída auditada para decidir se o texto deve sofrer abstenção conclusiva.
   */
  public static avaliarPosGeracao(
    claimsAuditados: OutputClaimAudit[],
    _dossie: DossierV31
  ): ResultadoAbstencao {
    if (claimsAuditados.length === 0) {
      return {
        deve_abster: false,
        tipo_resultado: "NORMAL_EXECUTION",
      };
    }

    const claimsComViolacaoGrave = claimsAuditados.filter(
      (c) => c.support_status === "FORBIDDEN_USE" || c.violates_memory_firewall
    );

    const claimsContraditados = claimsAuditados.filter(
      (c) => c.support_status === "CONTRADICTED"
    );

    const claimsNaoSuportados = claimsAuditados.filter(
      (c) => c.support_status === "UNSUPPORTED"
    );

    // Se mais de 50% dos claims factuais não possuem suporte, abstenção é mandatória
    const claimsFactuais = claimsAuditados.filter(
      (c) => c.claim_type === "AUTHORIAL_ASSERTION" || c.claim_type === "FACTUAL_ASSERTION"
    );

    if (claimsFactuais.length > 0 && claimsNaoSuportados.length / claimsFactuais.length > 0.5) {
      return MotorAbstencaoHonesta.gerarTemplateAbstencao(
        "LOW_SUPPORT",
        "A reflexão gerada extrapolou substancialmente as evidências autorizadas do Dossiê Contextual.",
        `${claimsNaoSuportados.length} de ${claimsFactuais.length} afirmações factuais não encontraram lastro.`,
        ["Revisar o plano da reflexão para ancorar as teses em fragmentos existentes."]
      );
    }

    // Se houver contradição frontal não reconciliada
    if (claimsContraditados.length > 0) {
      return MotorAbstencaoHonesta.gerarTemplateAbstencao(
        "CONTRADICTORY_EVIDENCE",
        "A reflexão formulou conclusões que colidem frontalmente com evidências divergentes registradas no acervo.",
        `${claimsContraditados.length} afirmação(ões) contraditada(s) por contraevidências do Dossiê.`,
        ["Considere examinar a tensão dialética antes de formular uma tese conclusiva."]
      );
    }

    // Violação de Memory-Inference Firewall em autoria
    if (claimsComViolacaoGrave.length > 0) {
      return MotorAbstencaoHonesta.gerarTemplateAbstencao(
        "AUTHORIAL_UNKNOWN",
        "Foram detectadas afirmações que atribuem ao autor crenças oriundas exclusivamente de fontes externas ou deduções sem confirmação humana.",
        `${claimsComViolacaoGrave.length} violação(ões) do Memory-Inference Firewall detectada(s).`,
        ["Reescreva atenuando as afirmações sobre a autoria para hipóteses reflexivas."]
      );
    }

    return {
      deve_abster: false,
      tipo_resultado: "NORMAL_EXECUTION",
    };
  }

  /**
   * Constrói uma resposta padronizada e determinística de abstenção sem gerar novos LLMs
   */
  public static gerarTemplateAbstencao(
    categoria: AbstentionCategory,
    mensagem: string,
    resumoEvidencias: string,
    acoesSugeridas: string[]
  ): ResultadoAbstencao {
    return {
      deve_abster: true,
      categoria,
      tipo_resultado: "COGNITIVE_ABSTENTION",
      mensagem_usuario: mensagem,
      resumo_evidencias_disponiveis: resumoEvidencias,
      acoes_sugeridas: acoesSugeridas,
    };
  }
}
