import {
  afterEach,
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
  cookiesMock,
  transactionMock,
  topLevelOrderPaymentUpdateMock,
  preparePosPricingMock,
  resolvePosDiscountActorMock,
  fetchMock,
} = vi.hoisted(() => ({
  cookiesMock:
    vi.fn(),

  transactionMock:
    vi.fn(),

  topLevelOrderPaymentUpdateMock:
    vi.fn(),

  preparePosPricingMock:
    vi.fn(),

  resolvePosDiscountActorMock:
    vi.fn(),

  fetchMock:
    vi.fn(),
}));

vi.mock(
  "next/headers",
  () => ({
    cookies:
      cookiesMock,
  })
);

vi.mock(
  "@/lib/prisma",
  () => ({
    prisma: {
      $transaction:
        transactionMock,

      orderPayment: {
        update:
          topLevelOrderPaymentUpdateMock,
      },
    },
  })
);

vi.mock(
  "@/lib/pos/preparePosPricing",
  () => {
    class PosPricingPreparationError
      extends Error {
      statusCode: number;

      constructor(
        message: string,
        statusCode = 400
      ) {
        super(message);

        this.name =
          "PosPricingPreparationError";

        this.statusCode =
          statusCode;
      }
    }

    return {
      PosPricingPreparationError,

      preparePosPricing:
        preparePosPricingMock,
    };
  }
);

vi.mock(
  "@/lib/pos/resolvePosDiscountActor",
  () => {
    class PosDiscountActorError
      extends Error {
      statusCode: number;

      constructor(
        message: string,
        statusCode = 400
      ) {
        super(message);

        this.name =
          "PosDiscountActorError";

        this.statusCode =
          statusCode;
      }
    }

    return {
      PosDiscountActorError,

      resolvePosDiscountActor:
        resolvePosDiscountActorMock,
    };
  }
);

import {
  POST as initiateSplitPayment,
} from "@/app/api/pos/split/initiate/route";

import {
  POST as retrySplitPayment,
} from "@/app/api/pos/split/retry/route";

const session = {
  adminId:
    "admin-1",

  role:
    "ADMIN",

  staffId:
    "staff-1",

  branchId:
    "branch-1",

  staffName:
    "Test Cashier",
};

function createCookieStore() {
  return {
    get:
      vi.fn(
        (
          name: string
        ) => {
          if (
            name !==
            "dg_admin"
          ) {
            return undefined;
          }

          return {
            value:
              encodeURIComponent(
                JSON.stringify(
                  session
                )
              ),
          };
        }
      ),
  };
}

function createPaystackResponse(
  body: unknown,
  status = 200
) {
  return new Response(
    JSON.stringify(
      body
    ),
    {
      status,

      headers: {
        "Content-Type":
          "application/json",
      },
    }
  );
}

function createDiscountedPricing() {
  return {
    originalSubtotalPesewas:
      500,

    discountAmountPesewas:
      25,

    finalSubtotalPesewas:
      475,

    lines: [
      {
        productId:
          "product-1",

        originalUnitPricePesewas:
          500,

        originalTotalPesewas:
          500,

        discountPerUnitPesewas:
          25,

        discountTotalPesewas:
          25,

        finalUnitPricePesewas:
          475,

        finalTotalPesewas:
          475,
      },
    ],

    discount: {
      type:
        "PERCENTAGE",

      value:
        5,

      reason:
        "CUSTOMER_NEGOTIATION",

      note:
        null,

      originalSubtotalPesewas:
        500,

      discountAmountPesewas:
        25,

      finalSubtotalPesewas:
        475,

      requestedById:
        "staff-1",

      requestedByName:
        "Test Cashier",

      requestedByRole:
        "CASHIER",

      approvalRequired:
        true,

      approval: {
        approvedById:
          "manager-1",

        approvedByName:
          "Test Manager",

        approvedByRole:
          "MANAGER",

        approvedAt:
          new Date(
            "2026-08-15T00:00:00.000Z"
          ),
      },
    },
  };
}

