import { ResolutionAction } from "../resolution";

export enum ExecutionStatus {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  KEPT = "KEPT",
  SKIPPED = "SKIPPED",
  FAILED = "FAILED",
}

export interface ExecutedEntityResult {
  entity: string;

  action: ResolutionAction;

  status: ExecutionStatus;

  existingId?: string;

  createdId?: string;

  message: string;
}

export interface ExecutedRecordResult {
  recordNumber: number;

  title: string;

  success: boolean;

  entities: ExecutedEntityResult[];

  errors: string[];
}

export interface SyncExecutionResult {
  totalRecords: number;

  successfulRecords: number;

  failedRecords: number;

  createdEntities: number;

  updatedEntities: number;

  keptEntities: number;

  skippedEntities: number;

  failedEntities: number;

  records: ExecutedRecordResult[];
}