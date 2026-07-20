import {
  EducationalStatus,
  PrismaClient,
} from "@prisma/client";

import {
  BaseReferenceCache,
  CacheRecord,
} from "./BaseReferenceCache";

export class AuthorCache extends BaseReferenceCache {
  constructor(
    private readonly prisma: PrismaClient,
  ) {
    super();
  }

  async load(): Promise<void> {
    this.clear();

    const authors =
      await this.prisma.educationalAuthor.findMany({
        where: {
          entity: {
            status: EducationalStatus.ACTIVE,
          },
        },

        select: {
          id: true,

          entity: {
            select: {
              canonicalName: true,
              displayName: true,
              searchName: true,
            },
          },
        },

        orderBy: {
          entity: {
            canonicalName: "asc",
          },
        },
      });

    const records: CacheRecord[] = [];

    for (const author of authors) {
      const names = new Set<string>();

      names.add(author.entity.canonicalName);

      if (author.entity.displayName) {
        names.add(author.entity.displayName);
      }

      if (author.entity.searchName) {
        names.add(author.entity.searchName);
      }

      for (const name of names) {
        records.push({
          id: author.id,
          name,
        });
      }
    }

    this.loadRecords(records);

    /*
     * Educational aliases will be connected separately once
     * their exact schema and entity relationship are inspected.
     */
    this.loadAliases([]);
  }
}