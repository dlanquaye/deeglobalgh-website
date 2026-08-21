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
} = vi.hoisted(() => ({
  transactionMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: transactionMock,
  },
}));

import { transferInventory } from "@/lib/inventory/transfer";

function createTransactionClient() {
  return {
    inventory: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      upsert: vi.fn(),
    },

    product: {
      update: vi.fn(),
    },

    stockMovement: {
      create: vi.fn(),
    },
  };
}

describe("transferInventory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(
    "transfers warehouse stock to a branch and synchronises the product stock mirror",
    async () => {
      const tx =
        createTransactionClient();

      tx.inventory.findUnique.mockResolvedValue(
        {
          id: "warehouse-inventory",
          quantity: 13,
        }
      );

      tx.inventory.updateMany.mockResolvedValue(
        {
          count: 1,
        }
      );

      tx.inventory.upsert.mockResolvedValue(
        {
          id: "branch-inventory",
          quantity: 9,
        }
      );

      tx.product.update.mockResolvedValue(
        {}
      );

      tx.stockMovement.create.mockResolvedValue(
        {
          id: "movement-1",
        }
      );

      transactionMock.mockImplementation(
        async (
          callback: (
            client: typeof tx
          ) => unknown
        ) => callback(tx)
      );

      const result =
        await transferInventory({
          productId:
            "product-1",

          fromLocationType:
            LocationType.WAREHOUSE,

          fromLocationId:
            "warehouse-1",

          toLocationType:
            LocationType.BRANCH,

          toLocationId:
            "branch-1",

          quantity: 1,

          createdByStaffId:
            "staff-1",
        });

      expect(
        tx.inventory.findUnique
      ).toHaveBeenCalledWith({
        where: {
          productId_locationType_locationId:
            {
              productId:
                "product-1",

              locationType:
                LocationType.WAREHOUSE,

              locationId:
                "warehouse-1",
            },
        },
        select: {
          id: true,
          quantity: true,
        },
      });

      expect(
        tx.inventory.updateMany
      ).toHaveBeenCalledWith({
        where: {
          id:
            "warehouse-inventory",

          quantity: {
            gte: 1,
          },
        },
        data: {
          quantity: {
            decrement: 1,
          },
        },
      });

      expect(
        tx.inventory.upsert
      ).toHaveBeenCalledWith({
        where: {
          productId_locationType_locationId:
            {
              productId:
                "product-1",

              locationType:
                LocationType.BRANCH,

              locationId:
                "branch-1",
            },
        },
        update: {
          quantity: {
            increment: 1,
          },
        },
        create: {
          productId:
            "product-1",

          locationType:
            LocationType.BRANCH,

          locationId:
            "branch-1",

          quantity: 1,
        },
        select: {
          id: true,
          quantity: true,
        },
      });

      expect(
        tx.product.update
      ).toHaveBeenCalledWith({
        where: {
          id:
            "product-1",
        },
        data: {
          stockQty: 9,
        },
      });

      expect(
        tx.stockMovement.create
      ).toHaveBeenCalledWith({
        data: {
          productId:
            "product-1",

          type:
            MovementType.TRANSFER,

          quantity: 1,

          fromLocationType:
            LocationType.WAREHOUSE,

          fromLocationId:
            "warehouse-1",

          toLocationType:
            LocationType.BRANCH,

          toLocationId:
            "branch-1",

          createdByStaffId:
            "staff-1",

          status:
            "COMPLETED",
        },
      });

      expect(result).toEqual({
        success: true,

        productId:
          "product-1",

        quantity: 1,

        fromLocationType:
          LocationType.WAREHOUSE,

        fromLocationId:
          "warehouse-1",

        toLocationType:
          LocationType.BRANCH,

        toLocationId:
          "branch-1",

        sourceQuantityAfter:
          12,

        destinationQuantityAfter:
          9,

        movementId:
          "movement-1",
      });
    }
  );

  it(
    "rejects a transfer when source stock is insufficient",
    async () => {
      const tx =
        createTransactionClient();

      tx.inventory.findUnique.mockResolvedValue(
        {
          id: "warehouse-inventory",
          quantity: 2,
        }
      );

      tx.inventory.updateMany.mockResolvedValue(
        {
          count: 0,
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
        transferInventory({
          productId:
            "product-1",

          fromLocationType:
            LocationType.WAREHOUSE,

          fromLocationId:
            "warehouse-1",

          toLocationType:
            LocationType.BRANCH,

          toLocationId:
            "branch-1",

          quantity: 3,

          createdByStaffId:
            "staff-1",
        })
      ).rejects.toThrow(
        "Insufficient stock at source location"
      );

      expect(
        tx.inventory.upsert
      ).not.toHaveBeenCalled();

      expect(
        tx.product.update
      ).not.toHaveBeenCalled();

      expect(
        tx.stockMovement.create
      ).not.toHaveBeenCalled();
    }
  );

  it(
    "rejects a transfer when the source inventory record does not exist",
    async () => {
      const tx =
        createTransactionClient();

      tx.inventory.findUnique.mockResolvedValue(
        null
      );

      transactionMock.mockImplementation(
        async (
          callback: (
            client: typeof tx
          ) => unknown
        ) => callback(tx)
      );

      await expect(
        transferInventory({
          productId:
            "product-1",

          fromLocationType:
            LocationType.WAREHOUSE,

          fromLocationId:
            "warehouse-1",

          toLocationType:
            LocationType.BRANCH,

          toLocationId:
            "branch-1",

          quantity: 1,

          createdByStaffId:
            "staff-1",
        })
      ).rejects.toThrow(
        "Source inventory record not found"
      );

      expect(
        tx.inventory.updateMany
      ).not.toHaveBeenCalled();

      expect(
        tx.inventory.upsert
      ).not.toHaveBeenCalled();

      expect(
        tx.stockMovement.create
      ).not.toHaveBeenCalled();
    }
  );

  it.each([
    0,
    -1,
    1.5,
  ])(
    "rejects invalid transfer quantity %s",
    async (quantity) => {
      await expect(
        transferInventory({
          productId:
            "product-1",

          fromLocationType:
            LocationType.WAREHOUSE,

          fromLocationId:
            "warehouse-1",

          toLocationType:
            LocationType.BRANCH,

          toLocationId:
            "branch-1",

          quantity,

          createdByStaffId:
            "staff-1",
        })
      ).rejects.toThrow(
        "Transfer quantity must be a positive whole number"
      );

      expect(
        transactionMock
      ).not.toHaveBeenCalled();
    }
  );

  it(
    "rejects a transfer when source and destination are the same location",
    async () => {
      await expect(
        transferInventory({
          productId:
            "product-1",

          fromLocationType:
            LocationType.BRANCH,

          fromLocationId:
            "branch-1",

          toLocationType:
            LocationType.BRANCH,

          toLocationId:
            "branch-1",

          quantity: 1,

          createdByStaffId:
            "staff-1",
        })
      ).rejects.toThrow(
        "Source and destination locations must be different"
      );

      expect(
        transactionMock
      ).not.toHaveBeenCalled();
    }
  );

  it(
    "synchronises Product.stockQty when stock leaves a branch",
    async () => {
      const tx =
        createTransactionClient();

      tx.inventory.findUnique
        .mockResolvedValueOnce({
          id: "branch-inventory",
          quantity: 8,
        })
        .mockResolvedValueOnce({
          quantity: 7,
        });

      tx.inventory.updateMany.mockResolvedValue(
        {
          count: 1,
        }
      );

      tx.inventory.upsert.mockResolvedValue(
        {
          id:
            "warehouse-inventory",
          quantity: 5,
        }
      );

      tx.product.update.mockResolvedValue(
        {}
      );

      tx.stockMovement.create.mockResolvedValue(
        {
          id: "movement-2",
        }
      );

      transactionMock.mockImplementation(
        async (
          callback: (
            client: typeof tx
          ) => unknown
        ) => callback(tx)
      );

      await transferInventory({
        productId:
          "product-1",

        fromLocationType:
          LocationType.BRANCH,

        fromLocationId:
          "branch-1",

        toLocationType:
          LocationType.WAREHOUSE,

        toLocationId:
          "warehouse-1",

        quantity: 1,

        createdByStaffId:
          "staff-1",
      });

      expect(
        tx.product.update
      ).toHaveBeenCalledWith({
        where: {
          id:
            "product-1",
        },
        data: {
          stockQty: 7,
        },
      });
    }
  );
});
