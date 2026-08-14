import {
  LocationType,
  OrderPaymentStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@prisma/client";

import { sendOrderSMS } from "@/app/lib/hubtelSms";
import { prisma } from "@/lib/prisma";
import { applyStockMovement } from "@/lib/stock";

type PosMomoMetadata = {
  source?: unknown;
  orderId?: unknown;
  orderPaymentId?: unknown;
  branchId?: unknown;
  actorId?: unknown;
};

export type FinalizePosMomoPaymentInput = {
  reference: string;
  amountPesewas: number;
  currency: string;
  channel: string;
  providerStatus: string;
  metadata?: PosMomoMetadata | null;
};

export type FinalizePosMomoPaymentResult = {
  paymentConfirmed: boolean;
  orderFinalized: boolean;
  alreadyFinalized: boolean;
  requiresAttention: boolean;

  orderId: string;
  paymentId: string;

  confirmedAmountPesewas: number;
  requiredAmountPesewas: number;

  message: string;
};

class PosMomoFinalizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name =
      "PosMomoFinalizationError";
  }
}

function getString(
  value: unknown
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const trimmed =
    value.trim();

  return trimmed
    ? trimmed
    : null;
}

function formatPaymentMethod(
  value: string | null
) {
  switch (value) {
    case "MOMO":
      return "Mobile Money";

    case "BANK_TRANSFER":
      return "Bank Transfer";

    case "ONLINE_CARD":
      return "Card";

    case "CASH":
      return "Cash";

    case "SPLIT":
      return "Split Payment";

    default:
      return value ||
        "Payment";
  }
}

function isRetryablePrismaError(
  error: unknown
) {
  return (
    error instanceof
      Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034"
  );
}

async function runSerializable<T>(
  operation: () => Promise<T>
): Promise<T> {
  const maxAttempts = 3;

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {
    try {
      return await operation();
    } catch (error) {
      if (
        !isRetryablePrismaError(
          error
        ) ||
        attempt === maxAttempts
      ) {
        throw error;
      }
    }
  }

  throw new Error(
    "Unable to complete payment finalisation"
  );
}

function buildPaymentMethod(
  methods: PaymentMethod[]
) {
  const uniqueMethods =
    Array.from(
      new Set(methods)
    );

  if (
    uniqueMethods.length === 1
  ) {
    return uniqueMethods[0];
  }

  return "SPLIT";
}

