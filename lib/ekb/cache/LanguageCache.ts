import { PrismaClient } from "@prisma/client";
import { BaseReferenceCache } from "./BaseReferenceCache";

const prisma = new PrismaClient();

export class LanguageCache extends BaseReferenceCache {
  async load(): Promise<void> {
    this.clear();

    const languages = await prisma.language.findMany();

    this.loadRecords(
      languages.map((language) => ({
        id: language.id,
        name: language.name,
      })),
    );

    const aliases = await prisma.languageAlias.findMany();

    this.loadAliases(
      aliases.map((alias) => ({
        alias: alias.alias,
        targetId: alias.languageId,
      })),
    );
  }
}