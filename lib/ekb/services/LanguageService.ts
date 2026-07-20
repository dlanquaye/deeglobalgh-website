import {
  LanguageDirection,
  Prisma,
  PrismaClient,
  EducationalEntityType,
} from "@prisma/client";

import { BaseEntityService } from "./BaseEntityService";

export interface UpsertLanguageInput {
  code: string;
  isoCode: string;
  canonicalName: string;

  displayName?: string;
  searchName?: string;
  slug?: string;
  description?: string;

  nativeName?: string;

  direction?: LanguageDirection;

  isOfficial?: boolean;
}

export class LanguageService extends BaseEntityService {
  constructor(
  prisma: PrismaClient | Prisma.TransactionClient,
) {
  super(prisma);
}

  async upsert(input: UpsertLanguageInput) {
    const entity = await this.upsertEntity({

      entityType: EducationalEntityType.LANGUAGE,

      code: input.code,

      canonicalName: input.canonicalName,

      displayName: input.displayName,

      searchName: input.searchName,

      slug: input.slug,

      description: input.description,
    });

    return this.prisma.educationalLanguage.upsert({
      where: {
        entityId: entity.id,
      },

      create: {
        entityId: entity.id,

        isoCode: input.isoCode,

        nativeName: input.nativeName,

        direction:
          input.direction ??
          LanguageDirection.LTR,

        isOfficial:
          input.isOfficial ??
          false,
      },

      update: {
        isoCode: input.isoCode,

        nativeName: input.nativeName,

        direction:
          input.direction ??
          LanguageDirection.LTR,

        isOfficial:
          input.isOfficial ??
          false,
      },
    });
  }
}