import { KnowledgeRule } from "../engine/types";

export const activityRules: KnowledgeRule[] = [
  {
    nodeCode: "ACT_READING",
    priority: 100,
    baseScore: 100,
    patterns: [
      "reading",
      "read",
      "reader",
      "reading comprehension"
    ]
  },

  {
    nodeCode: "ACT_WRITING",
    priority: 100,
    baseScore: 100,
    patterns: [
      "writing",
      "write",
      "written",
      "composition"
    ]
  },

  {
    nodeCode: "ACT_TRACING",
    priority: 100,
    baseScore: 100,
    patterns: [
      "tracing",
      "trace",
      "trace and write"
    ]
  },

  {
    nodeCode: "ACT_COLOURING",
    priority: 100,
    baseScore: 100,
    patterns: [
      "colouring",
      "coloring",
      "colour",
      "color"
    ]
  },

  {
    nodeCode: "ACT_REVISION",
    priority: 100,
    baseScore: 100,
    patterns: [
      "revision",
      "revision guide",
      "revision questions",
      "review"
    ]
  },

  {
    nodeCode: "ACT_PRACTICE",
    priority: 100,
    baseScore: 100,
    patterns: [
      "practice",
      "practise",
      "practice book",
      "practice questions"
    ]
  },

  {
    nodeCode: "ACT_ASSESSMENT",
    priority: 100,
    baseScore: 100,
    patterns: [
      "assessment",
      "assessment book",
      "assessment test",
      "assessment workbook"
    ]
  },

  {
    nodeCode: "ACT_EXERCISES",
    priority: 100,
    baseScore: 100,
    patterns: [
      "exercise",
      "exercises",
      "exercise book",
      "exercise workbook"
    ]
  },

  {
    nodeCode: "ACT_LISTENING",
    priority: 100,
    baseScore: 100,
    patterns: [
      "listening",
      "listen",
      "audio listening"
    ]
  },

  {
    nodeCode: "ACT_SPEAKING",
    priority: 100,
    baseScore: 100,
    patterns: [
      "speaking",
      "speak",
      "oral",
      "oral practice"
    ]
  }
];