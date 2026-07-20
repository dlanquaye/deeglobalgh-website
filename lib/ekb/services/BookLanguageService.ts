import { Prisma, PrismaClient } from "@prisma/client";

export interface UpsertBookLanguageInput {
  bookId: string;

  languageId: string;
}

export class BookLanguageService {
  constructor(
    private readonly prisma: PrismaClient | Prisma.TransactionClient,
  ) {}

  async upsert(input: UpsertBookLanguageInput) {
    return this.prisma.educationalBookLanguage.upsert({
      where: {
        bookId_languageId: {
          bookId: input.bookId,
          languageId: input.languageId,
        },
      },

      create: {
        bookId: input.bookId,

        languageId: input.languageId,
      },

      update: {},
    });
  }
}