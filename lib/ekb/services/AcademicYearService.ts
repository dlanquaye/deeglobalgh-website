import {
  EducationalEntityType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertAcademicYearInput {
  code: string;

  canonicalName: string;

  startYear: number;

  endYear: number;

  startDate?: Date;

  endDate?: Date;

  isCurrent?: boolean;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;
}

export class AcademicYearService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertAcademicYearInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.ACADEMIC_YEAR,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalAcademicYear.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        startYear: input.startYear,

        endYear: input.endYear,

        startDate: input.startDate,

        endDate: input.endDate,

        isCurrent: input.isCurrent ?? false,
      },

      update: {
        startYear: input.startYear,

        endYear: input.endYear,

        startDate: input.startDate,

        endDate: input.endDate,

        isCurrent: input.isCurrent ?? false,
      },
    });
  }
}
