import {
  EducationalEntityType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertDistrictInput {
  code: string;

  canonicalName: string;

  regionId: string;

  districtCode?: string;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;
}

export class DistrictService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertDistrictInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.DISTRICT,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalDistrict.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        regionId: input.regionId,

        districtCode: input.districtCode,
      },

      update: {
        regionId: input.regionId,

        districtCode: input.districtCode,
      },
    });
  }
}