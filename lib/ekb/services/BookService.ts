import {
  EducationalEntityType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertBookInput {
  code: string;

  canonicalName: string;

  bookLineId: string;

  seriesId?: string;

  subtitle?: string;

  summary?: string;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;
}

export class BookService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertBookInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.BOOK,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalBook.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        bookLineId: input.bookLineId,

        seriesId: input.seriesId,

        subtitle: input.subtitle,

        summary: input.summary,
      },

      update: {
        bookLineId: input.bookLineId,

        seriesId: input.seriesId,

        subtitle: input.subtitle,

        summary: input.summary,
      },
    });
  }
}