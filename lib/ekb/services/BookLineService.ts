import {
  EducationalEntityType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertBookLineInput {
  code: string;

  canonicalName: string;

  publisherId: string;

  marketingName?: string;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;
}

export class BookLineService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertBookLineInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.BOOK_LINE,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalBookLine.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        publisherId: input.publisherId,

        marketingName: input.marketingName,

        description: input.description,
      },

      update: {
        publisherId: input.publisherId,

        marketingName: input.marketingName,

        description: input.description,
      },
    });
  }
}