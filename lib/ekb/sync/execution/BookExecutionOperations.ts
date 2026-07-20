import {
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BookService } from "../../services/BookService";
import {
  BookOperations,
  ResolvedBookExecutionValue,
} from "./BookExecutor";
import { generateEntityCode } from "./generateEntityCode";

export class BookExecutionOperations
  implements BookOperations
{
  private readonly service: BookService;

  constructor(
    prisma:
      | PrismaClient
      | Prisma.TransactionClient,
  ) {
    this.service =
      new BookService(prisma);
  }

  async create(
    value: ResolvedBookExecutionValue,
  ): Promise<string> {
    const normalisedValue =
      this.normalise(value);

    const book =
      await this.service.upsert({
        code:
          generateEntityCode(
            "BOOK",
            normalisedValue.title,
          ),

        canonicalName:
          normalisedValue.title,

        bookLineId:
          normalisedValue.bookLineId,

        displayName:
          normalisedValue.title,

        searchName:
          normalisedValue.title,
      });

    return book.id;
  }

  async update(
    _id: string,
    value: ResolvedBookExecutionValue,
  ): Promise<void> {
    const normalisedValue =
      this.normalise(value);

    await this.service.upsert({
      code:
        generateEntityCode(
          "BOOK",
          normalisedValue.title,
        ),

      canonicalName:
        normalisedValue.title,

      bookLineId:
        normalisedValue.bookLineId,

      displayName:
        normalisedValue.title,

      searchName:
        normalisedValue.title,
    });
  }

  private normalise(
    value: ResolvedBookExecutionValue,
  ): ResolvedBookExecutionValue {
    const title =
      value.title.trim();

    const bookLineId =
      value.bookLineId.trim();

    const isbn =
      value.isbn?.trim() ||
      undefined;

    if (!title) {
      throw new Error(
        "Book title is required for execution.",
      );
    }

    if (!bookLineId) {
      throw new Error(
        `BookLine ID is required before executing book "${title}".`,
      );
    }

    return {
      title,
      bookLineId,
      isbn,
    };
  }
}