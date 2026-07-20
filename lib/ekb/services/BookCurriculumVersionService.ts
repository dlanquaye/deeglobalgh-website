import { Prisma, PrismaClient } from "@prisma/client";

export interface UpsertBookCurriculumVersionInput {
  bookId: string;

  curriculumVersionId: string;
}

export class BookCurriculumVersionService {
  constructor(
    private readonly prisma: PrismaClient | Prisma.TransactionClient,
  ) {}

  async upsert(input: UpsertBookCurriculumVersionInput) {
    return this.prisma.educationalBookCurriculumVersion.upsert({
      where: {
        bookId_curriculumVersionId: {
          bookId: input.bookId,
          curriculumVersionId: input.curriculumVersionId,
        },
      },

      create: {
        bookId: input.bookId,

        curriculumVersionId: input.curriculumVersionId,
      },

      update: {},
    });
  }
}