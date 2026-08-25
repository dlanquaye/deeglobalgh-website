import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  OrderPaymentStatus,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

const {
  orderPaymentFindUniqueMock,
  orderPaymentUpdateMock,
  transactionMock,
  applyStockMovementMock,
  sendOrderSMSMock,
  topLevelOrderUpdateMock,
} = vi.hoisted(() => ({
  orderPaymentFindUniqueMock:
    vi.fn(),

  orderPaymentUpdateMock:
    vi.fn(),

  transactionMock:
    vi.fn(),

  applyStockMovementMock:
    vi.fn(),

  sendOrderSMSMock:
    vi.fn(),

  topLevelOrderUpdateMock:
    vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    orderPayment: {
      findUnique:
        orderPaymentFindUniqueMock,

      update:
        orderPaymentUpdateMock,
    },

    order: {
      update:
        topLevelOrderUpdateMock,
    },

    $transaction:
      transactionMock,
  },
}));

vi.mock("@/lib/stock", () => ({
  applyStockMovement:
    applyStockMovementMock,
}));

vi.mock(
  "@/app/lib/hubtelSms",
  () => ({
    sendOrderSMS:
      sendOrderSMSMock,
  })
);

import {
  finalizePosMomoPayment,
} from "@/lib/pos/finalizePosMomoPayment";

const basePayment = {
  id:
    "momo-payment-1",

  orderId:
    "order-db-1",

  method:
    PaymentMethod.MOMO,

  provider:
    "PAYSTACK",

  providerReference:
    "POSSPLIT-TEST-1",

  amountPesewas:
    300,

  confirmedAt:
    null,

  order: {
    id:
      "order-db-1",

    orderId:
      "POS-SPLIT-TEST-1",

    locationId:
      "branch-1",

    paymentStatus:
      PaymentStatus.PENDING,

    paymentMethod:
  PaymentMethod.SPLIT,

reference:
  null,

stockReduced:
  false,

    amount:
      5,

    amountPesewas:
      500,

    phone:
      "0551234987",

    receiptToken:
      "receipt-token-1",

    smsSent:
      false,
  },
};

function createFinalizationTransactionClient() {
  const order = {
    id:
      "order-db-1",

    orderId:
      "POS-SPLIT-TEST-1",

    locationId:
      "branch-1",

    paymentStatus:
      PaymentStatus.PENDING,

    paymentMethod:
  PaymentMethod.SPLIT,

reference:
  null,

stockReduced:
  true,

    amount:
      5,

    amountPesewas:
      500,

    phone:
      "0551234987",

    receiptToken:
      "receipt-token-1",

    smsSent:
      false,

    payments: [
      {
        id:
          "cash-payment-1",

        method:
          PaymentMethod.CASH,

        amountPesewas:
          200,

        status:
          OrderPaymentStatus.CONFIRMED,

        provider:
          "POS",

        providerReference:
          null,
      },

      {
        id:
          "momo-payment-1",

        method:
          PaymentMethod.MOMO,

        amountPesewas:
          300,

        status:
          OrderPaymentStatus.CONFIRMED,

        provider:
          "PAYSTACK",

        providerReference:
          "POSSPLIT-TEST-1",
      },
    ],

    orderItems: [
      {
        id:
          "item-1",

        productId:
          "product-1",

        quantity:
          1,

        product: {
          id:
            "product-1",

          name:
            "Test Book",
        },
      },
    ],
  };

  return {
    order: {
      findUnique:
        vi.fn()
          .mockResolvedValue(
            order
          ),

      updateMany:
        vi.fn()
          .mockResolvedValue({
            count: 1,
          }),

      update:
        vi.fn()
          .mockResolvedValue({
            ...order,

            paymentStatus:
              PaymentStatus.PAID,

            paymentMethod:
  PaymentMethod.SPLIT,

reference:
  null,

stockReduced:
  true,
          }),
    },

    stockMovement: {
      create:
        vi.fn()
          .mockResolvedValue({
            id:
              "movement-1",
          }),
    },

    inventory: {
      findUnique:
        vi.fn()
          .mockResolvedValue({
            quantity:
              9,
          }),
    },

    product: {
      update:
        vi.fn()
          .mockResolvedValue({}),
    },
  };
}

