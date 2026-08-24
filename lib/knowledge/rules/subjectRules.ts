import { KnowledgeRule } from "../engine/types"

export const subjectRules: KnowledgeRule[] = [
  {
  nodeCode: "SUB_ENGLISH",
  priority: 100,
  baseScore: 100,
  patterns: [
    "english language",
    "english",
    "language and literacy",
    "language & literacy",
    "literacy skills",
    "phonics"
  ]
},

  {
    nodeCode: "SUB_CORE_MATHEMATICS",
    priority: 120,
    baseScore: 100,
    patterns: [
      "core mathematics"
    ]
  },

  {
    nodeCode: "SUB_GENERAL_MATHEMATICS",
    priority: 120,
    baseScore: 100,
    patterns: [
      "general mathematics"
    ]
  },

  {
    nodeCode: "SUB_ELECTIVE_MATHEMATICS",
    priority: 120,
    baseScore: 100,
    patterns: [
      "elective mathematics"
    ]
  },

  {
  nodeCode: "SUB_MATHEMATICS",
  priority: 90,
  baseScore: 100,
  patterns: [
    "mathematics",
    "maths",
    "math",
    "numeracy"
  ]
},

  {
    nodeCode: "SUB_INTEGRATED_SCIENCE",
    priority: 120,
    baseScore: 100,
    patterns: [
      "integrated science"
    ]
  },

  {
    nodeCode: "SUB_SCIENCE",
    priority: 80,
    baseScore: 100,
    patterns: [
      "science"
    ]
  },

  {
    nodeCode: "SUB_SOCIAL_STUDIES",
    priority: 120,
    baseScore: 100,
    patterns: [
      "social studies"
    ]
  },

  {
    nodeCode: "SUB_HISTORY",
    priority: 120,
    baseScore: 100,
    patterns: [
      "history"
    ]
  },

  {
  nodeCode: "SUB_CREATIVE_ARTS",
  priority: 120,
  baseScore: 100,
  patterns: [
    "creative arts",
    "creative art",
    "creativity"
  ]
},

  {
    nodeCode: "SUB_RME",
    priority: 120,
    baseScore: 100,
    patterns: [
      "religious and moral education",
      "religious & moral education",
      "rme"
    ]
  },

  {
    nodeCode: "SUB_FRENCH",
    priority: 120,
    baseScore: 100,
    patterns: [
      "french"
    ]
  },

  // =========================
// SHS Core & Elective Subjects
// =========================

{
  nodeCode: "SUB_PHYSICS",
  priority: 120,
  baseScore: 100,
  patterns: [
    "physics"
  ]
},

{
  nodeCode: "SUB_CHEMISTRY",
  priority: 120,
  baseScore: 100,
  patterns: [
    "chemistry"
  ]
},

{
  nodeCode: "SUB_BIOLOGY",
  priority: 120,
  baseScore: 100,
  patterns: [
    "biology"
  ]
},

{
  nodeCode: "SUB_ECONOMICS",
  priority: 120,
  baseScore: 100,
  patterns: [
    "economics"
  ]
},

{
  nodeCode: "SUB_GEOGRAPHY",
  priority: 120,
  baseScore: 100,
  patterns: [
    "geography"
  ]
},

{
  nodeCode: "SUB_GOVERNMENT",
  priority: 120,
  baseScore: 100,
  patterns: [
    "government"
  ]
},

{
  nodeCode: "SUB_LITERATURE_IN_ENGLISH",
  priority: 130,
  baseScore: 100,
  patterns: [
    "literature in english",
    "literature"
  ]
},

{
  nodeCode: "SUB_COMPUTING",
  priority: 130,
  baseScore: 100,
  patterns: [
    "computing",
    "computer studies"
  ]
},

{
  nodeCode: "SUB_ICT",
  priority: 130,
  baseScore: 100,
  patterns: [
    "ict",
    "information and communication technology"
  ]
},

{
  nodeCode: "SUB_FINANCIAL_ACCOUNTING",
  priority: 130,
  baseScore: 100,
  patterns: [
    "financial accounting"
  ]
},

{
  nodeCode: "SUB_COST_ACCOUNTING",
  priority: 130,
  baseScore: 100,
  patterns: [
    "cost accounting"
  ]
},

{
  nodeCode: "SUB_BUSINESS_MANAGEMENT",
  priority: 130,
  baseScore: 100,
  patterns: [
    "business management"
  ]
},

{
  nodeCode: "SUB_FOODS_AND_NUTRITION",
  priority: 130,
  baseScore: 100,
  patterns: [
    "foods and nutrition",
    "food and nutrition"
  ]
},

{
  nodeCode: "SUB_MANAGEMENT_IN_LIVING",
  priority: 130,
  baseScore: 100,
  patterns: [
    "management in living"
  ]
},

{
  nodeCode: "SUB_GRAPHIC_DESIGN",
  priority: 130,
  baseScore: 100,
  patterns: [
    "graphic design"
  ]
},

{
  nodeCode: "SUB_OUR_WORLD",
  priority: 120,
  baseScore: 100,
  patterns: [
    "owop",
    "our world our people",
    "our world and our people",
  ]
},


{
  nodeCode: "SUB_MUSIC",
  priority: 120,
  baseScore: 100,
  patterns: [
    "music"
  ]
},
]