import {
  EducationalEntityType,
  Prisma,
  PrismaClient,
  ResourceTypeCategory,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertResourceTypeInput {
  code: string;

  canonicalName: string;

  category: ResourceTypeCategory;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;
}

export class ResourceTypeService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertResourceTypeInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.RESOURCE_TYPE,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalResourceType.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        category: input.category,

        description: input.description,
      },

      update: {
        category: input.category,

        description: input.description,
      },
    });
  }
}