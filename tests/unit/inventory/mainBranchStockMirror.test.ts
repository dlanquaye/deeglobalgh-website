import {
  describe,
  expect,
  it,
} from "vitest";

import { LocationType } from "@prisma/client";

import {
  DEEGLOBALGH_MAIN_BRANCH_ID,
  isMainBranchStockMirrorLocation,
} from "../../../lib/inventory/mainBranchStockMirror";

describe("DeeGlobalGH main branch stock mirror", () => {
  it("recognises the established main branch", () => {
    expect(
      isMainBranchStockMirrorLocation(
        LocationType.BRANCH,
        DEEGLOBALGH_MAIN_BRANCH_ID
      )
    ).toBe(true);
  });

  it("rejects another retail branch", () => {
    expect(
      isMainBranchStockMirrorLocation(
        LocationType.BRANCH,
        "second-branch"
      )
    ).toBe(false);
  });

  it("rejects warehouse inventory", () => {
    expect(
      isMainBranchStockMirrorLocation(
        LocationType.WAREHOUSE,
        "cmq4b5g1j0001g3jgy501zz76"
      )
    ).toBe(false);
  });

  it("does not treat a warehouse with the same ID as a branch", () => {
    expect(
      isMainBranchStockMirrorLocation(
        LocationType.WAREHOUSE,
        DEEGLOBALGH_MAIN_BRANCH_ID
      )
    ).toBe(false);
  });

  it("rejects an empty branch identifier", () => {
    expect(
      isMainBranchStockMirrorLocation(
        LocationType.BRANCH,
        ""
      )
    ).toBe(false);
  });
});