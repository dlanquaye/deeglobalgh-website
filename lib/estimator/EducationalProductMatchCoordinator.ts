import {
  Prisma,
} from "@prisma/client";

import {
  prisma,
} from "@/lib/prisma";

import {
  getProductCatalogue,
} from "@/lib/knowledge/repository/getProductCatalogue";

import {
  findBestMatches,
  ProductMatchCandidate,
  ProductMatchResult,
} from "@/lib/knowledge/engine/findBestMatches";

import {
  EducationalBookSearchService,
  EducationalBookSearchResult,
} from "@/lib/ekb/search/EducationalBookSearchService";

import {
  BookReadService,
} from "@/lib/ekb/services/BookReadService";

export interface CoordinatedProductMatchResult
  extends ProductMatchResult {
  legacySimilarity: number;

  educationalBookScore: number;

  educationalBookId?: string;

  educationalBookName?: string;

  evidenceSources: Array<
    "LEGACY_FINGERPRINT"
    | "EDUCATIONAL_BOOK_SEARCH"
  >;
}

/**
 * Coordinates the existing Product Fingerprint matcher with the
 * Educational Knowledge Base ranked-book search.
 *
 * The coordinator does not replace either search engine.
 *
 * It preserves the existing Product result contract while allowing
 * EKB-ranked Educational Books to contribute additional evidence when
 * those books are connected to active sellable Products.
 */
export class EducationalProductMatchCoordinator {
  private readonly educationalBookSearchService:
    EducationalBookSearchService;

  constructor() {
    const bookReadService =
      new BookReadService(prisma);

    this.educationalBookSearchService =
      new EducationalBookSearchService(
        bookReadService,
      );
  }

  async findBestMatches(
    requestedProductName: string,
    limit = 5,
  ): Promise<
    CoordinatedProductMatchResult[]
  > {
    const normalizedQuery =
      requestedProductName.trim();

    if (!normalizedQuery) {
      return [];
    }

    const normalizedLimit =
      this.normalizeLimit(limit);

    const catalogue =
      await getProductCatalogue();

    const legacyMatches =
      findBestMatches(
        normalizedQuery,
        catalogue,
        Math.max(
          normalizedLimit * 5,
          25,
        ),
      );

    const educationalBookMatches =
      await this.educationalBookSearchService
        .search({
          query: normalizedQuery,

          limit: Math.max(
            normalizedLimit * 3,
            15,
          ),
        });

    const coordinatedMatches =
      new Map<
        string,
        CoordinatedProductMatchResult
      >();

    this.addLegacyMatches(
      coordinatedMatches,
      legacyMatches,
    );

    await this.addEducationalBookMatches(
      coordinatedMatches,
      educationalBookMatches,
      catalogue,
    );

    return Array.from(
      coordinatedMatches.values(),
    )
      .sort((left, right) => {
        if (
          right.similarity
          !== left.similarity
        ) {
          return (
            right.similarity
            - left.similarity
          );
        }

        if (
          right.educationalBookScore
          !== left.educationalBookScore
        ) {
          return (
            right.educationalBookScore
            - left.educationalBookScore
          );
        }

        return left.product.productName
          .localeCompare(
            right.product.productName,
          );
      })
      .slice(
        0,
        normalizedLimit,
      );
  }

  private addLegacyMatches(
    coordinatedMatches: Map<
      string,
      CoordinatedProductMatchResult
    >,
    legacyMatches: ProductMatchResult[],
  ): void {
    for (
      const legacyMatch
      of legacyMatches
    ) {
      coordinatedMatches.set(
        legacyMatch.product.id,
        {
          ...legacyMatch,

          legacySimilarity:
            legacyMatch.similarity,

          educationalBookScore: 0,

          evidenceSources: [
            "LEGACY_FINGERPRINT",
          ],
        },
      );
    }
  }

