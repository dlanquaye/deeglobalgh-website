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
  Prisma,
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

import { applyOpeningStockPrice } from "@/lib/inventory/openingStockPrice";

function createTransactionClient() {
  return {
    product: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },

    inventory: {
      findUnique: vi.fn(),
    },

    stockMovement: {
      create: vi.fn(),
    },
  };
}

const product = {
  id: "product-1",
  sku: "TEST-SKU-001",
  name: "Test Product",

  costPrice: 10,
  retailPrice: 20,
  wholesalePrice: 18,
  distributorPrice: 16,
};

describe("applyOpeningStockPrice", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    applyStockMovementMock.mockResolvedValue(
      undefined
    );
  });

  it(
    "updates prices and increases branch stock through an audited adjustment",
    async () => {
      const tx =
        createTransactionClient();

      tx.product.findUnique.mockResolvedValue(
        product
      );

      /*
       * inventory.findUnique calls:
       *
       * 1. Current branch stock
       * 2. Branch stock after adjustment
       */
      tx.inventory.findUnique
        .mockResolvedValueOnce({
          id: "inventory-1",
          quantity: 5,
        })
        .mockResolvedValueOnce({
          quantity: 12,
        });

      tx.stockMovement.create.mockResolvedValue(
        {
          id: "movement-increase",
        }
      );

      tx.product.update.mockResolvedValue(
        {}
      );

      transactionMock.mockImplementation(
        async (
          callback: (
            client: typeof tx
          ) => unknown
        ) => callback(tx)
      );

      const result =
        await applyOpeningStockPrice({
          items: [
            {
              productId:
                "product-1",

              sku:
                "TEST-SKU-001",

              target: {
                costPrice: 11,
                retailPrice: 22,
                wholesalePrice: 19,
                distributorPrice: 17,
                stockQty: 12,
              },
            },
          ],

          branchId:
            "branch-1",

          createdByStaffId:
            "staff-1",
        });

      expect(
        transactionMock
      ).toHaveBeenCalledWith(
        expect.any(Function),
        {
          maxWait: 10_000,
          timeout: 60_000,
          isolationLevel:
            Prisma
              .TransactionIsolationLevel
              .Serializable,
        }
      );

      expect(
        tx.product.findUnique
      ).toHaveBeenCalledWith({
        where: {
          id: "product-1",
        },
        select: {
          id: true,
          sku: true,
          name: true,
          costPrice: true,
          retailPrice: true,
          wholesalePrice: true,
          distributorPrice: true,
        },
      });

      expect(
        tx.inventory.findUnique
      ).toHaveBeenNthCalledWith(
        1,
        {
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
          select: {
            id: true,
            quantity: true,
          },
        }
      );

      expect(
        tx.stockMovement.create
      ).toHaveBeenCalledWith({
        data: {
          productId:
            "product-1",

          type:
            MovementType.ADJUSTMENT,

          quantity: 7,

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

      expect(
        applyStockMovementMock
      ).toHaveBeenCalledWith(
        tx,
        "movement-increase"
      );

      expect(
        tx.product.update
      ).toHaveBeenCalledWith({
        where: {
          id: "product-1",
        },
        data: {
          costPrice: 11,
          retailPrice: 22,
          wholesalePrice: 19,
          distributorPrice: 17,
          stockQty: 12,
        },
      });

      expect(result).toEqual({
        success: true,

        processed: 1,

        priceUpdates: 1,

        stockUpdates: 1,

        results: [
          {
            productId:
              "product-1",

            sku:
              "TEST-SKU-001",

            productName:
              "Test Product",

            pricesUpdated: true,

            stock: {
              changed: true,
              before: 5,
              after: 12,
              delta: 7,
              movementId:
                "movement-increase",
            },
          },
        ],
      });
    }
  );

  it(
    "decreases branch stock through an audited adjustment",
    async () => {
      const tx =
        createTransactionClient();

      tx.product.findUnique.mockResolvedValue(
        product
      );

      tx.inventory.findUnique
        .mockResolvedValueOnce({
          id: "inventory-1",
          quantity: 12,
        })
        .mockResolvedValueOnce({
          quantity: 5,
        });

      tx.stockMovement.create.mockResolvedValue(
        {
          id: "movement-decrease",
        }
      );

      tx.product.update.mockResolvedValue(
        {}
      );

      transactionMock.mockImplementation(
        async (
          callback: (
            client: typeof tx
          ) => unknown
        ) => callback(tx)
      );

      const result =
        await applyOpeningStockPrice({
          items: [
            {
              productId:
                "product-1",

              sku:
                "TEST-SKU-001",

              target: {
                stockQty: 5,
              },
            },
          ],

          branchId:
            "branch-1",

          createdByStaffId:
            "staff-1",
        });

      expect(
        tx.stockMovement.create
      ).toHaveBeenCalledWith({
        data: {
          productId:
            "product-1",

          type:
            MovementType.ADJUSTMENT,

          quantity: 7,

          fromLocationType:
            LocationType.BRANCH,

          fromLocationId:
            "branch-1",

          createdByStaffId:
            "staff-1",

          status:
            "COMPLETED",
        },
      });

      expect(
        applyStockMovementMock
      ).toHaveBeenCalledWith(
        tx,
        "movement-decrease"
      );

      expect(
        tx.product.update
      ).toHaveBeenCalledWith({
        where: {
          id: "product-1",
        },
        data: {
          stockQty: 5,
        },
      });

      expect(result.stockUpdates).toBe(
        1
      );

      expect(
        result.results[0].stock
      ).toEqual({
        changed: true,
        before: 12,
        after: 5,
        delta: -7,
        movementId:
          "movement-decrease",
      });
    }
  );

  it(
    "updates a price without creating a stock movement when no stock target is supplied",
    async () => {
      const tx =
        createTransactionClient();

      tx.product.findUnique.mockResolvedValue(
        product
      );

      tx.inventory.findUnique.mockResolvedValue(
        {
          id: "inventory-1",
          quantity: 8,
        }
      );

      tx.product.update.mockResolvedValue(
        {}
      );

      transactionMock.mockImplementation(
        async (
          callback: (
            client: typeof tx
          ) => unknown
        ) => callback(tx)
      );

      const result =
        await applyOpeningStockPrice({
          items: [
            {
              productId:
                "product-1",

              sku:
                "TEST-SKU-001",

              target: {
                retailPrice: 25,
              },
            },
          ],

          branchId:
            "branch-1",

          createdByStaffId:
            "staff-1",
        });

      expect(
        tx.stockMovement.create
      ).not.toHaveBeenCalled();

      expect(
        applyStockMovementMock
      ).not.toHaveBeenCalled();

      expect(
        tx.product.update
      ).toHaveBeenCalledWith({
        where: {
          id: "product-1",
        },
        data: {
          retailPrice: 25,
        },
      });

      expect(result).toEqual({
        success: true,

        processed: 1,

        priceUpdates: 1,

        stockUpdates: 0,

        results: [
          {
            productId:
              "product-1",

            sku:
              "TEST-SKU-001",

            productName:
              "Test Product",

            pricesUpdated: true,

            stock: {
              changed: false,
              before: 8,
              after: 8,
              delta: 0,
              movementId: null,
            },
          },
        ],
      });
    }
  );

  it(
    "creates no movement and performs no product update when target values already match live values",
    async () => {
      const tx =
        createTransactionClient();

      tx.product.findUnique.mockResolvedValue(
        product
      );

      tx.inventory.findUnique.mockResolvedValue(
        {
          id: "inventory-1",
          quantity: 8,
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
        await applyOpeningStockPrice({
          items: [
            {
              productId:
                "product-1",

              sku:
                "TEST-SKU-001",

              target: {
                costPrice: 10,
                retailPrice: 20,
                wholesalePrice: 18,
                distributorPrice: 16,
                stockQty: 8,
              },
            },
          ],

          branchId:
            "branch-1",

          createdByStaffId:
            "staff-1",
        });

      expect(
        tx.stockMovement.create
      ).not.toHaveBeenCalled();

      expect(
        applyStockMovementMock
      ).not.toHaveBeenCalled();

      expect(
        tx.product.update
      ).not.toHaveBeenCalled();

      expect(result).toEqual({
        success: true,

        processed: 1,

        priceUpdates: 0,

        stockUpdates: 0,

        results: [
          {
            productId:
              "product-1",

            sku:
              "TEST-SKU-001",

            productName:
              "Test Product",

            pricesUpdated: false,

            stock: {
              changed: false,
              before: 8,
              after: 8,
              delta: 0,
              movementId: null,
            },
          },
        ],
      });
    }
  );

  it(
    "retries a serializable transaction after a P2034 conflict",
    async () => {
      const tx =
        createTransactionClient();

      tx.product.findUnique.mockResolvedValue(
        product
      );

      tx.inventory.findUnique
        .mockResolvedValueOnce({
          id: "inventory-1",
          quantity: 5,
        })
        .mockResolvedValueOnce({
          quantity: 6,
        });

      tx.stockMovement.create.mockResolvedValue(
        {
          id: "movement-retry",
        }
      );

      tx.product.update.mockResolvedValue(
        {}
      );

      const transactionConflict =
        new Prisma.PrismaClientKnownRequestError(
          "Transaction conflict",
          {
            code: "P2034",
            clientVersion: "6.19.3",
          }
        );

      transactionMock
        .mockRejectedValueOnce(
          transactionConflict
        )
        .mockImplementationOnce(
          async (
            callback: (
              client: typeof tx
            ) => unknown
          ) => callback(tx)
        );

      const result =
        await applyOpeningStockPrice({
          items: [
            {
              productId:
                "product-1",

              sku:
                "TEST-SKU-001",

              target: {
                stockQty: 6,
              },
            },
          ],

          branchId:
            "branch-1",

          createdByStaffId:
            "staff-1",
        });

      expect(
        transactionMock
      ).toHaveBeenCalledTimes(2);

      expect(
        transactionMock
      ).toHaveBeenNthCalledWith(
        1,
        expect.any(Function),
        {
          maxWait: 10_000,
          timeout: 60_000,
          isolationLevel:
            Prisma
              .TransactionIsolationLevel
              .Serializable,
        }
      );

      expect(
        transactionMock
      ).toHaveBeenNthCalledWith(
        2,
        expect.any(Function),
        {
          maxWait: 10_000,
          timeout: 60_000,
          isolationLevel:
            Prisma
              .TransactionIsolationLevel
              .Serializable,
        }
      );

      expect(
        tx.stockMovement.create
      ).toHaveBeenCalledTimes(
        1
      );

      expect(
        applyStockMovementMock
      ).toHaveBeenCalledTimes(
        1
      );

      expect(result.success).toBe(
        true
      );

      expect(result.stockUpdates).toBe(
        1
      );

      expect(
        result.results[0].stock.after
      ).toBe(6);
    }
  );
});