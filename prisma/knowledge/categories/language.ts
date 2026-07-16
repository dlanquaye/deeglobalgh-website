import { KnowledgeNodeType } from "@prisma/client";

/**
 * Language Development Categories
 * Source: Approved DeeglobalGH Educational Knowledge Ontology
 */

export const languageCategories = [
  {
    code: "CAT_HANDWRITING",
    slug: "handwriting",
    name: "Handwriting",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_PRE_WRITING",
    slug: "pre-writing",
    name: "Pre-Writing",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_PENCIL_CONTROL",
    slug: "pencil-control",
    name: "Pencil Control",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_PHONICS",
    slug: "phonics",
    name: "Phonics",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_GRADUATED_READERS",
    slug: "graduated-readers",
    name: "Graduated Readers",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_READING_COMPREHENSION",
    slug: "reading-comprehension",
    name: "Reading Comprehension",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_SPELLING",
    slug: "spelling",
    name: "Spelling",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_VOCABULARY",
    slug: "vocabulary-development",
    name: "Vocabulary Development",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_GRAMMAR",
    slug: "grammar",
    name: "Grammar",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_COMPOSITION",
    slug: "composition",
    name: "Composition",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
];