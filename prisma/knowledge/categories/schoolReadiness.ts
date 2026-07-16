import { KnowledgeNodeType } from "@prisma/client";

/**
 * School Readiness Categories
 * Approved DeeglobalGH Educational Knowledge Ontology
 */

export const schoolReadinessCategories = [
  
  {
    code: "CAT_FINE_MOTOR_SKILLS",
    slug: "fine-motor-skills",
    name: "Fine Motor Skills",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_VISUAL_DISCRIMINATION",
    slug: "visual-discrimination",
    name: "Visual Discrimination",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_EYE_HAND_COORDINATION",
    slug: "eye-hand-coordination",
    name: "Eye-Hand Coordination",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_PRE_NUMBER",
    slug: "pre-number-concepts",
    name: "Pre-Number Concepts",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_PRE_READING",
    slug: "pre-reading",
    name: "Pre-Reading",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_SHAPE_RECOGNITION",
    slug: "shape-recognition",
    name: "Shape Recognition",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
  {
    code: "CAT_PATTERN_RECOGNITION",
    slug: "pattern-recognition",
    name: "Pattern Recognition",
    nodeType: KnowledgeNodeType.CATEGORY,
  },
];