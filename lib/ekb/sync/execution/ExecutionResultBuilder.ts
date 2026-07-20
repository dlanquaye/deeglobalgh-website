import {
  ExecutedEntityResult,
  ExecutedRecordResult,
  ExecutionStatus,
  SyncExecutionResult,
} from "./types";

export class ExecutionResultBuilder {
  private readonly records: ExecutedRecordResult[] = [];

  addRecord(record: ExecutedRecordResult): void {
    this.records.push(record);
  }

  build(): SyncExecutionResult {
    let successfulRecords = 0;
    let failedRecords = 0;

    let createdEntities = 0;
    let updatedEntities = 0;
    let keptEntities = 0;
    let skippedEntities = 0;
    let failedEntities = 0;

    for (const record of this.records) {
      if (record.success) {
        successfulRecords++;
      } else {
        failedRecords++;
      }

      for (const entity of record.entities) {
        this.countEntityStatus(entity, {
          incrementCreated: () => {
            createdEntities++;
          },

          incrementUpdated: () => {
            updatedEntities++;
          },

          incrementKept: () => {
            keptEntities++;
          },

          incrementSkipped: () => {
            skippedEntities++;
          },

          incrementFailed: () => {
            failedEntities++;
          },
        });
      }
    }

    return {
      totalRecords: this.records.length,

      successfulRecords,

      failedRecords,

      createdEntities,

      updatedEntities,

      keptEntities,

      skippedEntities,

      failedEntities,

      records: [...this.records],
    };
  }

  private countEntityStatus(
    entity: ExecutedEntityResult,
    counters: {
      incrementCreated(): void;

      incrementUpdated(): void;

      incrementKept(): void;

      incrementSkipped(): void;

      incrementFailed(): void;
    },
  ): void {
    switch (entity.status) {
      case ExecutionStatus.CREATED:
        counters.incrementCreated();
        break;

      case ExecutionStatus.UPDATED:
        counters.incrementUpdated();
        break;

      case ExecutionStatus.KEPT:
        counters.incrementKept();
        break;

      case ExecutionStatus.SKIPPED:
        counters.incrementSkipped();
        break;

      case ExecutionStatus.FAILED:
        counters.incrementFailed();
        break;
    }
  }
}