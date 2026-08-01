import {
  BookReadService,
  EducationalBookReadRecord,
} from "../services/BookReadService";

import {
  EducationalVocabulary,
} from "../vocabulary/EducationalVocabulary";

import {
  EducationalBookSearchScoreBreakdown,
  EducationalBookSearchScorer,
} from "./EducationalBookSearchScorer";

export type EducationalBookMatchMethod =
  | "EXACT_CODE"
  | "EXACT_TITLE"
  | "NORMALIZED_TITLE"
  | "EDUCATIONAL_SIGNALS"
  | "PARTIAL_TITLE"
  | "SEARCH_FIELD";

export interface EducationalBookSearchInput {
  query: string;

  limit?: number;
}

export interface EducationalBookSearchResult {
  book: EducationalBookReadRecord;

  score: number;

  matchMethod: EducationalBookMatchMethod;

  matchedValue: string;

  scoreBreakdown?: EducationalBookSearchScoreBreakdown;
}

const SEARCH_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "book",
  "books",
  "edition",
  "for",
  "from",
  "in",
  "of",
  "on",
  "series",
  "the",
  "to",
  "with",
]);

/**
 * Ranked Educational Book search service.
 *
 * Search flow:
 *
 * 1. Preserve exact code and exact title matches.
 * 2. Extract Ghana-focused educational vocabulary.
 * 3. Build several meaningful title-search variants.
 * 4. Search the repository using each variant.
 * 5. Merge and deduplicate all retrieved candidates.
 * 6. Score candidates using title and educational relationships.
 * 7. Return deterministic ranked results.
 *
 * This service contains no direct Prisma logic.
 */
export class EducationalBookSearchService {
  constructor(
    private readonly bookReadService: BookReadService,

    private readonly vocabulary:
      EducationalVocabulary =
        new EducationalVocabulary(),

    private readonly scorer:
      EducationalBookSearchScorer =
        new EducationalBookSearchScorer(),
  ) {}

  async search(
    input: EducationalBookSearchInput,
  ): Promise<EducationalBookSearchResult[]> {
    const rawQuery = input.query.trim();

    if (!rawQuery) {
      return [];
    }

    const limit =
      this.normalizeLimit(input.limit);

    const extraction =
      this.vocabulary.extract(rawQuery);

    const searchText =
      extraction.remainingText
      || extraction.normalizedText
      || rawQuery;

    const results =
      new Map<
        string,
        EducationalBookSearchResult
      >();

    await this.collectExactCodeMatch(
      rawQuery,
      results,
    );

    await this.collectExactTitleMatch(
      rawQuery,
      results,
    );

    await this.collectRankedCandidates(
      {
        rawQuery,

        searchText,

        subjects:
          extraction.subjects.map(
            (match) =>
              match.canonicalValue,
          ),

        levels:
          extraction.levels.map(
            (match) =>
              match.canonicalValue,
          ),

        resourceTypes:
          extraction.resourceTypes.map(
            (match) =>
              match.canonicalValue,
          ),

        curricula:
          extraction.curricula.map(
            (match) =>
              match.canonicalValue,
          ),

        limit,
      },
      results,
    );

    return Array.from(
      results.values(),
    )
      .sort((left, right) => {
        if (
          right.score !== left.score
        ) {
          return (
            right.score - left.score
          );
        }

        return left.book.entity.canonicalName
          .localeCompare(
            right.book.entity.canonicalName,
          );
      })
      .slice(0, limit);
  }

  private async collectExactCodeMatch(
    rawQuery: string,
    results: Map<
      string,
      EducationalBookSearchResult
    >,
  ): Promise<void> {
    const book =
      await this.bookReadService.findByCode(
        rawQuery,
      );

    if (!book) {
      return;
    }

    this.addOrReplaceResult(
      results,
      {
        book,

        score: 100,

        matchMethod: "EXACT_CODE",

        matchedValue: book.entity.code,
      },
    );
  }

  private async collectExactTitleMatch(
    rawQuery: string,
    results: Map<
      string,
      EducationalBookSearchResult
    >,
  ): Promise<void> {
    const book =
      await this.bookReadService
        .findByCanonicalName(
          rawQuery,
        );

    if (!book) {
      return;
    }

    const normalizedQuery =
      this.vocabulary.normalizeText(
        rawQuery,
      );

    const normalizedTitle =
      this.vocabulary.normalizeText(
        book.entity.canonicalName,
      );

    const exactTitle =
      rawQuery.toLocaleLowerCase("en")
      === book.entity.canonicalName
        .trim()
        .toLocaleLowerCase("en");

    this.addOrReplaceResult(
      results,
      {
        book,

        score: exactTitle
          ? 99
          : 97,

        matchMethod:
          normalizedQuery
          === normalizedTitle
            ? exactTitle
              ? "EXACT_TITLE"
              : "NORMALIZED_TITLE"
            : "EXACT_TITLE",

        matchedValue:
          book.entity.canonicalName,
      },
    );
  }

