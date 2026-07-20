import { PrismaClient } from "@prisma/client";

import {
  BaseReferenceCache,
  CacheRecord,
} from "./BaseReferenceCache";

export class BookLineCache extends BaseReferenceCache {
  private readonly publisherRecords =
    new Map<string, string>();

  constructor(
    private readonly prisma: PrismaClient,
  ) {
    super();
  }

  async load(): Promise<void> {
    this.clear();
    this.publisherRecords.clear();

    const bookLines =
      await this.prisma.educationalBookLine.findMany({
        select: {
          id: true,

          publisherId: true,

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

    for (const bookLine of bookLines) {
      const names =
        this.getBookLineNames(
          bookLine.entity,
        );

      for (const name of names) {
        records.push({
          id: bookLine.id,

          name,
        });

        this.publisherRecords.set(
          this.getPublisherKey(
            name,
            bookLine.publisherId,
          ),
          bookLine.id,
        );
      }
    }

    this.loadRecords(records);

    /*
     * EducationalEntity aliases can be added here when the alias
     * relation is connected to this cache. Canonical, display and
     * search names are currently indexed.
     */
    this.loadAliases([]);
  }

  find(
    name: string,
    publisherId?: string,
  ): string | undefined {
    if (publisherId) {
      const publisherMatch =
        this.publisherRecords.get(
          this.getPublisherKey(
            name,
            publisherId,
          ),
        );

      if (publisherMatch) {
        return publisherMatch;
      }
    }

    return super.find(name);
  }

  override getStats() {
    const baseStats =
      super.getStats();

    return {
      ...baseStats,

      publisherRecords:
        this.publisherRecords.size,
    };
  }

  private getBookLineNames(entity: {
    canonicalName: string;

    displayName: string | null;

    searchName: string | null;
  }): string[] {
    const names =
      new Map<string, string>();

    this.addName(
      names,
      entity.canonicalName,
    );

    this.addName(
      names,
      entity.displayName,
    );

    this.addName(
      names,
      entity.searchName,
    );

    return [
      ...names.values(),
    ];
  }

  private addName(
    names: Map<string, string>,
    value?: string | null,
  ): void {
    const name =
      value?.trim();

    if (!name) {
      return;
    }

    const key =
      this.normalise(name);

    if (!names.has(key)) {
      names.set(
        key,
        name,
      );
    }
  }

  private getPublisherKey(
    name: string,
    publisherId: string,
  ): string {
    return [
      publisherId,
      this.normalise(name),
    ].join(":");
  }
}