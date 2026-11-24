import {
  describe,
  expect,
  it,
} from "vitest";

import {
  validateWebsiteAllocationStock,
  type WebsiteStockRecord,
} from "../../../lib/inventory/websiteAllocationStock";

import type {
  WebsiteAllocatedItem,
} from "../../../lib/inventory/websiteOrderAllocation";

const mainBranch = "test-main";
const textileBranch = "test-textiles";

const textbook: WebsiteAllocatedItem = {
  productId: "product-book",
  sku: "TEST-BOOK",
  quantity: 2,
  locationType: "BRANCH",
  locationId: mainBranch,
};

const blanket: WebsiteAllocatedItem = {
  productId: "product-blanket",
  sku: "TEST-BLANKET",
  quantity: 3,
  locationType: "BRANCH",
  locationId: textileBranch,
};

const inventory: WebsiteStockRecord[] = [
  {
    productId: "product-book",
    locationType: "BRANCH",
    locationId: mainBranch,
    quantity: 12,
  },
  {
    productId: "product-blanket",
    locationType: "BRANCH",
    locationId: textileBranch,
    quantity: 8,
  },
];

describe("Website mixed-order stock validation", () => {
  it("accepts sufficient stock at both assigned branches", () => {
    const result = validateWebsiteAllocationStock(
      [textbook, blanket],
      inventory
    );

    expect(result).toEqual([
      {
        productId: "product-book",
        locationId: mainBranch,
        requestedQuantity: 2,
        availableQuantity: 12,
      },
      {
        productId: "product-blanket",
        locationId: textileBranch,
        requestedQuantity: 3,
        availableQuantity: 8,
      },
    ]);
  });

  it("rejects insufficient stock at the textile branch", () => {
    expect(() =>
      validateWebsiteAllocationStock(
        [{ ...blanket, quantity: 9 }],
        inventory
      )
    ).toThrow("Insufficient stock");
  });

  it("does not borrow stock from the main branch", () => {
    const records: WebsiteStockRecord[] = [
      {
        productId: blanket.productId,
        locationType: "BRANCH",
        locationId: mainBranch,
        quantity: 100,
      },
      {
        productId: blanket.productId,
        locationType: "BRANCH",
        locationId: textileBranch,
        quantity: 1,
      },
    ];

    expect(() =>
      validateWebsiteAllocationStock(
        [blanket],
        records
      )
    ).toThrow("Insufficient stock");
  });

  it("does not count warehouse stock as branch stock", () => {
    expect(() =>
      validateWebsiteAllocationStock(
        [blanket],
        [{
          productId: blanket.productId,
          locationType: "WAREHOUSE",
          locationId: textileBranch,
          quantity: 50,
        }]
      )
    ).toThrow("Insufficient stock");
  });

  it("treats missing inventory as unavailable", () => {
    expect(() =>
      validateWebsiteAllocationStock(
        [textbook],
        []
      )
    ).toThrow("Insufficient stock");
  });

  it("rejects negative or fractional inventory quantities", () => {
    for (const quantity of [-1, 2.5]) {
      expect(() =>
        validateWebsiteAllocationStock(
          [textbook],
          [{
            ...inventory[0],
            quantity,
          }]
        )
      ).toThrow("Invalid inventory record");
    }
  });

  it("rejects duplicate records for the same exact location", () => {
    expect(() =>
      validateWebsiteAllocationStock(
        [textbook],
        [inventory[0], inventory[0]]
      )
    ).toThrow("Duplicate inventory location record");
  });

  it("rejects duplicate order-product allocations", () => {
    expect(() =>
      validateWebsiteAllocationStock(
        [textbook, textbook],
        inventory
      )
    ).toThrow("Duplicate product allocation");
  });

  it("rejects invalid order quantities", () => {
    expect(() =>
      validateWebsiteAllocationStock(
        [{ ...textbook, quantity: 0 }],
        inventory
      )
    ).toThrow("Invalid website order allocation");
  });

  it("rejects an empty order", () => {
    expect(() =>
      validateWebsiteAllocationStock(
        [],
        inventory
      )
    ).toThrow("An order must contain items");
  });
});
