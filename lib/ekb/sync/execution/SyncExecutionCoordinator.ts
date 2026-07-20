import { PrismaClient } from "@prisma/client";

import { SyncPlan } from "../syncPlan";

import { ExecutionResultBuilder } from "./ExecutionResultBuilder";
import { PlannedRecordExecutor } from "./PlannedRecordExecutor";
import { SyncExecutionResult } from "./types";

export class SyncExecutionCoordinator {
  constructor(
    private readonly prisma: PrismaClient,
  ) {}

  async execute(
    plan: SyncPlan,
  ): Promise<SyncExecutionResult> {
    const resultBuilder =
      new ExecutionResultBuilder();

    for (
      let index = 0;
      index < plan.records.length;
      index++
    ) {
      const plannedRecord =
        plan.records[index];

      const recordNumber =
        index + 1;

      if (!plannedRecord.staged.valid) {
        resultBuilder.addRecord({
          recordNumber,

          title:
            plannedRecord
              .staged
              .record
              .title,

          success:
            false,

          entities:
            [],

          errors: [
            ...plannedRecord
              .staged
              .errors,
          ],
        });

        continue;
      }

      try {
        const executedRecord =
          await this.prisma.$transaction(
            async (transaction) => {
              const executor =
                new PlannedRecordExecutor(
                  transaction,
                );

              return executor.execute(
                plannedRecord,
                recordNumber,
              );
            },
          );

        resultBuilder.addRecord(
          executedRecord,
        );
      } catch (error) {
        resultBuilder.addRecord({
          recordNumber,

          title:
            plannedRecord
              .staged
              .record
              .title,

          success:
            false,

          entities:
            [],

          errors: [
            this.getErrorMessage(
              error,
            ),
          ],
        });
      }
    }

    return resultBuilder.build();
  }

  private getErrorMessage(
    error: unknown,
  ): string {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}