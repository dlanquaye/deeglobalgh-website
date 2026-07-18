import { ImportReader } from "./readers/reader";
import { stageRecords } from "../sync/stage";
import { buildSyncPlan } from "../sync/planner";

export async function runImport(
  reader: ImportReader,
) {
  const records = await reader.read();

  const preview = stageRecords(records);

  return buildSyncPlan(preview);
}