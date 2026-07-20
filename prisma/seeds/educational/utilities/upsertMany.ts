import { PrismaClient } from "@prisma/client";

export interface UpsertDefinition<T> {
  where: Record<string, unknown>;
  create: T;
  update: Partial<T>;
}

export interface UpsertSummary {
  processed: number;
}

export async function upsertMany<T>(
  prisma: PrismaClient,
  model: {
    upsert(args: {
      where: Record<string, unknown>;
      create: T;
      update: Partial<T>;
    }): Promise<unknown>;
  },
  records: UpsertDefinition<T>[],
): Promise<UpsertSummary> {
  for (const record of records) {
    await model.upsert({
      where: record.where,
      create: record.create,
      update: record.update,
    });
  }

  return {
    processed: records.length,
  };
}