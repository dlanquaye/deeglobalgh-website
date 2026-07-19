import { EducationalCache } from "../cache/EducationalCache";
import { PlanningResolverFactory } from "../sync/resolvers/PlanningResolverFactory";
import { buildSyncPlan } from "../sync/planner";
import { stageRecords } from "../sync/stage";
import { ImportReader } from "./readers/reader";

export async function runImport(
  reader: ImportReader,
) {
  const records = await reader.read();

  const preview = stageRecords(records);

  const cache = new EducationalCache();

  await cache.load();

  const resolverFactory =
    new PlanningResolverFactory(cache);

  const resolvers = resolverFactory.create();

  return buildSyncPlan(
    preview,
    resolvers,
  );
}