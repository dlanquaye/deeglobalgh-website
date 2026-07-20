import {
  EducationalEntityType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertStrandInput {
  code: string;

  canonicalName: string;

  subjectId: string;

  strandCode?: string;

  displayOrder?: number;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;
}

export class StrandService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertStrandInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.STRAND,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalStrand.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        subjectId: input.subjectId,

        strandCode: input.strandCode,

        displayOrder: input.displayOrder ?? 1,

        description: input.description,
      },

      update: {
        subjectId: input.subjectId,

        strandCode: input.strandCode,

        displayOrder: input.displayOrder ?? 1,

        description: input.description,
      },
    });
  }
}