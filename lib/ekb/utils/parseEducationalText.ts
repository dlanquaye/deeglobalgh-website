import { BookLine, EducationalFingerprint, Level, Publisher, ResourceType, Subject } from "../types";
import { findBookLine } from "./findBookLine";
import { findLevel } from "./findLevel";
import { findPublisher } from "./findPublisher";
import { findSubject } from "./findSubject";
import { normaliseText } from "./normalise";
import { RESOURCE_TYPES } from "../core/resourceTypes";

export interface EducationalParseResult {
  originalText: string;
  normalisedText: string;

  publisher?: Publisher;
  bookLine?: BookLine;
  subject?: Subject;
  level?: Level;
  resourceType?: ResourceType;

  fingerprint: EducationalFingerprint;
}

function findResourceType(text: string): ResourceType | undefined {
  const normalised = normaliseText(text);

  for (const resourceType of RESOURCE_TYPES) {
    if (normalised.includes(normaliseText(resourceType.name))) {
      return resourceType;
    }

    for (const alias of resourceType.aliases) {
      if (normalised.includes(normaliseText(alias))) {
        return resourceType;
      }
    }
  }

  return undefined;
}

export function parseEducationalText(
  text: string,
): EducationalParseResult {
  const publisher = findPublisher(text);
  const bookLine = findBookLine(text);
  const subject = findSubject(text);
  const level = findLevel(text);
  const resourceType = findResourceType(text);

  let confidence = 0;

  if (publisher) confidence += 15;
  if (bookLine) confidence += 35;
  if (subject) confidence += 20;
  if (level) confidence += 20;
  if (resourceType) confidence += 10;

  return {
    originalText: text,
    normalisedText: normaliseText(text),

    publisher,
    bookLine,
    subject,
    level,
    resourceType,

    fingerprint: {
      publisherCode: publisher?.code,
      bookLineCode: bookLine?.code,
      subjectCode: subject?.code,
      levelCode: level?.code,
      resourceTypeCode: resourceType?.code,
      confidence,
    },
  };
}