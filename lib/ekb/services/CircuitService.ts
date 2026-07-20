import {
  EducationalEntityType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertCircuitInput {
  code: string;

  canonicalName: string;

  districtId: string;

  circuitCode?: string;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;
}

export class CircuitService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertCircuitInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.CIRCUIT,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalCircuit.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        districtId: input.districtId,

        circuitCode: input.circuitCode,
      },

      update: {
        districtId: input.districtId,

        circuitCode: input.circuitCode,
      },
    });
  }
}