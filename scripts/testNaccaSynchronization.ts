/**
 * ============================================================
 * DeeglobalGH Educational Knowledge Platform
 * NaCCA Batch Synchronisation Runner
 * ============================================================
 *
 * Safely synchronises official NaCCA records in controlled
 * sequential batches.
 *
 * Pipeline:
 *
 * Official NaCCA source
 * → NaccaReader
 * → controlled record batches
 * → staging and validation
 * → resolution planning
 * → transactional execution
 * → Educational Knowledge Database
 *
 * Operational features:
 *
 * - Processes the dataset in configurable batches.
 * - Prints progress after every batch.
 * - Prints elapsed time.
 * - Estimates remaining time.
 * - Aggregates planning totals.
 * - Aggregates execution totals.
 * - Stops immediately on planning or execution failure.
 * - Supports limited test runs through environment variables.
 *
 * Environment variables:
 *
 * NACCA_BATCH_SIZE
 *   Number of records processed per batch.
 *   Default: 10
 *
 * NACCA_IMPORT_LIMIT
 *   Maximum number of records to process.
 *   Use 0 to process the entire dataset.
 *   Default: 0
 *
 * NACCA_START_INDEX
 *   Zero-based record offset.
 *   Default: 0
 *
 * Example controlled run:
 *
 * PowerShell:
 *
 * $env:NACCA_IMPORT_LIMIT="20"
 * $env:NACCA_BATCH_SIZE="10"
 * npx tsx scripts/testNaccaSynchronization.ts
 *
 * Example full import:
 *
 * Remove-Item Env:NACCA_IMPORT_LIMIT -ErrorAction SilentlyContinue
 * $env:NACCA_BATCH_SIZE="10"
 * npx tsx scripts/testNaccaSynchronization.ts
 *
 * IMPORTANT:
 *
 * This script writes to the configured database.
 * ============================================================
 */

import path from "node:path";
import { performance } from "node:perf_hooks";

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

const DEFAULT_BATCH_SIZE =
  10;

const DEFAULT_IMPORT_LIMIT =
  0;

const DEFAULT_START_INDEX =
  0;

type SynchronizationResult =
  Awaited<
    ReturnType<
      EducationalSynchronizationService["synchronize"]
    >
  >;

interface RunnerConfiguration {
  batchSize:
    number;

  importLimit:
    number;

  startIndex:
    number;
}

interface AggregatePlan {
  totalRecords:
    number;

  plannedCreates:
    number;

  plannedUpdates:
    number;

  plannedKeeps:
    number;

  plannedErrors:
    number;
}

interface AggregateExecution {
  totalRecords:
    number;

  successfulRecords:
    number;

  failedRecords:
    number;

  createdEntities:
    number;

  updatedEntities:
    number;

  keptEntities:
    number;

  skippedEntities:
    number;

  failedEntities:
    number;
}

class BatchImportReader
  implements ImportReader
{
  constructor(
    private readonly records:
      NaccaBookRecord[],
  ) {}

  async read():
  Promise<NaccaBookRecord[]> {
    return this.records;
  }
}

function parseNonNegativeInteger(
  value:
    string | undefined,

  fallback:
    number,

  variableName:
    string,
): number {
  if (
    value === undefined ||
    value.trim() === ""
  ) {
    return fallback;
  }

  const parsedValue =
    Number.parseInt(
      value,
      10,
    );

  if (
    !Number.isInteger(
      parsedValue,
    ) ||
    parsedValue < 0
  ) {
    throw new Error(
      `${variableName} must be a non-negative integer. Received: ${value}`,
    );
  }

  return parsedValue;
}

function readConfiguration():
RunnerConfiguration {
  const batchSize =
    parseNonNegativeInteger(
      process.env.NACCA_BATCH_SIZE,
      DEFAULT_BATCH_SIZE,
      "NACCA_BATCH_SIZE",
    );

  const importLimit =
    parseNonNegativeInteger(
      process.env.NACCA_IMPORT_LIMIT,
      DEFAULT_IMPORT_LIMIT,
      "NACCA_IMPORT_LIMIT",
    );

  const startIndex =
    parseNonNegativeInteger(
      process.env.NACCA_START_INDEX,
      DEFAULT_START_INDEX,
      "NACCA_START_INDEX",
    );

  if (
    batchSize < 1
  ) {
    throw new Error(
      "NACCA_BATCH_SIZE must be at least 1.",
    );
  }

  return {
    batchSize,
    importLimit,
    startIndex,
  };
}

