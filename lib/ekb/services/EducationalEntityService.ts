import {
  EducationalEntityType,
  EducationalStatus,
  Prisma,
  PrismaClient,
} from "@prisma/client";

export interface CreateEducationalEntityInput {
  entityType: EducationalEntityType;

  code: string;

  canonicalName: string;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;

  confidenceScore?: number;

  status?: EducationalStatus;

  effectiveFrom?: Date;

  effectiveTo?: Date;
}

export class EducationalEntityService {
  constructor(
    private readonly prisma: PrismaClient | Prisma.TransactionClient,
  ) {}

  async upsert(input: CreateEducationalEntityInput) {
    const entity = await this.prisma.educationalEntity.upsert({
      where: {
        code: input.code,
      },

      create: {
        entityType: input.entityType,

        code: input.code,

        canonicalName: input.canonicalName,

        displayName: input.displayName,

        searchName:
          input.searchName ??
          input.displayName ??
          input.canonicalName,

        slug: input.slug,

        description: input.description,

        confidenceScore: input.confidenceScore ?? 100,

        status: input.status ?? EducationalStatus.ACTIVE,

        effectiveFrom: input.effectiveFrom,

        effectiveTo: input.effectiveTo,
      },

      update: {
        canonicalName: input.canonicalName,

        displayName: input.displayName,

        searchName:
          input.searchName ??
          input.displayName ??
          input.canonicalName,

        slug: input.slug,

        description: input.description,

        confidenceScore: input.confidenceScore ?? 100,

        status: input.status ?? EducationalStatus.ACTIVE,

        effectiveFrom: input.effectiveFrom,

        effectiveTo: input.effectiveTo,
      },
      
    });
    return entity;
  }
}