import {
  PrismaClient,
} from "@prisma/client";

import {
  EducationalBookSearchResult,
  EducationalBookSearchService,
} from "../search/EducationalBookSearchService";

import {
  BookReadService,
} from "../services/BookReadService";

import {
  EducationalVocabulary,
} from "../vocabulary/EducationalVocabulary";

export type EducationalProductLinkStatus =
  | "ELIGIBLE"
  | "LINKED"
  | "ALREADY_LINKED"
  | "NO_CANDIDATE"
  | "LOW_CONFIDENCE"
  | "SMALL_MARGIN"
  | "MISSING_EDITION";

export interface EducationalProductLinkOptions {
  minimumScore?: number;

  minimumMargin?: number;
}

export interface EducationalProductLinkPreview {
  productId: string;

  sku: string;

  productName: string;

  status: EducationalProductLinkStatus;

  query: string;

  bestScore: number;

  secondScore: number;

  scoreMargin: number;

  bookId?: string;

  bookEntityId?: string;

  bookName?: string;

  editionId?: string;

  productPublisher?: string;

  candidatePublisher?: string;

  candidateSubjects?: string[];

  candidateResourceTypes?: string[];

  productLevels?: string[];

  candidateLevels?: string[];

  matchingLevels?: string[];

  exactLevelCompatible?: boolean;

  reason?: string;
}

interface EducationalProductLinkRecord {
  id: string;

  sku: string;

  name: string;

  publisher: string | null;

  author: string | null;

  levelSlugs: string[];

  educationalEntityId: string | null;

  educationalEditionId: string | null;

  fingerprint: {
    id: string;
  } | null;
}

interface EducationalProductLevelReview {
  productLevels: string[];

  candidateLevels: string[];

  matchingLevels: string[];

  compatible: boolean;

  reason: string;
}

/**
 * Reusable Product-to-EKB linking service.
 *
 * Responsibilities:
 *
 * - Build a Product search query.
 * - Rank EKB Educational Books.
 * - Enforce score and margin safeguards.
 * - Enforce exact Educational Level compatibility.
 * - Expose publisher, subject and resource-type evidence.
 * - Select an active published Edition.
 * - Preview links without modifying data.
 * - Apply verified Product and fingerprint links transactionally.
 *
 * This service does not select batches or decide which Products an
 * administrator should review. Callers remain responsible for that workflow.
 */
export class EducationalProductLinkService {
  private readonly searchService:
    EducationalBookSearchService;

  private readonly vocabulary:
    EducationalVocabulary;

  private readonly minimumScore: number;

  private readonly minimumMargin: number;

  constructor(
    private readonly prisma:
      PrismaClient,

    options:
      EducationalProductLinkOptions = {},
  ) {
    this.vocabulary =
      new EducationalVocabulary();

    this.searchService =
      new EducationalBookSearchService(
        new BookReadService(prisma),
        this.vocabulary,
      );

    this.minimumScore =
      this.normalizeThreshold(
        options.minimumScore,
        55,
      );

    this.minimumMargin =
      this.normalizeThreshold(
        options.minimumMargin,
        15,
      );
  }

  async previewByProductId(
    productId: string,
  ): Promise<
    EducationalProductLinkPreview | null
  > {
    const normalizedProductId =
      productId.trim();

    if (!normalizedProductId) {
      return null;
    }

    const product =
      await this.findProduct({
        id: normalizedProductId,
      });

    if (!product) {
      return null;
    }

    return this.evaluateProduct(
      product,
    );
  }

  async previewBySku(
    sku: string,
  ): Promise<
    EducationalProductLinkPreview | null
  > {
    const normalizedSku =
      sku.trim();

    if (!normalizedSku) {
      return null;
    }

    const product =
      await this.findProduct({
        sku: normalizedSku,
      });

    if (!product) {
      return null;
    }

    return this.evaluateProduct(
      product,
    );
  }

