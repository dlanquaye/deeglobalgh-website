import { PrismaClient } from "@prisma/client";
import { BaseReferenceCache } from "./BaseReferenceCache";

const prisma = new PrismaClient();

export class PublisherCache extends BaseReferenceCache {
  async load(): Promise<void> {
    this.clear();

    const publishers = await prisma.publisher.findMany();

    this.loadRecords(
      publishers.map((publisher) => ({
        id: publisher.id,
        name: publisher.name,
      })),
    );

    const aliases = await prisma.publisherAlias.findMany();

    this.loadAliases(
      aliases.map((alias) => ({
        alias: alias.alias,
        targetId: alias.publisherId,
      })),
    );
  }
}