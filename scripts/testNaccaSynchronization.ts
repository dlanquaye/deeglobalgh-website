/**
 * ============================================================
 * DeeglobalGH Educational Knowledge Platform
 * NaCCA Synchronisation Integration Test
 * ============================================================
 *
 * Performs a controlled end-to-end synchronisation using the
 * first valid record returned by the official NaCCA reader.
 *
 * Pipeline under test:
 *
 * Official NaCCA source
 * → NaccaReader
 * → staging and validation
 * → resolution planning
 * → transactional execution
 * → Educational Knowledge Database
 *
 * IMPORTANT:
 *
 * This script writes to the configured database.
 * It deliberately synchronises only one record so that the
 * complete execution pipeline can be verified safely before
 * running the entire official dataset.
 * ============================================================
 */

import path from "node:path";

import {
  EducationalSynchronizationService,
} from "../lib/ekb/sync/EducationalSynchronizationService";
import {
  NaccaReader,
} from "../lib/ekb/importers/readers/naccaReader";
import {
  ImportReader,
} from "../lib/ekb/importers/readers/reader";
import {
  NaccaBookRecord,
} from "../lib/ekb/importers/types";

class LimitedImportReader
  implements ImportReader
{
  constructor(
    private readonly reader:
      ImportReader,

    private readonly limit:
      number,
  ) {}

  async read():
    Promise<NaccaBookRecord[]> {
    const records =
      await this.reader.read();

    return records.slice(
      0,
      this.limit,
    );
  }
}

async function main():
  Promise<void> {
  console.log(
    "Starting controlled NaCCA synchronisation test...\n",
  );

  const cacheDirectory =
    path.resolve(
      process.cwd(),
      ".cache",
      "ekb",
      "nacca",
    );

  const sourceReader =
    new NaccaReader({
      cacheDirectory,

      allowCachedDocument:
        true,
    });

  const testReader =
    new LimitedImportReader(
      sourceReader,
      1,
    );

  const service =
    new EducationalSynchronizationService();

  const result =
    await service.synchronize(
      testReader,
    );

  console.log(
    "Synchronisation plan",
  );

  console.log(
    "--------------------",
  );

  console.log(
    `Total records: ${result.plan.totalRecords}`,
  );

  console.log(
    `Planned creates: ${result.plan.plannedCreates}`,
  );

  console.log(
    `Planned updates: ${result.plan.plannedUpdates}`,
  );

  console.log(
    `Planned keeps: ${result.plan.plannedKeeps}`,
  );

  console.log(
    `Planned errors: ${result.plan.plannedErrors}`,
  );

  console.log(
    "\nExecution result",
  );

  console.log(
    "----------------",
  );

  console.dir(
    result.execution,
    {
      depth:
        null,
    },
  );

  if (
    result.plan.totalRecords !== 1
  ) {
    throw new Error(
      `Expected exactly one planned record but received ${result.plan.totalRecords}.`,
    );
  }

  if (
    result.plan.plannedErrors > 0
  ) {
    throw new Error(
      "The controlled NaCCA synchronisation plan contains errors.",
    );
  }

  console.log(
    "\nControlled NaCCA synchronisation completed successfully.",
  );
}

main().catch(
  (error: unknown) => {
    console.error(
      "\nControlled NaCCA synchronisation failed.",
    );

    console.error(
      error,
    );

    process.exitCode =
      1;
  },
);