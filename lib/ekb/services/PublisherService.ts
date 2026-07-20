import {
  Prisma,
  PrismaClient,
  EducationalEntityType,
} from "@prisma/client";

import { EducationalEntityService } from "./EducationalEntityService";

export interface UpsertPublisherInput {
  code: string;

  canonicalName: string;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;

  website?: string;

  email?: string;

  phone?: string;
}

export class PublisherService {
  constructor(
    private readonly prisma: PrismaClient | Prisma.TransactionClient,
  ) {}

  async upsert(input: UpsertPublisherInput) {
    const entityService = new EducationalEntityService(this.prisma);

    const entity = await entityService.upsert({
      entityType: EducationalEntityType.PUBLISHER,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalPublisher.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        website: input.website,

        email: input.email,

        phone: input.phone,
      },

      update: {
        website: input.website,

        email: input.email,

        phone: input.phone,
      },
    });
  }
}