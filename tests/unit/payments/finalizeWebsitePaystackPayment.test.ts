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
  applyStockMovementMock,
} = vi.hoisted(() => ({
  transactionMock:
    vi.fn(),

  orderFindUniqueMock:
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
      "branch-1",

    orderItems: [
      {
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
              "branch-1",

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
          },
        });
      }
    );

    it(
      "does not reduce stock again when the order is already fully finalised",
      async () => {
        orderFindUniqueMock
          .mockResolvedValue(
            createOrder({
              paymentStatus:
                PaymentStatus.PAID,

              stockReduced:
                true,
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
          .mockResolvedValue({
            count:
              0,
          });

        tx.order.findUnique
          .mockResolvedValue({
            orderId:
              "DG-TEST-1",

            paymentStatus:
              PaymentStatus.PAID,

            stockReduced:
              true,
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
      }
    );
  }
);
