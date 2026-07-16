/**
 * Category Slug → Knowledge Node Code
 *
 * This is the first stage of automatic classification.
 * Existing products already have categorySlug values.
 * We translate those into Knowledge Nodes.
 */

export const CATEGORY_SLUG_MAPPING: Record<string, string> = {
  handwriting: "CAT_HANDWRITING",
  "pencil-control": "CAT_PENCIL_CONTROL",
  "pre-writing": "CAT_PRE_WRITING",

  phonics: "CAT_PHONICS",

  readers: "CAT_READERS",
  "graduated-readers": "CAT_GRADUATED_READERS",

  grammar: "CAT_GRAMMAR",
  spelling: "CAT_SPELLING",
  composition: "CAT_COMPOSITION",

  mathematics: "SUB_MATHEMATICS",
  english: "SUB_ENGLISH",

  textbooks: "CAT_TEXTBOOK",
  workbooks: "CAT_WORKBOOK",
  "activity-books": "CAT_ACTIVITY_BOOK",

  "write-and-colour": "CAT_WRITE_AND_COLOUR",
  "read-and-colour": "CAT_READ_AND_COLOUR",
  "trace-and-colour": "CAT_TRACE_AND_COLOUR",
  "draw-and-colour": "CAT_DRAW_AND_COLOUR",
};