  private async collectRankedCandidates(
    input: {
      rawQuery: string;

      searchText: string;

      subjects: string[];

      levels: string[];

      resourceTypes: string[];

      curricula: string[];

      limit: number;
    },
    results: Map<
      string,
      EducationalBookSearchResult
    >,
  ): Promise<void> {
    const candidateLimit =
      Math.min(
        Math.max(
          input.limit * 5,
          25,
        ),
        100,
      );

    const candidates =
      await this.findCandidateBooks(
        input.rawQuery,
        input.searchText,
        candidateLimit,
      );

    for (const book of candidates) {
      const querySignals = {
        title: input.searchText,

        subjects: input.subjects,

        levels: input.levels,

        resourceTypes:
          input.resourceTypes,

        curriculumVersions:
          input.curricula,
      };

      const candidateSignals =
        this.buildCandidateSignals(
          book,
        );

      const scored =
        this.scorer.score(
          querySignals,
          candidateSignals,
        );

      if (scored.total <= 0) {
        continue;
      }

      const titleScore =
        scored.breakdown.title;

      const educationalScore =
        scored.breakdown.subject
        + scored.breakdown.level
        + scored.breakdown
          .resourceType
        + scored.breakdown
          .curriculumVersion;

      const matchMethod:
        EducationalBookMatchMethod =
          educationalScore > 0
            ? "EDUCATIONAL_SIGNALS"
            : titleScore > 0
              ? "PARTIAL_TITLE"
              : "SEARCH_FIELD";

      this.addOrReplaceResult(
        results,
        {
          book,

          score: scored.total,

          matchMethod,

          matchedValue:
            book.entity.canonicalName,

          scoreBreakdown:
            scored.breakdown,
        },
      );
    }
  }

  /**
   * Generate several repository searches instead of requiring the complete
   * customer query to appear as one continuous database substring.
   */
  private async findCandidateBooks(
    rawQuery: string,
    searchText: string,
    candidateLimit: number,
  ): Promise<EducationalBookReadRecord[]> {
    const searchQueries =
      this.buildCandidateSearchQueries(
        rawQuery,
        searchText,
      );

    const candidates =
      new Map<
        string,
        EducationalBookReadRecord
      >();

    for (const query of searchQueries) {
      const books =
        await this.bookReadService.search({
          query,

          limit: candidateLimit,
        });

      for (const book of books) {
        candidates.set(
          book.id,
          book,
        );
      }

      if (
        candidates.size
        >= candidateLimit * 3
      ) {
        break;
      }
    }

    return Array.from(
      candidates.values(),
    );
  }

  /**
   * Builds a deterministic list containing:
   *
   * - the extracted title text;
   * - the original query;
   * - meaningful three-word phrases;
   * - meaningful two-word phrases;
   * - individual distinctive words.
   *
   * Longer and more precise phrases are searched before single words.
   */
  private buildCandidateSearchQueries(
    rawQuery: string,
    searchText: string,
  ): string[] {
    const queries: string[] = [];

    this.addUniqueSearchQuery(
      queries,
      searchText,
    );

    if (
      this.normalizeSearchQuery(
        rawQuery,
      )
      !== this.normalizeSearchQuery(
        searchText,
      )
    ) {
      this.addUniqueSearchQuery(
        queries,
        rawQuery,
      );
    }

    const normalizedSearchText =
      this.vocabulary.normalizeText(
        searchText,
      );

    const meaningfulTokens =
      normalizedSearchText
        .split(/\s+/)
        .map((token) =>
          token.trim(),
        )
        .filter((token) =>
          this.isMeaningfulSearchToken(
            token,
          ),
        );

    for (
      let phraseLength = 3;
      phraseLength >= 2;
      phraseLength--
    ) {
      for (
        let index = 0;
        index
        <= meaningfulTokens.length
          - phraseLength;
        index++
      ) {
        const phrase =
          meaningfulTokens
            .slice(
              index,
              index + phraseLength,
            )
            .join(" ");

        this.addUniqueSearchQuery(
          queries,
          phrase,
        );
      }
    }

    for (
      const token of meaningfulTokens
    ) {
      this.addUniqueSearchQuery(
        queries,
        token,
      );
    }

    return queries.slice(0, 20);
  }

