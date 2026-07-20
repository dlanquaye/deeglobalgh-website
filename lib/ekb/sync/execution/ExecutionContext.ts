import {
  Prisma,
  PrismaClient,
} from "@prisma/client";

export class ExecutionContext {
  constructor(
    readonly prisma:
      | PrismaClient
      | Prisma.TransactionClient,
  ) {}

  private readonly entityIds =
    new Map<string, string>();

  setEntityId(
    key: string,
    id: string,
  ): void {
    this.entityIds.set(key, id);
  }

  getEntityId(
    key: string,
  ): string | undefined {
    return this.entityIds.get(key);
  }

  hasEntity(
    key: string,
  ): boolean {
    return this.entityIds.has(key);
  }

  clear(): void {
    this.entityIds.clear();
  }
}