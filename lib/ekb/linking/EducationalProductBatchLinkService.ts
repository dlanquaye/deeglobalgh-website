import {
  PrismaClient,
} from "@prisma/client";

import {
  EducationalProductLinkOptions,
  EducationalProductLinkPreview,
  EducationalProductLinkService,
  EducationalProductLinkStatus,
} from "./EducationalProductLinkService";

export interface EducationalProductBatchLinkOptions
  extends EducationalProductLinkOptions {
  limit?: number;

  offset?: number;
}

export interface EducationalProductBatchLinkReport {
  selected: number;

  processed: number;

  offset: number;

  counts:
    Record<
      EducationalProductLinkStatus,
      number
    >;

  results:
    EducationalProductLinkPreview[];
}

const LINK_STATUSES:
  EducationalProductLinkStatus[] = [
    "ELIGIBLE",
    "LINKED",
    "ALREADY_LINKED",
    "NO_CANDIDATE",
    "LOW_CONFIDENCE",
    "SMALL_MARGIN",
    "MISSING_EDITION",
  ];

/**
 * Selects a stable batch of active, unlinked Products and evaluates
 * each Product through EducationalProductLinkService in preview mode.
 *
 * This service performs no database writes.
 */
export class EducationalProductBatchLinkService {
  private readonly linkService:
    EducationalProductLinkService;

  private readonly limit: number;

  private readonly offset: number;

  constructor(
    private readonly prisma:
      PrismaClient,

    options:
      EducationalProductBatchLinkOptions = {},
  ) {
    this.linkService =
      new EducationalProductLinkService(
        prisma,
        {
          minimumScore:
            options.minimumScore,

          minimumMargin:
            options.minimumMargin,
        },
      );

    this.limit =
      this.normalizeLimit(
        options.limit,
      );

    this.offset =
      this.normalizeOffset(
        options.offset,
      );
  }

  async previewActiveUnlinkedProducts():
    Promise<EducationalProductBatchLinkReport> {
    const products =
      await this.prisma.product.findMany({
        where: {
          isActive: true,

          educationalEntityId: null,

          educationalEditionId: null,
        },

        select: {
          id: true,
        },

        orderBy: [
          {
            name: "asc",
          },

          {
            sku: "asc",
          },

          {
            id: "asc",
          },
        ],

        skip:
          this.offset,

        take:
          this.limit,
      });

    const results:
      EducationalProductLinkPreview[] = [];

    for (
      const product
      of products
    ) {
      const preview =
        await this.linkService
          .previewByProductId(
            product.id,
          );

      if (preview) {
        results.push(
          preview,
        );
      }
    }

    return {
      selected:
        products.length,

      processed:
        results.length,

      offset:
        this.offset,

      counts:
        this.countStatuses(
          results,
        ),

      results,
    };
  }

  private countStatuses(
    results:
      EducationalProductLinkPreview[],
  ): Record<
    EducationalProductLinkStatus,
    number
  > {
    const counts =
      LINK_STATUSES.reduce(
        (
          currentCounts,
          status,
        ) => {
          currentCounts[status] = 0;

          return currentCounts;
        },
        {} as Record<
          EducationalProductLinkStatus,
          number
        >,
      );

    for (
      const result
      of results
    ) {
      counts[result.status] += 1;
    }

    return counts;
  }

  private normalizeLimit(
    value:
      number
      | undefined,
  ): number {
    if (
      value === undefined
      || !Number.isFinite(value)
    ) {
      return 25;
    }

    return Math.min(
      Math.max(
        Math.trunc(value),
        1,
      ),
      100,
    );
  }

  private normalizeOffset(
    value:
      number
      | undefined,
  ): number {
    if (
      value === undefined
      || !Number.isFinite(value)
    ) {
      return 0;
    }

    return Math.max(
      Math.trunc(value),
      0,
    );
  }
}