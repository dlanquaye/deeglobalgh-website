import {
  Prisma,
  PrismaClient,
  EducationalEntityType,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertLearningAreaInput {
  code: string;

  canonicalName: string;

  curriculumVersionId: string;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;

  displayOrder?: number;
}

export class LearningAreaService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertLearningAreaInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.LEARNING_AREA,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalLearningArea.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        curriculumVersionId: input.curriculumVersionId,

        displayOrder: input.displayOrder ?? 1,
      },

      update: {
        curriculumVersionId: input.curriculumVersionId,

        displayOrder: input.displayOrder ?? 1,
      },
    });
  }
}