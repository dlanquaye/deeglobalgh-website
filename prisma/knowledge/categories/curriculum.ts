import { KnowledgeNodeType } from "@prisma/client";

export const curriculumCategories = [
  {
    code: "CAT_TEXTBOOK",
    slug: "textbooks",
    name: "Textbooks",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_WORKBOOK",
    slug: "workbooks",
    name: "Workbooks",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_ACTIVITY_BOOK",
    slug: "activity-books",
    name: "Activity Books",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_READERS",
    slug: "readers",
    name: "Readers",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_REFERENCE",
    slug: "reference-books",
    name: "Reference Books",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_TEACHER_GUIDE",
    slug: "teacher-guides",
    name: "Teacher Guides",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_ASSESSMENT",
    slug: "assessment-books",
    name: "Assessment Books",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_EXAM_PRACTICE",
    slug: "exam-practice",
    name: "Exam Practice",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
];