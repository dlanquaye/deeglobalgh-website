"use client";

import { ChangeEvent, useMemo, useState } from "react";

type PreviewItem = {
  rowNumber: number;
  productId: string;
  sku: string;
  productName: string;

  current: {
    costPrice: number | null;
    retailPrice: number | null;
    wholesalePrice: number | null;
    distributorPrice: number | null;
    stockQty: number;
  };

  target: {
    costPrice?: number;
    retailPrice?: number;
    wholesalePrice?: number;
    distributorPrice?: number;
    stockQty?: number;
  };

  stockDelta?: number;
  changes: string[];
  action: "UPDATE" | "NO_CHANGE";
};

type Analysis = {
  status: "VALIDATED" | "VALIDATION_FAILED";
  fileName: string;
  fileSize: number;
  branchId: string;

  totalRows: number;
  validRows: number;
  invalidRows: number;
  updateRows: number;
  noChangeRows: number;
  priceChangeRows: number;
  stockChangeRows: number;
  duplicateSkus: number;

  errors: string[];
  warnings: string[];

  preview: PreviewItem[];
  syncItems: PreviewItem[];
};

type AnalyseResponse = {
  success: boolean;
  analysis?: Analysis;
  error?: string;
};

type SynchroniseResultItem = {
  productId: string;
  sku: string;
  productName: string;
  pricesUpdated: boolean;

  stock: {
    changed: boolean;
    before: number;
    after: number;
    delta: number;
    movementId: string | null;
  };
};

type SynchroniseReport = {
  success: boolean;
  processed: number;
  priceUpdates: number;
  stockUpdates: number;
  results: SynchroniseResultItem[];
};

type SynchroniseResponse = {
  success: boolean;
  report?: SynchroniseReport;
  error?: string;
};

