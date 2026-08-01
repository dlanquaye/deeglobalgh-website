import {
  Prisma,
  PrismaClient,
} from "@prisma/client";

export const educationalBookInclude = {
  entity: true,

  bookLine: {
    include: {
      entity: true,

      publisher: {
        include: {
          entity: true,
        },
      },
    },
  },

  series: {
    include: {
      entity: true,
    },
  },

  editions: true,

  authors: {
    include: {
      author: {
        include: {
          entity: true,
        },
      },
    },
  },

  subjects: {
    include: {
      subject: {
        include: {
          entity: true,
        },
      },
    },
  },

  levels: {
    include: {
      level: {
        include: {
          entity: true,
        },
      },
    },
  },

  languages: {
    include: {
      language: {
        include: {
          entity: true,
        },
      },
    },
  },

  resourceTypes: {
    include: {
      resourceType: {
        include: {
          entity: true,
        },
      },
    },
  },

  curriculumVersions: {
    include: {
      curriculumVersion: {
        include: {
          entity: true,

          curriculum: {
            include: {
              entity: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.EducationalBookInclude;

export type EducationalBookRecord =
  Prisma.EducationalBookGetPayload<{
    include: typeof educationalBookInclude;
  }>;

export interface SearchEducationalBooksQuery {
  query: string;

  limit: number;

  offset: number;
}

export interface ListEducationalBooksQuery {
  limit: number;

  offset: number;
}

/**
 * Read-only database repository for Educational Books.
 *
 * This repository owns Prisma read queries only.
 * It must not contain estimator, API or synchronisation business logic.
 */
export class BookRepository {
  constructor(
    private readonly prisma:
      | PrismaClient
      | Prisma.TransactionClient,
  ) {}

  /**
   * Find an Educational Book by its internal database ID.
   */
  async findById(
    id: string,
  ): Promise<EducationalBookRecord | null> {
    return this.prisma.educationalBook.findUnique({
      where: {
        id,
      },

      include: educationalBookInclude,
    });
  }

  /**
   * Find an Educational Book by its EducationalEntity ID.
   */
  async findByEntityId(
    entityId: string,
  ): Promise<EducationalBookRecord | null> {
    return this.prisma.educationalBook.findUnique({
      where: {
        entityId,
      },

      include: educationalBookInclude,
    });
  }

  /**
   * Find an Educational Book using its unique entity code.
   */
  async findByCode(
    code: string,
  ): Promise<EducationalBookRecord | null> {
    return this.prisma.educationalBook.findFirst({
      where: {
        entity: {
          code,
        },
      },

      include: educationalBookInclude,
    });
  }

  /**
   * Find the first Educational Book with an exact canonical-name match.
   */
  async findByCanonicalName(
    canonicalName: string,
  ): Promise<EducationalBookRecord | null> {
    return this.prisma.educationalBook.findFirst({
      where: {
        entity: {
          canonicalName: {
            equals: canonicalName,

            mode: "insensitive",
          },
        },
      },

      include: educationalBookInclude,

      orderBy: {
        createdAt: "asc",
      },
    });
  }

  /**
   * Search books by their core searchable fields.
   */
  async search(
    input: SearchEducationalBooksQuery,
  ): Promise<EducationalBookRecord[]> {
    return this.prisma.educationalBook.findMany({
      where: {
        OR: [
          {
            entity: {
              canonicalName: {
                contains: input.query,

                mode: "insensitive",
              },
            },
          },

          {
            entity: {
              displayName: {
                contains: input.query,

                mode: "insensitive",
              },
            },
          },

          {
            entity: {
              searchName: {
                contains: input.query,

                mode: "insensitive",
              },
            },
          },

          {
            entity: {
              code: {
                contains: input.query,

                mode: "insensitive",
              },
            },
          },

          {
            subtitle: {
              contains: input.query,

              mode: "insensitive",
            },
          },

          {
            summary: {
              contains: input.query,

              mode: "insensitive",
            },
          },
        ],
      },

      include: educationalBookInclude,

      orderBy: [
        {
          entity: {
            canonicalName: "asc",
          },
        },

        {
          createdAt: "asc",
        },
      ],

      take: input.limit,

      skip: input.offset,
    });
  }

  /**
   * Return books connected to an Educational Subject.
   */
  async findBySubjectId(
    subjectId: string,
    input: ListEducationalBooksQuery,
  ): Promise<EducationalBookRecord[]> {
    return this.prisma.educationalBook.findMany({
      where: {
        subjects: {
          some: {
            subjectId,
          },
        },
      },

      include: educationalBookInclude,

      orderBy: {
        createdAt: "asc",
      },

      take: input.limit,

      skip: input.offset,
    });
  }

  /**
   * Return books connected to an Educational Level.
   */
  async findByLevelId(
    levelId: string,
    input: ListEducationalBooksQuery,
  ): Promise<EducationalBookRecord[]> {
    return this.prisma.educationalBook.findMany({
      where: {
        levels: {
          some: {
            levelId,
          },
        },
      },

      include: educationalBookInclude,

      orderBy: {
        createdAt: "asc",
      },

      take: input.limit,

      skip: input.offset,
    });
  }

  /**
   * Return books connected to an Educational Author.
   */
  async findByAuthorId(
    authorId: string,
    input: ListEducationalBooksQuery,
  ): Promise<EducationalBookRecord[]> {
    return this.prisma.educationalBook.findMany({
      where: {
        authors: {
          some: {
            authorId,
          },
        },
      },

      include: educationalBookInclude,

      orderBy: {
        createdAt: "asc",
      },

      take: input.limit,

      skip: input.offset,
    });
  }

  /**
   * Return books connected to an Educational Language.
   */
  async findByLanguageId(
    languageId: string,
    input: ListEducationalBooksQuery,
  ): Promise<EducationalBookRecord[]> {
    return this.prisma.educationalBook.findMany({
      where: {
        languages: {
          some: {
            languageId,
          },
        },
      },

      include: educationalBookInclude,

      orderBy: {
        createdAt: "asc",
      },

      take: input.limit,

      skip: input.offset,
    });
  }

  /**
   * Return books connected to an Educational Resource Type.
   */
  async findByResourceTypeId(
    resourceTypeId: string,
    input: ListEducationalBooksQuery,
  ): Promise<EducationalBookRecord[]> {
    return this.prisma.educationalBook.findMany({
      where: {
        resourceTypes: {
          some: {
            resourceTypeId,
          },
        },
      },

      include: educationalBookInclude,

      orderBy: {
        createdAt: "asc",
      },

      take: input.limit,

      skip: input.offset,
    });
  }

  /**
   * Return books connected to a Curriculum Version.
   */
  async findByCurriculumVersionId(
    curriculumVersionId: string,
    input: ListEducationalBooksQuery,
  ): Promise<EducationalBookRecord[]> {
    return this.prisma.educationalBook.findMany({
      where: {
        curriculumVersions: {
          some: {
            curriculumVersionId,
          },
        },
      },

      include: educationalBookInclude,

      orderBy: {
        createdAt: "asc",
      },

      take: input.limit,

      skip: input.offset,
    });
  }

  /**
   * Return the total number of Educational Books.
   */
  async count(): Promise<number> {
    return this.prisma.educationalBook.count();
  }
}