import { PrismaClient } from "@prisma/client";
import { BaseReferenceCache } from "./BaseReferenceCache";

const prisma = new PrismaClient();

export class CurriculumCache extends BaseReferenceCache {
  async load(): Promise<void> {
    this.clear();

    const curricula = await prisma.curriculum.findMany();

    this.loadRecords(
      curricula.map((curriculum) => ({
        id: curriculum.id,
        name: curriculum.name,
      })),
    );

    const aliases = await prisma.curriculumAlias.findMany();

    this.loadAliases(
      aliases.map((alias) => ({
        alias: alias.alias,
        targetId: alias.curriculumId,
      })),
    );
  }
}