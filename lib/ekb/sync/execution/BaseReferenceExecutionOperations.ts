import {
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { ReferenceEntityOperations } from "./ReferenceEntityExecutor";
import { generateEntityCode } from "./generateEntityCode";

export abstract class BaseReferenceExecutionOperations
  implements ReferenceEntityOperations<string>
{
  protected readonly prisma:
    | PrismaClient
    | Prisma.TransactionClient;

  constructor(
    prisma:
      | PrismaClient
      | Prisma.TransactionClient,
  ) {
    this.prisma = prisma;
  }

  async create(
    value: string,
  ): Promise<string> {
    const name =
      this.normalise(value);

    return this.upsert(
      generateEntityCode(
        this.codePrefix,
        name,
      ),
      name,
    );
  }

  async update(
    _id: string,
    value: string,
  ): Promise<void> {
    const name =
      this.normalise(value);

    await this.upsert(
      generateEntityCode(
        this.codePrefix,
        name,
      ),
      name,
    );
  }

  protected normalise(
    value: string,
  ): string {
    const name =
      value.trim();

    if (!name) {
      throw new Error(
        "Entity name is required.",
      );
    }

    return name;
  }

  protected abstract get codePrefix(): string;

  protected abstract upsert(
    code: string,
    canonicalName: string,
  ): Promise<string>;
}