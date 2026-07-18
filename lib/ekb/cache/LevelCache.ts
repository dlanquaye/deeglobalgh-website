import { PrismaClient } from "@prisma/client";
import { BaseReferenceCache } from "./BaseReferenceCache";

const prisma = new PrismaClient();

export class LevelCache extends BaseReferenceCache {
  async load(): Promise<void> {
    this.clear();

    const levels = await prisma.level.findMany();

    this.loadRecords(
      levels.map((level) => ({
        id: level.id,
        name: level.name,
      })),
    );

    const aliases = await prisma.levelAlias.findMany();

    this.loadAliases(
      aliases.map((alias) => ({
        alias: alias.alias,
        targetId: alias.levelId,
      })),
    );
  }
}