import {
  EducationalEntityType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertSubStrandInput {
  code: string;

  canonicalName: string;

  strandId: string;

  subStrandCode?: string;

  displayOrder?: number;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;
}

export class SubStrandService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertSubStrandInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.SUB_STRAND,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalSubStrand.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        strandId: input.strandId,

        subStrandCode: input.subStrandCode,

        displayOrder: input.displayOrder ?? 1,

        description: input.description,
      },

      update: {
        strandId: input.strandId,

        subStrandCode: input.subStrandCode,

        displayOrder: input.displayOrder ?? 1,

        description: input.description,
      },
    });
  }
}