import {
  describe,
  expect,
  it,
} from "vitest";

import {
  canAdjustInventoryAtLocation,
  validateAdjustmentLocation,
} from "../../../lib/inventory/adjustmentLocation";

describe("DeeGlobalGH inventory location validation", () => {
  it("accepts a specific branch ID", () => {
    expect(
      validateAdjustmentLocation({
        locationType: "BRANCH",
        locationId: "branch-main",
      })
    ).toEqual({
      valid: true,
      locationType: "BRANCH",
      locationId: "branch-main",
    });
  });

  it("accepts a specific warehouse ID", () => {
    expect(
      validateAdjustmentLocation({
        locationType: "WAREHOUSE",
        locationId: "warehouse-existing",
      }).valid
    ).toBe(true);
  });

  it("rejects a missing location ID", () => {
    expect(
      validateAdjustmentLocation({
        locationType: "BRANCH",
        locationId: "",
      }).valid
    ).toBe(false);
  });

  it("rejects invalid location types", () => {
    expect(
      validateAdjustmentLocation({
        locationType: "UNKNOWN",
        locationId: "somewhere",
      }).valid
    ).toBe(false);
  });

  it("rejects whitespace-only IDs", () => {
    expect(
      validateAdjustmentLocation({
        locationType: "BRANCH",
        locationId: "   ",
      }).valid
    ).toBe(false);
  });
});

describe("DeeGlobalGH inventory adjustment permissions", () => {
  const base = {
    isActive: true,
    staffBranchId: "branch-main",
    locationType: "BRANCH" as const,
    locationId: "branch-main",
  };

  it("allows a manager to adjust their own branch", () => {
    expect(
      canAdjustInventoryAtLocation({
        ...base,
        role: "MANAGER",
      })
    ).toBe(true);
  });

  it("blocks managers from adjusting another branch", () => {
    expect(
      canAdjustInventoryAtLocation({
        ...base,
        role: "MANAGER",
        locationId: "branch-textiles",
      })
    ).toBe(false);
  });

  it("blocks warehouse managers from branch adjustments", () => {
    expect(
      canAdjustInventoryAtLocation({
        ...base,
        role: "WAREHOUSE_MANAGER",
      })
    ).toBe(false);
  });

  it("allows warehouse managers to manage warehouse stock", () => {
    expect(
      canAdjustInventoryAtLocation({
        ...base,
        role: "WAREHOUSE_MANAGER",
        locationType: "WAREHOUSE",
        locationId: "warehouse-existing",
      })
    ).toBe(true);
  });

  it("blocks branch managers from warehouse adjustments", () => {
    expect(
      canAdjustInventoryAtLocation({
        ...base,
        role: "MANAGER",
        locationType: "WAREHOUSE",
        locationId: "warehouse-existing",
      })
    ).toBe(false);
  });

  it("allows an active super admin to select either location", () => {
    for (const locationType of [
      "BRANCH",
      "WAREHOUSE",
    ] as const) {
      expect(
        canAdjustInventoryAtLocation({
          ...base,
          role: "SUPER_ADMIN",
          locationType,
        })
      ).toBe(true);
    }
  });

  it("blocks inactive staff", () => {
    expect(
      canAdjustInventoryAtLocation({
        ...base,
        role: "MANAGER",
        isActive: false,
      })
    ).toBe(false);
  });

  it("blocks unknown staff roles", () => {
    expect(
      canAdjustInventoryAtLocation({
        ...base,
        role: "CASHIER",
      })
    ).toBe(false);
  });

  it("blocks managers without a branch assignment", () => {
    expect(
      canAdjustInventoryAtLocation({
        ...base,
        role: "MANAGER",
        staffBranchId: null,
      })
    ).toBe(false);
  });
});
