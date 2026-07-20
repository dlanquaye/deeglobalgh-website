import { PrismaClient } from "@prisma/client";

import { BaseReferenceCache } from "./BaseReferenceCache";

const prisma = new PrismaClient();

export class CurriculumCache extends BaseReferenceCache {
  async load(): Promise<void> {
    this.clear();

    const curricula =
      await prisma.educationalCurriculum.findMany({
        include: {
          entity: {
            include: {
              aliases: true,
            },
          },
        },
      });

    this.loadRecords(
      curricula.map((curriculum) => ({
        id: curriculum.id,
        name: curriculum.entity.canonicalName,
      })),
    );

    this.loadAliases(
      curricula.flatMap((curriculum) =>
        curriculum.entity.aliases.map((alias) => ({
          alias: alias.alias,
          targetId: curriculum.id,
        })),
      ),
    );
  }
}