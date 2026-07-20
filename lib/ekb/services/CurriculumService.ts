import {
  CurriculumAuthority,
  EducationalEntityType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertCurriculumInput {
  code: string;

  canonicalName: string;

  authority: CurriculumAuthority;

  countryCode?: string;

  officialCode?: string;

  website?: string;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;
}

export class CurriculumService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertCurriculumInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.CURRICULUM,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalCurriculum.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        authority: input.authority,

        countryCode: input.countryCode,

        officialCode: input.officialCode,

        website: input.website,

        description: input.description,
      },

      update: {
        authority: input.authority,

        countryCode: input.countryCode,

        officialCode: input.officialCode,

        website: input.website,

        description: input.description,
      },
    });
  }
}