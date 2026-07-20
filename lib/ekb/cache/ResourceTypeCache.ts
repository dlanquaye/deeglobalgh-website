import { PrismaClient } from "@prisma/client";

import { BaseReferenceCache } from "./BaseReferenceCache";

const prisma = new PrismaClient();

export class ResourceTypeCache extends BaseReferenceCache {
  async load(): Promise<void> {
    this.clear();

    const resourceTypes =
      await prisma.educationalResourceType.findMany({
        include: {
          entity: {
            include: {
              aliases: true,
            },
          },
        },
      });

    this.loadRecords(
      resourceTypes.map((resourceType) => ({
        id: resourceType.id,
        name: resourceType.entity.canonicalName,
      })),
    );

    this.loadAliases(
      resourceTypes.flatMap((resourceType) =>
        resourceType.entity.aliases.map((alias) => ({
          alias: alias.alias,
          targetId: resourceType.id,
        })),
      ),
    );
  }
}