import {
  EducationalEntityType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertConceptInput {
  code: string;

  canonicalName: string;

  parentConceptId?: string;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;
}

export class ConceptService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertConceptInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.CONCEPT,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalConcept.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        description: input.description,

        parentConceptId: input.parentConceptId,
      },

      update: {
        description: input.description,

        parentConceptId: input.parentConceptId,
      },
    });
  }
}