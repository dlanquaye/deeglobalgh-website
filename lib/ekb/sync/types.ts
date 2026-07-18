import { NaccaBookRecord } from "../importers/types";

export interface StagedBookRecord {
  record: NaccaBookRecord;

  valid: boolean;

  errors: string[];

  warnings: string[];
}

export interface SyncPreview {
  totalRecords: number;

  validRecords: number;

  invalidRecords: number;

  records: StagedBookRecord[];
}