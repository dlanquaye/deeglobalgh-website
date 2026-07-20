import {
  EducationalStatus,
  PrismaClient,
} from "@prisma/client";

export interface BookCacheLookupInput {
  title: string;

  bookLineId?: string;

  isbn?: string;
}

export class BookCache {
  private readonly booksByTitleAndLine =
    new Map<string, string>();

  private readonly booksByTitle =
    new Map<string, string>();

  private readonly booksByIsbn =
    new Map<string, string>();

  constructor(
    private readonly prisma: PrismaClient,
  ) {}

  private normalise(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  private normaliseIsbn(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^0-9x]/g, "");
  }

  private createTitleAndLineKey(
    title: string,
    bookLineId: string,
  ): string {
    return [
      this.normalise(title),
      bookLineId.trim(),
    ].join("::");
  }

  async load(): Promise<void> {
    this.clear();

    const books =
      await this.prisma.educationalBook.findMany({
        where: {
          entity: {
            status: EducationalStatus.ACTIVE,
          },
        },

        select: {
          id: true,

          bookLineId: true,

          entity: {
            select: {
              canonicalName: true,
              displayName: true,
              searchName: true,
            },
          },

          editions: {
            select: {
              isbns: {
                select: {
                  isbn10: true,
                  isbn13: true,
                  barcode: true,
                },
              },
            },
          },
        },

        orderBy: {
          entity: {
            canonicalName: "asc",
          },
        },
      });

    for (const book of books) {
      const titles = new Set<string>();

      titles.add(book.entity.canonicalName);

      if (book.entity.displayName) {
        titles.add(book.entity.displayName);
      }

      if (book.entity.searchName) {
        titles.add(book.entity.searchName);
      }

      for (const title of titles) {
        const normalisedTitle =
          this.normalise(title);

        this.booksByTitle.set(
          normalisedTitle,
          book.id,
        );

        this.booksByTitleAndLine.set(
          this.createTitleAndLineKey(
            title,
            book.bookLineId,
          ),
          book.id,
        );
      }

      for (const edition of book.editions) {
        for (const isbnRecord of edition.isbns) {
          const identifiers = [
            isbnRecord.isbn10,
            isbnRecord.isbn13,
            isbnRecord.barcode,
          ];

          for (const identifier of identifiers) {
            if (!identifier) {
              continue;
            }

            this.booksByIsbn.set(
              this.normaliseIsbn(identifier),
              book.id,
            );
          }
        }
      }
    }
  }

  find(
    input: BookCacheLookupInput,
  ): string | undefined {
    const isbn = input.isbn?.trim();

    if (isbn) {
      const isbnMatch =
        this.booksByIsbn.get(
          this.normaliseIsbn(isbn),
        );

      if (isbnMatch) {
        return isbnMatch;
      }
    }

    const title = input.title.trim();

    if (!title) {
      return undefined;
    }

    const bookLineId =
      input.bookLineId?.trim();

    if (bookLineId) {
      const scopedMatch =
        this.booksByTitleAndLine.get(
          this.createTitleAndLineKey(
            title,
            bookLineId,
          ),
        );

      if (scopedMatch) {
        return scopedMatch;
      }
    }

    return this.booksByTitle.get(
      this.normalise(title),
    );
  }

  clear(): void {
    this.booksByTitleAndLine.clear();
    this.booksByTitle.clear();
    this.booksByIsbn.clear();
  }

  getStats() {
    return {
      titleAndLineKeys:
        this.booksByTitleAndLine.size,

      titleKeys: this.booksByTitle.size,

      isbnKeys: this.booksByIsbn.size,
    };
  }
}