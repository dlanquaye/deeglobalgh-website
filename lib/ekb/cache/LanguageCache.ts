import { PrismaClient } from "@prisma/client";

import { BaseReferenceCache } from "./BaseReferenceCache";

const prisma = new PrismaClient();

export class LanguageCache extends BaseReferenceCache {
  async load(): Promise<void> {
    this.clear();

    const languages =
      await prisma.educationalLanguage.findMany({
        include: {
          entity: {
            include: {
              aliases: true,
            },
          },
        },
      });

    this.loadRecords(
      languages.map((language) => ({
        id: language.id,

        name:
          language.entity.canonicalName,
      })),
    );

    this.loadAliases(
      languages.flatMap((language) =>
        language.entity.aliases.map(
          (alias) => ({
            alias:
              alias.alias,

            targetId:
              language.id,
          }),
        ),
      ),
    );
  }
}