function formatDuration(
  durationMilliseconds:
    number,
): string {
  if (
    durationMilliseconds < 1_000
  ) {
    return `${durationMilliseconds.toFixed(0)} ms`;
  }

  const totalSeconds =
    Math.round(
      durationMilliseconds /
      1_000,
    );

  const hours =
    Math.floor(
      totalSeconds /
      3_600,
    );

  const minutes =
    Math.floor(
      (
        totalSeconds %
        3_600
      ) /
      60,
    );

  const seconds =
    totalSeconds %
    60;

  const parts:
    string[] =
    [];

  if (
    hours > 0
  ) {
    parts.push(
      `${hours}h`,
    );
  }

  if (
    minutes > 0 ||
    hours > 0
  ) {
    parts.push(
      `${minutes}m`,
    );
  }

  parts.push(
    `${seconds}s`,
  );

  return parts.join(
    " ",
  );
}

function createEmptyPlan():
AggregatePlan {
  return {
    totalRecords:
      0,

    plannedCreates:
      0,

    plannedUpdates:
      0,

    plannedKeeps:
      0,

    plannedErrors:
      0,
  };
}

function createEmptyExecution():
AggregateExecution {
  return {
    totalRecords:
      0,

    successfulRecords:
      0,

    failedRecords:
      0,

    createdEntities:
      0,

    updatedEntities:
      0,

    keptEntities:
      0,

    skippedEntities:
      0,

    failedEntities:
      0,
  };
}

function addPlanTotals(
  aggregate:
    AggregatePlan,

  result:
    SynchronizationResult,
): void {
  aggregate.totalRecords +=
    result.plan.totalRecords;

  aggregate.plannedCreates +=
    result.plan.plannedCreates;

  aggregate.plannedUpdates +=
    result.plan.plannedUpdates;

  aggregate.plannedKeeps +=
    result.plan.plannedKeeps;

  aggregate.plannedErrors +=
    result.plan.plannedErrors;
}

function addExecutionTotals(
  aggregate:
    AggregateExecution,

  result:
    SynchronizationResult,
): void {
  aggregate.totalRecords +=
    result.execution.totalRecords;

  aggregate.successfulRecords +=
    result.execution.successfulRecords;

  aggregate.failedRecords +=
    result.execution.failedRecords;

  aggregate.createdEntities +=
    result.execution.createdEntities;

  aggregate.updatedEntities +=
    result.execution.updatedEntities;

  aggregate.keptEntities +=
    result.execution.keptEntities;

  aggregate.skippedEntities +=
    result.execution.skippedEntities;

  aggregate.failedEntities +=
    result.execution.failedEntities;
}

function validateBatchResult(
  result:
    SynchronizationResult,

  expectedRecordCount:
    number,

  batchNumber:
    number,
): void {
  if (
    result.plan.totalRecords !==
    expectedRecordCount
  ) {
    throw new Error(
      `Batch ${batchNumber} expected ${expectedRecordCount} planned records but received ${result.plan.totalRecords}.`,
    );
  }

  if (
    result.execution.totalRecords !==
    expectedRecordCount
  ) {
    throw new Error(
      `Batch ${batchNumber} expected ${expectedRecordCount} executed records but received ${result.execution.totalRecords}.`,
    );
  }

  if (
    result.plan.plannedErrors > 0
  ) {
    throw new Error(
      `Batch ${batchNumber} contains ${result.plan.plannedErrors} planning error(s).`,
    );
  }

  if (
    result.execution.failedRecords > 0 ||
    result.execution.failedEntities > 0
  ) {
    console.error(
      `\nBatch ${batchNumber} failure details`,
    );

    console.dir(
      result.execution.records.filter(
        (
          record,
        ) =>
          !record.success ||
          record.errors.length >
            0,
      ),
      {
        depth:
          null,
      },
    );

    throw new Error(
      `Batch ${batchNumber} failed. Failed records: ${result.execution.failedRecords}. Failed entities: ${result.execution.failedEntities}.`,
    );
  }
}

