import {
  describe,
  expect,
  it,
} from "vitest";

import {
  planWebsiteOrderAllocations,
} from "../../../lib/inventory/websiteOrderAllocation";

const mainId = "test-main-branch";
const textilesId = "test-textiles-branch";

const locations = {
  mainBranchId: mainId,
  textilesBranchId: textilesId,
  verifiedBranchIds: [mainId, textilesId],
};

const assignments = {
  "TEST-BLANKET": "TEXTILES_BRANCH" as const,
  "TEST-BEDSHEET": "TEXTILES_BRANCH" as const,
};

const textbook = {
  productId: "product-book",
  sku: "TEST-BOOK",
  categorySlug: "textbooks",
  quantity: 1,
};

const blanket = {
  productId: "product-blanket",
  sku: "TEST-BLANKET",
  categorySlug: "boarding-essentials",
  quantity: 2,
};

describe("DeeGlobalGH mixed website order allocation", () => {
  it("allocates textbook and blanket to separate branches", () => {
    const result = planWebsiteOrderAllocations(
      [textbook, blanket],
      assignments,
      locations
    );

    expect(result).toEqual([
      {
        productId: "product-book",
        sku: "TEST-BOOK",
        quantity: 1,
        locationType: "BRANCH",
        locationId: mainId,
      },
      {
        productId: "product-blanket",
        sku: "TEST-BLANKET",
        quantity: 2,
        locationType: "BRANCH",
        locationId: textilesId,
      },
    ]);
  });

  it("keeps unassigned products at the main shop", () => {
    const result = planWebsiteOrderAllocations(
      [textbook],
      assignments,
      locations
    );

    expect(result[0].locationId).toBe(mainId);
  });

  it("does not route all boarding essentials to textiles", () => {
    const result = planWebsiteOrderAllocations(
      [{
        productId: "product-chopbox",
        sku: "TEST-CHOPBOX",
        categorySlug: "boarding-essentials",
        quantity: 1,
      }],
      assignments,
      locations
    );

    expect(result[0].locationId).toBe(mainId);
  });

  it("refuses textile allocation when its branch is not configured", () => {
    expect(() =>
      planWebsiteOrderAllocations(
        [blanket],
        assignments,
        {
          mainBranchId: mainId,
          verifiedBranchIds: [mainId],
        }
      )
    ).toThrow(
      "Required website supplying branch is not configured."
    );
  });

  it("refuses an unverified textile branch", () => {
    expect(() =>
      planWebsiteOrderAllocations(
        [blanket],
        assignments,
        {
          mainBranchId: mainId,
          textilesBranchId: textilesId,
          verifiedBranchIds: [mainId],
        }
      )
    ).toThrow(
      "Website supplying branch has not been verified."
    );
  });

  it("refuses an unverified main branch", () => {
    expect(() =>
      planWebsiteOrderAllocations(
        [textbook],
        assignments,
        {
          mainBranchId: mainId,
          textilesBranchId: textilesId,
          verifiedBranchIds: [textilesId],
        }
      )
    ).toThrow(
      "Website supplying branch has not been verified."
    );
  });

  it("rejects zero and fractional quantities", () => {
    for (const quantity of [0, -1, 1.5]) {
      expect(() =>
        planWebsiteOrderAllocations(
          [{ ...textbook, quantity }],
          assignments,
          locations
        )
      ).toThrow("Invalid order quantity");
    }
  });

  it("rejects duplicate product entries", () => {
    expect(() =>
      planWebsiteOrderAllocations(
        [textbook, textbook],
        assignments,
        locations
      )
    ).toThrow("Duplicate product in order");
  });

  it("rejects an empty order", () => {
    expect(() =>
      planWebsiteOrderAllocations(
        [],
        assignments,
        locations
      )
    ).toThrow("Order must contain at least one item.");
  });
});