function createAlreadyFinalizedTransactionClient() {
  const order = {
    id:
      "order-db-1",

    orderId:
      "POS-SPLIT-TEST-1",

    locationId:
      "branch-1",

    paymentStatus:
      PaymentStatus.PAID,

    paymentMethod:
  PaymentMethod.SPLIT,

reference:
  null,

stockReduced:
  true,

    amount:
      5,

    amountPesewas:
      500,

    phone:
      "0551234987",

    receiptToken:
      "receipt-token-1",

    smsSent:
      true,

    payments: [
      {
        id:
          "cash-payment-1",

        method:
          PaymentMethod.CASH,

        amountPesewas:
          200,

        status:
          OrderPaymentStatus.CONFIRMED,

        provider:
          "POS",

        providerReference:
          null,
      },

      {
        id:
          "momo-payment-1",

        method:
          PaymentMethod.MOMO,

        amountPesewas:
          300,

        status:
          OrderPaymentStatus.CONFIRMED,

        provider:
          "PAYSTACK",

        providerReference:
          "POSSPLIT-TEST-1",
      },
    ],

    orderItems: [
      {
        id:
          "item-1",

        productId:
          "product-1",

        quantity:
          1,

        product: {
          id:
            "product-1",

          name:
            "Test Book",
        },
      },
    ],
  };

  return {
    order: {
      findUnique:
        vi.fn()
          .mockResolvedValue(
            order
          ),

      updateMany:
        vi.fn(),

      update:
        vi.fn(),
    },

    stockMovement: {
      create:
        vi.fn(),
    },

    inventory: {
      findUnique:
        vi.fn(),
    },

    product: {
      update:
        vi.fn(),
    },
  };
}

describe(
  "finalizePosMomoPayment",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      orderPaymentFindUniqueMock
        .mockResolvedValue(
          basePayment
        );

      orderPaymentUpdateMock
        .mockResolvedValue({});

      topLevelOrderUpdateMock
        .mockResolvedValue({});

      applyStockMovementMock
        .mockResolvedValue(
          undefined
        );

      sendOrderSMSMock
        .mockResolvedValue(
          "sent"
        );
    });

    it(
      "finalises a fully paid Cash + MoMo split order and reduces stock exactly once",
      async () => {
        const tx =
          createFinalizationTransactionClient();

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
          await finalizePosMomoPayment({
            reference:
              "POSSPLIT-TEST-1",

            amountPesewas:
              300,

            currency:
              "GHS",

            channel:
              "mobile_money",

            providerStatus:
              "success",

            metadata: {
              source:
                "POS_MOMO",

              orderId:
                "POS-SPLIT-TEST-1",

              orderPaymentId:
                "momo-payment-1",

              branchId:
                "branch-1",

              actorId:
                "staff-1",
            },
          });

        expect(
          orderPaymentUpdateMock
        ).toHaveBeenCalledWith({
          where: {
            id:
              "momo-payment-1",
          },

          data:
            expect.objectContaining({
              status:
                OrderPaymentStatus.CONFIRMED,

              providerStatus:
                "success",

              confirmedAt:
                expect.any(
                  Date
                ),
            }),
        });

        expect(
          tx.order.updateMany
        ).toHaveBeenCalledWith({
          where: {
            id:
              "order-db-1",

            stockReduced:
              false,
          },

          data: {
            stockReduced:
              true,
          },
        });

        expect(
          tx.stockMovement.create
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          tx.stockMovement.create
        ).toHaveBeenCalledWith({
          data: {
            productId:
              "product-1",

            quantity:
              1,

            type:
              "SALE",

            fromLocationType:
              "BRANCH",

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
        ).toHaveBeenCalledTimes(
          1
        );

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
              9,
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
              PaymentMethod.SPLIT,

            reference:
              null,
          },
        });

        expect(
          result
        ).toEqual(
          expect.objectContaining({
            paymentConfirmed:
              true,

            orderFinalized:
              true,

            alreadyFinalized:
              false,

            requiresAttention:
              false,

            orderId:
              "POS-SPLIT-TEST-1",

            paymentId:
              "momo-payment-1",

            confirmedAmountPesewas:
              500,

            requiredAmountPesewas:
              500,
          })
        );

        expect(
          sendOrderSMSMock
        ).toHaveBeenCalledTimes(
          1
        );
      }
    );

    it(
      "does not reduce stock again when the same split payment is finalised a second time",
      async () => {
        const tx =
          createAlreadyFinalizedTransactionClient();

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
          await finalizePosMomoPayment({
            reference:
              "POSSPLIT-TEST-1",

            amountPesewas:
              300,

            currency:
              "GHS",

            channel:
              "mobile_money",

            providerStatus:
              "success",

            metadata: {
              source:
                "POS_MOMO",

              orderId:
                "POS-SPLIT-TEST-1",

              orderPaymentId:
                "momo-payment-1",

              branchId:
                "branch-1",

              actorId:
                "staff-1",
            },
          });

        expect(
          tx.order.updateMany
        ).not.toHaveBeenCalled();

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
          tx.order.update
        ).not.toHaveBeenCalled();

        expect(
          sendOrderSMSMock
        ).not.toHaveBeenCalled();

        expect(
          result
        ).toEqual(
          expect.objectContaining({
            paymentConfirmed:
              true,

            orderFinalized:
              true,

            alreadyFinalized:
              true,

            requiresAttention:
              false,

            confirmedAmountPesewas:
              500,

            requiredAmountPesewas:
              500,
          })
        );
      }
    );
  }
);