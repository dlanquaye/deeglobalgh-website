import {
  Prisma,
  PrismaClient,
} from "@prisma/client";

import {
  EditionService,
} from "../../services/EditionService";

import {
  ISBNService,
} from "../../services/ISBNService";

import {
  generateEntityCode,
} from "./generateEntityCode";

export interface ExecuteBookPublicationInput {
  bookId: string;

  bookTitle: string;

  isbn?: string;
}

interface NormalisedISBN {
  canonicalISBN: string;

  isbn10?: string;

  isbn13?: string;
}

/**
 * Executes publication-level Educational Book data.
 *
 * Every valid Educational Book receives a current print Edition.
 * ISBN creation remains optional because official source records may
 * identify an approved book without publishing an ISBN.
 */
export class BookPublicationExecutor {
  private readonly editionService:
    EditionService;

  private readonly isbnService:
    ISBNService;

  constructor(
    prisma:
      | PrismaClient
      | Prisma.TransactionClient,
  ) {
    this.editionService =
      new EditionService(prisma);

    this.isbnService =
      new ISBNService(prisma);
  }

  async execute(
    input: ExecuteBookPublicationInput,
  ): Promise<void> {
    const bookId =
      input.bookId.trim();

    const bookTitle =
      input.bookTitle.trim();

    if (!bookId) {
      throw new Error(
        "Book ID is required before executing publication data.",
      );
    }

    if (!bookTitle) {
      throw new Error(
        "Book title is required before executing publication data.",
      );
    }

    const editionName =
      "Current Edition";

    const editionCanonicalName =
      `${bookTitle} - ${editionName}`;

    const edition =
      await this.editionService.upsert({
        code:
          generateEntityCode(
            "EDITION",
            `${bookId}-${editionName}`,
          ),

        canonicalName:
          editionCanonicalName,

        displayName:
          editionCanonicalName,

        searchName:
          editionCanonicalName,

        bookId,

        editionName,

        isCurrentEdition:
          true,

        isPublished:
          true,

        isDigital:
          false,

        isPrint:
          true,

        isActive:
          true,
      });

    const normalisedISBN =
      this.normaliseISBN(
        input.isbn,
      );

    if (!normalisedISBN) {
      return;
    }

    await this.isbnService.upsert({
      code:
        generateEntityCode(
          "ISBN",
          normalisedISBN.canonicalISBN,
        ),

      canonicalName:
        normalisedISBN.canonicalISBN,

      displayName:
        normalisedISBN.canonicalISBN,

      searchName:
        normalisedISBN.canonicalISBN,

      editionId:
        edition.id,

      isbn10:
        normalisedISBN.isbn10,

      isbn13:
        normalisedISBN.isbn13,

      barcode:
        normalisedISBN.isbn13,
    });
  }

  private normaliseISBN(
    value?: string,
  ): NormalisedISBN | undefined {
    const rawValue =
      value?.trim();

    if (!rawValue) {
      return undefined;
    }

    const compactValue =
      rawValue
        .replace(
          /^isbn(?:-1[03])?\s*:?\s*/i,
          "",
        )
        .replace(
          /[^0-9Xx]/g,
          "",
        )
        .toUpperCase();

    if (
      compactValue.length === 10
    ) {
      if (
        !/^[0-9]{9}[0-9X]$/.test(
          compactValue,
        )
      ) {
        throw new Error(
          `Invalid ISBN-10 value "${rawValue}".`,
        );
      }

      return {
        canonicalISBN:
          compactValue,

        isbn10:
          compactValue,
      };
    }

    if (
      compactValue.length === 13
    ) {
      if (
        !/^[0-9]{13}$/.test(
          compactValue,
        )
      ) {
        throw new Error(
          `Invalid ISBN-13 value "${rawValue}".`,
        );
      }

      return {
        canonicalISBN:
          compactValue,

        isbn13:
          compactValue,
      };
    }

    throw new Error(
      `ISBN "${rawValue}" must contain either 10 or 13 characters.`,
    );
  }
}