  private addUniqueSearchQuery(
    queries: string[],
    value: string,
  ): void {
    const normalizedValue =
      this.normalizeSearchQuery(
        value,
      );

    if (
      normalizedValue.length < 2
    ) {
      return;
    }

    const alreadyExists =
      queries.some(
        (existingQuery) =>
          this.normalizeSearchQuery(
            existingQuery,
          )
          === normalizedValue,
      );

    if (alreadyExists) {
      return;
    }

    queries.push(
      value.trim(),
    );
  }

  private normalizeSearchQuery(
    value: string,
  ): string {
    return this.vocabulary
      .normalizeText(value)
      .toLocaleLowerCase("en")
      .replace(/\s+/g, " ")
      .trim();
  }

  private isMeaningfulSearchToken(
    token: string,
  ): boolean {
    const normalizedToken =
      token
        .toLocaleLowerCase("en")
        .trim();

    if (!normalizedToken) {
      return false;
    }

    if (
      SEARCH_STOP_WORDS.has(
        normalizedToken,
      )
    ) {
      return false;
    }

    if (
      /^\d+$/.test(normalizedToken)
    ) {
      return normalizedToken.length <= 2;
    }

    return normalizedToken.length >= 3;
  }

  private buildCandidateSignals(
    book: EducationalBookReadRecord,
  ) {
    const publishers =
      book.bookLine
        ? [
            book.bookLine.publisher
              .entity.canonicalName,

            book.bookLine.publisher
              .entity.displayName,

            book.bookLine.entity
              .canonicalName,

            book.bookLine.marketingName,
          ].filter(
            (
              value,
            ): value is string =>
              typeof value === "string"
              && value.trim().length > 0,
          )
        : [];

    const subjects =
      book.subjects.flatMap(
        (relationship) => [
          relationship.subject
            .entity.canonicalName,

          relationship.subject
            .entity.displayName,

          relationship.subject
            .subjectCode,
        ],
      ).filter(
        (
          value,
        ): value is string =>
          typeof value === "string"
          && value.trim().length > 0,
      );

    const levels =
      book.levels.flatMap(
        (relationship) => [
          relationship.level
            .entity.canonicalName,

          relationship.level
            .entity.displayName,

          relationship.level
            .shortCode,
        ],
      ).filter(
        (
          value,
        ): value is string =>
          typeof value === "string"
          && value.trim().length > 0,
      );

    const resourceTypes =
      book.resourceTypes.flatMap(
        (relationship) => [
          relationship.resourceType
            .entity.canonicalName,

          relationship.resourceType
            .entity.displayName,
        ],
      ).filter(
        (
          value,
        ): value is string =>
          typeof value === "string"
          && value.trim().length > 0,
      );

    const authors =
      book.authors.flatMap(
        (relationship) => [
          relationship.author
            .entity.canonicalName,

          relationship.author
            .entity.displayName,
        ],
      ).filter(
        (
          value,
        ): value is string =>
          typeof value === "string"
          && value.trim().length > 0,
      );

    const curriculumVersions =
      book.curriculumVersions.flatMap(
        (relationship) => [
          relationship
            .curriculumVersion
            .entity.canonicalName,

          relationship
            .curriculumVersion
            .entity.displayName,

          relationship
            .curriculumVersion
            .version,

          relationship
            .curriculumVersion
            .curriculum
            .entity
            .canonicalName,

          relationship
            .curriculumVersion
            .curriculum
            .entity
            .displayName,
        ],
      ).filter(
        (
          value,
        ): value is string =>
          typeof value === "string"
          && value.trim().length > 0,
      );

    return {
      title:
        book.entity.canonicalName,

      code:
        book.entity.code,

      publishers,

      subjects,

      levels,

      curriculumVersions,

      resourceTypes,

      authors,
    };
  }

  private addOrReplaceResult(
    results: Map<
      string,
      EducationalBookSearchResult
    >,
    candidate:
      EducationalBookSearchResult,
  ): void {
    const existing =
      results.get(
        candidate.book.id,
      );

    if (
      !existing
      || candidate.score
        > existing.score
    ) {
      results.set(
        candidate.book.id,
        candidate,
      );
    }
  }

  private normalizeLimit(
    limit: number | undefined,
  ): number {
    if (
      limit === undefined
      || !Number.isFinite(limit)
    ) {
      return 10;
    }

    return Math.min(
      Math.max(
        Math.trunc(limit),
        1,
      ),
      50,
    );
  }
}