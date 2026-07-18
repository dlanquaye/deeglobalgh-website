import {
  BookLine,
  EducationalFingerprint,
  Level,
  Publisher,
  ResourceType,
  Subject,
} from "../types";

import { findBookLine } from "./findBookLine";
import { findLevel } from "./findLevel";
import { findPublisher } from "./findPublisher";
import { findSubject } from "./findSubject";
import { normaliseText } from "./normalise";
import { RESOURCE_TYPES } from "../core/resourceTypes";
import { PUBLISHER_BY_CODE } from "../core/publishers";
import { getBookLineMetadata } from "./getBookLineMetadata";
import { enrichEducationalFingerprint } from "./enrichEducationalFingerprint";

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
  let publisher = findPublisher(text);

const bookLine = findBookLine(text);

const metadata = getBookLineMetadata(bookLine);

if (!publisher && metadata.publisherCode) {
  publisher = PUBLISHER_BY_CODE.get(
    metadata.publisherCode,
  );
}

let subject = findSubject(text);

if (!subject && bookLine?.subjectCode) {
  subject = {
    code: bookLine.subjectCode,
  } as Subject;
}

const level = findLevel(text);

let resourceType = findResourceType(text);

if (
  !resourceType &&
  metadata.supportedResourceTypes?.length === 1
) {
  resourceType = {
    code: metadata.supportedResourceTypes[0],
  } as ResourceType;
}

  let confidence = 0;

  if (publisher) confidence += 15;
  if (bookLine) confidence += 35;
  if (subject) confidence += 20;
  if (level) confidence += 20;
  if (resourceType) confidence += 10;

  return enrichEducationalFingerprint({
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
});
}