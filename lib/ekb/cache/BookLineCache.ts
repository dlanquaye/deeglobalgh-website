import { PrismaClient } from "@prisma/client";

import {
  BaseReferenceCache,
  CacheRecord,
} from "./BaseReferenceCache";

export class BookLineCache extends BaseReferenceCache {
  constructor(
    private readonly prisma: PrismaClient,
  ) {
    super();
  }

  async load(): Promise<void> {
    this.clear();

    const bookLines =
      await this.prisma.bookLine.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      });

    const records: CacheRecord[] =
      bookLines.map((bookLine) => ({
        id: bookLine.id,
        name: bookLine.name,
      }));

    this.loadRecords(records);

    // Book lines currently have no alias table.
    this.loadAliases([]);
  }
}