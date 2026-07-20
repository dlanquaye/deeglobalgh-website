import { ResolutionResult } from "../resolution";
import { BasePlanningResolver } from "./BasePlanningResolver";

export interface BookPlanningInput {
  title: string;

  bookLineId?: string;

  isbn?: string;
}

export interface BookPlanningLookup {
  find(
    input: BookPlanningInput,
  ): string | undefined;
}

export class BookPlanningResolver
  extends BasePlanningResolver
{
  constructor(
    private readonly lookup: BookPlanningLookup,
  ) {
    super();
  }

  resolve(
    input: BookPlanningInput,
  ): ResolutionResult {
    const title = input.title.trim();
    const bookLineId =
      input.bookLineId?.trim() || undefined;
    const isbn =
      input.isbn?.trim() || undefined;

    if (!title) {
      return this.error(
        "Book",
        "Book title is empty",
      );
    }

    const existingId = this.lookup.find({
      title,
      bookLineId,
      isbn,
    });

    if (existingId) {
      return this.keep(
        "Book",
        existingId,
        isbn
          ? "Book already exists by ISBN or title"
          : "Book already exists by title",
      );
    }

    return this.create(
      "Book",
      isbn
        ? "Book will be created with the supplied ISBN"
        : "Book will be created",
    );
  }
}