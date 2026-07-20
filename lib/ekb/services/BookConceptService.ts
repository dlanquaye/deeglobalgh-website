import { Prisma, PrismaClient } from "@prisma/client";

export interface UpsertBookConceptInput {
  bookId: string;
  conceptId: string;
  relevanceScore?: number;
}

export class BookConceptService {
  constructor(
    private readonly prisma: PrismaClient | Prisma.TransactionClient,
  ) {}

  async upsert(
    input: UpsertBookConceptInput,
  ) {
    return this.prisma.educationalBookConcept.upsert({
      where: {
        bookId_conceptId: {
          bookId: input.bookId,
          conceptId: input.conceptId,
        },
      },

      create: {
        bookId: input.bookId,
        conceptId: input.conceptId,
        relevanceScore: input.relevanceScore ?? 100,
      },

      update: {
        relevanceScore: input.relevanceScore ?? 100,
      },
    });
  }

  async findByBook(bookId: string) {
    return this.prisma.educationalBookConcept.findMany({
      where: {
        bookId,
      },

      include: {
        concept: true,
      },

      orderBy: {
        relevanceScore: "desc",
      },
    });
  }

  async findByConcept(conceptId: string) {
    return this.prisma.educationalBookConcept.findMany({
      where: {
        conceptId,
      },

      include: {
        book: true,
      },

      orderBy: {
        relevanceScore: "desc",
      },
    });
  }

  async remove(
    bookId: string,
    conceptId: string,
  ) {
    return this.prisma.educationalBookConcept.delete({
      where: {
        bookId_conceptId: {
          bookId,
          conceptId,
        },
      },
    });
  }

  async removeAllForBook(bookId: string) {
    return this.prisma.educationalBookConcept.deleteMany({
      where: {
        bookId,
      },
    });
  }

  async removeAllForConcept(conceptId: string) {
    return this.prisma.educationalBookConcept.deleteMany({
      where: {
        conceptId,
      },
    });
  }

  async exists(
    bookId: string,
    conceptId: string,
  ): Promise<boolean> {
    const record =
      await this.prisma.educationalBookConcept.findUnique({
        where: {
          bookId_conceptId: {
            bookId,
            conceptId,
          },
        },

        select: {
          id: true,
        },
      });

    return record !== null;
  }

  async countByBook(
    bookId: string,
  ): Promise<number> {
    return this.prisma.educationalBookConcept.count({
      where: {
        bookId,
      },
    });
  }

  async countByConcept(
    conceptId: string,
  ): Promise<number> {
    return this.prisma.educationalBookConcept.count({
      where: {
        conceptId,
      },
    });
  }
}