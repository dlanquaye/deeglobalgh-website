import { ResolutionResult } from "./resolution";
import { StagedBookRecord } from "./types";

export interface PlannedRecord {
  staged: StagedBookRecord;

  publisher: ResolutionResult;

  subject: ResolutionResult;

  level: ResolutionResult;

  resourceType: ResolutionResult;

  language: ResolutionResult;

  curriculum: ResolutionResult;

  author: ResolutionResult[];

  bookLine: ResolutionResult;

  book: ResolutionResult;
}

export interface SyncPlan {
  totalRecords: number;

  plannedCreates: number;

  plannedUpdates: number;

  plannedKeeps: number;

  plannedErrors: number;

  records: PlannedRecord[];
}