import { Prisma, PrismaClient } from "@prisma/client";

export interface UpsertBookLevelInput {
  bookId: string;

  levelId: string;
}

export class BookLevelService {
  constructor(
    private readonly prisma: PrismaClient | Prisma.TransactionClient,
  ) {}

  async upsert(input: UpsertBookLevelInput) {
    return this.prisma.educationalBookLevel.upsert({
      where: {
        bookId_levelId: {
          bookId: input.bookId,
          levelId: input.levelId,
        },
      },

      create: {
        bookId: input.bookId,

        levelId: input.levelId,
      },

      update: {},
    });
  }
}