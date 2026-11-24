import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveWebsiteStockSource,
  type WebsiteStockAssignments,
} from "../../../lib/inventory/websiteStockRouting";

describe("DeeGlobalGH website stock routing", () => {
  const assignments: WebsiteStockAssignments = {
    "TEST-BLANKET-001": "TEXTILES_BRANCH",
    "TEST-TOWEL-001": "TEXTILES_BRANCH",
    "TEST-CHOPBOX-001": "MAIN_SHOP",
  };

  it("routes an explicitly assigned blanket to textiles", () => {
    expect(
      resolveWebsiteStockSource(
        {
          sku: "TEST-BLANKET-001",
          categorySlug: "boarding-essentials",
        },
        assignments
      )
    ).toBe("TEXTILES_BRANCH");
  });

  it("keeps a chop box in the main shop", () => {
    expect(
      resolveWebsiteStockSource(
        {
          sku: "TEST-CHOPBOX-001",
          categorySlug: "boarding-essentials",
        },
        assignments
      )
    ).toBe("MAIN_SHOP");
  });

  it("does not route every boarding essential to textiles", () => {
    expect(
      resolveWebsiteStockSource(
        {
          sku: "TEST-TRUNK-001",
          categorySlug: "boarding-essentials",
        },
        assignments
      )
    ).toBe("MAIN_SHOP");
  });

  it("preserves the main-shop default for textbooks", () => {
    expect(
      resolveWebsiteStockSource(
        {
          sku: "TXT-EXL-ENG-0010",
          categorySlug: "textbooks",
        },
        assignments
      )
    ).toBe("MAIN_SHOP");
  });

  it("normalises SKU case and surrounding spaces", () => {
    expect(
      resolveWebsiteStockSource(
        {
          sku: " test-towel-001 ",
          categorySlug: "boarding-essentials",
        },
        assignments
      )
    ).toBe("TEXTILES_BRANCH");
  });

  it("rejects missing product SKUs", () => {
    expect(() =>
      resolveWebsiteStockSource(
        {
          sku: " ",
          categorySlug: "boarding-essentials",
        },
        assignments
      )
    ).toThrow("A valid product SKU is required.");
  });

  it("rejects invalid explicit assignments", () => {
    expect(() =>
      resolveWebsiteStockSource(
        {
          sku: "TEST-INVALID",
          categorySlug: "boarding-essentials",
        },
        {
          "TEST-INVALID": "UNKNOWN",
        } as unknown as WebsiteStockAssignments
      )
    ).toThrow("Invalid website stock assignment");
  });
});
