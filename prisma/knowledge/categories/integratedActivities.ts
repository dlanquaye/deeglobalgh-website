import { KnowledgeNodeType } from "@prisma/client";

/**
 * Integrated Activity Books
 * Standalone educational product categories.
 * They are NOT combinations of other categories.
 */

export const integratedActivityCategories = [
  {
    code: "CAT_WRITE_AND_COLOUR",
    slug: "write-and-colour",
    name: "Write and Colour",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_READ_AND_COLOUR",
    slug: "read-and-colour",
    name: "Read and Colour",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_TRACE_AND_COLOUR",
    slug: "trace-and-colour",
    name: "Trace and Colour",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_DRAW_AND_COLOUR",
    slug: "draw-and-colour",
    name: "Draw and Colour",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_COUNT_AND_COLOUR",
    slug: "count-and-colour",
    name: "Count and Colour",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_PICTURE_READING_AND_COLOURING",
    slug: "picture-reading-and-colouring",
    name: "Picture Reading and Colouring",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_ART_AND_COLOURING",
    slug: "art-and-colouring",
    name: "Art and Colouring",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_STICK_AND_COLOUR",
    slug: "stick-and-colour",
    name: "Stick and Colour",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_CUT_AND_PASTE",
    slug: "cut-and-paste",
    name: "Cut and Paste",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
];