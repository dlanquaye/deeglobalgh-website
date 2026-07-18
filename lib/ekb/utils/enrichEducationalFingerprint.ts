import { EducationalParseResult } from "./parseEducationalText";

export function enrichEducationalFingerprint(
  result: EducationalParseResult,
): EducationalParseResult {
  const { bookLine, fingerprint } = result;

  if (!bookLine) {
    return result;
  }

  if (!fingerprint.publisherCode && bookLine.publisherCode) {
    fingerprint.publisherCode = bookLine.publisherCode;
  }

  if (!fingerprint.subjectCode && bookLine.subjectCode) {
    fingerprint.subjectCode = bookLine.subjectCode;
  }

  if (!fingerprint.curriculumCode && bookLine.curriculumCode) {
    fingerprint.curriculumCode = bookLine.curriculumCode;
  }

  if (!fingerprint.languageCode && bookLine.languageCode) {
    fingerprint.languageCode = bookLine.languageCode;
  }

  if (
    !fingerprint.resourceTypeCode &&
    bookLine.supportedResourceTypes?.length === 1
  ) {
    fingerprint.resourceTypeCode =
      bookLine.supportedResourceTypes[0];
  }

  return result;
}