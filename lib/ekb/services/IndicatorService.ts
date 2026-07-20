import {
  EducationalEntityType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertIndicatorInput {
  code: string;

  canonicalName: string;

  subStrandId: string;

  statement: string;

  indicatorCode?: string;

  explanation?: string;

  displayOrder?: number;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;
}

export class IndicatorService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertIndicatorInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.INDICATOR,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalIndicator.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        subStrandId: input.subStrandId,

        indicatorCode: input.indicatorCode,

        statement: input.statement,

        explanation: input.explanation,

        displayOrder: input.displayOrder ?? 1,
      },

      update: {
        subStrandId: input.subStrandId,

        indicatorCode: input.indicatorCode,

        statement: input.statement,

        explanation: input.explanation,

        displayOrder: input.displayOrder ?? 1,
      },
    });
  }
}