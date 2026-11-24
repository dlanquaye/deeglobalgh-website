import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  LocationType,
} from "@prisma/client";

import {
  DEEGLOBALGH_MAIN_BRANCH_ID,
} from "../../../lib/inventory/mainBranchStockMirror";

const { transactionMock } = vi.hoisted(() => ({
  transactionMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: transactionMock,
  },
}));

import {
  transferInventory,
} from "../../../lib/inventory/transfer";

const MAIN = DEEGLOBALGH_MAIN_BRANCH_ID;
const SECOND = "second-branch";
const WAREHOUSE = "warehouse-1";

function createTx(
  sourceQuantity: number,
  destinationQuantity: number,
  remainingMainQuantity?: number
) {
  const inventoryFindUnique = vi.fn()
    .mockResolvedValueOnce({
      id: "source-inventory",
      quantity: sourceQuantity,
    });

  if (remainingMainQuantity !== undefined) {
    inventoryFindUnique.mockResolvedValueOnce({
      quantity: remainingMainQuantity,
    });
  }

  return {
    inventory: {
      findUnique: inventoryFindUnique,
      updateMany: vi.fn().mockResolvedValue({
        count: 1,
      }),
      upsert: vi.fn().mockResolvedValue({
        id: "destination-inventory",
        quantity: destinationQuantity,
      }),
    },
    product: {
      update: vi.fn().mockResolvedValue({}),
    },
    stockMovement: {
      create: vi.fn().mockResolvedValue({
        id: "movement-1",
      }),
    },
  };
}

describe("Multi-branch transfer stock mirror protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not change main stock when warehouse supplies another branch", async () => {
    const tx = createTx(20, 8);

    transactionMock.mockImplementation(
      async (callback) => callback(tx)
    );

    await transferInventory({
      productId: "product-1",
      fromLocationType: LocationType.WAREHOUSE,
      fromLocationId: WAREHOUSE,
      toLocationType: LocationType.BRANCH,
      toLocationId: SECOND,
      quantity: 2,
      createdByStaffId: "staff-1",
    });

    expect(tx.product.update).not.toHaveBeenCalled();
    expect(tx.stockMovement.create).toHaveBeenCalledTimes(1);
  });

  it("does not change main stock when another branch sends stock to warehouse", async () => {
    const tx = createTx(10, 12);

    transactionMock.mockImplementation(
      async (callback) => callback(tx)
    );

    await transferInventory({
      productId: "product-1",
      fromLocationType: LocationType.BRANCH,
      fromLocationId: SECOND,
      toLocationType: LocationType.WAREHOUSE,
      toLocationId: WAREHOUSE,
      quantity: 2,
      createdByStaffId: "staff-1",
    });

    expect(tx.product.update).not.toHaveBeenCalled();
  });

  it("uses remaining main-branch stock when transferring to another branch", async () => {
    const tx = createTx(15, 7, 12);

    transactionMock.mockImplementation(
      async (callback) => callback(tx)
    );

    await transferInventory({
      productId: "product-1",
      fromLocationType: LocationType.BRANCH,
      fromLocationId: MAIN,
      toLocationType: LocationType.BRANCH,
      toLocationId: SECOND,
      quantity: 3,
      createdByStaffId: "staff-1",
    });

    expect(tx.product.update).toHaveBeenCalledWith({
      where: {
        id: "product-1",
      },
      data: {
        stockQty: 12,
      },
    });

    expect(tx.product.update).toHaveBeenCalledTimes(1);
  });

  it("uses updated main-branch stock when receiving from another branch", async () => {
    const tx = createTx(10, 23);

    transactionMock.mockImplementation(
      async (callback) => callback(tx)
    );

    await transferInventory({
      productId: "product-1",
      fromLocationType: LocationType.BRANCH,
      fromLocationId: SECOND,
      toLocationType: LocationType.BRANCH,
      toLocationId: MAIN,
      quantity: 3,
      createdByStaffId: "staff-1",
    });

    expect(tx.product.update).toHaveBeenCalledWith({
      where: {
        id: "product-1",
      },
      data: {
        stockQty: 23,
      },
    });

    expect(tx.product.update).toHaveBeenCalledTimes(1);
  });
});