export async function finalizePosMomoPayment(
  input: FinalizePosMomoPaymentInput
): Promise<FinalizePosMomoPaymentResult> {
  const reference =
    input.reference.trim();

  if (!reference) {
    throw new PosMomoFinalizationError(
      "Missing Paystack reference"
    );
  }

  if (
    input.providerStatus !==
    "success"
  ) {
    throw new PosMomoFinalizationError(
      "Paystack transaction is not successful"
    );
  }

  if (
    !Number.isInteger(
      input.amountPesewas
    ) ||
    input.amountPesewas <= 0
  ) {
    throw new PosMomoFinalizationError(
      "Invalid Paystack amount"
    );
  }

  if (
    input.currency.toUpperCase() !==
    "GHS"
  ) {
    throw new PosMomoFinalizationError(
      "Unexpected Paystack currency"
    );
  }

  if (
    input.channel !==
    "mobile_money"
  ) {
    throw new PosMomoFinalizationError(
      "Unexpected Paystack payment channel"
    );
  }

  const metadata =
    input.metadata ?? {};

  const metadataSource =
    getString(
      metadata.source
    );

  const metadataOrderId =
    getString(
      metadata.orderId
    );

  const metadataPaymentId =
    getString(
      metadata.orderPaymentId
    );

  const metadataBranchId =
    getString(
      metadata.branchId
    );

  const actorId =
    getString(
      metadata.actorId
    );

    if (!actorId) {
  throw new PosMomoFinalizationError(
    "POS payment actor metadata is missing"
  );
}

  if (
    metadataSource !==
    "POS_MOMO"
  ) {
    throw new PosMomoFinalizationError(
      "Payment is not a POS Mobile Money transaction"
    );
  }

  if (
    !metadataOrderId ||
    !metadataPaymentId
  ) {
    throw new PosMomoFinalizationError(
      "POS payment metadata is incomplete"
    );
  }

  /*
   * ==========================================
   * PHASE 1
   * RECORD THE CONFIRMED CUSTOMER PAYMENT
   * ==========================================
   *
   * This happens BEFORE stock finalisation.
   *
   * If the customer has genuinely paid but
   * inventory finalisation later encounters
   * a problem, the confirmed payment remains
   * recorded for reconciliation.
   */
  const payment =
    await prisma.orderPayment.findUnique({
      where: {
        providerReference:
          reference,
      },
      include: {
        order: true,
      },
    });

  if (!payment) {
    throw new PosMomoFinalizationError(
      "POS Mobile Money payment was not found"
    );
  }

  if (
    payment.id !==
    metadataPaymentId
  ) {
    throw new PosMomoFinalizationError(
      "Paystack payment metadata does not match the payment record"
    );
  }

  if (
    payment.order.orderId !==
    metadataOrderId
  ) {
    throw new PosMomoFinalizationError(
      "Paystack order metadata does not match the order record"
    );
  }

  if (
    payment.method !==
    PaymentMethod.MOMO
  ) {
    throw new PosMomoFinalizationError(
      "Payment record is not Mobile Money"
    );
  }

  if (
    payment.provider !==
    "PAYSTACK"
  ) {
    throw new PosMomoFinalizationError(
      "Payment provider is not Paystack"
    );
  }

  if (
    payment.amountPesewas !==
    input.amountPesewas
  ) {
    throw new PosMomoFinalizationError(
      "Paystack amount does not match the expected payment amount"
    );
  }

  if (
    metadataBranchId &&
    payment.order.locationId !==
      metadataBranchId
  ) {
    throw new PosMomoFinalizationError(
      "Paystack branch metadata does not match the order"
    );
  }

  const confirmedAt =
    payment.confirmedAt ??
    new Date();

  await prisma.orderPayment.update({
    where: {
      id: payment.id,
    },
    data: {
      status:
        OrderPaymentStatus.CONFIRMED,

      providerStatus:
        "success",

      confirmedAt,
    },
  });

  /*
   * ==========================================
   * PHASE 2
   * FINALISE ORDER IF FULLY PAID
   * ==========================================
   *
   * The stock transaction is SERIALIZABLE.
   *
   * stockReduced is used as the atomic claim.
   * Because the claim and all stock mutations
   * happen inside one transaction, any failure
   * rolls the claim back automatically.
   */
  type TransactionResult = {
    state:
      | "FINALIZED"
      | "ALREADY_FINALIZED"
      | "PARTIAL"
      | "OVERPAID";

    orderId: string;
    orderDbId: string;
    paymentId: string;

    confirmedAmountPesewas: number;
    requiredAmountPesewas: number;

    phone: string;
    amount: number;
    paymentMethod: string | null;
    receiptToken: string | null;
    smsSent: boolean;
  };

  let transactionResult:
    TransactionResult;

  try {
    transactionResult =
      await runSerializable(
        async () =>
          prisma.$transaction(
            async (tx) => {
              const order =
                await tx.order.findUnique({
                  where: {
                    id:
                      payment.orderId,
                  },
                  include: {
                    orderItems: {
                      include: {
                        product: true,
                      },
                    },

                    payments: true,
                  },
                });

              if (!order) {
                throw new PosMomoFinalizationError(
                  "Order not found during payment finalisation"
                );
              }

              const confirmedPayments =
                order.payments.filter(
                  (item) =>
                    item.status ===
                    OrderPaymentStatus.CONFIRMED
                );

              const confirmedAmountPesewas =
                confirmedPayments.reduce(
                  (
                    total,
                    item
                  ) =>
                    total +
                    item.amountPesewas,
                  0
                );

              const requiredAmountPesewas =
                order.amount *
                100;

              if (
                confirmedAmountPesewas <
                requiredAmountPesewas
              ) {
                return {
                  state:
                    "PARTIAL",

                  orderId:
                    order.orderId,

                  orderDbId:
                    order.id,

                  paymentId:
                    payment.id,

                  confirmedAmountPesewas,

                  requiredAmountPesewas,

                  phone:
                    order.phone,

                  amount:
                    order.amount,

                  paymentMethod:
                    order.paymentMethod,

                  receiptToken:
                    order.receiptToken,

                  smsSent:
                    order.smsSent,
                };
              }

              if (
                confirmedAmountPesewas >
                requiredAmountPesewas
              ) {
                return {
                  state:
                    "OVERPAID",

                  orderId:
                    order.orderId,

                  orderDbId:
                    order.id,

                  paymentId:
                    payment.id,

                  confirmedAmountPesewas,

                  requiredAmountPesewas,

                  phone:
                    order.phone,

                  amount:
                    order.amount,

                  paymentMethod:
                    order.paymentMethod,

                  receiptToken:
                    order.receiptToken,

                  smsSent:
                    order.smsSent,
                };
              }

              if (
                order.stockReduced &&
                order.paymentStatus ===
                  PaymentStatus.PAID
              ) {
                return {
                  state:
                    "ALREADY_FINALIZED",

                  orderId:
                    order.orderId,

                  orderDbId:
                    order.id,

                  paymentId:
                    payment.id,

                  confirmedAmountPesewas,

                  requiredAmountPesewas,

                  phone:
                    order.phone,

                  amount:
                    order.amount,

                  paymentMethod:
                    order.paymentMethod,

                  receiptToken:
                    order.receiptToken,

                  smsSent:
                    order.smsSent,
                };
              }

              /*
               * Atomic finalisation claim.
               *
               * Only one concurrent webhook /
               * verification transaction may
               * change stockReduced from false
               * to true.
               */
              const claim =
                await tx.order.updateMany({
                  where: {
                    id:
                      order.id,

                    stockReduced:
                      false,
                  },

                  data: {
                    stockReduced:
                      true,
                  },
                });

              if (
                claim.count !== 1
              ) {
                const current =
                  await tx.order.findUnique({
                    where: {
                      id:
                        order.id,
                    },
                    select: {
                      stockReduced:
                        true,

                      paymentStatus:
                        true,
                    },
                  });

                if (
                  current
                    ?.stockReduced &&
                  current
                    .paymentStatus ===
                    PaymentStatus.PAID
                ) {
                  return {
                    state:
                      "ALREADY_FINALIZED",

                    orderId:
                      order.orderId,

                    orderDbId:
                      order.id,

                    paymentId:
                      payment.id,

                    confirmedAmountPesewas,

                    requiredAmountPesewas,

                    phone:
                      order.phone,

                    amount:
                      order.amount,

                    paymentMethod:
                      order.paymentMethod,

                    receiptToken:
                      order.receiptToken,

                    smsSent:
                      order.smsSent,
                  };
                }

                throw new PosMomoFinalizationError(
                  "Order finalisation is already in progress"
                );
              }

              /*
               * Apply exactly the same
               * authoritative inventory engine
               * used by the normal POS checkout.
               */
              for (
                const item of
                order.orderItems
              ) {
                const movement =
                  await tx.stockMovement.create({
                    data: {
                      productId:
                        item.productId,

                      quantity:
                        item.quantity,

                      type:
                        "SALE",

                      fromLocationType:
                        LocationType.BRANCH,

                      fromLocationId:
                        order.locationId!,

                      createdByStaffId:
  actorId,

  status:
  "COMPLETED",
                    },
                  });

                await applyStockMovement(
                  tx,
                  movement.id
                );

                const updatedInventory =
                  await tx.inventory.findUnique({
                    where: {
                      productId_locationType_locationId:
                        {
                          productId:
                            item.productId,

                          locationType:
                            LocationType.BRANCH,

                          locationId:
                            order.locationId!,
                        },
                    },

                    select: {
                      quantity:
                        true,
                    },
                  });

                if (
                  !updatedInventory
                ) {
                  throw new PosMomoFinalizationError(
                    `Inventory record missing for ${item.product.name}`
                  );
                }

                await tx.product.update({
                  where: {
                    id:
                      item.productId,
                  },

                  data: {
                    stockQty:
                      updatedInventory.quantity,
                  },
                });
              }

              const paymentMethod =
                buildPaymentMethod(
                  confirmedPayments.map(
                    (item) =>
                      item.method
                  )
                );

              /*
               * A pure MoMo order can still
               * populate the legacy Order.reference.
               *
               * Split tender may have several
               * payment references, so the detailed
               * references remain on OrderPayment.
               */
              const singleProviderReference =
                confirmedPayments.length ===
                  1
                  ? confirmedPayments[0]
                      .providerReference
                  : null;

              const updatedOrder =
                await tx.order.update({
                  where: {
                    id:
                      order.id,
                  },

                  data: {
                    paymentStatus:
                      PaymentStatus.PAID,

                    paymentMethod,

                    reference:
                      singleProviderReference ??
                      order.reference,
                  },
                });

              return {
                state:
                  "FINALIZED",

                orderId:
                  updatedOrder.orderId,

                orderDbId:
                  updatedOrder.id,

                paymentId:
                  payment.id,

                confirmedAmountPesewas,

                requiredAmountPesewas,

                phone:
                  updatedOrder.phone,

                amount:
                  updatedOrder.amount,

                paymentMethod:
                  updatedOrder.paymentMethod,

                receiptToken:
                  updatedOrder.receiptToken,

                smsSent:
                  updatedOrder.smsSent,
              };
            },
            {
              isolationLevel:
                Prisma
                  .TransactionIsolationLevel
                  .Serializable,
            }
          )
      );
  } catch (error) {
    /*
     * IMPORTANT:
     *
     * Phase 1 has already committed the
     * customer payment as CONFIRMED.
     *
     * Therefore we deliberately DO NOT
     * change it back to FAILED here.
     *
     * This creates a visible reconciliation
     * condition rather than pretending a
     * customer payment never happened.
     */
    console.error(
      "POS MoMo stock finalisation failed after confirmed payment:",
      error
    );

    return {
      paymentConfirmed:
        true,

      orderFinalized:
        false,

      alreadyFinalized:
        false,

      requiresAttention:
        true,

      orderId:
        payment.order.orderId,

      paymentId:
        payment.id,

      confirmedAmountPesewas:
        payment.amountPesewas,

      requiredAmountPesewas:
        payment.order.amount *
        100,

      message:
        error instanceof Error
          ? `Payment confirmed, but order finalisation requires attention: ${error.message}`
          : "Payment confirmed, but order finalisation requires attention.",
    };
  }

  if (
    transactionResult.state ===
    "PARTIAL"
  ) {
    return {
      paymentConfirmed:
        true,

      orderFinalized:
        false,

      alreadyFinalized:
        false,

      requiresAttention:
        false,

      orderId:
        transactionResult.orderId,

      paymentId:
        transactionResult.paymentId,

      confirmedAmountPesewas:
        transactionResult.confirmedAmountPesewas,

      requiredAmountPesewas:
        transactionResult.requiredAmountPesewas,

      message:
        "Payment confirmed. Waiting for the remaining payment amount.",
    };
  }

  if (
    transactionResult.state ===
    "OVERPAID"
  ) {
    return {
      paymentConfirmed:
        true,

      orderFinalized:
        false,

      alreadyFinalized:
        false,

      requiresAttention:
        true,

      orderId:
        transactionResult.orderId,

      paymentId:
        transactionResult.paymentId,

      confirmedAmountPesewas:
        transactionResult.confirmedAmountPesewas,

      requiredAmountPesewas:
        transactionResult.requiredAmountPesewas,

      message:
        "Confirmed payments exceed the order total. Manual reconciliation is required.",
    };
  }

  /*
   * ==========================================
   * PHASE 3
   * SEND DIGITAL RECEIPT SMS
   * ==========================================
   *
   * SMS is deliberately outside the stock
   * transaction. SMS failure can never undo
   * a successfully paid sale.
   *
   * We send automatically only when this call
   * actually performed the finalisation.
   */
  if (
    transactionResult.state ===
      "FINALIZED" &&
    !transactionResult.smsSent &&
    transactionResult.phone
  ) {
    try {
      const digitalReceiptUrl =
        transactionResult.receiptToken
          ? `https://www.shopdeeglobalgh.com/r/${transactionResult.receiptToken}`
          : null;

      const message =
        `DeeGlobalGH Receipt\n` +
        `Order: ${transactionResult.orderId}\n` +
        `Total: GHS ${transactionResult.amount.toFixed(
          2
        )}\n` +
        `Paid: ${formatPaymentMethod(
          transactionResult.paymentMethod
        )}\n` +
        (digitalReceiptUrl
          ? `Receipt: ${digitalReceiptUrl}\n`
          : "") +
        `Call: 0246 011 773\n` +
        `WhatsApp: 027 003 0000\n` +
        `Review: https://www.shopdeeglobalgh.com/review\n` +
        `Thank you.`;

      await sendOrderSMS({
        phone:
          transactionResult.phone,

        message,
      });

      await prisma.order.update({
        where: {
          id:
            transactionResult.orderDbId,
        },

        data: {
          smsSent:
            true,
        },
      });
    } catch (smsError) {
      console.error(
        "POS MoMo receipt SMS failed:",
        smsError
      );
    }
  }

  return {
    paymentConfirmed:
      true,

    orderFinalized:
      true,

    alreadyFinalized:
      transactionResult.state ===
      "ALREADY_FINALIZED",

    requiresAttention:
      false,

    orderId:
      transactionResult.orderId,

    paymentId:
      transactionResult.paymentId,

    confirmedAmountPesewas:
      transactionResult.confirmedAmountPesewas,

    requiredAmountPesewas:
      transactionResult.requiredAmountPesewas,

    message:
      transactionResult.state ===
      "ALREADY_FINALIZED"
        ? "Payment and order were already finalised."
        : "Payment confirmed and order finalised successfully.",
  };
}