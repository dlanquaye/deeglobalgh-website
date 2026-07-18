import { PrismaClient } from "@prisma/client";
import { BaseReferenceCache } from "./BaseReferenceCache";

const prisma = new PrismaClient();

export class ResourceTypeCache extends BaseReferenceCache {
  async load(): Promise<void> {
    this.clear();

    const resourceTypes = await prisma.resourceType.findMany();

    this.loadRecords(
      resourceTypes.map((resourceType) => ({
        id: resourceType.id,
        name: resourceType.name,
      })),
    );

    const aliases = await prisma.resourceTypeAlias.findMany();

    this.loadAliases(
      aliases.map((alias) => ({
        alias: alias.alias,
        targetId: alias.resourceTypeId,
      })),
    );
  }
}