import { SyncPreview } from "./types";
import {
  ResolutionAction,
  ResolutionResult,
} from "./resolution";
import { PlannedRecord, SyncPlan } from "./syncPlan";

function keep(entity: string): ResolutionResult {
  return {
    entity,
    action: ResolutionAction.KEEP,
    message: "Resolver not connected yet",
  };
}

export function buildSyncPlan(
  preview: SyncPreview,
): SyncPlan {
  const records: PlannedRecord[] =
    preview.records.map((record) => ({
      staged: record,

      publisher: keep("Publisher"),

      subject: keep("Subject"),

      level: keep("Level"),

      resourceType: keep("ResourceType"),

      language: keep("Language"),

      curriculum: keep("Curriculum"),

      author: [],

      bookLine: keep("BookLine"),

      book: keep("Book"),
    }));

  return {
    totalRecords: records.length,

    plannedCreates: 0,

    plannedUpdates: 0,

    plannedKeeps: records.length * 8,

    plannedErrors: 0,

    records,
  };
}