  async linkByProductId(
    productId: string,
  ): Promise<
    EducationalProductLinkPreview | null
  > {
    const normalizedProductId =
      productId.trim();

    if (!normalizedProductId) {
      return null;
    }

    const product =
      await this.findProduct({
        id: normalizedProductId,
      });

    if (!product) {
      return null;
    }

    return this.evaluateAndLinkProduct(
      product,
    );
  }

  async linkBySku(
    sku: string,
  ): Promise<
    EducationalProductLinkPreview | null
  > {
    const normalizedSku =
      sku.trim();

    if (!normalizedSku) {
      return null;
    }

    const product =
      await this.findProduct({
        sku: normalizedSku,
      });

    if (!product) {
      return null;
    }

    return this.evaluateAndLinkProduct(
      product,
    );
  }

  private async evaluateAndLinkProduct(
    product:
      EducationalProductLinkRecord,
  ): Promise<EducationalProductLinkPreview> {
    const preview =
      await this.evaluateProduct(
        product,
      );

    if (
      preview.status
      !== "ELIGIBLE"
      || !preview.bookEntityId
      || !preview.editionId
    ) {
      return preview;
    }

    await this.prisma.$transaction(
      async (transaction) => {
        await transaction.product.update({
          where: {
            id: product.id,
          },

          data: {
            educationalEntityId:
              preview.bookEntityId,

            educationalEditionId:
              preview.editionId,

            classificationConfidence:
              preview.bestScore,

            educationalVerified:
              true,

            educationalLastSyncedAt:
              new Date(),
          },
        });

        if (product.fingerprint) {
          await transaction.productFingerprint.update({
            where: {
              id: product.fingerprint.id,
            },

            data: {
              educationalEntityId:
                preview.bookEntityId,

              educationalEditionId:
                preview.editionId,
            },
          });
        }
      },
    );

    return {
      ...preview,

      status: "LINKED",

      reason:
        "Product and fingerprint were linked transactionally.",
    };
  }

