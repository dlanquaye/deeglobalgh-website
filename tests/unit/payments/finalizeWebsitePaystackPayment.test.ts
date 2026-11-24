import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  PaymentStatus,
} from "@prisma/client";

const {
  transactionMock,
  orderFindUniqueMock,
  orderUpdateManyMock,
  applyStockMovementMock,
} = vi.hoisted(() => ({
  transactionMock:
    vi.fn(),

  orderFindUniqueMock:
    vi.fn(),

  orderUpdateManyMock:
    vi.fn(),

  applyStockMovementMock:
    vi.fn(),
}));

vi.mock(
  "@/lib/prisma",
  () => ({
    prisma: {
      order: {
        findUnique:
          orderFindUniqueMock,

        updateMany:
          orderUpdateManyMock,
      },

      $transaction:
        transactionMock,
    },
  })
);

vi.mock(
  "@/lib/stock",
  () => ({
    applyStockMovement:
      applyStockMovementMock,
  })
);

import {
  finalizeWebsitePaystackPayment,
} from "@/lib/payments/finalizeWebsitePaystackPayment";

function createOrder(
  overrides: Partial<{
    paymentStatus:
      PaymentStatus;

    stockReduced:
      boolean;

    amountPesewas:
      number | null;

    amount:
      number;

    locationId:
      string | null;

    receiptToken:
      string | null;
  }> = {}
) {
  return {
    id:
      "order-db-1",

    orderId:
      "DG-TEST-1",

    amount:
      50,

    amountPesewas:
      5000,

    paymentStatus:
      PaymentStatus.PENDING,

    stockReduced:
      false,

    locationId:
      "cmq4b407s0000g3jg31elgm80",

    receiptToken:
      null,

    orderItems: [
      {
        id: "order-item-1",
        fulfillmentLocationId: null,
        productId:
          "product-1",

        quantity:
          2,

        product: {
          id:
            "product-1",

          name:
            "Test Book",
        },
      },
    ],

    ...overrides,
  };
}

function createTransactionClient() {
  const orderUpdateMany =
    vi.fn()
      .mockResolvedValue({
        count:
          1,
      });

  const orderUpdate =
    vi.fn()
      .mockResolvedValue({
        id:
          "order-db-1",
      });

  const stockMovementCreate =
    vi.fn()
      .mockResolvedValue({
        id:
          "movement-1",
      });

  const inventoryFindUnique =
    vi.fn()
      .mockResolvedValue({
        quantity:
          8,
      });

  const productUpdate =
    vi.fn()
      .mockResolvedValue({
        id:
          "product-1",
      });

  const inventoryMovementCreate =
    vi.fn()
      .mockResolvedValue({
        id:
          "inventory-movement-1",
      });

  const orderFindUnique =
    vi.fn()
      .mockResolvedValue({
        orderId:
          "DG-TEST-1",

        paymentStatus:
          PaymentStatus.PAID,

        stockReduced:
          true,

        receiptToken:
          "existing-receipt-token",
      });

  return {
    order: {
      updateMany:
        orderUpdateMany,

      update:
        orderUpdate,

      findUnique:
        orderFindUnique,
    },

    stockMovement: {
      create:
        stockMovementCreate,
    },

    inventory: {
      findUnique:
        inventoryFindUnique,
    },

    product: {
      update:
        productUpdate,
    },

    inventoryMovement: {
      create:
        inventoryMovementCreate,
    },
  };
}

