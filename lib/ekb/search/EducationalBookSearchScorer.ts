export interface EducationalBookSearchSignals {
  title: string;

  code?: string;

  publishers?: string[];

  subjects?: string[];

  levels?: string[];

  curriculumVersions?: string[];

  resourceTypes?: string[];

  authors?: string[];
}

export interface EducationalBookSearchCandidate {
  title: string;

  code?: string;

  publishers?: string[];

  subjects?: string[];

  levels?: string[];

  curriculumVersions?: string[];

  resourceTypes?: string[];

  authors?: string[];
}

export interface EducationalBookSearchScoreBreakdown {
  title: number;

  code: number;

  publisher: number;

  subject: number;

  level: number;

  curriculumVersion: number;

  resourceType: number;

  author: number;
}

export interface EducationalBookSearchScore {
  total: number;

  breakdown: EducationalBookSearchScoreBreakdown;
}

/**
 * Deterministic educational relevance scorer.
 *
 * Maximum score:
 *
 * Title               40
 * Code                15
 * Publisher           10
 * Subject             10
 * Level               10
 * Curriculum version   5
 * Resource type        5
 * Author               5
 * ----------------------
 * Total              100
 *
 * This scorer contains no database logic. It receives already-extracted
 * educational signals and produces a transparent relevance score.
 */
export class EducationalBookSearchScorer {
  private static readonly weights = {
    title: 40,

    code: 15,

    publisher: 10,

    subject: 10,

    level: 10,

    curriculumVersion: 5,

    resourceType: 5,

    author: 5,
  } as const;

  score(
    query: EducationalBookSearchSignals,
    candidate: EducationalBookSearchCandidate,
  ): EducationalBookSearchScore {
    const breakdown: EducationalBookSearchScoreBreakdown = {
      title: this.scorePrimaryText(
        query.title,
        candidate.title,
        EducationalBookSearchScorer.weights.title,
      ),

      code: this.scoreOptionalPrimaryText(
        query.code,
        candidate.code,
        EducationalBookSearchScorer.weights.code,
      ),

      publisher: this.scoreCollections(
        query.publishers,
        candidate.publishers,
        EducationalBookSearchScorer.weights.publisher,
      ),

      subject: this.scoreCollections(
        query.subjects,
        candidate.subjects,
        EducationalBookSearchScorer.weights.subject,
      ),

      level: this.scoreCollections(
        query.levels,
        candidate.levels,
        EducationalBookSearchScorer.weights.level,
      ),

      curriculumVersion: this.scoreCollections(
        query.curriculumVersions,
        candidate.curriculumVersions,
        EducationalBookSearchScorer.weights.curriculumVersion,
      ),

      resourceType: this.scoreCollections(
        query.resourceTypes,
        candidate.resourceTypes,
        EducationalBookSearchScorer.weights.resourceType,
      ),

      author: this.scoreCollections(
        query.authors,
        candidate.authors,
        EducationalBookSearchScorer.weights.author,
      ),
    };

    return {
      total: this.clampScore(
        Object.values(breakdown).reduce(
          (total, value) => total + value,
          0,
        ),
        100,
      ),

      breakdown,
    };
  }

  private scorePrimaryText(
    queryValue: string,
    candidateValue: string,
    maximumScore: number,
  ): number {
    const normalizedQuery =
      this.normalizeSearchText(queryValue);

    const normalizedCandidate =
      this.normalizeSearchText(candidateValue);

    if (
      !normalizedQuery
      || !normalizedCandidate
    ) {
      return 0;
    }

    if (
      normalizedQuery
      === normalizedCandidate
    ) {
      return maximumScore;
    }

    if (
      normalizedCandidate.includes(
        normalizedQuery,
      )
    ) {
      const lengthCoverage =
        normalizedQuery.length
        / normalizedCandidate.length;

      return this.clampScore(
        Math.round(
          maximumScore
          * (
            0.75
            + Math.min(lengthCoverage, 1) * 0.2
          ),
        ),
        maximumScore,
      );
    }

    if (
      normalizedQuery.includes(
        normalizedCandidate,
      )
    ) {
      const lengthCoverage =
        normalizedCandidate.length
        / normalizedQuery.length;

      return this.clampScore(
        Math.round(
          maximumScore
          * (
            0.65
            + Math.min(lengthCoverage, 1) * 0.2
          ),
        ),
        maximumScore,
      );
    }

    const tokenCoverage =
      this.calculateTokenCoverage(
        normalizedQuery,
        normalizedCandidate,
      );

    if (tokenCoverage <= 0) {
      return 0;
    }

    return this.clampScore(
      Math.round(
        maximumScore
        * tokenCoverage
        * 0.75,
      ),
      maximumScore,
    );
  }

