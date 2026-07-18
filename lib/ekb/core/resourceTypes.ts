import { ResourceType } from "../types";

/**
 * Official Educational Knowledge Base (EKB)
 * Resource Types
 */

export const RESOURCE_TYPES: ResourceType[] = [
  {
    id: "resource-learner-book",
    code: "RESOURCE_LEARNER_BOOK",
    name: "Learner Book",
    aliases: [
      "learner book",
      "learner's book",
      "learner textbook",
      "textbook",
      "pupil book",
      "student book",
      "lb",
      "l/b",
    ],
    active: true,
  },

  {
    id: "resource-teacher-guide",
    code: "RESOURCE_TEACHER_GUIDE",
    name: "Teacher Guide",
    aliases: [
      "teacher guide",
      "teachers guide",
      "teacher's guide",
      "teacher manual",
      "teachers manual",
      "tg",
      "t/g",
    ],
    active: true,
  },

  {
    id: "resource-workbook",
    code: "RESOURCE_WORKBOOK",
    name: "Workbook",
    aliases: [
      "workbook",
      "work book",
      "activity workbook",
      "wb",
      "w/b",
    ],
    active: true,
  },

  {
    id: "resource-activity-book",
    code: "RESOURCE_ACTIVITY_BOOK",
    name: "Activity Book",
    aliases: [
      "activity book",
      "activities book",
      "exercise book",
      "practice book",
    ],
    active: true,
  },

  {
    id: "resource-reader",
    code: "RESOURCE_READER",
    name: "Reader",
    aliases: [
      "reader",
      "reading book",
      "story book",
      "supplementary reader",
    ],
    active: true,
  },

  {
    id: "resource-supplementary",
    code: "RESOURCE_SUPPLEMENTARY",
    name: "Supplementary Resource",
    aliases: [
      "supplementary",
      "supplementary material",
      "supplementary resource",
      "supplementary text",
    ],
    active: true,
  },

  {
    id: "resource-manual",
    code: "RESOURCE_MANUAL",
    name: "Manual",
    aliases: [
      "manual",
      "resource manual",
      "instruction manual",
    ],
    active: true,
  },

  {
    id: "resource-poster",
    code: "RESOURCE_POSTER",
    name: "Poster",
    aliases: [
      "poster",
      "wall chart",
      "chart",
      "learning chart",
    ],
    active: true,
  },
];

export const RESOURCE_TYPE_BY_CODE = new Map(
  RESOURCE_TYPES.map((resourceType) => [resourceType.code, resourceType]),
);

export const RESOURCE_TYPE_BY_NAME = new Map(
  RESOURCE_TYPES.map((resourceType) => [
    resourceType.name.toLowerCase(),
    resourceType,
  ]),
);