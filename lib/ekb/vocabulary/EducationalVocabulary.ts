import {
  curriculumVocabulary,
} from "./CurriculumVocabulary";

import {
  levelVocabulary,
} from "./LevelVocabulary";

import {
  resourceVocabulary,
} from "./ResourceVocabulary";

import {
  subjectVocabulary,
} from "./SubjectVocabulary";

import type {
  EducationalVocabularyEntry,
} from "./VocabularyTypes";

export type EducationalVocabularyCategory =
  | "SUBJECT"
  | "LEVEL"
  | "RESOURCE_TYPE"
  | "CURRICULUM"
  | "GENERAL";

export interface EducationalVocabularyMatch {
  category: EducationalVocabularyCategory;

  input: string;

  normalizedInput: string;

  canonicalValue: string;

  matchedAlias: string;

  isExactCanonicalMatch: boolean;
}

export interface EducationalVocabularyExtraction {
  originalText: string;

  normalizedText: string;

  subjects: EducationalVocabularyMatch[];

  levels: EducationalVocabularyMatch[];

  resourceTypes: EducationalVocabularyMatch[];

  curricula: EducationalVocabularyMatch[];

  remainingText: string;
}

/**
 * Central Ghana-focused educational vocabulary.
 *
 * This class translates customer wording, school-list abbreviations,
 * common terminology and OCR-friendly variants into canonical educational
 * values used by the Educational Knowledge Base.
 *
 * Vocabulary data is stored in dedicated modules while this class remains
 * responsible for matching, extraction and normalisation behaviour.
 *
 * It contains no Prisma or database logic.
 */
export class EducationalVocabulary {
  private readonly subjectEntries:
    EducationalVocabularyEntry[] =
      subjectVocabulary;

  private readonly levelEntries:
    EducationalVocabularyEntry[] =
      levelVocabulary;

  private readonly resourceTypeEntries:
    EducationalVocabularyEntry[] =
      resourceVocabulary;

  private readonly curriculumEntries:
    EducationalVocabularyEntry[] =
      curriculumVocabulary;

