import {
  EducationalEntityType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertISBNInput {
  code: string;

  canonicalName: string;

  editionId: string;

  isbn10?: string;

  isbn13?: string;

  barcode?: string;

  format?: string;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;
}

export class ISBNService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertISBNInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.ISBN,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalISBN.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        editionId: input.editionId,

        isbn10: input.isbn10,

        isbn13: input.isbn13,

        barcode: input.barcode,

        format: input.format,
      },

      update: {
        editionId: input.editionId,

        isbn10: input.isbn10,

        isbn13: input.isbn13,

        barcode: input.barcode,

        format: input.format,
      },
    });
  }
}