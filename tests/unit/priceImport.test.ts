import { describe, expect, it } from "vitest";

import {
  preparePriceImport,
} from "@/lib/product-sync/price-import";

describe("price import validation", () => {
  it("accepts a valid retail-price-only update", () => {
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

  it("accepts a valid cost-price-only update", () => {
    const result = preparePriceImport([
      {
        existingId: "wise-ant-biology",
        costPrice: 180,
      },
    ]);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.syncItems).toEqual([
      {
        action: "UPDATE",
        existingId: "wise-ant-biology",
        product: {
          costPrice: 180,
        },
      },
    ]);
  });

  it("accepts a valid wholesale-price-only update", () => {
    const result = preparePriceImport([
      {
        existingId: "wise-ant-biology",
        wholesalePrice: 225,
      },
    ]);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.syncItems).toEqual([
      {
        action: "UPDATE",
        existingId: "wise-ant-biology",
        product: {
          wholesalePrice: 225,
        },
      },
    ]);
  });

  it("accepts cost and wholesale prices without resending retail price", () => {
    const result = preparePriceImport([
      {
        existingId: "best-brain-social-studies",
        costPrice: 100,
        wholesalePrice: 117,
      },
    ]);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.syncItems).toEqual([
      {
        action: "UPDATE",
        existingId: "best-brain-social-studies",
        product: {
          costPrice: 100,
          wholesalePrice: 117,
        },
      },
    ]);

    expect(
      result.syncItems[0].product
    ).not.toHaveProperty("retailPrice");
  });

  it("accepts all three commercial price fields", () => {
    const result = preparePriceImport([
      {
        existingId: "wise-ant-biology",
        costPrice: 180,
        wholesalePrice: 225,
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
          costPrice: 180,
          wholesalePrice: 225,
          retailPrice: 250,
        },
      },
    ]);
  });

  it("ignores blank optional commercial price fields", () => {
    const result = preparePriceImport([
      {
        existingId: "wise-ant-biology",
        costPrice: "",
        wholesalePrice: 225,
        retailPrice: "",
      },
    ]);

    expect(result.valid).toBe(true);
    expect(result.syncItems).toEqual([
      {
        action: "UPDATE",
        existingId: "wise-ant-biology",
        product: {
          wholesalePrice: 225,
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
        costPrice: 180,
      },
      {
        existingId: "wise-ant-physics",
        wholesalePrice: 225,
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

  it("rejects a row with no commercial price supplied", () => {
    const result = preparePriceImport([
      {
        existingId: "wise-ant-biology",
        costPrice: "",
        wholesalePrice: "",
        retailPrice: "",
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.syncItems).toEqual([]);
    expect(result.errors[0]).toContain(
      "At least one of Cost Price, Wholesale Price, or Retail Price is required"
    );
  });

  it("rejects zero and negative prices", () => {
    for (const price of [0, -10]) {
      const result = preparePriceImport([
        {
          existingId: "wise-ant-biology",
          costPrice: price,
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
          wholesalePrice: price,
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
        costPrice: 180,
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
        costPrice: "",
        wholesalePrice: "",
        retailPrice: "",
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.syncItems).toEqual([]);
  });
});
