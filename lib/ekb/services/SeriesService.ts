import {
  EducationalEntityType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertSeriesInput {
  code: string;

  canonicalName: string;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;
}

export class SeriesService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertSeriesInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.SERIES,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalSeries.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        description: input.description,
      },

      update: {
        description: input.description,
      },
    });
  }
}