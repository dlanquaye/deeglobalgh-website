import {
  Prisma,
  PrismaClient,
  EducationalEntityType,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertCurriculumVersionInput {
  code: string;

  canonicalName: string;

  curriculumId: string;

  version: string;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;

  effectiveFrom?: Date;

  effectiveTo?: Date;

  isCurrent?: boolean;
}

export class CurriculumVersionService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertCurriculumVersionInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.CURRICULUM_VERSION,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,

      effectiveFrom: input.effectiveFrom,

      effectiveTo: input.effectiveTo,
    });

    return this.prisma.educationalCurriculumVersion.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        curriculumId: input.curriculumId,

        version: input.version,

        effectiveFrom: input.effectiveFrom,

        effectiveTo: input.effectiveTo,

        isCurrent: input.isCurrent ?? true,

        description: input.description,
      },

      update: {
        curriculumId: input.curriculumId,

        version: input.version,

        effectiveFrom: input.effectiveFrom,

        effectiveTo: input.effectiveTo,

        isCurrent: input.isCurrent ?? true,

        description: input.description,
      },
    });
  }
}