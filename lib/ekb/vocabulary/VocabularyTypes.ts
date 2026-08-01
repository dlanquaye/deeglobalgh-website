/**
 * Shared vocabulary types.
 *
 * These interfaces are intentionally independent of the
 * educational domain so they can later be reused by:
 *
 * - Educational Vocabulary
 * - Stationery Vocabulary
 * - Uniform Vocabulary
 * - Boarding Vocabulary
 * - Electronics Vocabulary
 * - Future catalogue vocabularies
 */

export interface EducationalVocabularyEntry {
  canonicalValue: string;

  aliases: string[];
}