function createInitiationTransactionClient() {
  const cashPayment = {
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
  };

  const momoPayment = {
    id:
      "momo-payment-1",

    method:
      PaymentMethod.MOMO,

    amountPesewas:
      275,

    status:
      OrderPaymentStatus.PENDING,

    provider:
      "PAYSTACK",

    providerReference:
      "POSSPLIT-TEST-INITIAL",
  };

  return {
    product: {
      findMany:
        vi.fn()
          .mockResolvedValue([
            {
              id:
                "product-1",

              name:
                "Test Book",

              retailPrice:
                5,

              minimumSellingPrice:
                4,

              costPrice:
                4,

              isActive:
                true,
            },
          ]),
    },

    inventory: {
      findMany:
        vi.fn()
          .mockResolvedValue([
            {
              productId:
                "product-1",

              quantity:
                12,
            },
          ]),
    },

    staff: {
      findUnique:
        vi.fn(),
    },

    admin: {
      findUnique:
        vi.fn(),
    },

    order: {
      create:
        vi.fn()
          .mockResolvedValue({
            id:
              "order-db-1",

            orderId:
              "POS-TEST-FAILED",

            email:
              "pos@shop.com",

            phone:
              "0551234987",

            payments: [
              cashPayment,
              momoPayment,
            ],
          }),
    },

    orderDiscount: {
      create:
        vi.fn()
          .mockResolvedValue({
            id:
              "discount-1",
          }),
    },
  };
}

