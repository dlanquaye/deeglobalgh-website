import {
  EducationalEntityType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertLevelInput {
  code: string;

  canonicalName: string;

  educationStageId: string;

  displayOrder?: number;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;
}

export class LevelService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertLevelInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.LEVEL,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalLevel.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        educationStageId: input.educationStageId,

        displayOrder: input.displayOrder ?? 1,

        description: input.description,
      },

      update: {
        educationStageId: input.educationStageId,

        displayOrder: input.displayOrder ?? 1,

        description: input.description,
      },
    });
  }
}