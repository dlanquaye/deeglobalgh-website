import { PrismaClient } from "@prisma/client";

import { BaseReferenceCache } from "./BaseReferenceCache";

const prisma = new PrismaClient();

export class LevelCache extends BaseReferenceCache {
  async load(): Promise<void> {
    this.clear();

    const levels =
      await prisma.educationalLevel.findMany({
        include: {
          entity: {
            include: {
              aliases: true,
            },
          },
        },
      });

    this.loadRecords(
      levels.map((level) => ({
        id: level.id,

        name:
          level.entity.canonicalName,
      })),
    );

    this.loadAliases(
      levels.flatMap((level) =>
        level.entity.aliases.map(
          (alias) => ({
            alias:
              alias.alias,

            targetId:
              level.id,
          }),
        ),
      ),
    );
  }
}