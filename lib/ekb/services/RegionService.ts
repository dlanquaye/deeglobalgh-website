import {
  EducationalEntityType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertRegionInput {
  code: string;

  canonicalName: string;

  countryId: string;

  regionCode?: string;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;
}

export class RegionService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertRegionInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.REGION,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalRegion.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        countryId: input.countryId,

        regionCode: input.regionCode,
      },

      update: {
        countryId: input.countryId,

        regionCode: input.regionCode,
      },
    });
  }
}