export enum KnowledgeNodeType {
  PRODUCT_FAMILY = "PRODUCT_FAMILY",
  CATEGORY = "CATEGORY",
  SUBJECT = "SUBJECT",
  EDUCATIONAL_CAPABILITY = "EDUCATIONAL_CAPABILITY",
  DEVELOPMENTAL_CAPABILITY = "DEVELOPMENTAL_CAPABILITY",
  COGNITIVE_CAPABILITY = "COGNITIVE_CAPABILITY",
  EDUCATIONAL_OUTCOME = "EDUCATIONAL_OUTCOME",
  LIFE_SKILL = "LIFE_SKILL",
  CHARACTER_TRAIT = "CHARACTER_TRAIT",
}

export enum KnowledgeRelationType {
  RELATED_TO = "RELATED_TO",
  RECOMMENDS = "RECOMMENDS",
  SUPPORTS = "SUPPORTS",
  REQUIRES = "REQUIRES",
  PREREQUISITE_FOR = "PREREQUISITE_FOR",
  CONTRIBUTES_TO = "CONTRIBUTES_TO",
  ENHANCES = "ENHANCES",
  COMPLEMENTS = "COMPLEMENTS",
  ALTERNATIVE_TO = "ALTERNATIVE_TO",
}

export interface CreateKnowledgeNodeInput {
  code: string
  slug: string
  name: string
  description?: string
  nodeType: KnowledgeNodeType
  parentId?: string | null
}

export interface CreateKnowledgeRelationshipInput {
  sourceId: string
  targetId: string
  relationshipType: KnowledgeRelationType
  weight?: number
}