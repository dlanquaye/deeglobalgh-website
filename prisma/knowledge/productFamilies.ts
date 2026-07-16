import { KnowledgeNodeType } from "@prisma/client";

export const productFamilies = [
  {
    code: "PF_CURRICULUM",
    slug: "curriculum-resources",
    name: "Curriculum Resources",
    nodeType: KnowledgeNodeType.PRODUCT_FAMILY,
  },
  {
    code: "PF_ACTIVITY",
    slug: "integrated-activity-books",
    name: "Integrated Activity Books",
    nodeType: KnowledgeNodeType.PRODUCT_FAMILY,
  },
  {
    code: "PF_SCHOOL_READINESS",
    slug: "school-readiness-resources",
    name: "School Readiness Resources",
    nodeType: KnowledgeNodeType.PRODUCT_FAMILY,
  },
  {
    code: "PF_CREATIVE",
    slug: "creative-enrichment-resources",
    name: "Creative & Enrichment Resources",
    nodeType: KnowledgeNodeType.PRODUCT_FAMILY,
  },
  {
    code: "PF_RELIGIOUS",
    slug: "religious-moral-resources",
    name: "Religious & Moral Resources",
    nodeType: KnowledgeNodeType.PRODUCT_FAMILY,
  },
  {
    code: "PF_REFERENCE",
    slug: "reference-resources",
    name: "Reference Resources",
    nodeType: KnowledgeNodeType.PRODUCT_FAMILY,
  },
  {
    code: "PF_EXAM",
    slug: "exam-preparation-resources",
    name: "Exam Preparation Resources",
    nodeType: KnowledgeNodeType.PRODUCT_FAMILY,
  },
  {
    code: "PF_LANGUAGE",
    slug: "language-development-resources",
    name: "Language Development Resources",
    nodeType: KnowledgeNodeType.PRODUCT_FAMILY,
  },
];