function printBatchSummary(
  batchNumber:
    number,

  totalBatches:
    number,

  processedRecords:
    number,

  totalRecords:
    number,

  result:
    SynchronizationResult,

  batchDurationMilliseconds:
    number,

  totalElapsedMilliseconds:
    number,
): void {
  const progressPercentage =
    totalRecords === 0
      ? 100
      : (
          processedRecords /
          totalRecords
        ) *
        100;

  const averageMillisecondsPerRecord =
    processedRecords === 0
      ? 0
      : totalElapsedMilliseconds /
        processedRecords;

  const remainingRecords =
    Math.max(
      totalRecords -
        processedRecords,
      0,
    );

  const estimatedRemainingMilliseconds =
    averageMillisecondsPerRecord *
    remainingRecords;

  console.log(
    `\nBatch ${batchNumber}/${totalBatches} completed`,
  );

  console.log(
    "--------------------------------",
  );

  console.log(
    `Progress: ${processedRecords}/${totalRecords} records (${progressPercentage.toFixed(1)}%)`,
  );

  console.log(
    `Batch duration: ${formatDuration(batchDurationMilliseconds)}`,
  );

  console.log(
    `Total elapsed: ${formatDuration(totalElapsedMilliseconds)}`,
  );

  console.log(
    `Estimated remaining: ${formatDuration(estimatedRemainingMilliseconds)}`,
  );

  console.log(
    `Plan: create ${result.plan.plannedCreates}, update ${result.plan.plannedUpdates}, keep ${result.plan.plannedKeeps}, error ${result.plan.plannedErrors}`,
  );

  console.log(
    `Execution: successful ${result.execution.successfulRecords}, failed ${result.execution.failedRecords}`,
  );

  console.log(
    `Entities: created ${result.execution.createdEntities}, updated ${result.execution.updatedEntities}, kept ${result.execution.keptEntities}, skipped ${result.execution.skippedEntities}, failed ${result.execution.failedEntities}`,
  );
}

async function loadSelectedRecords(
  configuration:
    RunnerConfiguration,
): Promise<{
  sourceRecordCount:
    number;

  selectedRecords:
    NaccaBookRecord[];
}> {
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

  console.log(
    "Reading official NaCCA dataset...",
  );

  const sourceRecords =
    await sourceReader.read();

  if (
    sourceRecords.length === 0
  ) {
    throw new Error(
      "The official NaCCA reader returned no records.",
    );
  }

  if (
    configuration.startIndex >=
    sourceRecords.length
  ) {
    throw new Error(
      `NACCA_START_INDEX ${configuration.startIndex} is outside the dataset of ${sourceRecords.length} records.`,
    );
  }

  const recordsAfterOffset =
    sourceRecords.slice(
      configuration.startIndex,
    );

  const selectedRecords =
    configuration.importLimit >
      0
      ? recordsAfterOffset.slice(
          0,
          configuration.importLimit,
        )
      : recordsAfterOffset;

  if (
    selectedRecords.length === 0
  ) {
    throw new Error(
      "No NaCCA records were selected for synchronisation.",
    );
  }

  return {
    sourceRecordCount:
      sourceRecords.length,

    selectedRecords,
  };
}

