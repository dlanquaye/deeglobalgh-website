import {
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BookAuthorService } from "../../services/BookAuthorService";
import { BookCurriculumVersionService } from "../../services/BookCurriculumVersionService";
import { BookLanguageService } from "../../services/BookLanguageService";
import { BookLevelService } from "../../services/BookLevelService";
import { BookResourceTypeService } from "../../services/BookResourceTypeService";
import { BookSubjectService } from "../../services/BookSubjectService";

import { ExecutedEntityResult } from "./types";

export interface ExecuteBookRelationshipsInput {
  bookId: string;

  subjectId: string;

  levelId: string;

  languageId: string;

  resourceTypeId: string;

  curriculumVersionId: string;

  authorResults: ExecutedEntityResult[];
}

export class BookRelationshipExecutor {
  private readonly bookAuthorService: BookAuthorService;

  private readonly bookSubjectService: BookSubjectService;

  private readonly bookLanguageService: BookLanguageService;

  private readonly bookLevelService: BookLevelService;

  private readonly bookResourceTypeService: BookResourceTypeService;

  private readonly bookCurriculumVersionService:
    BookCurriculumVersionService;

  constructor(
    prisma:
      | PrismaClient
      | Prisma.TransactionClient,
  ) {
    this.bookAuthorService =
      new BookAuthorService(prisma);

    this.bookSubjectService =
      new BookSubjectService(prisma);

    this.bookLanguageService =
      new BookLanguageService(prisma);

    this.bookLevelService =
      new BookLevelService(prisma);

    this.bookResourceTypeService =
      new BookResourceTypeService(prisma);

    this.bookCurriculumVersionService =
      new BookCurriculumVersionService(
        prisma,
      );
  }

  async execute(
    input: ExecuteBookRelationshipsInput,
  ): Promise<void> {
    await this.bookSubjectService.upsert({
      bookId: input.bookId,

      subjectId: input.subjectId,
    });

    await this.bookLevelService.upsert({
      bookId: input.bookId,

      levelId: input.levelId,
    });

    await this.bookLanguageService.upsert({
      bookId: input.bookId,

      languageId: input.languageId,
    });

    await this.bookResourceTypeService.upsert({
      bookId: input.bookId,

      resourceTypeId: input.resourceTypeId,
    });

    await this.bookCurriculumVersionService.upsert({
      bookId: input.bookId,

      curriculumVersionId:
        input.curriculumVersionId,
    });

    const authorIds =
      this.getUniqueEntityIds(
        input.authorResults,
      );

    for (const authorId of authorIds) {
      await this.bookAuthorService.upsert({
        bookId: input.bookId,

        authorId,
      });
    }
  }

  private getUniqueEntityIds(
    results: ExecutedEntityResult[],
  ): string[] {
    const ids =
      results.map(
        (result) =>
          this.getEntityIdFromResult(
            result,
          ),
      );

    return [
      ...new Set(ids),
    ];
  }

  private getEntityIdFromResult(
    result: ExecutedEntityResult,
  ): string {
    const entityId =
      result.createdId ||
      result.existingId;

    if (!entityId) {
      throw new Error(
        `Execution result for ${result.entity} did not contain an entity ID.`,
      );
    }

    return entityId;
  }
}