  private scoreOptionalPrimaryText(
    queryValue: string | undefined,
    candidateValue: string | undefined,
    maximumScore: number,
  ): number {
    if (
      !queryValue
      || !candidateValue
    ) {
      return 0;
    }

    const normalizedQuery =
      this.normalizeSearchText(queryValue);

    const normalizedCandidate =
      this.normalizeSearchText(candidateValue);

    if (
      !normalizedQuery
      || !normalizedCandidate
    ) {
      return 0;
    }

    if (
      normalizedQuery
      === normalizedCandidate
    ) {
      return maximumScore;
    }

    return 0;
  }

  private scoreCollections(
    queryValues: string[] | undefined,
    candidateValues: string[] | undefined,
    maximumScore: number,
  ): number {
    const normalizedQueryValues =
      this.normalizeCollection(queryValues);

    const normalizedCandidateValues =
      this.normalizeCollection(candidateValues);

    if (
      normalizedQueryValues.length === 0
      || normalizedCandidateValues.length === 0
    ) {
      return 0;
    }

    let bestScore = 0;

    for (
      const queryValue
      of normalizedQueryValues
    ) {
      for (
        const candidateValue
        of normalizedCandidateValues
      ) {
        const currentScore =
          this.scoreCollectionValue(
            queryValue,
            candidateValue,
            maximumScore,
          );

        if (currentScore > bestScore) {
          bestScore = currentScore;
        }

        if (bestScore === maximumScore) {
          return maximumScore;
        }
      }
    }

    return bestScore;
  }

  private scoreCollectionValue(
    queryValue: string,
    candidateValue: string,
    maximumScore: number,
  ): number {
    if (
      queryValue
      === candidateValue
    ) {
      return maximumScore;
    }

    if (
      candidateValue.includes(queryValue)
      || queryValue.includes(candidateValue)
    ) {
      return this.clampScore(
        Math.round(maximumScore * 0.8),
        maximumScore,
      );
    }

    const tokenCoverage =
      this.calculateTokenCoverage(
        queryValue,
        candidateValue,
      );

    if (tokenCoverage < 0.5) {
      return 0;
    }

    return this.clampScore(
      Math.round(
        maximumScore
        * tokenCoverage
        * 0.7,
      ),
      maximumScore,
    );
  }

  private calculateTokenCoverage(
    queryValue: string,
    candidateValue: string,
  ): number {
    const queryTokens =
      this.tokenize(queryValue);

    const candidateTokenSet =
      new Set(
        this.tokenize(candidateValue),
      );

    if (queryTokens.length === 0) {
      return 0;
    }

    const matchedTokens =
      queryTokens.filter(
        (token) =>
          candidateTokenSet.has(token),
      ).length;

    return matchedTokens / queryTokens.length;
  }

  private normalizeCollection(
    values: string[] | undefined,
  ): string[] {
    if (!values) {
      return [];
    }

    return Array.from(
      new Set(
        values
          .map((value) =>
            this.normalizeSearchText(value),
          )
          .filter(Boolean),
      ),
    );
  }

  private normalizeSearchText(
    value: string,
  ): string {
    return value
      .normalize("NFKD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .toLocaleLowerCase("en")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  private tokenize(
    value: string,
  ): string[] {
    return value
      .split(" ")
      .map((token) => token.trim())
      .filter(Boolean);
  }

  private clampScore(
    score: number,
    maximumScore: number,
  ): number {
    return Math.min(
      Math.max(
        Math.round(score),
        0,
      ),
      maximumScore,
    );
  }
}