function formatMoney(
  value: number | null | undefined
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  return `GH₵ ${value.toFixed(2)}`;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function targetOrCurrent(
  target: number | undefined,
  current: number | null
) {
  return target !== undefined
    ? target
    : current;
}

export default function OpeningStockPricePage() {
  const [file, setFile] =
    useState<File | null>(null);

  const [analysis, setAnalysis] =
    useState<Analysis | null>(null);

  const [analyseError, setAnalyseError] =
    useState("");

  const [syncError, setSyncError] =
    useState("");

  const [
    synchroniseReport,
    setSynchroniseReport,
  ] =
    useState<SynchroniseReport | null>(
      null
    );

  const [isAnalysing, setIsAnalysing] =
    useState(false);

  const [
    isSynchronising,
    setIsSynchronising,
  ] = useState(false);

  const updateItems = useMemo(
    () =>
      analysis?.preview.filter(
        (item) =>
          item.action === "UPDATE"
      ) ?? [],
    [analysis]
  );

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile =
      event.target.files?.[0] ?? null;

    setFile(selectedFile);
    setAnalysis(null);
    setAnalyseError("");
    setSyncError("");
    setSynchroniseReport(null);
  }

  function resetPage() {
    setFile(null);
    setAnalysis(null);
    setAnalyseError("");
    setSyncError("");
    setSynchroniseReport(null);

    const input =
      document.getElementById(
        "opening-stock-price-file"
      ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  }

  async function analyseFile() {
    if (!file) {
      setAnalyseError(
        "Select an Excel or CSV file first."
      );
      return;
    }

    setIsAnalysing(true);
    setAnalyseError("");
    setSyncError("");
    setSynchroniseReport(null);
    setAnalysis(null);

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const response =
        await fetch(
          "/api/admin/inventory/opening-stock-price/analyze",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        (await response.json()) as AnalyseResponse;

      if (
        !response.ok ||
        !data.success ||
        !data.analysis
      ) {
        throw new Error(
          data.error ??
            "Unable to analyse the file."
        );
      }

      setAnalysis(data.analysis);
    } catch (error) {
      setAnalyseError(
        error instanceof Error
          ? error.message
          : "Unable to analyse the file."
      );
    } finally {
      setIsAnalysing(false);
    }
  }

  async function synchronise() {
    if (
      !analysis ||
      analysis.status !== "VALIDATED"
    ) {
      setSyncError(
        "The file must pass validation before it can be synchronised."
      );
      return;
    }

    if (
      analysis.syncItems.length === 0
    ) {
      setSyncError(
        "There are no changes to synchronise."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Apply ${analysis.syncItems.length} Opening Stock & Price change(s)?\n\n` +
          "Stock changes will create audited inventory adjustments. " +
          "This action will update live product prices and branch stock."
      );

    if (!confirmed) {
      return;
    }

    setIsSynchronising(true);
    setSyncError("");
    setSynchroniseReport(null);

    try {
      const response =
        await fetch(
          "/api/admin/inventory/opening-stock-price/synchronize",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              syncItems:
                analysis.syncItems,
            }),
          }
        );

      const data =
        (await response.json()) as SynchroniseResponse;

      if (
        !response.ok ||
        !data.success ||
        !data.report
      ) {
        throw new Error(
          data.error ??
            "Unable to synchronise the file."
        );
      }

      setSynchroniseReport(
        data.report
      );
    } catch (error) {
      setSyncError(
        error instanceof Error
          ? error.message
          : "Unable to synchronise the file."
      );
    } finally {
      setIsSynchronising(false);
    }
  }

  const canSynchronise =
    analysis?.status === "VALIDATED" &&
    analysis.syncItems.length > 0 &&
    !synchroniseReport &&
    !isSynchronising;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">
                Inventory Management
              </p>

              <h1 className="mt-1 text-2xl font-bold text-gray-900">
                Opening Stock &amp; Price
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
                Upload an Excel or CSV file,
                review every proposed price
                and branch stock change, then
                synchronise only after the file
                passes validation.
              </p>
            </div>

            <a
              href="/admin/inventory"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to Inventory
            </a>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            1. Prepare your spreadsheet
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            SKU identifies the existing
            product. Blank price cells leave
            the existing price unchanged.
            Opening Stock is the required final
            branch quantity, not an amount to
            add.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-700">
                  <th className="border border-gray-200 px-3 py-2">
                    SKU
                  </th>

                  <th className="border border-gray-200 px-3 py-2">
                    Cost Price
                  </th>

                  <th className="border border-gray-200 px-3 py-2">
                    Retail Price
                  </th>

                  <th className="border border-gray-200 px-3 py-2">
                    Wholesale Price
                  </th>

                  <th className="border border-gray-200 px-3 py-2">
                    Distributor Price
                  </th>

                  <th className="border border-gray-200 px-3 py-2">
                    Opening Stock
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr className="text-gray-600">
                  <td className="border border-gray-200 px-3 py-2">
                    Required
                  </td>

                  <td className="border border-gray-200 px-3 py-2">
                    Optional
                  </td>

                  <td className="border border-gray-200 px-3 py-2">
                    Optional
                  </td>

                  <td className="border border-gray-200 px-3 py-2">
                    Optional
                  </td>

                  <td className="border border-gray-200 px-3 py-2">
                    Optional
                  </td>

                  <td className="border border-gray-200 px-3 py-2">
                    Optional whole number
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Example: if current branch stock is
            5 and Opening Stock is 12, the
            system creates an audited +7 stock
            adjustment. If current stock is 12
            and Opening Stock is 5, it creates
            an audited -7 adjustment.
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            2. Upload and analyse
          </h2>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label
                htmlFor="opening-stock-price-file"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Excel or CSV file
              </label>

              <input
                id="opening-stock-price-file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={
                  handleFileChange
                }
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={
                  analyseFile
                }
                disabled={
                  !file ||
                  isAnalysing
                }
                className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isAnalysing
                  ? "Analysing..."
                  : "Analyse File"}
              </button>

              <button
                type="button"
                onClick={resetPage}
                disabled={
                  isAnalysing ||
                  isSynchronising
                }
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
              >
                Reset
              </button>
            </div>
          </div>

          {analyseError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {analyseError}
            </div>
          )}
        </section>

        {analysis && (
          <>
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    3. Analysis summary
                  </h2>

                  <p className="mt-1 text-sm text-gray-600">
                    {analysis.fileName} ·{" "}
                    {formatFileSize(
                      analysis.fileSize
                    )}
                  </p>
                </div>

                <span
                  className={
                    analysis.status ===
                    "VALIDATED"
                      ? "inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800"
                      : "inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800"
                  }
                >
                  {analysis.status ===
                  "VALIDATED"
                    ? "Validated"
                    : "Validation Failed"}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                  label="Spreadsheet Rows"
                  value={
                    analysis.totalRows
                  }
                />

                <SummaryCard
                  label="Rows to Update"
                  value={
                    analysis.updateRows
                  }
                />

                <SummaryCard
                  label="Price Changes"
                  value={
                    analysis.priceChangeRows
                  }
                />

                <SummaryCard
                  label="Stock Changes"
                  value={
                    analysis.stockChangeRows
                  }
                />

                <SummaryCard
                  label="No Change"
                  value={
                    analysis.noChangeRows
                  }
                />

                <SummaryCard
                  label="Valid Rows"
                  value={
                    analysis.validRows
                  }
                />

                <SummaryCard
                  label="Invalid Rows"
                  value={
                    analysis.invalidRows
                  }
                />

                <SummaryCard
                  label="Duplicate SKUs"
                  value={
                    analysis.duplicateSkus
                  }
                />
              </div>

              {analysis.errors.length >
                0 && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                  <h3 className="font-semibold text-red-900">
                    Validation errors
                  </h3>

                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-800">
                    {analysis.errors.map(
                      (
                        error,
                        index
                      ) => (
                        <li
                          key={`${error}-${index}`}
                        >
                          {error}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {analysis.warnings.length >
                0 && (
                <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <h3 className="font-semibold text-amber-900">
                    Warnings
                  </h3>

                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
                    {analysis.warnings.map(
                      (
                        warning,
                        index
                      ) => (
                        <li
                          key={`${warning}-${index}`}
                        >
                          {warning}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </section>

            {analysis.preview.length >
              0 && (
              <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      4. Preview
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                      Review the database
                      values against the
                      spreadsheet targets
                      before synchronising.
                    </p>
                  </div>

                  <p className="text-sm font-medium text-gray-700">
                    {
                      analysis.preview
                        .length
                    }{" "}
                    validated row
                    {analysis.preview
                      .length === 1
                      ? ""
                      : "s"}
                  </p>
                </div>

                <div className="mt-5 max-h-[650px] overflow-auto rounded-lg border border-gray-200">
                  <table className="min-w-[1450px] w-full border-collapse text-sm">
                    <thead className="sticky top-0 z-10 bg-gray-100 text-left text-xs uppercase tracking-wide text-gray-600">
                      <tr>
                        <th className="border-b border-gray-200 px-3 py-3">
                          Row
                        </th>

                        <th className="border-b border-gray-200 px-3 py-3">
                          SKU
                        </th>

                        <th className="border-b border-gray-200 px-3 py-3">
                          Product
                        </th>

                        <th className="border-b border-gray-200 px-3 py-3">
                          Cost
                        </th>

                        <th className="border-b border-gray-200 px-3 py-3">
                          Retail
                        </th>

                        <th className="border-b border-gray-200 px-3 py-3">
                          Wholesale
                        </th>

                        <th className="border-b border-gray-200 px-3 py-3">
                          Distributor
                        </th>

                        <th className="border-b border-gray-200 px-3 py-3">
                          Stock
                        </th>

                        <th className="border-b border-gray-200 px-3 py-3">
                          Action
                        </th>

                        <th className="border-b border-gray-200 px-3 py-3">
                          Changes
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {analysis.preview.map(
                        (item) => (
                          <tr
                            key={`${item.rowNumber}-${item.productId}`}
                            className={
                              item.action ===
                              "UPDATE"
                                ? "bg-blue-50/40"
                                : "bg-white"
                            }
                          >
                            <td className="border-b border-gray-100 px-3 py-3 text-gray-600">
                              {
                                item.rowNumber
                              }
                            </td>

                            <td className="border-b border-gray-100 px-3 py-3 font-medium text-gray-900">
                              {
                                item.sku
                              }
                            </td>

                            <td className="border-b border-gray-100 px-3 py-3 text-gray-800">
                              {
                                item.productName
                              }
                            </td>

                            <PriceComparison
                              current={
                                item
                                  .current
                                  .costPrice
                              }
                              target={
                                item
                                  .target
                                  .costPrice
                              }
                            />

                            <PriceComparison
                              current={
                                item
                                  .current
                                  .retailPrice
                              }
                              target={
                                item
                                  .target
                                  .retailPrice
                              }
                            />

                            <PriceComparison
                              current={
                                item
                                  .current
                                  .wholesalePrice
                              }
                              target={
                                item
                                  .target
                                  .wholesalePrice
                              }
                            />

                            <PriceComparison
                              current={
                                item
                                  .current
                                  .distributorPrice
                              }
                              target={
                                item
                                  .target
                                  .distributorPrice
                              }
                            />

                            <td className="border-b border-gray-100 px-3 py-3">
                              <ComparisonValue
                                current={
                                  item
                                    .current
                                    .stockQty
                                }
                                target={
                                  item
                                    .target
                                    .stockQty
                                }
                                formatter={(
                                  value
                                ) =>
                                  String(
                                    value
                                  )
                                }
                              />

                              {item.stockDelta !==
                                undefined &&
                                item.stockDelta !==
                                  0 && (
                                  <div
                                    className={
                                      item.stockDelta >
                                      0
                                        ? "mt-1 text-xs font-semibold text-green-700"
                                        : "mt-1 text-xs font-semibold text-red-700"
                                    }
                                  >
                                    {item.stockDelta >
                                    0
                                      ? "+"
                                      : ""}
                                    {
                                      item.stockDelta
                                    }
                                  </div>
                                )}
                            </td>

                            <td className="border-b border-gray-100 px-3 py-3">
                              <span
                                className={
                                  item.action ===
                                  "UPDATE"
                                    ? "inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800"
                                    : "inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700"
                                }
                              >
                                {
                                  item.action
                                }
                              </span>
                            </td>

                            <td className="border-b border-gray-100 px-3 py-3">
                              {item.changes
                                .length >
                              0 ? (
                                <ul className="space-y-1 text-xs text-gray-700">
                                  {item.changes.map(
                                    (
                                      change,
                                      index
                                    ) => (
                                      <li
                                        key={`${change}-${index}`}
                                      >
                                        {
                                          change
                                        }
                                      </li>
                                    )
                                  )}
                                </ul>
                              ) : (
                                <span className="text-xs text-gray-400">
                                  No changes
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                5. Synchronise
              </h2>

              {analysis.status !==
                "VALIDATED" && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  Synchronisation is blocked
                  because the spreadsheet has
                  validation errors. Correct
                  the file and analyse it
                  again.
                </div>
              )}

              {analysis.status ===
                "VALIDATED" &&
                updateItems.length ===
                  0 && (
                  <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                    The spreadsheet is valid,
                    but there are no price or
                    stock changes to apply.
                  </div>
                )}

              {analysis.status ===
                "VALIDATED" &&
                updateItems.length >
                  0 && (
                  <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                    <strong>
                      {
                        updateItems.length
                      }{" "}
                      product
                      {updateItems.length ===
                      1
                        ? ""
                        : "s"}
                    </strong>{" "}
                    will be processed. Stock
                    quantities will be
                    re-read from the live
                    branch inventory at the
                    moment of
                    synchronisation.
                  </div>
                )}

              {syncError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  {syncError}
                </div>
              )}

              {synchroniseReport && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-5">
                  <h3 className="font-semibold text-green-900">
                    Synchronisation completed
                  </h3>

                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <ResultCard
                      label="Products Processed"
                      value={
                        synchroniseReport.processed
                      }
                    />

                    <ResultCard
                      label="Price Updates"
                      value={
                        synchroniseReport.priceUpdates
                      }
                    />

                    <ResultCard
                      label="Stock Updates"
                      value={
                        synchroniseReport.stockUpdates
                      }
                    />
                  </div>

                  <p className="mt-4 text-sm text-green-800">
                    The submitted changes were
                    applied successfully. Any
                    stock changes were recorded
                    through audited Stock
                    Movement adjustments.
                  </p>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={synchronise}
                  disabled={
                    !canSynchronise
                  }
                  className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {isSynchronising
                    ? "Synchronising..."
                    : "Synchronise Opening Stock & Price"}
                </button>

                {synchroniseReport && (
                  <button
                    type="button"
                    onClick={resetPage}
                    className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Start New Upload
                  </button>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function ResultCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-green-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-green-700">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function PriceComparison({
  current,
  target,
}: {
  current: number | null;
  target?: number;
}) {
  return (
    <td className="border-b border-gray-100 px-3 py-3">
      <ComparisonValue
        current={current}
        target={target}
        formatter={formatMoney}
      />
    </td>
  );
}

function ComparisonValue({
  current,
  target,
  formatter,
}: {
  current: number | null;
  target?: number;
  formatter: (
    value: number | null | undefined
  ) => string;
}) {
  const finalValue =
    targetOrCurrent(
      target,
      current
    );

  const changed =
    target !== undefined &&
    target !== current;

  if (!changed) {
    return (
      <span className="text-gray-700">
        {formatter(finalValue)}
      </span>
    );
  }

  return (
    <div>
      <div className="text-xs text-gray-400 line-through">
        {formatter(current)}
      </div>

      <div className="font-semibold text-blue-800">
        {formatter(target)}
      </div>
    </div>
  );
}