async function main():
Promise<void> {
  console.log(
    "Starting NaCCA batch synchronisation...\n",
  );

  const configuration =
    readConfiguration();

  const {
    sourceRecordCount,
    selectedRecords,
  } =
    await loadSelectedRecords(
      configuration,
    );

  const totalRecords =
    selectedRecords.length;

  const totalBatches =
    Math.ceil(
      totalRecords /
      configuration.batchSize,
    );

  console.log(
    "\nSynchronisation configuration",
  );

  console.log(
    "-----------------------------",
  );

  console.log(
    `Official source records: ${sourceRecordCount}`,
  );

  console.log(
    `Starting index: ${configuration.startIndex}`,
  );

  console.log(
    `Selected records: ${totalRecords}`,
  );

  console.log(
    `Batch size: ${configuration.batchSize}`,
  );

  console.log(
    `Total batches: ${totalBatches}`,
  );

  const aggregatePlan =
    createEmptyPlan();

  const aggregateExecution =
    createEmptyExecution();

  const service =
    new EducationalSynchronizationService();

  const importStartedAt =
    performance.now();

  for (
    let batchIndex =
      0;
    batchIndex <
    totalBatches;
    batchIndex +=
      1
  ) {
    const batchNumber =
      batchIndex +
      1;

    const batchStartIndex =
      batchIndex *
      configuration.batchSize;

    const batchEndIndex =
      Math.min(
        batchStartIndex +
          configuration.batchSize,
        totalRecords,
      );

    const batchRecords =
      selectedRecords.slice(
        batchStartIndex,
        batchEndIndex,
      );

    console.log(
      `\nProcessing batch ${batchNumber}/${totalBatches}: records ${batchStartIndex + 1}-${batchEndIndex}`,
    );

    const batchReader =
      new BatchImportReader(
        batchRecords,
      );

    const batchStartedAt =
      performance.now();

    const result =
      await service.synchronize(
        batchReader,
      );

    const batchCompletedAt =
      performance.now();

    const batchDurationMilliseconds =
      batchCompletedAt -
      batchStartedAt;

    validateBatchResult(
      result,
      batchRecords.length,
      batchNumber,
    );

    addPlanTotals(
      aggregatePlan,
      result,
    );

    addExecutionTotals(
      aggregateExecution,
      result,
    );

    const processedRecords =
      batchEndIndex;

    const totalElapsedMilliseconds =
      batchCompletedAt -
      importStartedAt;

    printBatchSummary(
      batchNumber,
      totalBatches,
      processedRecords,
      totalRecords,
      result,
      batchDurationMilliseconds,
      totalElapsedMilliseconds,
    );
  }

  const importCompletedAt =
    performance.now();

  const totalDurationMilliseconds =
    importCompletedAt -
    importStartedAt;

  console.log(
    "\nNaCCA synchronisation final summary",
  );

  console.log(
    "===================================",
  );

  console.log(
    `Source records: ${sourceRecordCount}`,
  );

  console.log(
    `Selected records: ${totalRecords}`,
  );

  console.log(
    `Processed records: ${aggregateExecution.totalRecords}`,
  );

  console.log(
    `Successful records: ${aggregateExecution.successfulRecords}`,
  );

  console.log(
    `Failed records: ${aggregateExecution.failedRecords}`,
  );

  console.log(
    `Total duration: ${formatDuration(totalDurationMilliseconds)}`,
  );

  console.log(
    `Average per record: ${formatDuration(totalDurationMilliseconds / totalRecords)}`,
  );

  console.log(
    "\nPlanning totals",
  );

  console.log(
    "---------------",
  );

  console.log(
    `Creates: ${aggregatePlan.plannedCreates}`,
  );

  console.log(
    `Updates: ${aggregatePlan.plannedUpdates}`,
  );

  console.log(
    `Keeps: ${aggregatePlan.plannedKeeps}`,
  );

  console.log(
    `Errors: ${aggregatePlan.plannedErrors}`,
  );

  console.log(
    "\nExecution totals",
  );

  console.log(
    "----------------",
  );

  console.log(
    `Created entities: ${aggregateExecution.createdEntities}`,
  );

  console.log(
    `Updated entities: ${aggregateExecution.updatedEntities}`,
  );

  console.log(
    `Kept entities: ${aggregateExecution.keptEntities}`,
  );

  console.log(
    `Skipped entities: ${aggregateExecution.skippedEntities}`,
  );

  console.log(
    `Failed entities: ${aggregateExecution.failedEntities}`,
  );

  if (
    aggregatePlan.totalRecords !==
      totalRecords ||
    aggregateExecution.totalRecords !==
      totalRecords
  ) {
    throw new Error(
      "Final record totals do not match the selected NaCCA record count.",
    );
  }

  if (
    aggregatePlan.plannedErrors >
      0 ||
    aggregateExecution.failedRecords >
      0 ||
    aggregateExecution.failedEntities >
      0
  ) {
    throw new Error(
      "NaCCA synchronisation completed with errors.",
    );
  }

  console.log(
    "\nNaCCA batch synchronisation completed successfully.",
  );
}

main().catch(
  (
    error:
      unknown,
  ) => {
    console.error(
      "\nNaCCA batch synchronisation failed.",
    );

    console.error(
      error,
    );

    process.exitCode =
      1;
  },
);