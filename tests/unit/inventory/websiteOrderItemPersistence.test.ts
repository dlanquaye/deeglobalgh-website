import {
  describe,
  expect,
  it,
} from "vitest";

import {
  prepareAllocatedWebsiteOrderItems,
} from "../../../lib/inventory/websiteOrderItemPersistence";

import type {
  WebsiteAllocatedItem,
} from "../../../lib/inventory/websiteOrderAllocation";

const book = {
  productId: "product-book",
  quantity: 2,
  unitPriceGhs: 60,
  totalPriceGhs: 120,
};

const blanket = {
  productId: "product-blanket",
  quantity: 1,
  unitPriceGhs: 85,
  totalPriceGhs: 85,
};

const bookAllocation: WebsiteAllocatedItem = {
  productId: "product-book",
  sku: "TEST-BOOK",
  quantity: 2,
  locationType: "BRANCH",
  locationId: "main-branch",
};

const blanketAllocation: WebsiteAllocatedItem = {
  productId: "product-blanket",
  sku: "TEST-BLANKET",
  quantity: 1,
  locationType: "BRANCH",
  locationId: "textiles-branch",
};

describe("Website order-item persistence preparation", () => {
  it("records separate supplying branches on mixed items", () => {
    const result = prepareAllocatedWebsiteOrderItems(
      [book, blanket],
      [bookAllocation, blanketAllocation]
    );

    expect(result.map(
      (item) => item.fulfillmentLocationId
    )).toEqual(["main-branch", "textiles-branch"]);
  });

  it("preserves prices and quantities exactly", () => {
    const result = prepareAllocatedWebsiteOrderItems(
      [book],
      [bookAllocation]
    );

    expect(result[0]).toEqual({
      ...book,
      fulfillmentLocationId: "main-branch",
    });
  });

  it("matches products by ID, not array position", () => {
    const result = prepareAllocatedWebsiteOrderItems(
      [book, blanket],
      [blanketAllocation, bookAllocation]
    );

    expect(result[0].fulfillmentLocationId).toBe("main-branch");
    expect(result[1].fulfillmentLocationId).toBe("textiles-branch");
  });

  it("rejects an item missing its allocation", () => {
    expect(() =>
      prepareAllocatedWebsiteOrderItems(
        [book, blanket],
        [bookAllocation]
      )
    ).toThrow("Missing supplying-branch allocation");
  });

  it("rejects unexpected extra allocations", () => {
    expect(() =>
      prepareAllocatedWebsiteOrderItems(
        [book],
        [bookAllocation, blanketAllocation]
      )
    ).toThrow("Unexpected supplying-branch allocations");
  });

  it("rejects duplicate allocations", () => {
    expect(() =>
      prepareAllocatedWebsiteOrderItems(
        [book],
        [bookAllocation, bookAllocation]
      )
    ).toThrow("Duplicate product allocation");
  });

  it("rejects duplicate prepared products", () => {
    expect(() =>
      prepareAllocatedWebsiteOrderItems(
        [book, book],
        [bookAllocation]
      )
    ).toThrow("Duplicate prepared order product");
  });

  it("rejects mismatched allocation quantities", () => {
    expect(() =>
      prepareAllocatedWebsiteOrderItems(
        [book],
        [{
          ...bookAllocation,
          quantity: 3,
        }]
      )
    ).toThrow("Allocation quantity mismatch");
  });

  it("rejects invalid supplying branches", () => {
    expect(() =>
      prepareAllocatedWebsiteOrderItems(
        [book],
        [{
          ...bookAllocation,
          locationId: " ",
        }]
      )
    ).toThrow("Invalid supplying-branch allocation");
  });

  it("rejects empty orders", () => {
    expect(() =>
      prepareAllocatedWebsiteOrderItems(
        [],
        []
      )
    ).toThrow("Order must contain items");
  });
});