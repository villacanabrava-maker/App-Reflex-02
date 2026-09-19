/**
 * Golden Dataset V3 Seeds — Fixtures Sintéticas e Higienizadas
 * Missão: MIS-0007 (Wave 1: Fundação Epistemológica Executável)
 * 
 * Contém casos de teste representativos para as 12 famílias de raciocínio cognitivo (CBR),
 * totalmente livres de dados privados de usuários e estruturadas para avaliação contínua.
 */

import {
  EpistemicStatus,
  SourceRole,
  ClaimType,
} from "../../../src/tipos/cognitivo-v3";

export interface GoldenTestCase {
  id: string;
  family:
    | "INGEST"
    | "CLAIM"
    | "MEMORY"
    | "TEMPORAL"
    | "TAXONOMY"
    | "RETRIEVAL"
    | "CONTRADICTION"
    | "AUTHOR"
    | "ABSTENTION"
    | "GENERATION"
    | "LEARNING"
    | "PROVENANCE";
  description: string;
  isWave1Executable: boolean; // Flag para distinguir testes executáveis na Wave 1
  isWave2Executable?: boolean; // Flag para casos executáveis na Wave 2 (Event Ledger e Transições)
  sourceInput: {
    text: string;
    sourceType: "obra" | "versao_obra" | "fragmento" | "reflexao" | "nota_avulsa";
    sourceId: string;
    sourceVersion: number;
  };
  expectedBehavior: {
    shouldExtract: boolean;
    expectedClaimCount?: number;
    expectedEpistemicStatus?: EpistemicStatus;
    expectedAuthorialRole?: SourceRole;
    expectedClaimType?: ClaimType;
    shouldAbstain?: boolean;
    forbiddenClaimsSubstrings?: string[];
    mustContainHashMatching?: boolean;
    mustRejectFirewallViolation?: boolean;
  };
  notes: string;
}

