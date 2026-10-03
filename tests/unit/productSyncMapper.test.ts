import { describe, expect, it } from "vitest";

import {
  buildProductCreate,
  buildProductUpdate,
} from "@/lib/product-sync/mapper";
import type { SyncItem } from "@/lib/product-sync/types";

describe("product sync mapper", () => {
  it("canonicalises brand when building an UPDATE payload", () => {
    const item: SyncItem = {
      action: "UPDATE",
      existingId: "product-1",
      product: {
        name: "Don Mathematics Basic 4",
        brand: "Don Series",
        retailPrice: 45,
      },
    };

    const update = buildProductUpdate(item);

    expect(update.brand).toBe("Don");
    expect(update.name).toBe("Don Mathematics Basic 4");
    expect(update.retailPrice).toBe(45);
  });

  it("canonicalises brand when building a CREATE payload", () => {
    const item: SyncItem = {
      action: "INSERT",
      product: {
        sku: "TEST-001",
        name: "Excellence Test Product",
        brand: "Excellence Series",
        retailPrice: 50,
      },
    };

    const create = buildProductCreate(item);

    expect(create.brand).toBe("Excellence");
    expect(create.sku).toBe("TEST-001");
    expect(create.name).toBe("Excellence Test Product");
    expect(create.retailPrice).toBe(50);
  });

  it("preserves Generic at the mapper boundary", () => {
    const item: SyncItem = {
      action: "UPDATE",
      existingId: "product-2",
      product: {
        name: "Unidentified Product",
        brand: "Generic",
      },
    };

    const update = buildProductUpdate(item);

    expect(update.brand).toBe("Generic");
  });

  it("preserves unknown identities instead of guessing", () => {
    const item: SyncItem = {
      action: "INSERT",
      product: {
        sku: "TEST-002",
        name: "Future Product",
        brand: "Future Books",
      },
    };

    const create = buildProductCreate(item);

    expect(create.brand).toBe("Future Books");
  });

  it("does not mutate the original SyncItem product", () => {
    const item: SyncItem = {
      action: "UPDATE",
      existingId: "product-3",
      product: {
        name: "Akrong Mathematics",
        brand: "Akrong Series",
      },
    };

    const update = buildProductUpdate(item);

    expect(update.brand).toBe("Akrong");
    expect(item.product.brand).toBe("Akrong Series");
  });

  it("still excludes fields not approved for UPDATE by governance", () => {
    const item: SyncItem = {
      action: "UPDATE",
      existingId: "product-4",
      product: {
        name: "Protected Product",
        brand: "Don Series",
        id: "must-not-be-written",
        createdAt: "must-not-be-written",
        updatedAt: "must-not-be-written",
      },
    };

    const update = buildProductUpdate(item);

    expect(update.brand).toBe("Don");
    expect(update).not.toHaveProperty("id");
    expect(update).not.toHaveProperty("createdAt");
    expect(update).not.toHaveProperty("updatedAt");
  });
});
