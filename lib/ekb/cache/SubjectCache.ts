import { PrismaClient } from "@prisma/client";
import { BaseReferenceCache } from "./BaseReferenceCache";

const prisma = new PrismaClient();

export class SubjectCache extends BaseReferenceCache {
  async load(): Promise<void> {
    this.clear();

    const subjects = await prisma.subject.findMany();

    this.loadRecords(
      subjects.map((subject) => ({
        id: subject.id,
        name: subject.name,
      })),
    );

    const aliases = await prisma.subjectAlias.findMany();

    this.loadAliases(
      aliases.map((alias) => ({
        alias: alias.alias,
        targetId: alias.subjectId,
      })),
    );
  }
}