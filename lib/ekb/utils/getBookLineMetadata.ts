import { BookLine } from "../types";

export interface BookLineMetadata {
  publisherCode?: string;
  subjectCode?: string;
  curriculumCode?: string;
  languageCode?: string;
  supportedLevels?: string[];
  supportedResourceTypes?: string[];
}

export function getBookLineMetadata(
  bookLine?: BookLine,
): BookLineMetadata {
  if (!bookLine) {
    return {};
  }

  return {
    publisherCode: bookLine.publisherCode,
    subjectCode: bookLine.subjectCode,
    curriculumCode: bookLine.curriculumCode,
    languageCode: bookLine.languageCode,
    supportedLevels: bookLine.supportedLevels,
    supportedResourceTypes:
      bookLine.supportedResourceTypes,
  };
}