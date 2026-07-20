import {
  Prisma,
  PrismaClient,
  EducationalEntityType,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertSubjectInput {
  code: string;

  canonicalName: string;

  learningAreaId: string;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;

  subjectCode?: string;

  displayOrder?: number;
}

export class SubjectService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertSubjectInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.SUBJECT,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalSubject.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        learningAreaId: input.learningAreaId,

        subjectCode: input.subjectCode,

        description: input.description,

        displayOrder: input.displayOrder ?? 1,
      },

      update: {
        learningAreaId: input.learningAreaId,

        subjectCode: input.subjectCode,

        description: input.description,

        displayOrder: input.displayOrder ?? 1,
      },
    });
  }
}