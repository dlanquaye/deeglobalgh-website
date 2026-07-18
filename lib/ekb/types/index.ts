/**
 * ============================================================
 * Educational Knowledge Base (EKB)
 * ------------------------------------------------------------
 * Canonical type definitions shared across the Knowledge Engine,
 * OCR, Estimator and Product Intelligence systems.
 * ============================================================
 */

export interface Publisher {
  id: string;
  code: string;
  name: string;
  aliases: string[];
  website?: string;
  active: boolean;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  shortName?: string;
  aliases: string[];
  active: boolean;
}

export interface Level {
  id: string;
  code: string;
  name: string;
  order: number;
  aliases: string[];
  active: boolean;
}

export interface ResourceType {
  id: string;
  code: string;
  name: string;
  aliases: string[];
  active: boolean;
}

export interface Curriculum {
  id: string;
  code: string;
  name: string;
  country: string;
  aliases: string[];
  active: boolean;
}

export interface Language {
  id: string;
  code: string;
  name: string;
  aliases: string[];
  active: boolean;
}

export interface Author {
  id: string;
  fullName: string;
  aliases: string[];
}

export interface BookLine {
  id: string;
  code: string;
  name: string;

  publisherCode: string;

  subjectCode?: string;
  curriculumCode?: string;
  languageCode?: string;

  supportedLevels?: string[];

  supportedResourceTypes?: string[];

  aliases: string[];

  active: boolean;
}

export interface Book {
  id: string;

  isbn?: string;

  title: string;

  bookLineCode: string;

  subjectCode: string;

  levelCode: string;

  resourceTypeCode: string;

  curriculumCode: string;

  languageCode: string;

  publisherCode: string;

  authorIds: string[];

  edition?: string;

  active: boolean;
}

export interface EducationalFingerprint {
  publisherCode?: string;

  bookLineCode?: string;

  subjectCode?: string;

  levelCode?: string;

  resourceTypeCode?: string;

  curriculumCode?: string;

  languageCode?: string;

  isbn?: string;

  confidence: number;
}