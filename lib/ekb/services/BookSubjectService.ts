import { Prisma, PrismaClient } from "@prisma/client";

export interface UpsertBookSubjectInput {
  bookId: string;

  subjectId: string;
}

export class BookSubjectService {
  constructor(
    private readonly prisma: PrismaClient | Prisma.TransactionClient,
  ) {}

  async upsert(input: UpsertBookSubjectInput) {
    return this.prisma.educationalBookSubject.upsert({
      where: {
        bookId_subjectId: {
          bookId: input.bookId,
          subjectId: input.subjectId,
        },
      },

      create: {
        bookId: input.bookId,

        subjectId: input.subjectId,
      },

      update: {},
    });
  }
}