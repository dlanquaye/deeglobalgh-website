import {
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { AuthorService } from "../../services/AuthorService";
import { AuthorOperations } from "./AuthorExecutor";
import { generateEntityCode } from "./generateEntityCode";

export class AuthorExecutionOperations
  implements AuthorOperations
{
  private readonly service: AuthorService;

  constructor(
    prisma:
      | PrismaClient
      | Prisma.TransactionClient,
  ) {
    this.service =
      new AuthorService(prisma);
  }

  async create(
    name: string,
  ): Promise<string> {
    const normalisedName =
      this.normaliseName(name);

    const author =
      await this.service.upsert({
        code:
          generateEntityCode(
            "AUTHOR",
            normalisedName,
          ),

        canonicalName:
          normalisedName,

        displayName:
          normalisedName,

        searchName:
          normalisedName,
      });

    return author.id;
  }

  async update(
    _id: string,
    name: string,
  ): Promise<void> {
    const normalisedName =
      this.normaliseName(name);

    await this.service.upsert({
      code:
        generateEntityCode(
          "AUTHOR",
          normalisedName,
        ),

      canonicalName:
        normalisedName,

      displayName:
        normalisedName,

      searchName:
        normalisedName,
    });
  }

  private normaliseName(
    name: string,
  ): string {
    const normalisedName =
      name.trim();

    if (!normalisedName) {
      throw new Error(
        "Author name is required for execution.",
      );
    }

    return normalisedName;
  }
}