import {
  EducationalEntityType,
  EducationalLevelType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertEducationStageInput {
  code: string;

  canonicalName: string;

  levelType: EducationalLevelType;

  displayOrder?: number;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;
}

export class EducationStageService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertEducationStageInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.EDUCATION_STAGE,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalEducationStage.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        levelType: input.levelType,

        displayOrder: input.displayOrder ?? 1,

        description: input.description,
      },

      update: {
        levelType: input.levelType,

        displayOrder: input.displayOrder ?? 1,

        description: input.description,
      },
    });
  }
}