import { Prisma, PrismaClient } from "@prisma/client";

export interface UpsertBookResourceTypeInput {
  bookId: string;

  resourceTypeId: string;
}

export class BookResourceTypeService {
  constructor(
    private readonly prisma: PrismaClient | Prisma.TransactionClient,
  ) {}

  async upsert(input: UpsertBookResourceTypeInput) {
    return this.prisma.educationalBookResourceType.upsert({
      where: {
        bookId_resourceTypeId: {
          bookId: input.bookId,
          resourceTypeId: input.resourceTypeId,
        },
      },

      create: {
        bookId: input.bookId,

        resourceTypeId: input.resourceTypeId,
      },

      update: {},
    });
  }
}