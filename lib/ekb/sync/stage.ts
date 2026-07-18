import { NaccaBookRecord } from "../importers/types";
import {
  StagedBookRecord,
  SyncPreview,
} from "./types";

export function stageRecords(
  records: NaccaBookRecord[],
): SyncPreview {
  const staged: StagedBookRecord[] = records.map(
    (record) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!record.publisher.trim()) {
        errors.push("Missing publisher");
      }

      if (!record.title.trim()) {
        errors.push("Missing title");
      }

      if (!record.subject.trim()) {
        errors.push("Missing subject");
      }

      if (!record.level.trim()) {
        errors.push("Missing level");
      }

      if (!record.resourceType.trim()) {
        errors.push("Missing resource type");
      }

      return {
        record,
        valid: errors.length === 0,
        errors,
        warnings,
      };
    },
  );

  return {
    totalRecords: staged.length,
    validRecords: staged.filter((r) => r.valid).length,
    invalidRecords: staged.filter((r) => !r.valid).length,
    records: staged,
  };
}