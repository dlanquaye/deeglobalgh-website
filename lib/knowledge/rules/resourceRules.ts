import { KnowledgeRule } from "../engine/types";

export const resourceRules: KnowledgeRule[] = [
  {
    nodeCode: "RES_TEXTBOOK",
    priority: 100,
    baseScore: 100,
    patterns: [
      "textbook",
      "text book",
      "coursebook",
      "course book",
      "student book",
      "learner book",
      "pupil book"
    ]
  },

  {
    nodeCode: "RES_WORKBOOK",
    priority: 100,
    baseScore: 100,
    patterns: [
      "workbook",
      "work book",
      "work-book"
    ]
  },

  {
    nodeCode: "RES_ACTIVITY_BOOK",
    priority: 100,
    baseScore: 100,
    patterns: [
      "activity book",
      "activity workbook"
    ]
  },

  {
    nodeCode: "RES_PRACTICE_BOOK",
    priority: 100,
    baseScore: 100,
    patterns: [
      "practice book",
      "practice workbook"
    ]
  },

  {
    nodeCode: "RES_EXERCISE_BOOK",
    priority: 100,
    baseScore: 100,
    patterns: [
      "exercise book",
      "exercise workbook"
    ]
  },

  {
    nodeCode: "RES_ASSESSMENT_BOOK",
    priority: 100,
    baseScore: 100,
    patterns: [
      "assessment book",
      "assessment workbook"
    ]
  },

  {
    nodeCode: "RES_REVISION_GUIDE",
    priority: 100,
    baseScore: 100,
    patterns: [
      "revision guide",
      "study guide"
    ]
  },

  {
    nodeCode: "RES_REVISION_QUESTIONS",
    priority: 100,
    baseScore: 100,
    patterns: [
      "revision questions",
      "revision question",
      "past questions"
    ]
  },

  {
    nodeCode: "RES_TEACHER_GUIDE",
    priority: 100,
    baseScore: 100,
    patterns: [
      "teacher guide",
      "teacher's guide",
      "teachers guide",
      "teacher manual",
      "teacher's manual",
      "facilitator guide"
    ]
  },

  {
    nodeCode: "RES_DICTIONARY",
    priority: 100,
    baseScore: 100,
    patterns: [
      "dictionary",
      "learner dictionary",
      "school dictionary"
    ]
  },

  {
    nodeCode: "RES_ATLAS",
    priority: 100,
    baseScore: 100,
    patterns: [
      "atlas",
      "school atlas"
    ]
  },

  {
    nodeCode: "RES_STORY_BOOK",
    priority: 100,
    baseScore: 100,
    patterns: [
      "story book",
      "storybook",
      "story reader"
    ]
  },

  {
    nodeCode: "RES_READER",
    priority: 100,
    baseScore: 100,
    patterns: [
      "reader",
      "graded reader",
      "reading book"
    ]
  },

  {
    nodeCode: "RES_FLASH_CARDS",
    priority: 100,
    baseScore: 100,
    patterns: [
      "flash card",
      "flash cards",
      "flashcard",
      "flashcards"
    ]
  },

  {
    nodeCode: "RES_HANDWRITING_BOOK",
    priority: 100,
    baseScore: 100,
    patterns: [
      "handwriting",
      "handwriting book",
      "penmanship"
    ]
  },

  {
    nodeCode: "RES_COLOURING_BOOK",
    priority: 100,
    baseScore: 100,
    patterns: [
      "colouring",
      "colouring book",
      "coloring",
      "coloring book"
    ]
  },

  {
    nodeCode: "RES_COPY_WRITING_BOOK",
    priority: 100,
    baseScore: 100,
    patterns: [
      "copy writing",
      "copywriting",
      "copy writing book"
    ]
  }
];