function createRetryOrder(
  options?: {
    includePendingMomo?:
      boolean;
  }
) {
  const payments: Array<{
    id: string;
    method: PaymentMethod;
    amountPesewas: number;
    status: OrderPaymentStatus;
    provider: string;
    providerReference: string | null;
  }> = [
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
        "failed-momo-1",

      method:
        PaymentMethod.MOMO,

      amountPesewas:
        275,

      status:
        OrderPaymentStatus.FAILED,

      provider:
        "PAYSTACK",

      providerReference:
        "POSSPLIT-FAILED-1",
    },
  ];

  if (
    options
      ?.includePendingMomo
  ) {
    payments.push({
      id:
        "pending-momo-1",

      method:
        PaymentMethod.MOMO,

      amountPesewas:
        275,

      status:
        OrderPaymentStatus.PENDING,

      provider:
        "PAYSTACK",

      providerReference:
        "POSSPLIT-PENDING-1",
    });
  }

  return {
    id:
      "order-db-1",

    orderId:
      "POS-TEST-FAILED",

    email:
      "pos@shop.com",

    phone:
      "0551234987",

    locationId:
      "branch-1",

    paymentMethod:
      PaymentMethod.SPLIT,

    paymentStatus:
      PaymentStatus.PENDING,

    stockReduced:
      false,

    /*
     * Exact discounted amount:
     *
     * GHS 5.00 retail
     * - GHS 0.25 discount
     * = GHS 4.75
     */
    amountPesewas:
      475,

    /*
     * Legacy compatibility field.
     *
     * Recovery must ignore this rounded
     * value because amountPesewas exists.
     */
    amount:
      5,

    payments,

    orderItems: [
      {
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
}

function createRetryTransactionClient(
  options?: {
    includePendingMomo?:
      boolean;
  }
) {
  return {
    order: {
      findUnique:
        vi.fn()
          .mockResolvedValue(
            createRetryOrder(
              options
            )
          ),

      update:
        vi.fn(),
    },

    inventory: {
      findMany:
        vi.fn()
          .mockResolvedValue([
            {
              productId:
                "product-1",

              quantity:
                12,
            },
          ]),
    },

    orderPayment: {
      create:
        vi.fn()
          .mockResolvedValue({
            id:
              "retry-momo-1",

            providerReference:
              "POSSPLIT-RETRY-1",
          }),
    },
  };
}

describe(
  "POS split payment failure and recovery",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      process.env
        .PAYSTACK_POS_SECRET_KEY =
        "sk_test_unit_only";

      cookiesMock
        .mockResolvedValue(
          createCookieStore()
        );

      resolvePosDiscountActorMock
        .mockResolvedValue({
          id:
            "staff-1",

          name:
            "Test Cashier",

          role:
            "CASHIER",

          maxDiscountPercent:
            0,
        });

      preparePosPricingMock
        .mockResolvedValue(
          createDiscountedPricing()
        );

      vi.stubGlobal(
        "fetch",
        fetchMock
      );
    });

    afterEach(() => {
      vi.unstubAllGlobals();

      delete process.env
        .PAYSTACK_POS_SECRET_KEY;
    });

    it(
      "preserves confirmed Cash and fails only the MoMo allocation when discounted Split initiation definitively fails",
      async () => {
        const tx =
          createInitiationTransactionClient();

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

        fetchMock
          .mockResolvedValue(
            createPaystackResponse(
              {
                status:
                  false,

                message:
                  "Test Mobile Money initiation failure",

                data: {
                  reference:
                    "POSSPLIT-TEST-INITIAL",

                  status:
                    "failed",

                  message:
                    "Simulated test failure",
                },
              },
              400
            )
          );

        const request =
          new Request(
            "http://localhost/api/pos/split/initiate",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  customerName:
                    "Test Customer",

                  customerPhone:
                    "0551234987",

                  provider:
                    "mtn",

                  cashAmount:
                    "2.00",

                  items: [
                    {
                      id:
                        "product-1",

                      quantity:
                        1,
                    },
                  ],

                  discount: {
                    type:
                      "PERCENTAGE",

                    value:
                      5,

                    reason:
                      "CUSTOMER_NEGOTIATION",

                    note:
                      null,

                    approval: {
                      email:
                        "manager@example.com",

                      pin:
                        "0000",
                    },
                  },
                }),
            }
          );

        const response =
          await initiateSplitPayment(
            request
          );

        const data =
          await response.json();

        expect(
          response.status
        ).toBe(
          400
        );

        expect(
          data
        ).toEqual(
          expect.objectContaining({
            orderId:
              "POS-TEST-FAILED",

            orderAmountPesewas:
              475,

            originalSubtotalPesewas:
              500,

            discountAmountPesewas:
              25,

            cashAmountPesewas:
              200,

            momoAmountPesewas:
              275,

            cashPaymentStatus:
              "CONFIRMED",

            momoPaymentStatus:
              "FAILED",

            orderFinalized:
              false,
          })
        );

        expect(
          tx.order.create
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            data:
              expect.objectContaining({
                paymentMethod:
                  PaymentMethod.SPLIT,

                amountPesewas:
                  475,

                paymentStatus:
                  "PENDING",

                payments: {
                  create:
                    expect.arrayContaining([
                      expect.objectContaining({
                        method:
                          PaymentMethod.CASH,

                        amountPesewas:
                          200,

                        status:
                          OrderPaymentStatus.CONFIRMED,
                      }),

                      expect.objectContaining({
                        method:
                          PaymentMethod.MOMO,

                        amountPesewas:
                          275,

                        status:
                          OrderPaymentStatus.PENDING,
                      }),
                    ]),
                },
              }),
          })
        );

        expect(
          tx.orderDiscount.create
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          topLevelOrderPaymentUpdateMock
        ).toHaveBeenCalledWith({
          where: {
            id:
              "momo-payment-1",
          },

          data:
            expect.objectContaining({
              status:
                OrderPaymentStatus.FAILED,

              providerStatus:
                "failed",
            }),
        });

        /*
         * Initiation performs a stock
         * availability read only.
         *
         * There is deliberately no stock
         * update or StockMovement call in
         * this transaction.
         */
        expect(
          tx.inventory.findMany
        ).toHaveBeenCalledTimes(
          1
        );
      }
    );

    it(
      "retries only the exact outstanding discounted MoMo balance and does not record Cash again",
      async () => {
        const tx =
          createRetryTransactionClient();

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

        fetchMock
          .mockResolvedValue(
            createPaystackResponse({
              status:
                true,

              message:
                "Charge attempted",

              data: {
                reference:
                  "POSSPLIT-RETRY-1",

                status:
                  "pay_offline",

                display_text:
                  "Please approve the payment.",
              },
            })
          );

        const request =
          new Request(
            "http://localhost/api/pos/split/retry",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  orderId:
                    "POS-TEST-FAILED",

                  provider:
                    "mtn",

                  customerPhone:
                    "0551234987",
                }),
            }
          );

        const response =
          await retrySplitPayment(
            request
          );

        const data =
          await response.json();

        expect(
          response.status
        ).toBe(
          200
        );

        expect(
          data
        ).toEqual(
          expect.objectContaining({
            success:
              true,

            orderId:
              "POS-TEST-FAILED",

            paymentStatus:
              "PENDING",

            paymentMethod:
              "SPLIT",

            orderAmountPesewas:
              475,

            confirmedAmountPesewas:
              200,

            cashAmountPesewas:
              200,

            momoAmountPesewas:
              275,
          })
        );

        /*
         * Recovery creates exactly one new
         * payment allocation and it is MoMo.
         *
         * No second Cash allocation exists.
         */
        expect(
          tx.orderPayment.create
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          tx.orderPayment.create
        ).toHaveBeenCalledWith({
          data:
            expect.objectContaining({
              method:
                PaymentMethod.MOMO,

              amountPesewas:
                275,

              status:
                OrderPaymentStatus.PENDING,

              provider:
                "PAYSTACK",
            }),
        });

        const paystackCall =
          fetchMock.mock
            .calls[0];

        expect(
          paystackCall
        ).toBeDefined();

        const requestOptions =
          paystackCall[1] as
            RequestInit;

        const paystackBody =
          JSON.parse(
            String(
              requestOptions.body
            )
          );

        /*
         * The stored exact order amount is
         * GHS 4.75.
         *
         * Confirmed Cash is GHS 2.00.
         *
         * Paystack must therefore receive
         * exactly GHS 2.75.
         */
        expect(
          paystackBody.amount
        ).toBe(
          "275"
        );

        expect(
          paystackBody.metadata
            .paymentMode
        ).toBe(
          "SPLIT_RETRY"
        );

        expect(
          paystackBody.metadata
            .orderId
        ).toBe(
          "POS-TEST-FAILED"
        );

        /*
         * Stock is checked before another
         * charge is requested, but is never
         * reduced by the retry route.
         */
        expect(
          tx.inventory.findMany
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          topLevelOrderPaymentUpdateMock
        ).toHaveBeenCalledWith({
          where: {
            id:
              "retry-momo-1",
          },

          data: {
            providerReference:
              "POSSPLIT-RETRY-1",

            providerStatus:
              "pay_offline",
          },
        });
      }
    );

    it(
      "refuses to create another MoMo allocation while an existing Split MoMo payment is still pending",
      async () => {
        const tx =
          createRetryTransactionClient({
            includePendingMomo:
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

        const request =
          new Request(
            "http://localhost/api/pos/split/retry",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  orderId:
                    "POS-TEST-FAILED",

                  provider:
                    "mtn",

                  customerPhone:
                    "0551234987",
                }),
            }
          );

        const response =
          await retrySplitPayment(
            request
          );

        const data =
          await response.json();

        expect(
          response.status
        ).toBe(
          409
        );

        expect(
          data
        ).toEqual(
          expect.objectContaining({
            existingPayment:
              true,

            paymentStatus:
              "PENDING",

            paymentId:
              "pending-momo-1",

            reference:
              "POSSPLIT-PENDING-1",
          })
        );

        /*
         * Most important duplicate-charge
         * protection:
         *
         * no replacement payment is created
         * and Paystack is never contacted.
         */
        expect(
          tx.orderPayment.create
        ).not.toHaveBeenCalled();

        expect(
          fetchMock
        ).not.toHaveBeenCalled();

        expect(
          topLevelOrderPaymentUpdateMock
        ).not.toHaveBeenCalled();
      }
    );
  }
);