  private async addEducationalBookMatches(
    coordinatedMatches: Map<
      string,
      CoordinatedProductMatchResult
    >,
    educationalBookMatches:
      EducationalBookSearchResult[],
    catalogue: ProductMatchCandidate[],
  ): Promise<void> {
    const catalogueByProductId =
      new Map(
        catalogue.map(
          (product) => [
            product.id,
            product,
          ],
        ),
      );

    for (
      const educationalMatch
      of educationalBookMatches
    ) {
      const products =
        await this.findProductsForBook(
          educationalMatch,
        );

      for (const product of products) {
        const candidate =
          catalogueByProductId.get(
            product.id,
          );

        if (!candidate) {
          continue;
        }

        const existing =
          coordinatedMatches.get(
            candidate.id,
          );

        const legacySimilarity =
          existing?.legacySimilarity
          ?? 0;

        const educationalBookScore =
          Math.max(
            existing
              ?.educationalBookScore
              ?? 0,

            educationalMatch.score,
          );

        const similarity =
          this.combineScores(
            legacySimilarity,
            educationalBookScore,
          );

        const evidenceSources =
          this.buildEvidenceSources(
            legacySimilarity,
            educationalBookScore,
          );

        coordinatedMatches.set(
          candidate.id,
          {
            product: candidate,

            similarity,

            matchingDimensions:
              existing
                ?.matchingDimensions
              ?? [],

            differentDimensions:
              existing
                ?.differentDimensions
              ?? [],

            missingDimensions:
              existing
                ?.missingDimensions
              ?? [],

            legacySimilarity,

            educationalBookScore,

            educationalBookId:
              educationalMatch.book.id,

            educationalBookName:
              educationalMatch
                .book.entity
                .canonicalName,

            evidenceSources,
          },
        );
      }
    }
  }

  private async findProductsForBook(
    educationalMatch:
      EducationalBookSearchResult,
  ): Promise<Array<{ id: string }>> {
    const book =
      educationalMatch.book;

    const editionIds =
      book.editions.map(
        (edition) =>
          edition.id,
      );

    const directConditions:
      Prisma.ProductWhereInput[] = [
        {
          educationalEntityId:
            book.entityId,
        },
      ];

    const fingerprintConditions:
      Prisma.ProductFingerprintWhereInput[] =
        [
          {
            educationalEntityId:
              book.entityId,
          },
        ];

    if (editionIds.length > 0) {
      directConditions.push({
        educationalEditionId: {
          in: editionIds,
        },
      });

      fingerprintConditions.push({
        educationalEditionId: {
          in: editionIds,
        },
      });
    }

    return prisma.product.findMany({
      where: {
        isActive: true,

        OR: [
          ...directConditions,

          {
            fingerprint: {
              is: {
                OR:
                  fingerprintConditions,
              },
            },
          },
        ],
      },

      select: {
        id: true,
      },

      orderBy: {
        name: "asc",
      },
    });
  }

  private combineScores(
    legacySimilarity: number,
    educationalBookScore: number,
  ): number {
    if (
      legacySimilarity <= 0
      && educationalBookScore <= 0
    ) {
      return 0;
    }

    if (legacySimilarity <= 0) {
      return this.clampScore(
        educationalBookScore,
      );
    }

    if (
      educationalBookScore <= 0
    ) {
      return this.clampScore(
        legacySimilarity,
      );
    }

    const strongestScore =
      Math.max(
        legacySimilarity,
        educationalBookScore,
      );

    const agreementBonus = 10;

    return this.clampScore(
      strongestScore
      + agreementBonus,
    );
  }

  private buildEvidenceSources(
    legacySimilarity: number,
    educationalBookScore: number,
  ): CoordinatedProductMatchResult[
    "evidenceSources"
  ] {
    const sources:
      CoordinatedProductMatchResult[
        "evidenceSources"
      ] = [];

    if (legacySimilarity > 0) {
      sources.push(
        "LEGACY_FINGERPRINT",
      );
    }

    if (
      educationalBookScore > 0
    ) {
      sources.push(
        "EDUCATIONAL_BOOK_SEARCH",
      );
    }

    return sources;
  }

  private clampScore(
    score: number,
  ): number {
    return Math.min(
      Math.max(
        Math.round(score),
        0,
      ),
      100,
    );
  }

  private normalizeLimit(
    limit: number,
  ): number {
    if (!Number.isFinite(limit)) {
      return 5;
    }

    return Math.min(
      Math.max(
        Math.trunc(limit),
        1,
      ),
      25,
    );
  }
}