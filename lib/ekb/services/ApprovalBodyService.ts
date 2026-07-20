import {
  EducationalEntityType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertApprovalBodyInput {
  code: string;

  canonicalName: string;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;

  shortName?: string;

  legalName?: string;

  country?: string;

  website?: string;

  email?: string;

  phone?: string;

  isGovernment?: boolean;
}

export class ApprovalBodyService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertApprovalBodyInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.APPROVAL_BODY,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalApprovalBody.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        shortName: input.shortName,

        legalName: input.legalName,

        country: input.country,

        website: input.website,

        email: input.email,

        phone: input.phone,

        isGovernment: input.isGovernment ?? false,
      },

      update: {
        shortName: input.shortName,

        legalName: input.legalName,

        country: input.country,

        website: input.website,

        email: input.email,

        phone: input.phone,

        isGovernment: input.isGovernment ?? false,
      },
    });
  }
}