  normalizeText(value: string): string {
    return value
      .normalize("NFKD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .toLocaleLowerCase("en")
      .replace(/&/g, " and ")
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  normalizeSubject(
    value: string,
  ): string | undefined {
    return this.findCanonicalValue(
      value,
      this.subjectEntries,
    );
  }

  normalizeLevel(
    value: string,
  ): string | undefined {
    return this.findCanonicalValue(
      value,
      this.levelEntries,
    );
  }

  normalizeResourceType(
    value: string,
  ): string | undefined {
    return this.findCanonicalValue(
      value,
      this.resourceTypeEntries,
    );
  }

  normalizeCurriculum(
    value: string,
  ): string | undefined {
    return this.findCanonicalValue(
      value,
      this.curriculumEntries,
    );
  }

  findSubjectMatches(
    value: string,
  ): EducationalVocabularyMatch[] {
    return this.findMatches(
      value,
      "SUBJECT",
      this.subjectEntries,
    );
  }

  findLevelMatches(
    value: string,
  ): EducationalVocabularyMatch[] {
    return this.findMatches(
      value,
      "LEVEL",
      this.levelEntries,
    );
  }

  findResourceTypeMatches(
    value: string,
  ): EducationalVocabularyMatch[] {
    return this.findMatches(
      value,
      "RESOURCE_TYPE",
      this.resourceTypeEntries,
    );
  }

  findCurriculumMatches(
    value: string,
  ): EducationalVocabularyMatch[] {
    return this.findMatches(
      value,
      "CURRICULUM",
      this.curriculumEntries,
    );
  }

  extract(
    value: string,
  ): EducationalVocabularyExtraction {
    const originalText = value;

    const normalizedText =
      this.normalizeText(value);

    const subjects =
      this.findSubjectMatches(value);

    const levels =
      this.findLevelMatches(value);

    const resourceTypes =
      this.findResourceTypeMatches(value);

    const curricula =
      this.findCurriculumMatches(value);

    const matchedAliases = [
      ...subjects,
      ...levels,
      ...resourceTypes,
      ...curricula,
    ].map(
      (match) =>
        this.normalizeText(
          match.matchedAlias,
        ),
    );

    const remainingText =
      this.removeMatchedAliases(
        normalizedText,
        matchedAliases,
      );

    return {
      originalText,

      normalizedText,

      subjects,

      levels,

      resourceTypes,

      curricula,

      remainingText,
    };
  }

  getSubjectCanonicalValues(): string[] {
    return this.getCanonicalValues(
      this.subjectEntries,
    );
  }

  getLevelCanonicalValues(): string[] {
    return this.getCanonicalValues(
      this.levelEntries,
    );
  }

  getResourceTypeCanonicalValues(): string[] {
    return this.getCanonicalValues(
      this.resourceTypeEntries,
    );
  }

  getCurriculumCanonicalValues(): string[] {
    return this.getCanonicalValues(
      this.curriculumEntries,
    );
  }

  private findCanonicalValue(
    value: string,
    entries: EducationalVocabularyEntry[],
  ): string | undefined {
    const normalizedValue =
      this.normalizeText(value);

    if (!normalizedValue) {
      return undefined;
    }

    for (const entry of entries) {
      const normalizedCanonicalValue =
        this.normalizeText(
          entry.canonicalValue,
        );

      if (
        normalizedValue
        === normalizedCanonicalValue
      ) {
        return entry.canonicalValue;
      }

      for (const alias of entry.aliases) {
        if (
          normalizedValue
          === this.normalizeText(alias)
        ) {
          return entry.canonicalValue;
        }
      }
    }

    return undefined;
  }

  private findMatches(
    value: string,
    category: EducationalVocabularyCategory,
    entries: EducationalVocabularyEntry[],
  ): EducationalVocabularyMatch[] {
    const normalizedInput =
      this.normalizeText(value);

    if (!normalizedInput) {
      return [];
    }

    const matches =
      new Map<
        string,
        EducationalVocabularyMatch
      >();

    const sortedEntries =
      entries.map((entry) => ({
        ...entry,

        aliases: Array.from(
          new Set([
            entry.canonicalValue,
            ...entry.aliases,
          ]),
        ).sort(
          (left, right) =>
            this.normalizeText(right).length
            - this.normalizeText(left).length,
        ),
      }));

    for (const entry of sortedEntries) {
      for (const alias of entry.aliases) {
        const normalizedAlias =
          this.normalizeText(alias);

        if (!normalizedAlias) {
          continue;
        }

        if (
          !this.containsPhrase(
            normalizedInput,
            normalizedAlias,
          )
        ) {
          continue;
        }

        const existing =
          matches.get(
            entry.canonicalValue,
          );

        if (
          existing
          && this.normalizeText(
            existing.matchedAlias,
          ).length
          >= normalizedAlias.length
        ) {
          continue;
        }

        matches.set(
          entry.canonicalValue,
          {
            category,

            input: value,

            normalizedInput,

            canonicalValue:
              entry.canonicalValue,

            matchedAlias: alias,

            isExactCanonicalMatch:
              normalizedInput
              === this.normalizeText(
                entry.canonicalValue,
              ),
          },
        );
      }
    }

    return Array.from(
      matches.values(),
    );
  }

  private containsPhrase(
    normalizedText: string,
    normalizedPhrase: string,
  ): boolean {
    const paddedText =
      ` ${normalizedText} `;

    const paddedPhrase =
      ` ${normalizedPhrase} `;

    return paddedText.includes(
      paddedPhrase,
    );
  }

  private removeMatchedAliases(
    normalizedText: string,
    normalizedAliases: string[],
  ): string {
    let remainingText =
      ` ${normalizedText} `;

    const uniqueAliases =
      Array.from(
        new Set(
          normalizedAliases.filter(Boolean),
        ),
      ).sort(
        (left, right) =>
          right.length - left.length,
      );

    for (const alias of uniqueAliases) {
      remainingText =
        remainingText.replace(
          new RegExp(
            `\\s${this.escapeRegularExpression(
              alias,
            )}\\s`,
            "g",
          ),
          " ",
        );
    }

    return remainingText
      .trim()
      .replace(/\s+/g, " ");
  }

  private escapeRegularExpression(
    value: string,
  ): string {
    return value.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );
  }

  private getCanonicalValues(
    entries: EducationalVocabularyEntry[],
  ): string[] {
    return entries.map(
      (entry) =>
        entry.canonicalValue,
    );
  }
}