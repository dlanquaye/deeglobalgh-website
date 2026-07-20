import {
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { BookLineService } from "../../services/BookLineService";
import {
  BookLineExecutionValue,
  BookLineOperations,
} from "./BookLineExecutor";
import { generateEntityCode } from "./generateEntityCode";

export class BookLineExecutionOperations
  implements BookLineOperations
{
  private readonly service: BookLineService;

  constructor(
    prisma:
      | PrismaClient
      | Prisma.TransactionClient,
  ) {
    this.service =
      new BookLineService(prisma);
  }

  async create(
    value: BookLineExecutionValue,
  ): Promise<string> {
    const normalisedValue =
      this.normalise(value);

    const bookLine =
      await this.service.upsert({
        code:
          generateEntityCode(
            "BOOKLINE",
            normalisedValue.name,
          ),

        canonicalName:
          normalisedValue.name,

        publisherId:
          normalisedValue.publisherId,

        marketingName:
          normalisedValue.name,

        displayName:
          normalisedValue.name,

        searchName:
          normalisedValue.name,
      });

    return bookLine.id;
  }

  async update(
    _id: string,
    value: BookLineExecutionValue,
  ): Promise<void> {
    const normalisedValue =
      this.normalise(value);

    await this.service.upsert({
      code:
        generateEntityCode(
          "BOOKLINE",
          normalisedValue.name,
        ),

      canonicalName:
        normalisedValue.name,

      publisherId:
        normalisedValue.publisherId,

      marketingName:
        normalisedValue.name,

      displayName:
        normalisedValue.name,

      searchName:
        normalisedValue.name,
    });
  }

  private normalise(
    value: BookLineExecutionValue,
  ): BookLineExecutionValue {
    const name =
      value.name.trim();

    const publisherId =
      value.publisherId.trim();

    if (!name) {
      throw new Error(
        "Book line name is required for execution.",
      );
    }

    if (!publisherId) {
      throw new Error(
        `Publisher ID is required before executing book line "${name}".`,
      );
    }

    return {
      name,
      publisherId,
    };
  }
}