import { EducationalFingerprint } from "../types";

export interface FingerprintComparison {
  score: number;

  publisher: boolean;
  bookLine: boolean;
  subject: boolean;
  level: boolean;
  resourceType: boolean;
  curriculum: boolean;
  language: boolean;
}

const WEIGHTS = {
  publisher: 10,
  bookLine: 35,
  subject: 20,
  level: 20,
  resourceType: 10,
  curriculum: 3,
  language: 2,
};

export function compareFingerprints(
  a: EducationalFingerprint,
  b: EducationalFingerprint,
): FingerprintComparison {
  let score = 0;

  const publisher =
    a.publisherCode !== undefined &&
    a.publisherCode === b.publisherCode;

  if (publisher) score += WEIGHTS.publisher;

  const bookLine =
    a.bookLineCode !== undefined &&
    a.bookLineCode === b.bookLineCode;

  if (bookLine) score += WEIGHTS.bookLine;

  const subject =
    a.subjectCode !== undefined &&
    a.subjectCode === b.subjectCode;

  if (subject) score += WEIGHTS.subject;

  const level =
    a.levelCode !== undefined &&
    a.levelCode === b.levelCode;

  if (level) score += WEIGHTS.level;

  const resourceType =
    a.resourceTypeCode !== undefined &&
    a.resourceTypeCode === b.resourceTypeCode;

  if (resourceType) score += WEIGHTS.resourceType;

  const curriculum =
    a.curriculumCode !== undefined &&
    a.curriculumCode === b.curriculumCode;

  if (curriculum) score += WEIGHTS.curriculum;

  const language =
    a.languageCode !== undefined &&
    a.languageCode === b.languageCode;

  if (language) score += WEIGHTS.language;

  return {
    score,

    publisher,
    bookLine,
    subject,
    level,
    resourceType,
    curriculum,
    language,
  };
}