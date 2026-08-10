import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  LocationType,
  MovementType,
} from "@prisma/client";

const {
  transactionMock,
  applyStockMovementMock,
} = vi.hoisted(() => ({
  transactionMock: vi.fn(),
  applyStockMovementMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: transactionMock,
  },
}));

vi.mock("@/lib/stock", () => ({
  applyStockMovement:
    applyStockMovementMock,
}));

import { breakBulkInventory } from "@/lib/inventory/breakBulk";

function createTransactionClient() {
  return {
    breakBulkRule: {
      findUnique: vi.fn(),
    },

    inventory: {
      findUnique: vi.fn(),
    },

    stockMovement: {
      create: vi.fn(),
    },

    product: {
      update: vi.fn(),
    },

    breakBulkConversion: {
      create: vi.fn(),
    },
  };
}

const activeRule = {
  id: "rule-1",
  sourceProductId: "source-product",
  destinationProductId:
    "destination-product",
  conversionRatio: 20,
  isActive: true,

  sourceProduct: {
    id: "source-product",
    sku: "TEST-CARTON",
    name: "Test Carton",
    isActive: true,
  },

  destinationProduct: {
    id: "destination-product",
    sku: "TEST-BOX",
    name: "Test Box",
    isActive: true,
  },
};

describe("breakBulkInventory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(
    "converts source stock into destination stock and records a complete audit trail",
    async () => {
      const tx =
        createTransactionClient();

      tx.breakBulkRule.findUnique.mockResolvedValue(
        activeRule
      );

      /*
       * inventory.findUnique calls:
       *
       * 1. Source stock before conversion
       * 2. Source stock after conversion
       * 3. Destination stock after conversion
       */
      tx.inventory.findUnique
        .mockResolvedValueOnce({
          id: "source-inventory",
          quantity: 1,
        })
        .mockResolvedValueOnce({
          quantity: 0,
        })
        .mockResolvedValueOnce({
          quantity: 20,
        });

      tx.stockMovement.create
        .mockResolvedValueOnce({
          id: "movement-out",
        })
        .mockResolvedValueOnce({
          id: "movement-in",
        });

      tx.product.update.mockResolvedValue(
        {}
      );

      tx.breakBulkConversion.create.mockResolvedValue(
        {
          id: "conversion-1",
        }
      );

      applyStockMovementMock.mockResolvedValue(
        undefined
      );

      transactionMock.mockImplementation(
        async (
          callback: (
            client: typeof tx
          ) => unknown
        ) => callback(tx)
      );

      const result =
        await breakBulkInventory({
          ruleId: "rule-1",
          locationType:
            LocationType.BRANCH,
          locationId: "branch-1",
          sourceQuantity: 1,
          createdByStaffId: "staff-1",
          note: "Unit test conversion",
        });

      expect(
        tx.breakBulkRule.findUnique
      ).toHaveBeenCalledWith({
        where: {
          id: "rule-1",
        },
        include: {
          sourceProduct: {
            select: {
              id: true,
              sku: true,
              name: true,
              isActive: true,
            },
          },
          destinationProduct: {
            select: {
              id: true,
              sku: true,
              name: true,
              isActive: true,
            },
          },
        },
      });

      expect(
        tx.stockMovement.create
      ).toHaveBeenNthCalledWith(1, {
        data: {
          productId:
            "source-product",
          type:
            MovementType.BREAK_BULK_OUT,
          quantity: 1,
          fromLocationType:
            LocationType.BRANCH,
          fromLocationId: "branch-1",
          createdByStaffId:
            "staff-1",
          status: "COMPLETED",
        },
      });

      expect(
        tx.stockMovement.create
      ).toHaveBeenNthCalledWith(2, {
        data: {
          productId:
            "destination-product",
          type:
            MovementType.BREAK_BULK_IN,
          quantity: 20,
          toLocationType:
            LocationType.BRANCH,
          toLocationId: "branch-1",
          createdByStaffId:
            "staff-1",
          status: "COMPLETED",
        },
      });

      expect(
        applyStockMovementMock
      ).toHaveBeenNthCalledWith(
        1,
        tx,
        "movement-out"
      );

      expect(
        applyStockMovementMock
      ).toHaveBeenNthCalledWith(
        2,
        tx,
        "movement-in"
      );

      expect(
        tx.product.update
      ).toHaveBeenNthCalledWith(1, {
        where: {
          id: "source-product",
        },
        data: {
          stockQty: 0,
        },
      });

      expect(
        tx.product.update
      ).toHaveBeenNthCalledWith(2, {
        where: {
          id: "destination-product",
        },
        data: {
          stockQty: 20,
        },
      });

      expect(
        tx.breakBulkConversion.create
      ).toHaveBeenCalledWith({
        data: {
          ruleId: "rule-1",
          sourceProductId:
            "source-product",
          destinationProductId:
            "destination-product",
          locationType:
            LocationType.BRANCH,
          locationId: "branch-1",

          sourceQuantityConverted: 1,
          conversionRatio: 20,
          destinationQuantityCreated: 20,

          sourceQuantityBefore: 1,
          sourceQuantityAfter: 0,

          destinationQuantityBefore: 0,
          destinationQuantityAfter: 20,

          sourceMovementId:
            "movement-out",
          destinationMovementId:
            "movement-in",

          createdByStaffId:
            "staff-1",
          note: "Unit test conversion",
        },
      });

      expect(result).toEqual({
        success: true,

        conversionId:
          "conversion-1",

        rule: {
          id: "rule-1",
          conversionRatio: 20,
        },

        source: {
          productId:
            "source-product",
          sku: "TEST-CARTON",
          name: "Test Carton",
          quantityConverted: 1,
          quantityBefore: 1,
          quantityAfter: 0,
          movementId:
            "movement-out",
        },

        destination: {
          productId:
            "destination-product",
          sku: "TEST-BOX",
          name: "Test Box",
          quantityCreated: 20,
          quantityBefore: 0,
          quantityAfter: 20,
          movementId:
            "movement-in",
        },

        location: {
          type:
            LocationType.BRANCH,
          id: "branch-1",
        },
      });
    }
  );

  it(
    "rejects conversion when source stock is insufficient and creates no movements",
    async () => {
      const tx =
        createTransactionClient();

      tx.breakBulkRule.findUnique.mockResolvedValue(
        activeRule
      );

      tx.inventory.findUnique.mockResolvedValueOnce(
        {
          id: "source-inventory",
          quantity: 0,
        }
      );

      transactionMock.mockImplementation(
        async (
          callback: (
            client: typeof tx
          ) => unknown
        ) => callback(tx)
      );

      await expect(
        breakBulkInventory({
          ruleId: "rule-1",
          locationType:
            LocationType.BRANCH,
          locationId: "branch-1",
          sourceQuantity: 1,
          createdByStaffId:
            "staff-1",
        })
      ).rejects.toThrow(
        "Insufficient stock for Test Carton. Available: 0"
      );

      expect(
        tx.stockMovement.create
      ).not.toHaveBeenCalled();

      expect(
        applyStockMovementMock
      ).not.toHaveBeenCalled();

      expect(
        tx.product.update
      ).not.toHaveBeenCalled();

      expect(
        tx.breakBulkConversion.create
      ).not.toHaveBeenCalled();
    }
  );
});