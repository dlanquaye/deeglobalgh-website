import { prisma } from "@/lib/prisma";

import { runImport } from "../importers/importEngine";
import { ImportReader } from "../importers/readers/reader";

import { SyncExecutionCoordinator } from "./execution/SyncExecutionCoordinator";
import { SyncExecutionResult } from "./execution/types";
import { SyncPlan } from "./syncPlan";

export interface EducationalSynchronizationResult {
  plan: SyncPlan;
  execution: SyncExecutionResult;
}

export class EducationalSynchronizationService {
  async synchronize(
    reader: ImportReader,
  ): Promise<EducationalSynchronizationResult> {
    const plan =
      await runImport(reader);

    const coordinator =
      new SyncExecutionCoordinator(
        prisma,
      );

    const execution =
      await coordinator.execute(
        plan,
      );

    return {
      plan,
      execution,
    };
  }
}