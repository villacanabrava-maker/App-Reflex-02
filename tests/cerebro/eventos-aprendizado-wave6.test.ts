import { describe, expect, it } from "vitest";
import {
  EventTypeEnum,
  MemoryEventPayloadUnion,
} from "@/tipos/cognitivo-v3";

describe("MIS-0012 - eventos de aprendizado autoral", () => {
  it("reconhece os eventos de decisão humana da Wave 6", () => {
    expect(
      EventTypeEnum.parse("LEARNING_PROPOSAL_CONFIRMED_BY_AUTHOR")
    ).toBe("LEARNING_PROPOSAL_CONFIRMED_BY_AUTHOR");

    expect(
      EventTypeEnum.parse("LEARNING_PROPOSAL_REJECTED_BY_AUTHOR")
    ).toBe("LEARNING_PROPOSAL_REJECTED_BY_AUTHOR");
  });

  it("valida payload de confirmação com entidade materializada", () => {
    const resultado = MemoryEventPayloadUnion.parse({
      event_type: "LEARNING_PROPOSAL_CONFIRMED_BY_AUTHOR",
      data: {
        proposta_id: "c9b77e84-4217-4de1-b958-796088a9c0be",
        tipo_proposta: "atualizacao_regra",
        decisao: "confirmada",
        entidade_tipo: "regra",
        entidade_id: "25e9f50a-e221-4510-ae57-a563924617cf",
        notas_autor_presentes: true,
      },
    });

    expect(resultado.data.decisao).toBe("confirmada");
  });

  it("valida rejeição sem entidade cognitiva", () => {
    const resultado = MemoryEventPayloadUnion.parse({
      event_type: "LEARNING_PROPOSAL_REJECTED_BY_AUTHOR",
      data: {
        proposta_id: "ddc58349-f227-429c-8b46-0dc91c528a82",
        tipo_proposta: "nova_metodologia",
        decisao: "rejeitada",
        entidade_tipo: "nenhuma",
        entidade_id: null,
        notas_autor_presentes: false,
      },
    });

    expect(resultado.data.entidade_id).toBeNull();
  });

  it("falha fechado quando o evento e a decisão divergem", () => {
    expect(() =>
      MemoryEventPayloadUnion.parse({
        event_type: "LEARNING_PROPOSAL_CONFIRMED_BY_AUTHOR",
        data: {
          proposta_id: "c9b77e84-4217-4de1-b958-796088a9c0be",
          tipo_proposta: "atualizacao_regra",
          decisao: "rejeitada",
          entidade_tipo: "nenhuma",
          entidade_id: null,
          notas_autor_presentes: false,
        },
      })
    ).toThrow();
  });
});
