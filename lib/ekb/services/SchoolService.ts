import {
  EducationalEntityType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertSchoolInput {
  code: string;

  canonicalName: string;

  circuitId?: string;

  emisCode?: string;

  schoolType?: string;

  ownership?: string;

  address?: string;

  town?: string;

  latitude?: number;

  longitude?: number;

  website?: string;

  email?: string;

  phone?: string;

  isActive?: boolean;

  displayName?: string;

  searchName?: string;

  slug?: string;

  description?: string;
}

export class SchoolService extends BaseEntityService {
  constructor(
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    super(prisma);
  }

  async upsert(input: UpsertSchoolInput) {
    const entity = await this.upsertEntity({
      entityType: EducationalEntityType.SCHOOL,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalSchool.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        circuitId: input.circuitId,

        emisCode: input.emisCode,

        schoolType: input.schoolType,

        ownership: input.ownership,

        address: input.address,

        town: input.town,

        latitude: input.latitude,

        longitude: input.longitude,

        website: input.website,

        email: input.email,

        phone: input.phone,

        isActive: input.isActive ?? true,
      },

      update: {
        circuitId: input.circuitId,

        emisCode: input.emisCode,

        schoolType: input.schoolType,

        ownership: input.ownership,

        address: input.address,

        town: input.town,

        latitude: input.latitude,

        longitude: input.longitude,

        website: input.website,

        email: input.email,

        phone: input.phone,

        isActive: input.isActive ?? true,
      },
    });
  }
}