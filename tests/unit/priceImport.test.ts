import { describe, expect, it } from "vitest";

import {
  preparePriceImport,
} from "@/lib/product-sync/price-import";

describe("price import validation", () => {
  it("accepts a valid price-only update", () => {
    const result = preparePriceImport([
      {
        existingId: "wise-ant-biology",
        retailPrice: 250,
      },
    ]);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.syncItems).toEqual([
      {
        action: "UPDATE",
        existingId: "wise-ant-biology",
        product: {
          retailPrice: 250,
        },
      },
    ]);
  });

  it("accepts multiple valid price updates", () => {
    const result = preparePriceImport([
      {
        existingId: "wise-ant-biology",
        retailPrice: 250,
      },
      {
        existingId: "wise-ant-chemistry",
        retailPrice: 250,
      },
      {
        existingId: "wise-ant-physics",
        retailPrice: 250,
      },
    ]);

    expect(result.valid).toBe(true);
    expect(result.syncItems).toHaveLength(3);
    expect(result.errors).toEqual([]);
  });

  it("rejects an unmatched product", () => {
    const result = preparePriceImport([
      {
        retailPrice: 250,
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.syncItems).toEqual([]);
    expect(result.errors[0]).toContain(
      "Existing product match required"
    );
  });

  it("rejects missing retail prices", () => {
    const result = preparePriceImport([
      {
        existingId: "wise-ant-biology",
        retailPrice: "",
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.syncItems).toEqual([]);
  });

  it("rejects zero and negative prices", () => {
    for (const price of [0, -10]) {
      const result = preparePriceImport([
        {
          existingId: "wise-ant-biology",
          retailPrice: price,
        },
      ]);

      expect(result.valid).toBe(false);
      expect(result.syncItems).toEqual([]);
    }
  });

  it("rejects non-numeric and non-finite prices", () => {
    for (const price of ["invalid", "Infinity", NaN]) {
      const result = preparePriceImport([
        {
          existingId: "wise-ant-biology",
          retailPrice: price,
        },
      ]);

      expect(result.valid).toBe(false);
      expect(result.syncItems).toEqual([]);
    }
  });

  it("rejects prices with more than two decimal places", () => {
    const result = preparePriceImport([
      {
        existingId: "wise-ant-biology",
        retailPrice: 250.123,
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.syncItems).toEqual([]);
  });

  it("rejects duplicate product IDs", () => {
    const result = preparePriceImport([
      {
        existingId: "wise-ant-biology",
        retailPrice: 250,
      },
      {
        existingId: "wise-ant-biology",
        retailPrice: 260,
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.syncItems).toEqual([]);
    expect(result.errors[0]).toContain(
      "Duplicate product"
    );
  });

  it("rejects an empty import", () => {
    const result = preparePriceImport([]);

    expect(result.valid).toBe(false);
    expect(result.syncItems).toEqual([]);
  });

  it("rejects the entire batch when any row is invalid", () => {
    const result = preparePriceImport([
      {
        existingId: "wise-ant-biology",
        retailPrice: 250,
      },
      {
        existingId: "wise-ant-chemistry",
        retailPrice: "",
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.syncItems).toEqual([]);
  });
});
