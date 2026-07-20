import { Prisma, PrismaClient } from "@prisma/client";

export interface UpsertBookAuthorInput {
  bookId: string;
  authorId: string;
}

export class BookAuthorService {
  constructor(
    private readonly prisma: PrismaClient | Prisma.TransactionClient,
  ) {}

  async upsert(input: UpsertBookAuthorInput) {
    return this.prisma.educationalBookAuthor.upsert({
      where: {
        bookId_authorId: {
          bookId: input.bookId,
          authorId: input.authorId,
        },
      },

      create: {
        bookId: input.bookId,
        authorId: input.authorId,
      },

      update: {},
    });
  }
}