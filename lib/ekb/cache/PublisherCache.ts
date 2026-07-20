import { PrismaClient } from "@prisma/client";

import { BaseReferenceCache } from "./BaseReferenceCache";

const prisma = new PrismaClient();

export class PublisherCache extends BaseReferenceCache {
  async load(): Promise<void> {
    this.clear();

    const publishers =
      await prisma.educationalPublisher.findMany({
        include: {
          entity: {
            include: {
              aliases: true,
            },
          },
        },
      });

    this.loadRecords(
      publishers.map((publisher) => ({
        id: publisher.id,

        name:
          publisher.entity.canonicalName,
      })),
    );

    this.loadAliases(
      publishers.flatMap((publisher) =>
        publisher.entity.aliases.map(
          (alias) => ({
            alias:
              alias.alias,

            targetId:
              publisher.id,
          }),
        ),
      ),
    );
  }
}