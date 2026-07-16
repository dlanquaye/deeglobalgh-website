import { KnowledgeRelationType } from "@prisma/client";

export const knowledgeRelationships = [
  {
    sourceCode: "CAT_PENCIL_CONTROL",
    targetCode: "DEV_FINE_MOTOR",
    relationshipType: KnowledgeRelationType.SUPPORTS,
    weight: 1,
  },
  {
    sourceCode: "DEV_FINE_MOTOR",
    targetCode: "OUT_SCHOOL_READY",
    relationshipType: KnowledgeRelationType.CONTRIBUTES_TO,
    weight: 1,
  },
  {
    sourceCode: "CAT_HANDWRITING",
    targetCode: "CAT_PENCIL_CONTROL",
    relationshipType: KnowledgeRelationType.REQUIRES,
    weight: 1,
  },
  {
    sourceCode: "CAT_PRE_WRITING",
    targetCode: "CAT_PENCIL_CONTROL",
    relationshipType: KnowledgeRelationType.REQUIRES,
    weight: 1,
  },
  {
    sourceCode: "CAT_TRACE_AND_COLOUR",
    targetCode: "CAT_PENCIL_CONTROL",
    relationshipType: KnowledgeRelationType.SUPPORTS,
    weight: 1,
  },
  {
    sourceCode: "CAT_WRITE_AND_COLOUR",
    targetCode: "CAT_HANDWRITING",
    relationshipType: KnowledgeRelationType.SUPPORTS,
    weight: 1,
  },
  {
    sourceCode: "CAT_READ_AND_COLOUR",
    targetCode: "CAT_GRADUATED_READERS",
    relationshipType: KnowledgeRelationType.SUPPORTS,
    weight: 1,
  },
  {
    sourceCode: "CAT_COUNT_AND_COLOUR",
    targetCode: "SUB_MATHEMATICS",
    relationshipType: KnowledgeRelationType.SUPPORTS,
    weight: 1,
  },
];