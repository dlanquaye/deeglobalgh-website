import { evaluateSubject } from "./evaluateSubject";
import { evaluatePublisher } from "./evaluatePublisher";
import { evaluateCurriculum } from "./evaluateCurriculum";
import { evaluateResource } from "./evaluateResource";
import { evaluateActivity } from "./evaluateActivity";
import { evaluateLanguage } from "./evaluateLanguage";
import { evaluateLevel } from "./evaluateLevel";

export const classifiers = [
  {
    key: "subject",
    evaluate: evaluateSubject,
  },
  {
    key: "publisher",
    evaluate: evaluatePublisher,
  },
  {
    key: "curriculum",
    evaluate: evaluateCurriculum,
  },
  {
    key: "resource",
    evaluate: evaluateResource,
  },
  {
    key: "activity",
    evaluate: evaluateActivity,
  },
  {
    key: "language",
    evaluate: evaluateLanguage,
  },
  {
    key: "level",
    evaluate: evaluateLevel,
  },
] as const;