export const GOLDEN_DATASET_V3_SEEDS: GoldenTestCase[] = [
  // --------------------------------------------------------------------------
  // 1. FAMÍLIA: INGEST (Ingestão com Preservação Factual de Span)
  // --------------------------------------------------------------------------
  {
    id: "CBR-01-INGEST-CLEAN",
    family: "INGEST",
    description: "Extração limpa de asserção autoral direta preservando span e proveniência.",
    isWave1Executable: true,
    sourceInput: {
      text: "Eu decidi adotar fichamentos manuscritos antes de qualquer redação formal.",
      sourceType: "obra",
      sourceId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      sourceVersion: 1,
    },
    expectedBehavior: {
      shouldExtract: true,
      expectedClaimCount: 1,
      expectedEpistemicStatus: "extracted",
      expectedAuthorialRole: "AUTHOR_EXPLICIT",
      expectedClaimType: "AUTHOR_EXPLICIT_CLAIM",
      mustContainHashMatching: true,
    },
    notes: "Verifica se a 1ª pessoa é corretamente associada à autoridade explícita com span íntegro.",
  },

  // --------------------------------------------------------------------------
  // 2. FAMÍLIA: CLAIM (Descontextualização e Resolução Proposicional)
  // --------------------------------------------------------------------------
  {
    id: "CBR-02-CLAIM-DECONTEXT",
    family: "CLAIM",
    description: "Descontextualização atômica sem perda de sentido proposicional.",
    isWave1Executable: true,
    sourceInput: {
      text: "A clareza sintática precede a elegância estética na prosa reflexiva.",
      sourceType: "fragmento",
      sourceId: "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
      sourceVersion: 1,
    },
    expectedBehavior: {
      shouldExtract: true,
      expectedClaimCount: 1,
      expectedEpistemicStatus: "extracted",
      expectedAuthorialRole: "UNKNOWN", // Afirmação geral sem 1ª pessoa explícita nasce UNKNOWN (princípio UNKNOWN != AUTHORIAL)
      expectedClaimType: "SOURCE_CLAIM",
    },
    notes: "Garante que declarações genéricas não recebam authorial role sem chancela expressa.",
  },

  // --------------------------------------------------------------------------
  // 3. FAMÍLIA: MEMORY (Memory-Inference Firewall contra Vazamento)
  // --------------------------------------------------------------------------
  {
    id: "CBR-03-MEMORY-FIREWALL-INFERENCE",
    family: "MEMORY",
    description: "Tentativa de promover dedução probabilística como fato lembrado pelo autor (MILR).",
    isWave1Executable: true,
    sourceInput: {
      text: "O autor talvez sinta certa hesitação ao concluir ensaios longos.",
      sourceType: "fragmento",
      sourceId: "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f",
      sourceVersion: 1,
    },
    expectedBehavior: {
      shouldExtract: false, // Incerteza ('talvez') deve ser rejeitada pelo validador NLI ou neutralizada
      mustRejectFirewallViolation: true,
      forbiddenClaimsSubstrings: ["O autor tem certeza de hesitação", "Lembro que você hesita"],
    },
    notes: "Caso primário para validação do MILR = 0.0%.",
  },

  // --------------------------------------------------------------------------
  // 4. FAMÍLIA: TEMPORAL (Evolução Temporal e Superação Epistêmica)
  // --------------------------------------------------------------------------
  {
    id: "CBR-04-TEMPORAL-SUPERSEDED",
    family: "TEMPORAL",
    description: "Detecção de tese que superou visão antiga no tempo e registro de transição superseded no ledger.",
    isWave1Executable: false,
    isWave2Executable: true, // Executável na Wave 2 (Event Ledger)
    sourceInput: {
      text: "Revendo minha tese de 2020, abandonei a abordagem positivista.",
      sourceType: "obra",
      sourceId: "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a",
      sourceVersion: 2,
    },
    expectedBehavior: {
      shouldExtract: true,
      expectedEpistemicStatus: "superseded",
    },
    notes: "Contrato formal para a Wave 2 (Timeline de Eventos Epistêmicos).",
  },

  // --------------------------------------------------------------------------
  // 5. FAMÍLIA: TAXONOMY (Ancoragem Conceitual SKOS)
  // --------------------------------------------------------------------------
  {
    id: "CBR-05-TAXONOMY-SKOS-ALIGNMENT",
    family: "TAXONOMY",
    description: "Contrato futuro: associação de claim com conceito ontológico SKOS.",
    isWave1Executable: false, // Executável na Wave 3 (Ontologia SKOS)
    sourceInput: {
      text: "A hermenêutica filosófica difere do método empírico.",
      sourceType: "fragmento",
      sourceId: "e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b",
      sourceVersion: 1,
    },
    expectedBehavior: {
      shouldExtract: true,
    },
    notes: "Contrato formal para a Wave 3.",
  },

  // --------------------------------------------------------------------------
  // 6. FAMÍLIA: RETRIEVAL (Recuperação Híbrida sob Orçamento)
  // --------------------------------------------------------------------------
  {
    id: "CBR-06-RETRIEVAL-BUDGET",
    family: "RETRIEVAL",
    description: "Contrato futuro: busca com alocação máxima de tokens.",
    isWave1Executable: false, // Executável na Wave 3 & 4
    sourceInput: {
      text: "Recuperar apenas premissas que caibam no orçamento de 500 tokens.",
      sourceType: "reflexao",
      sourceId: "f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c",
      sourceVersion: 1,
    },
    expectedBehavior: {
      shouldExtract: true,
    },
    notes: "Contrato formal para a Wave 4 (Dossiê Contextual).",
  },

  // --------------------------------------------------------------------------
  // 7. FAMÍLIA: CONTRADICTION (Detecção de Contradição Lógica)
  // --------------------------------------------------------------------------
  {
    id: "CBR-07-CONTRADICTION-NLI",
    family: "CONTRADICTION",
    description: "Detecção de polaridade invertida: o claim não pode contradizer a fonte.",
    isWave1Executable: true,
    sourceInput: {
      text: "Eu nunca publico rascunhos sem antes revisar pessoalmente três vezes.",
      sourceType: "obra",
      sourceId: "a7b8c9d0-e1f2-3a4b-5c6d-7e8f9a0b1c2d",
      sourceVersion: 1,
    },
    expectedBehavior: {
      shouldExtract: true,
      forbiddenClaimsSubstrings: ["O autor publica rascunhos sem revisar"],
    },
    notes: "Valida que o NLI marca hipóteses invertidas como CONTRADICTION e as descarta.",
  },

  // --------------------------------------------------------------------------
  // 8. FAMÍLIA: AUTHOR (Soberania Autoral vs Citação de Terceiro - AMR)
  // --------------------------------------------------------------------------
  {
    id: "CBR-08-AUTHOR-EXTERNAL-SOURCE",
    family: "AUTHOR",
    description: "Citação de terceiro em obra da biblioteca nunca vira autoria primária (AMR).",
    isWave1Executable: true,
    sourceInput: {
      text: "Segundo Kant, o imperativo categórico é a lei universal da moralidade.",
      sourceType: "obra",
      sourceId: "b8c9d0e1-f2a3-4b5c-6d7e-8f9a0b1c2d3e",
      sourceVersion: 1,
    },
    expectedBehavior: {
      shouldExtract: true,
      expectedAuthorialRole: "EXTERNAL_SOURCE", // Jamais AUTHOR_EXPLICIT
      expectedClaimType: "SOURCE_CLAIM",
      forbiddenClaimsSubstrings: ["Você defende o imperativo categórico", "O autor criou o imperativo"],
    },
    notes: "Métrica primária de AMR: proibido atribuir citação externa à autoria do usuário.",
  },

  // --------------------------------------------------------------------------
  // 9. FAMÍLIA: ABSTENTION (Abstenção Honesta por Ausência de Dados)
  // --------------------------------------------------------------------------
  {
    id: "CBR-09-ABSTENTION-AMBIGUOUS",
    family: "ABSTENTION",
    description: "Texto ambíguo ou inconclusivo aciona a regra: Ambiguidade -> Não Extrai.",
    isWave1Executable: true,
    sourceInput: {
      text: "Pode ser que algo tenha acontecido naquele dia, ou não.",
      sourceType: "fragmento",
      sourceId: "c9d0e1f2-a3b4-5c6d-7e8f-9a0b1c2d3e4f",
      sourceVersion: 1,
    },
    expectedBehavior: {
      shouldExtract: false,
      shouldAbstain: true,
    },
    notes: "Verifica que proposições ambíguas são descartadas preventivamente.",
  },

  // --------------------------------------------------------------------------
  // 10. FAMÍLIA: GENERATION (Dossiê Contextual com Allowed Use)
  // --------------------------------------------------------------------------
  {
    id: "CBR-10-GENERATION-SEGREGATED",
    family: "GENERATION",
    description: "Contrato futuro: injeção em Working Memory respeitando compartimentos.",
    isWave1Executable: false, // Executável na Wave 4
    sourceInput: {
      text: "Dossiê com tags CAN_BE_STATED_AS_FACT.",
      sourceType: "reflexao",
      sourceId: "d0e1f2a3-b4c5-6d7e-8f9a-0b1c2d3e4f5a",
      sourceVersion: 1,
    },
    expectedBehavior: {
      shouldExtract: true,
    },
    notes: "Contrato formal para a Wave 4.",
  },

  // --------------------------------------------------------------------------
  // 11. FAMÍLIA: LEARNING (Aprendizado por Edição do Autor)
  // --------------------------------------------------------------------------
  {
    id: "CBR-11-LEARNING-USER-EDIT",
    family: "LEARNING",
    description: "Contrato futuro: diff de edição do usuário gera proposta estruturada.",
    isWave1Executable: false, // Executável na Wave 6
    sourceInput: {
      text: "Autor altera frase sugerida pela IA removendo jargão corporativo.",
      sourceType: "reflexao",
      sourceId: "e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b",
      sourceVersion: 1,
    },
    expectedBehavior: {
      shouldExtract: true,
    },
    notes: "Contrato formal para a Wave 6.",
  },

  // --------------------------------------------------------------------------
  // 12. FAMÍLIA: PROVENANCE (Integridade com Acentos, Emojis e Aspas Curvas)
  // --------------------------------------------------------------------------
  {
    id: "CBR-12-PROVENANCE-UNICODE-COMPLEX",
    family: "PROVENANCE",
    description: "Preservação exata de offsets e hashing SHA-256 com caracteres complexos em português.",
    isWave1Executable: true,
    sourceInput: {
      text: "“A imaginação é a prévia das atrações da vida” — anotação com acentuação e aspas curvas.",
      sourceType: "nota_avulsa",
      sourceId: "f2a3b4c5-d6e7-8f9a-0b1c-2d3e4f5a6b7c",
      sourceVersion: 1,
    },
    expectedBehavior: {
      shouldExtract: true,
      expectedClaimCount: 1,
      mustContainHashMatching: true,
    },
    notes: "Verifica que a normalização NFC e o cálculo UTF-16 não quebram o span factual.",
  },
];
