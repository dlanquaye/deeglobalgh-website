import {
  EducationalEntityType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertCountryInput {
  code: string;

  canonicalName: string;

  iso2: string;

  iso3?: string;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;
}

export class CountryService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertCountryInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.COUNTRY,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalCountry.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        iso2: input.iso2,

        iso3: input.iso3,
      },

      update: {
        iso2: input.iso2,

        iso3: input.iso3,
      },
    });
  }
}