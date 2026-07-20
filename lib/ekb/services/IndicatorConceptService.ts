import { Prisma, PrismaClient } from "@prisma/client";

export interface UpsertIndicatorConceptInput {
  indicatorId: string;
  conceptId: string;
  relevanceScore?: number;
}

export class IndicatorConceptService {
  constructor(
    private readonly prisma: PrismaClient | Prisma.TransactionClient,
  ) {}

  async upsert(
    input: UpsertIndicatorConceptInput,
  ) {
    return this.prisma.educationalIndicatorConcept.upsert({
      where: {
        indicatorId_conceptId: {
          indicatorId: input.indicatorId,
          conceptId: input.conceptId,
        },
      },

      create: {
        indicatorId: input.indicatorId,
        conceptId: input.conceptId,
        relevanceScore: input.relevanceScore ?? 100,
      },

      update: {
        relevanceScore: input.relevanceScore ?? 100,
      },
    });
  }

  async findByIndicator(
    indicatorId: string,
  ) {
    return this.prisma.educationalIndicatorConcept.findMany({
      where: {
        indicatorId,
      },

      include: {
        concept: true,
      },

      orderBy: {
        relevanceScore: "desc",
      },
    });
  }

  async findByConcept(
    conceptId: string,
  ) {
    return this.prisma.educationalIndicatorConcept.findMany({
      where: {
        conceptId,
      },

      include: {
        indicator: true,
      },

      orderBy: {
        relevanceScore: "desc",
      },
    });
  }

  async exists(
    indicatorId: string,
    conceptId: string,
  ): Promise<boolean> {
    const record =
      await this.prisma.educationalIndicatorConcept.findUnique({
        where: {
          indicatorId_conceptId: {
            indicatorId,
            conceptId,
          },
        },

        select: {
          id: true,
        },
      });

    return record !== null;
  }

  async remove(
    indicatorId: string,
    conceptId: string,
  ) {
    return this.prisma.educationalIndicatorConcept.delete({
      where: {
        indicatorId_conceptId: {
          indicatorId,
          conceptId,
        },
      },
    });
  }

  async removeAllForIndicator(
    indicatorId: string,
  ) {
    return this.prisma.educationalIndicatorConcept.deleteMany({
      where: {
        indicatorId,
      },
    });
  }

  async removeAllForConcept(
    conceptId: string,
  ) {
    return this.prisma.educationalIndicatorConcept.deleteMany({
      where: {
        conceptId,
      },
    });
  }

  async countByIndicator(
    indicatorId: string,
  ): Promise<number> {
    return this.prisma.educationalIndicatorConcept.count({
      where: {
        indicatorId,
      },
    });
  }

  async countByConcept(
    conceptId: string,
  ): Promise<number> {
    return this.prisma.educationalIndicatorConcept.count({
      where: {
        conceptId,
      },
    });
  }
}