import {
  BookBinding,
  EducationalEntityType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertEditionInput {
  code: string;

  canonicalName: string;

  bookId: string;

  editionNumber?: number;

  editionName?: string;

  publicationYear?: number;

  publicationDate?: Date;

  revision?: string;

  binding?: BookBinding;

  pageCount?: number;

  coverImage?: string;

  publisherSku?: string;

  isCurrentEdition?: boolean;

  isPublished?: boolean;

  isDigital?: boolean;

  isPrint?: boolean;

  isActive?: boolean;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;
}

export class EditionService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertEditionInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.EDITION,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalEdition.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        bookId: input.bookId,

        editionNumber: input.editionNumber,

        editionName: input.editionName,

        publicationYear: input.publicationYear,

        publicationDate: input.publicationDate,

        revision: input.revision,

        binding: input.binding,

        pageCount: input.pageCount,

        coverImage: input.coverImage,

        publisherSku: input.publisherSku,

        isCurrentEdition: input.isCurrentEdition ?? true,

        isPublished: input.isPublished ?? true,

        isDigital: input.isDigital ?? false,

        isPrint: input.isPrint ?? true,

        isActive: input.isActive ?? true,
      },

      update: {
        bookId: input.bookId,

        editionNumber: input.editionNumber,

        editionName: input.editionName,

        publicationYear: input.publicationYear,

        publicationDate: input.publicationDate,

        revision: input.revision,

        binding: input.binding,

        pageCount: input.pageCount,

        coverImage: input.coverImage,

        publisherSku: input.publisherSku,

        isCurrentEdition: input.isCurrentEdition ?? true,

        isPublished: input.isPublished ?? true,

        isDigital: input.isDigital ?? false,

        isPrint: input.isPrint ?? true,

        isActive: input.isActive ?? true,
      },
    });
  }
}