  private async evaluateProduct(
    product:
      EducationalProductLinkRecord,
  ): Promise<EducationalProductLinkPreview> {
    const query =
      this.buildSearchQuery(
        product,
      );

    if (
      product.educationalEntityId
      || product.educationalEditionId
    ) {
      return {
        productId: product.id,

        sku: product.sku,

        productName:
          product.name,

        status:
          "ALREADY_LINKED",

        query,

        bestScore: 0,

        secondScore: 0,

        scoreMargin: 0,

        productPublisher:
          product.publisher
          ?? undefined,

        reason:
          "Product already has an EKB relationship.",
      };
    }

    const candidates =
      await this.searchService.search({
        query,

        limit: 2,
      });

    if (
      candidates.length === 0
    ) {
      return {
        productId: product.id,

        sku: product.sku,

        productName:
          product.name,

        status:
          "NO_CANDIDATE",

        query,

        bestScore: 0,

        secondScore: 0,

        scoreMargin: 0,

        productPublisher:
          product.publisher
          ?? undefined,

        reason:
          "No EKB Educational Book candidate was found.",
      };
    }

    const bestCandidate =
      candidates[0];

    const secondCandidate =
      candidates[1];

    const secondScore =
      secondCandidate?.score
      ?? 0;

    const scoreMargin =
      bestCandidate.score
      - secondScore;

    const levelReview =
      this.reviewExactLevelCompatibility(
        product,
        bestCandidate,
      );

    const candidatePublisher =
      bestCandidate.book
        .bookLine
        ?.publisher
        ?.entity
        .canonicalName;

    const candidateSubjects =
      this.uniqueCanonicalValues(
        bestCandidate.book
          .subjects
          .map(
            (relationship) =>
              relationship.subject
                .entity
                .canonicalName,
          ),
      );

    const candidateResourceTypes =
      this.uniqueCanonicalValues(
        bestCandidate.book
          .resourceTypes
          .map(
            (relationship) =>
              relationship.resourceType
                .entity
                .canonicalName,
          ),
      );

    const commonResult = {
      productId: product.id,

      sku: product.sku,

      productName:
        product.name,

      query,

      bestScore:
        bestCandidate.score,

      secondScore,

      scoreMargin,

      bookId:
        bestCandidate.book.id,

      bookEntityId:
        bestCandidate.book.entityId,

      bookName:
        bestCandidate.book.entity
          .canonicalName,

      productPublisher:
        product.publisher
        ?? undefined,

      candidatePublisher,

      candidateSubjects,

      candidateResourceTypes,

      productLevels:
        levelReview.productLevels,

      candidateLevels:
        levelReview.candidateLevels,

      matchingLevels:
        levelReview.matchingLevels,

      exactLevelCompatible:
        levelReview.compatible,
    };

    if (
      bestCandidate.score
      < this.minimumScore
    ) {
      return {
        ...commonResult,

        status:
          "LOW_CONFIDENCE",

        reason:
          `Best score ${bestCandidate.score} is below the required ${this.minimumScore}.`,
      };
    }

    if (
      scoreMargin
      < this.minimumMargin
    ) {
      return {
        ...commonResult,

        status:
          "SMALL_MARGIN",

        reason:
          `Score margin ${scoreMargin} is below the required ${this.minimumMargin}.`,
      };
    }

    if (!levelReview.compatible) {
      return {
        ...commonResult,

        status:
          "LOW_CONFIDENCE",

        reason:
          levelReview.reason,
      };
    }

    const edition =
      this.selectCurrentEdition(
        bestCandidate,
      );

    if (!edition) {
      return {
        ...commonResult,

        status:
          "MISSING_EDITION",

        reason:
          "The selected Educational Book has no active published Edition.",
      };
    }

    return {
      ...commonResult,

      status:
        "ELIGIBLE",

      editionId:
        edition.id,

      reason:
        [
          "Candidate passed the automated score, margin,",
          "exact-level and Edition safeguards.",
          "Subject, resource type, publisher and logical",
          "book identity still require manual review.",
        ].join(" "),
    };
  }

