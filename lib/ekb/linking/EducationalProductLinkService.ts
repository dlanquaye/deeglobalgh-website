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

/**
 * Reusable Product-to-EKB linking service.
 *
 * Responsibilities:
 *
 * - Build a Product search query.
 * - Rank EKB Educational Books.
 * - Enforce score and margin safeguards.
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

  private readonly minimumScore: number;

  private readonly minimumMargin: number;

  constructor(
  private readonly prisma:
    PrismaClient,

  options:
    EducationalProductLinkOptions = {},
) {
    this.searchService =
      new EducationalBookSearchService(
        new BookReadService(prisma),
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
        "Candidate passed the score, margin and Edition safeguards.",
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