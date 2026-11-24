import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolvePersistedWebsiteOrderLocations,
  type PersistedWebsiteOrderItem,
} from "../../../lib/inventory/websitePersistedAllocation";

const mainBranch = "test-main-branch";
const textileBranch = "test-textile-branch";

const legacyBook: PersistedWebsiteOrderItem = {
  id: "item-book",
  productId: "product-book",
  quantity: 2,
};

const legacySet: PersistedWebsiteOrderItem = {
  id: "item-set",
  productId: "product-set",
  quantity: 1,
  fulfillmentLocationId: null,
};

const newBook: PersistedWebsiteOrderItem = {
  ...legacyBook,
  fulfillmentLocationId: mainBranch,
};

const newBlanket: PersistedWebsiteOrderItem = {
  id: "item-blanket",
  productId: "product-blanket",
  quantity: 3,
  fulfillmentLocationId: textileBranch,
};

describe("Persisted website order allocations", () => {
  it("preserves the original branch for legacy orders", () => {
    const result = resolvePersistedWebsiteOrderLocations(
      mainBranch,
      [legacyBook, legacySet]
    );

    expect(result).toHaveLength(2);
    expect(result.every(
      (item) => item.locationId === mainBranch
    )).toBe(true);
  });

  it("resolves a new mixed order item by item", () => {
    const result = resolvePersistedWebsiteOrderLocations(
      mainBranch,
      [newBook, newBlanket]
    );

    expect(result.map(
      (item) => item.locationId
    )).toEqual([mainBranch, textileBranch]);
  });

  it("does not override item allocations with Order.locationId", () => {
    const result = resolvePersistedWebsiteOrderLocations(
      "unrelated-order-location",
      [newBlanket]
    );

    expect(result[0].locationId).toBe(textileBranch);
  });

  it("allows a fully allocated order without a legacy location", () => {
    const result = resolvePersistedWebsiteOrderLocations(
      null,
      [newBook, newBlanket]
    );

    expect(result).toHaveLength(2);
  });

  it("rejects partially allocated orders", () => {
    expect(() =>
      resolvePersistedWebsiteOrderLocations(
        mainBranch,
        [newBook, legacySet]
      )
    ).toThrow("incomplete item-level allocations");
  });

  it("rejects legacy orders missing their branch", () => {
    expect(() =>
      resolvePersistedWebsiteOrderLocations(
        null,
        [legacyBook]
      )
    ).toThrow("Legacy order has no supplying branch");
  });

  it("rejects blank explicitly allocated branch IDs", () => {
    expect(() =>
      resolvePersistedWebsiteOrderLocations(
        mainBranch,
        [{
          ...newBook,
          fulfillmentLocationId: " ",
        }]
      )
    ).toThrow("no valid supplying branch");
  });

  it("rejects invalid item quantities", () => {
    for (const quantity of [0, -1, 1.5]) {
      expect(() =>
        resolvePersistedWebsiteOrderLocations(
          mainBranch,
          [{ ...legacyBook, quantity }]
        )
      ).toThrow("Invalid persisted order item quantity");
    }
  });

  it("rejects duplicate order item identifiers", () => {
    expect(() =>
      resolvePersistedWebsiteOrderLocations(
        mainBranch,
        [legacyBook, legacyBook]
      )
    ).toThrow("Duplicate persisted order item ID");
  });

  it("rejects orders without items", () => {
    expect(() =>
      resolvePersistedWebsiteOrderLocations(
        mainBranch,
        []
      )
    ).toThrow("Order has no items");
  });
});