  private async findProduct(
    where:
      | {
          id: string;
        }
      | {
          sku: string;
        },
  ): Promise<
    EducationalProductLinkRecord | null
  > {
    return this.prisma.product.findFirst({
      where,

      select: {
        id: true,

        sku: true,

        name: true,

        publisher: true,

        author: true,

        levelSlugs: true,

        educationalEntityId: true,

        educationalEditionId: true,

        fingerprint: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  private buildSearchQuery(
    product: {
      name: string;

      publisher: string | null;

      author: string | null;

      levelSlugs: string[];
    },
  ): string {
    return Array.from(
      new Set(
        [
          product.name,

          product.publisher,

          product.author,

          ...product.levelSlugs,
        ]
          .map(
            (value) =>
              value?.trim(),
          )
          .filter(
            (
              value,
            ): value is string =>
              Boolean(value),
          ),
      ),
    ).join(" ");
  }

  private reviewExactLevelCompatibility(
    product:
      EducationalProductLinkRecord,

    candidate:
      EducationalBookSearchResult,
  ): EducationalProductLevelReview {
    const productLevels =
      this.extractCanonicalLevels([
        product.name,
        ...product.levelSlugs,
      ]);

    const candidateLevelValues =
      candidate.book.levels
        .flatMap(
          (relationship) => [
            relationship.level
              .entity.canonicalName,

            relationship.level
              .entity.displayName,

            relationship.level
              .shortCode,
          ],
        )
        .filter(
          (
            value,
          ): value is string =>
            typeof value === "string"
            && value.trim().length > 0,
        );

    const candidateLevels =
      this.extractCanonicalLevels(
        candidateLevelValues,
      );

    const normalizedCandidateLevels =
      new Set(
        candidateLevels.map(
          (level) =>
            this.normalizeEducationalValue(
              level,
            ),
        ),
      );

    const matchingLevels =
      productLevels.filter(
        (level) =>
          normalizedCandidateLevels.has(
            this.normalizeEducationalValue(
              level,
            ),
          ),
      );

    if (
      productLevels.length === 0
    ) {
      return {
        productLevels,

        candidateLevels,

        matchingLevels,

        compatible: false,

        reason:
          "Exact level safeguard failed because no recognised Product level could be identified.",
      };
    }

    if (
      candidateLevels.length === 0
    ) {
      return {
        productLevels,

        candidateLevels,

        matchingLevels,

        compatible: false,

        reason:
          "Exact level safeguard failed because the selected Educational Book has no recognised level relationship.",
      };
    }

    if (
      matchingLevels.length
      !== productLevels.length
    ) {
      return {
        productLevels,

        candidateLevels,

        matchingLevels,

        compatible: false,

        reason:
          [
            "Exact level safeguard failed.",
            `Product level(s): ${productLevels.join(", ")}.`,
            `Candidate level(s): ${candidateLevels.join(", ")}.`,
          ].join(" "),
      };
    }

    return {
      productLevels,

      candidateLevels,

      matchingLevels,

      compatible: true,

      reason:
        `Exact level safeguard passed for ${matchingLevels.join(", ")}.`,
    };
  }

  private extractCanonicalLevels(
    values: string[],
  ): string[] {
    const levels =
      new Map<string, string>();

    for (const value of values) {
      const normalizedValue =
        value.trim();

      if (!normalizedValue) {
        continue;
      }

      const extraction =
        this.vocabulary.extract(
          normalizedValue,
        );

      for (
        const match
        of extraction.levels
      ) {
        const canonicalValue =
          match.canonicalValue.trim();

        const normalizedCanonicalValue =
          this.normalizeEducationalValue(
            canonicalValue,
          );

        if (
          normalizedCanonicalValue
          && !levels.has(
            normalizedCanonicalValue,
          )
        ) {
          levels.set(
            normalizedCanonicalValue,
            canonicalValue,
          );
        }
      }
    }

    return Array.from(
      levels.values(),
    );
  }

  private uniqueCanonicalValues(
    values:
      Array<
        string
        | null
        | undefined
      >,
  ): string[] {
    const uniqueValues =
      new Map<string, string>();

    for (const value of values) {
      const canonicalValue =
        value?.trim();

      if (!canonicalValue) {
        continue;
      }

      const normalizedValue =
        this.normalizeEducationalValue(
          canonicalValue,
        );

      if (
        normalizedValue
        && !uniqueValues.has(
          normalizedValue,
        )
      ) {
        uniqueValues.set(
          normalizedValue,
          canonicalValue,
        );
      }
    }

    return Array.from(
      uniqueValues.values(),
    );
  }

  private normalizeEducationalValue(
    value: string,
  ): string {
    return this.vocabulary
      .normalizeText(value)
      .toLocaleLowerCase("en")
      .replace(/\s+/g, " ")
      .trim();
  }

  private selectCurrentEdition(
    candidate:
      EducationalBookSearchResult,
  ) {
    return (
      candidate.book.editions.find(
        (edition) =>
          edition.isCurrentEdition
          && edition.isActive
          && edition.isPublished,
      )
      ?? candidate.book.editions.find(
        (edition) =>
          edition.isActive
          && edition.isPublished,
      )
      ?? candidate.book.editions[0]
    );
  }

  private normalizeThreshold(
    value: number | undefined,
    fallback: number,
  ): number {
    if (
      value === undefined
      || !Number.isFinite(value)
    ) {
      return fallback;
    }

    return Math.min(
      Math.max(
        Math.trunc(value),
        0,
      ),
      100,
    );
  }
}