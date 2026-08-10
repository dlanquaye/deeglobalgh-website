"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

type SearchProduct = {
  id: string;
  sku?: string | null;
  name: string;
  stockQty?: number;
};

type RuleProduct = {
  id: string;
  sku: string | null;
  name: string;
  isActive: boolean;
  stockQty: number;
};

type BreakBulkRule = {
  id: string;
  conversionRatio: number;
  isActive: boolean;
  sourceProduct: RuleProduct;
  destinationProduct: RuleProduct;
  _count: {
    conversions: number;
  };
};

export default function BreakBulkPage() {
  const [rules, setRules] = useState<BreakBulkRule[]>([]);
  const [isLoadingRules, setIsLoadingRules] =
    useState(true);

  // ==============================
  // CREATE RULE STATE
  // ==============================
  const [sourceProductId, setSourceProductId] =
    useState("");
  const [sourceQuery, setSourceQuery] =
    useState("");
  const [sourceResults, setSourceResults] =
    useState<SearchProduct[]>([]);

  const [
    destinationProductId,
    setDestinationProductId,
  ] = useState("");
  const [destinationQuery, setDestinationQuery] =
    useState("");
  const [
    destinationResults,
    setDestinationResults,
  ] = useState<SearchProduct[]>([]);

  const [conversionRatio, setConversionRatio] =
    useState("");

  const [isCreatingRule, setIsCreatingRule] =
    useState(false);

  // ==============================
  // RULE EDIT STATE
  // ==============================
  const [editingRuleId, setEditingRuleId] =
    useState<string | null>(null);
  const [editingRatio, setEditingRatio] =
    useState("");
  const [updatingRuleId, setUpdatingRuleId] =
    useState<string | null>(null);

  // ==============================
  // CONVERSION STATE
  // ==============================
  const [selectedRuleId, setSelectedRuleId] =
    useState<string | null>(null);
  const [sourceQuantity, setSourceQuantity] =
    useState("");
  const [conversionNote, setConversionNote] =
    useState("");
  const [isConverting, setIsConverting] =
    useState(false);

  // ==============================
  // LOAD RULES
  // ==============================
  const loadRules = useCallback(async () => {
    setIsLoadingRules(true);

    try {
      const res = await fetch(
        "/api/inventory/break-bulk/rules",
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            "Unable to load Break Bulk rules"
        );
        setRules([]);
        return;
      }

      setRules(
        Array.isArray(data.rules)
          ? data.rules
          : []
      );
    } catch {
      alert("Unable to load Break Bulk rules");
      setRules([]);
    } finally {
      setIsLoadingRules(false);
    }
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  // ==============================
  // PRODUCT SEARCH
  // ==============================
  const searchProducts = async (
    value: string
  ): Promise<SearchProduct[]> => {
    const trimmed = value.trim();

    if (trimmed.length < 2) {
      return [];
    }

    try {
      const res = await fetch(
        `/api/pos/search?q=${encodeURIComponent(
          trimmed
        )}`
      );

      const data = await res.json();

      return Array.isArray(data)
        ? data
        : [];
    } catch {
      return [];
    }
  };

  const handleSourceSearch = async (
    value: string
  ) => {
    setSourceQuery(value);
    setSourceProductId("");

    const results =
      await searchProducts(value);

    setSourceResults(results);
  };

  const handleDestinationSearch = async (
    value: string
  ) => {
    setDestinationQuery(value);
    setDestinationProductId("");

    const results =
      await searchProducts(value);

    setDestinationResults(results);
  };

  // ==============================
  // CREATE RULE
  // ==============================
  const handleCreateRule = async () => {
    if (isCreatingRule) {
      return;
    }

    if (!sourceProductId) {
      alert("Please select a source product");
      return;
    }

    if (!destinationProductId) {
      alert(
        "Please select a destination product"
      );
      return;
    }

    if (
      sourceProductId ===
      destinationProductId
    ) {
      alert(
        "Source and destination products must be different"
      );
      return;
    }

    const ratio =
      Number(conversionRatio);

    if (
      !Number.isInteger(ratio) ||
      ratio <= 0
    ) {
      alert(
        "Conversion ratio must be a positive whole number"
      );
      return;
    }

    setIsCreatingRule(true);

    try {
      const res = await fetch(
        "/api/inventory/break-bulk/rules",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            sourceProductId,
            destinationProductId,
            conversionRatio: ratio,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            "Unable to create Break Bulk rule"
        );
        return;
      }

      alert(
        "Break Bulk rule created successfully"
      );

      setSourceProductId("");
      setSourceQuery("");
      setSourceResults([]);

      setDestinationProductId("");
      setDestinationQuery("");
      setDestinationResults([]);

      setConversionRatio("");

      await loadRules();
    } catch {
      alert(
        "Unable to create Break Bulk rule"
      );
    } finally {
      setIsCreatingRule(false);
    }
  };

  // ==============================
  // START RATIO EDIT
  // ==============================
  const startEditingRatio = (
    rule: BreakBulkRule
  ) => {
    setEditingRuleId(rule.id);
    setEditingRatio(
      String(rule.conversionRatio)
    );
  };

  // ==============================
  // SAVE RATIO
  // ==============================
  const handleSaveRatio = async (
    ruleId: string
  ) => {
    const ratio =
      Number(editingRatio);

    if (
      !Number.isInteger(ratio) ||
      ratio <= 0
    ) {
      alert(
        "Conversion ratio must be a positive whole number"
      );
      return;
    }

    setUpdatingRuleId(ruleId);

    try {
      const res = await fetch(
        `/api/inventory/break-bulk/rules/${ruleId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            conversionRatio: ratio,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            "Unable to update conversion ratio"
        );
        return;
      }

      setEditingRuleId(null);
      setEditingRatio("");

      await loadRules();
    } catch {
      alert(
        "Unable to update conversion ratio"
      );
    } finally {
      setUpdatingRuleId(null);
    }
  };

  // ==============================
  // ACTIVATE / DEACTIVATE
  // ==============================
  const handleToggleRule = async (
    rule: BreakBulkRule
  ) => {
    setUpdatingRuleId(rule.id);

    try {
      const res = await fetch(
        `/api/inventory/break-bulk/rules/${rule.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            isActive: !rule.isActive,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            "Unable to update Break Bulk rule"
        );
        return;
      }

      if (
        selectedRuleId === rule.id &&
        rule.isActive
      ) {
        setSelectedRuleId(null);
        setSourceQuantity("");
        setConversionNote("");
      }

      await loadRules();
    } catch {
      alert(
        "Unable to update Break Bulk rule"
      );
    } finally {
      setUpdatingRuleId(null);
    }
  };

  // ==============================
  // EXECUTE BREAK BULK
  // ==============================
  const handleBreakBulk = async (
    rule: BreakBulkRule
  ) => {
    if (isConverting) {
      return;
    }

    const quantity =
      Number(sourceQuantity);

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      alert(
        "Break Bulk quantity must be a positive whole number"
      );
      return;
    }

    const destinationQuantity =
      quantity *
      rule.conversionRatio;

    const confirmed = window.confirm(
      `Confirm Break Bulk?\n\n` +
        `${quantity} × ${rule.sourceProduct.name}\n` +
        `will be converted into\n` +
        `${destinationQuantity} × ${rule.destinationProduct.name}`
    );

    if (!confirmed) {
      return;
    }

    setIsConverting(true);

    try {
      const res = await fetch(
        "/api/inventory/break-bulk",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            ruleId: rule.id,
            sourceQuantity: quantity,
            note: conversionNote,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            "Break Bulk conversion failed"
        );
        return;
      }

      alert(
        `Break Bulk completed successfully.\n\n` +
          `${data.source.quantityConverted} × ${data.source.name} converted.\n` +
          `${data.destination.quantityCreated} × ${data.destination.name} created.`
      );

      setSelectedRuleId(null);
      setSourceQuantity("");
      setConversionNote("");

      await loadRules();
    } catch {
      alert(
        "Break Bulk conversion failed"
      );
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Break Bulk Inventory
        </h1>

        <p className="text-sm text-gray-600 mt-1">
          Convert stock between configured
          packaging levels while keeping an
          auditable inventory trail.
        </p>
      </div>

      {/* ============================
          CREATE RULE
      ============================ */}
      <div className="border rounded-xl p-4 max-w-3xl">
        <h2 className="text-lg font-semibold mb-4">
          Create Break Bulk Rule
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Source Product
            </label>

            <input
              type="text"
              value={sourceQuery}
              onChange={(e) =>
                handleSourceSearch(
                  e.target.value
                )
              }
              placeholder="Search source product..."
              className="w-full border p-2 rounded-lg"
            />

            {sourceResults.length > 0 && (
              <div className="border rounded-lg mt-2 overflow-hidden">
                {sourceResults.map(
                  (product) => (
                    <button
                      type="button"
                      key={product.id}
                      onClick={() => {
                        setSourceProductId(
                          product.id
                        );
                        setSourceQuery(
                          product.name
                        );
                        setSourceResults([]);
                      }}
                      className="w-full text-left border-b last:border-b-0 p-3 hover:bg-gray-100"
                    >
                      <div className="font-medium">
                        {product.name}
                      </div>

                      {product.sku && (
                        <div className="text-xs text-gray-500">
                          SKU: {product.sku}
                        </div>
                      )}
                    </button>
                  )
                )}
              </div>
            )}

            {sourceProductId && (
              <div className="mt-2 text-sm text-green-700">
                Source product selected
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Destination Product
            </label>

            <input
              type="text"
              value={destinationQuery}
              onChange={(e) =>
                handleDestinationSearch(
                  e.target.value
                )
              }
              placeholder="Search destination product..."
              className="w-full border p-2 rounded-lg"
            />

            {destinationResults.length >
              0 && (
              <div className="border rounded-lg mt-2 overflow-hidden">
                {destinationResults.map(
                  (product) => (
                    <button
                      type="button"
                      key={product.id}
                      onClick={() => {
                        setDestinationProductId(
                          product.id
                        );
                        setDestinationQuery(
                          product.name
                        );
                        setDestinationResults(
                          []
                        );
                      }}
                      className="w-full text-left border-b last:border-b-0 p-3 hover:bg-gray-100"
                    >
                      <div className="font-medium">
                        {product.name}
                      </div>

                      {product.sku && (
                        <div className="text-xs text-gray-500">
                          SKU: {product.sku}
                        </div>
                      )}
                    </button>
                  )
                )}
              </div>
            )}

            {destinationProductId && (
              <div className="mt-2 text-sm text-green-700">
                Destination product selected
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Conversion Ratio
            </label>

            <input
              type="number"
              min="1"
              step="1"
              value={conversionRatio}
              onChange={(e) =>
                setConversionRatio(
                  e.target.value
                )
              }
              placeholder="Example: 12"
              className="w-full border p-2 rounded-lg"
            />

            <p className="text-xs text-gray-500 mt-1">
              Enter how many destination units
              are created from one source unit.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateRule}
            disabled={isCreatingRule}
            className="w-full bg-black text-white p-2 rounded-lg disabled:opacity-50"
          >
            {isCreatingRule
              ? "Creating..."
              : "Create Break Bulk Rule"}
          </button>
        </div>
      </div>

      {/* ============================
          EXISTING RULES
      ============================ */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Break Bulk Rules
        </h2>

        {isLoadingRules ? (
          <div className="border rounded-xl p-4">
            Loading rules...
          </div>
        ) : rules.length === 0 ? (
          <div className="border rounded-xl p-4 text-gray-600">
            No Break Bulk rules have been
            created yet.
          </div>
        ) : (
          <div className="space-y-4">
            {rules.map((rule) => {
              const isEditing =
                editingRuleId === rule.id;

              const isSelected =
                selectedRuleId === rule.id;

              const quantity =
                Number(sourceQuantity);

              const calculatedDestination =
                isSelected &&
                Number.isInteger(quantity) &&
                quantity > 0
                  ? quantity *
                    rule.conversionRatio
                  : 0;

              return (
                <div
                  key={rule.id}
                  className="border rounded-xl p-4 max-w-4xl"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500">
                          SOURCE
                        </div>

                        <div className="font-semibold">
                          {
                            rule.sourceProduct
                              .name
                          }
                        </div>

                        <div className="text-sm text-gray-600">
                          SKU:{" "}
                          {rule.sourceProduct
                            .sku || "—"}
                        </div>

                        <div className="text-sm">
                          Current stock:{" "}
                          <strong>
                            {
                              rule
                                .sourceProduct
                                .stockQty
                            }
                          </strong>
                        </div>
                      </div>

                      <div className="text-xl font-bold">
                        ↓
                      </div>

                      <div>
                        <div className="text-xs text-gray-500">
                          DESTINATION
                        </div>

                        <div className="font-semibold">
                          {
                            rule
                              .destinationProduct
                              .name
                          }
                        </div>

                        <div className="text-sm text-gray-600">
                          SKU:{" "}
                          {rule
                            .destinationProduct
                            .sku || "—"}
                        </div>

                        <div className="text-sm">
                          Current stock:{" "}
                          <strong>
                            {
                              rule
                                .destinationProduct
                                .stockQty
                            }
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="lg:text-right space-y-2">
                      <div>
                        <span
                          className={
                            rule.isActive
                              ? "inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                              : "inline-block px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-700"
                          }
                        >
                          {rule.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>

                      <div className="text-lg font-semibold">
                        1 source ={" "}
                        {
                          rule.conversionRatio
                        }{" "}
                        destination
                      </div>

                      <div className="text-sm text-gray-600">
                        Conversions recorded:{" "}
                        {
                          rule._count
                            .conversions
                        }
                      </div>
                    </div>
                  </div>

                  <div className="border-t mt-4 pt-4 space-y-4">
                    {/* EDIT RATIO */}
                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={
                            editingRatio
                          }
                          onChange={(e) =>
                            setEditingRatio(
                              e.target.value
                            )
                          }
                          className="border p-2 rounded-lg"
                          placeholder="New ratio"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            handleSaveRatio(
                              rule.id
                            )
                          }
                          disabled={
                            updatingRuleId ===
                            rule.id
                          }
                          className="bg-black text-white px-4 py-2 rounded-lg disabled:opacity-50"
                        >
                          Save Ratio
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingRuleId(
                              null
                            );
                            setEditingRatio(
                              ""
                            );
                          }}
                          className="border px-4 py-2 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            startEditingRatio(
                              rule
                            )
                          }
                          className="border px-4 py-2 rounded-lg hover:bg-gray-50"
                        >
                          Edit Ratio
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleRule(
                              rule
                            )
                          }
                          disabled={
                            updatingRuleId ===
                            rule.id
                          }
                          className="border px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                          {updatingRuleId ===
                          rule.id
                            ? "Updating..."
                            : rule.isActive
                              ? "Deactivate Rule"
                              : "Activate Rule"}
                        </button>

                        {rule.isActive && (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                selectedRuleId ===
                                rule.id
                              ) {
                                setSelectedRuleId(
                                  null
                                );
                                setSourceQuantity(
                                  ""
                                );
                                setConversionNote(
                                  ""
                                );
                              } else {
                                setSelectedRuleId(
                                  rule.id
                                );
                                setSourceQuantity(
                                  ""
                                );
                                setConversionNote(
                                  ""
                                );
                              }
                            }}
                            className="bg-black text-white px-4 py-2 rounded-lg"
                          >
                            {isSelected
                              ? "Cancel Break Bulk"
                              : "Break Bulk Stock"}
                          </button>
                        )}
                      </div>
                    )}

                    {/* EXECUTE CONVERSION */}
                    {isSelected &&
                      rule.isActive && (
                        <div className="border rounded-xl p-4 bg-gray-50 space-y-4">
                          <div>
                            <h3 className="font-semibold">
                              Perform Break Bulk
                            </h3>

                            <p className="text-sm text-gray-600">
                              Enter how many
                              source units you are
                              physically opening.
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Source Quantity
                            </label>

                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={
                                sourceQuantity
                              }
                              onChange={(e) =>
                                setSourceQuantity(
                                  e.target
                                    .value
                                )
                              }
                              className="w-full border p-2 rounded-lg bg-white"
                              placeholder="Example: 1"
                            />
                          </div>

                          {calculatedDestination >
                            0 && (
                            <div className="border rounded-lg p-3 bg-white">
                              <div className="text-sm text-gray-600">
                                This conversion
                                will:
                              </div>

                              <div className="font-medium mt-1">
                                Remove{" "}
                                {
                                  sourceQuantity
                                }{" "}
                                ×{" "}
                                {
                                  rule
                                    .sourceProduct
                                    .name
                                }
                              </div>

                              <div className="font-medium">
                                Add{" "}
                                {
                                  calculatedDestination
                                }{" "}
                                ×{" "}
                                {
                                  rule
                                    .destinationProduct
                                    .name
                                }
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Note
                              <span className="text-gray-500 font-normal">
                                {" "}
                                (optional)
                              </span>
                            </label>

                            <textarea
                              value={
                                conversionNote
                              }
                              onChange={(e) =>
                                setConversionNote(
                                  e.target
                                    .value
                                )
                              }
                              rows={3}
                              className="w-full border p-2 rounded-lg bg-white"
                              placeholder="Optional reason or reference..."
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleBreakBulk(
                                rule
                              )
                            }
                            disabled={
                              isConverting
                            }
                            className="w-full bg-black text-white p-2 rounded-lg disabled:opacity-50"
                          >
                            {isConverting
                              ? "Processing..."
                              : "Confirm Break Bulk"}
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}