describe(
  "website Paystack payment finalisation",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      orderUpdateManyMock
        .mockResolvedValue({
          count:
            1,
        });

      applyStockMovementMock
        .mockResolvedValue(
          undefined
        );
    });

    it(
      "finalises a successful website payment exactly once using authoritative Branch stock",
      async () => {
        const order =
          createOrder();

        orderFindUniqueMock
          .mockResolvedValue(
            order
          );

        const tx =
          createTransactionClient();

        transactionMock
          .mockImplementation(
            async (
              callback: (
                client:
                  typeof tx
              ) =>
                unknown
            ) =>
              callback(
                tx
              )
          );

        const result =
          await finalizeWebsitePaystackPayment({
            reference:
              "DG-TEST-1",

            orderId:
              "DG-TEST-1",

            amountPesewas:
              5000,

            currency:
              "GHS",

            providerStatus:
              "success",
          });

        expect(
          result
        ).toEqual({
          orderId:
            "DG-TEST-1",

          paymentConfirmed:
            true,

          orderFinalized:
            true,

          alreadyFinalized:
            false,

          requiresAttention:
            false,
        });

        expect(
          tx.order.updateMany
        ).toHaveBeenCalledWith({
          where: {
            id:
              "order-db-1",

            stockReduced:
              false,

            paymentStatus: {
              not:
                PaymentStatus.PAID,
            },
          },

          data: {
            stockReduced:
              true,
          },
        });

        expect(
          tx.stockMovement.create
        ).toHaveBeenCalledWith({
          data: {
            productId:
              "product-1",

            type:
              "SALE",

            quantity:
              2,

            fromLocationType:
              "BRANCH",

            fromLocationId:
              "cmq4b407s0000g3jg31elgm80",

            createdByStaffId:
              "SYSTEM",

            status:
              "COMPLETED",
          },
        });

        expect(
          applyStockMovementMock
        ).toHaveBeenCalledWith(
          tx,
          "movement-1"
        );

        expect(
          tx.product.update
        ).toHaveBeenCalledWith({
          where: {
            id:
              "product-1",
          },

          data: {
            stockQty:
              8,
          },
        });

        expect(
          tx.inventoryMovement.create
        ).toHaveBeenCalledWith({
          data: {
            productId:
              "product-1",

            orderId:
              "order-db-1",

            type:
              "SALE",

            quantity:
              2,

            note:
              "Online sale for order DG-TEST-1 - DG-TEST-1",
          },
        });

        expect(
          tx.order.update
        ).toHaveBeenCalledWith({
          where: {
            id:
              "order-db-1",
          },

          data: {
            paymentStatus:
              PaymentStatus.PAID,

            paymentMethod:
              "ONLINE_CARD",

            reference:
              "DG-TEST-1",

            stockReduced:
              true,

            receiptToken:
              expect.any(
                String
              ),
          },
        });

        const finalOrderUpdate =
          tx.order.update.mock
            .calls[0]?.[0];

        expect(
          finalOrderUpdate
            ?.data
            ?.receiptToken
        ).toMatch(
          /^[A-Za-z0-9_-]+$/
        );

        expect(
          finalOrderUpdate
            ?.data
            ?.receiptToken
            .length
        ).toBeGreaterThan(
          20
        );
      }
    );

    it(
      "uses each saved item branch for a mixed-branch payment",
      async () => {
        const mainBranchId =
          "cmq4b407s0000g3jg31elgm80";

        const secondBranchId =
          "second-branch-test";

        const base = createOrder();

        const order = {
          ...base,
          orderItems: [
            {
              ...base.orderItems[0],
              fulfillmentLocationId: mainBranchId,
            },
            {
              ...base.orderItems[0],
              id: "order-item-2",
              productId: "product-2",
              quantity: 1,
              fulfillmentLocationId: secondBranchId,
              product: {
                id: "product-2",
                name: "Second Test Book",
              },
            },
          ],
        };

        orderFindUniqueMock.mockResolvedValue(order);

        const tx = createTransactionClient();

        transactionMock.mockImplementation(
          async (
            callback: (client: typeof tx) => unknown
          ) => callback(tx)
        );

        const result =
          await finalizeWebsitePaystackPayment({
            reference: "DG-TEST-1",
            orderId: "DG-TEST-1",
            amountPesewas: 5000,
            currency: "GHS",
            providerStatus: "success",
          });

        expect(result.orderFinalized).toBe(true);
        expect(result.requiresAttention).toBe(false);

        expect(
          tx.stockMovement.create
        ).toHaveBeenCalledTimes(2);

        expect(
          tx.stockMovement.create
        ).toHaveBeenNthCalledWith(
          1,
          {
            data: expect.objectContaining({
              productId: "product-1",
              fromLocationType: "BRANCH",
              fromLocationId: mainBranchId,
            }),
          }
        );

        expect(
          tx.stockMovement.create
        ).toHaveBeenNthCalledWith(
          2,
          {
            data: expect.objectContaining({
              productId: "product-2",
              fromLocationType: "BRANCH",
              fromLocationId: secondBranchId,
            }),
          }
        );

        expect(
          tx.inventory.findUnique
        ).toHaveBeenNthCalledWith(
          1,
          {
            where: {
              productId_locationType_locationId: {
                productId: "product-1",
                locationType: "BRANCH",
                locationId: mainBranchId,
              },
            },
            select: {
              quantity: true,
            },
          }
        );

        expect(
          tx.inventory.findUnique
        ).toHaveBeenNthCalledWith(
          2,
          {
            where: {
              productId_locationType_locationId: {
                productId: "product-2",
                locationType: "BRANCH",
                locationId: secondBranchId,
              },
            },
            select: {
              quantity: true,
            },
          }
        );

        expect(
          tx.product.update
        ).toHaveBeenCalledTimes(1);

        expect(
          tx.product.update
        ).toHaveBeenCalledWith({
          where: {
            id: "product-1",
          },
          data: {
            stockQty: 8,
          },
        });

        expect(
          tx.inventoryMovement.create
        ).toHaveBeenCalledTimes(2);

        expect(
          applyStockMovementMock
        ).toHaveBeenCalledTimes(2);

        expect(
          tx.order.update
        ).toHaveBeenCalledWith({
          where: {
            id: "order-db-1",
          },
          data: expect.objectContaining({
            paymentStatus: PaymentStatus.PAID,
            stockReduced: true,
          }),
        });
      }
    );

    it(
      "rejects incomplete item allocations before claiming stock",
      async () => {
        const base = createOrder();

        const order = {
          ...base,
          orderItems: [
            {
              ...base.orderItems[0],
              fulfillmentLocationId:
                "cmq4b407s0000g3jg31elgm80",
            },
            {
              ...base.orderItems[0],
              id: "order-item-2",
              productId: "product-2",
              fulfillmentLocationId: null,
            },
          ],
        };

        orderFindUniqueMock.mockResolvedValue(order);

        await expect(
          finalizeWebsitePaystackPayment({
            reference: "DG-TEST-1",
            orderId: "DG-TEST-1",
            amountPesewas: 5000,
            currency: "GHS",
            providerStatus: "success",
          })
        ).rejects.toThrow(
          "incomplete item-level allocations"
        );

        expect(
          transactionMock
        ).not.toHaveBeenCalled();

        expect(
          applyStockMovementMock
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "finalises second-branch stock without changing the main-branch mirror",
      async () => {
        const secondBranchId = "second-branch-test";

        orderFindUniqueMock.mockResolvedValue(
          createOrder({
            locationId: secondBranchId,
          })
        );

        const tx = createTransactionClient();

        transactionMock.mockImplementation(
          async (
            callback: (client: typeof tx) => unknown
          ) => callback(tx)
        );

        const result =
          await finalizeWebsitePaystackPayment({
            reference: "DG-TEST-1",
            orderId: "DG-TEST-1",
            amountPesewas: 5000,
            currency: "GHS",
            providerStatus: "success",
          });

        expect(result).toEqual({
          orderId: "DG-TEST-1",
          paymentConfirmed: true,
          orderFinalized: true,
          alreadyFinalized: false,
          requiresAttention: false,
        });

        expect(
          tx.stockMovement.create
        ).toHaveBeenCalledWith({
          data: expect.objectContaining({
            productId: "product-1",
            type: "SALE",
            quantity: 2,
            fromLocationType: "BRANCH",
            fromLocationId: secondBranchId,
            createdByStaffId: "SYSTEM",
          }),
        });

        expect(
          applyStockMovementMock
        ).toHaveBeenCalledWith(
          tx,
          "movement-1"
        );

        expect(
          tx.inventory.findUnique
        ).toHaveBeenCalledWith({
          where: {
            productId_locationType_locationId: {
              productId: "product-1",
              locationType: "BRANCH",
              locationId: secondBranchId,
            },
          },
          select: {
            quantity: true,
          },
        });

        expect(
          tx.product.update
        ).not.toHaveBeenCalled();

        expect(
          tx.inventoryMovement.create
        ).toHaveBeenCalledWith({
          data: expect.objectContaining({
            productId: "product-1",
            orderId: "order-db-1",
            type: "SALE",
            quantity: 2,
          }),
        });

        expect(
          tx.order.update
        ).toHaveBeenCalledWith({
          where: {
            id: "order-db-1",
          },
          data: expect.objectContaining({
            paymentStatus: PaymentStatus.PAID,
            paymentMethod: "ONLINE_CARD",
            stockReduced: true,
          }),
        });
      }
    );

    it(
      "backfills a receipt token without reducing stock when the order is already fully finalised",
      async () => {
        orderFindUniqueMock
          .mockResolvedValue(
            createOrder({
              paymentStatus:
                PaymentStatus.PAID,

              stockReduced:
                true,

              receiptToken:
                null,
            })
          );

        const result =
          await finalizeWebsitePaystackPayment({
            reference:
              "DG-TEST-1",

            orderId:
              "DG-TEST-1",

            amountPesewas:
              5000,

            currency:
              "GHS",

            providerStatus:
              "success",
          });

        expect(
          result
        ).toEqual({
          orderId:
            "DG-TEST-1",

          paymentConfirmed:
            true,

          orderFinalized:
            true,

          alreadyFinalized:
            true,

          requiresAttention:
            false,
        });

        expect(
          orderUpdateManyMock
        ).toHaveBeenCalledWith({
          where: {
            id:
              "order-db-1",

            receiptToken:
              null,
          },

          data: {
            receiptToken:
              expect.any(
                String
              ),
          },
        });

        expect(
          transactionMock
        ).not.toHaveBeenCalled();

        expect(
          applyStockMovementMock
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "does not replace an existing receipt token when the order is already fully finalised",
      async () => {
        orderFindUniqueMock
          .mockResolvedValue(
            createOrder({
              paymentStatus:
                PaymentStatus.PAID,

              stockReduced:
                true,

              receiptToken:
                "existing-receipt-token",
            })
          );

        const result =
          await finalizeWebsitePaystackPayment({
            reference:
              "DG-TEST-1",

            orderId:
              "DG-TEST-1",

            amountPesewas:
              5000,

            currency:
              "GHS",

            providerStatus:
              "success",
          });

        expect(
          result.alreadyFinalized
        ).toBe(
          true
        );

        expect(
          orderUpdateManyMock
        ).not.toHaveBeenCalled();

        expect(
          transactionMock
        ).not.toHaveBeenCalled();

        expect(
          applyStockMovementMock
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "flags historical PAID orders with stockReduced false for reconciliation instead of deducting again",
      async () => {
        orderFindUniqueMock
          .mockResolvedValue(
            createOrder({
              paymentStatus:
                PaymentStatus.PAID,

              stockReduced:
                false,
            })
          );

        const result =
          await finalizeWebsitePaystackPayment({
            reference:
              "DG-TEST-1",

            orderId:
              "DG-TEST-1",

            amountPesewas:
              5000,

            currency:
              "GHS",

            providerStatus:
              "success",
          });

        expect(
          result
        ).toEqual({
          orderId:
            "DG-TEST-1",

          paymentConfirmed:
            true,

          orderFinalized:
            false,

          alreadyFinalized:
            false,

          requiresAttention:
            true,
        });

        expect(
          transactionMock
        ).not.toHaveBeenCalled();

        expect(
          applyStockMovementMock
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "rejects a Paystack amount that does not match the authoritative order amount",
      async () => {
        orderFindUniqueMock
          .mockResolvedValue(
            createOrder()
          );

        await expect(
          finalizeWebsitePaystackPayment({
            reference:
              "DG-TEST-1",

            orderId:
              "DG-TEST-1",

            amountPesewas:
              4900,

            currency:
              "GHS",

            providerStatus:
              "success",
          })
        ).rejects.toThrow(
          "Payment amount mismatch"
        );

        expect(
          transactionMock
        ).not.toHaveBeenCalled();

        expect(
          applyStockMovementMock
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "rejects a payment in the wrong currency",
      async () => {
        await expect(
          finalizeWebsitePaystackPayment({
            reference:
              "DG-TEST-1",

            orderId:
              "DG-TEST-1",

            amountPesewas:
              5000,

            currency:
              "USD",

            providerStatus:
              "success",
          })
        ).rejects.toThrow(
          "Unexpected payment currency"
        );

        expect(
          orderFindUniqueMock
        ).not.toHaveBeenCalled();

        expect(
          transactionMock
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "rejects payment metadata when the reference does not match the order ID",
      async () => {
        await expect(
          finalizeWebsitePaystackPayment({
            reference:
              "DG-OTHER-ORDER",

            orderId:
              "DG-TEST-1",

            amountPesewas:
              5000,

            currency:
              "GHS",

            providerStatus:
              "success",
          })
        ).rejects.toThrow(
          "Payment reference does not match order"
        );

        expect(
          orderFindUniqueMock
        ).not.toHaveBeenCalled();

        expect(
          transactionMock
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "rejects a provider payment that is not successful",
      async () => {
        await expect(
          finalizeWebsitePaystackPayment({
            reference:
              "DG-TEST-1",

            orderId:
              "DG-TEST-1",

            amountPesewas:
              5000,

            currency:
              "GHS",

            providerStatus:
              "failed",
          })
        ).rejects.toThrow(
          "Payment is not successful"
        );

        expect(
          orderFindUniqueMock
        ).not.toHaveBeenCalled();

        expect(
          transactionMock
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "treats a concurrent finalisation claim that already completed as idempotent",
      async () => {
        orderFindUniqueMock
          .mockResolvedValue(
            createOrder()
          );

        const tx =
          createTransactionClient();

        tx.order.updateMany
          .mockResolvedValueOnce({
            count:
              0,
          })
          .mockResolvedValueOnce({
            count:
              1,
          });

        tx.order.findUnique
          .mockResolvedValue({
            orderId:
              "DG-TEST-1",

            paymentStatus:
              PaymentStatus.PAID,

            stockReduced:
              true,

            receiptToken:
              null,
          });

        transactionMock
          .mockImplementation(
            async (
              callback: (
                client:
                  typeof tx
              ) =>
                unknown
            ) =>
              callback(
                tx
              )
          );

        const result =
          await finalizeWebsitePaystackPayment({
            reference:
              "DG-TEST-1",

            orderId:
              "DG-TEST-1",

            amountPesewas:
              5000,

            currency:
              "GHS",

            providerStatus:
              "success",
          });

        expect(
          result.alreadyFinalized
        ).toBe(
          true
        );

        expect(
          applyStockMovementMock
        ).not.toHaveBeenCalled();

        expect(
          tx.stockMovement.create
        ).not.toHaveBeenCalled();

        expect(
          tx.order.updateMany
        ).toHaveBeenNthCalledWith(
          2,
          {
            where: {
              id:
                "order-db-1",

              receiptToken:
                null,
            },

            data: {
              receiptToken:
                expect.any(
                  String
                ),
            },
          }
        );
      }
    );
  }
);