import {
  EducationalEntityType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertAuthorInput {
  code: string;

  canonicalName: string;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;

  biography?: string;

  nationality?: string;

  website?: string;

  photo?: string;
}

export class AuthorService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertAuthorInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.AUTHOR,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalAuthor.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        biography: input.biography,

        nationality: input.nationality,

        website: input.website,

        photo: input.photo,
      },

      update: {
        biography: input.biography,

        nationality: input.nationality,

        website: input.website,

        photo: input.photo,
      },
    });
  }
}