import { randomBytes } from "crypto";

import {
  InventoryMovementType,
  LocationType,
  MovementType,
  PaymentStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { applyStockMovement } from "@/lib/stock";
import { getRequiredOrderAmountPesewas } from "@/lib/pos/orderMoney";

type FinalizeWebsitePaystackPaymentInput = {
  reference: string;
  orderId: string;
  amountPesewas: number;
  currency: string;
  providerStatus: string;
};

type FinalizeWebsitePaystackPaymentResult = {
  orderId: string;
  paymentConfirmed: boolean;
  orderFinalized: boolean;
  alreadyFinalized: boolean;
  requiresAttention: boolean;
};

/*
 * Website sales are automated transactions rather
 * than actions performed by a logged-in staff member.
 *
 * StockMovement.createdByStaffId is intentionally a
 * plain string in the current schema, so SYSTEM is
 * used as the audit actor for automated online sales.
 */
const WEBSITE_SYSTEM_ACTOR =
  "SYSTEM";

function createReceiptToken() {
  return randomBytes(
    24
  ).toString("base64url");
}

export async function finalizeWebsitePaystackPayment({
  reference,
  orderId,
  amountPesewas,
  currency,
  providerStatus,
}: FinalizeWebsitePaystackPaymentInput): Promise<FinalizeWebsitePaystackPaymentResult> {
  const cleanReference =
    reference.trim();

  const cleanOrderId =
    orderId.trim();

  const cleanCurrency =
    currency
      .trim()
      .toUpperCase();

  const cleanProviderStatus =
    providerStatus
      .trim()
      .toLowerCase();

  /*
   * ==========================================
   * PROVIDER DATA VALIDATION
   * ==========================================
   */
  if (
    !cleanReference ||
    !cleanOrderId
  ) {
    throw new Error(
      "Missing payment reference or order ID"
    );
  }

  /*
   * Website Paystack transactions are initialised
   * with Order.orderId as the Paystack reference.
   *
   * Requiring the two values to match prevents a
   * valid Paystack transaction from being applied
   * to a different order through altered metadata.
   */
  if (
    cleanReference !==
    cleanOrderId
  ) {
    throw new Error(
      "Payment reference does not match order"
    );
  }

  if (
    cleanProviderStatus !==
    "success"
  ) {
    throw new Error(
      "Payment is not successful"
    );
  }

  if (
    cleanCurrency !==
    "GHS"
  ) {
    throw new Error(
      "Unexpected payment currency"
    );
  }

  if (
    !Number.isInteger(
      amountPesewas
    ) ||
    amountPesewas <= 0
  ) {
    throw new Error(
      "Invalid payment amount"
    );
  }

  /*
   * ==========================================
   * LOAD ORDER
   * ==========================================
   */
  const order =
    await prisma.order.findUnique({
      where: {
        orderId:
          cleanOrderId,
      },

      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

  if (!order) {
    throw new Error(
      "Order not found"
    );
  }

  if (!order.locationId) {
    throw new Error(
      "Order has no inventory location"
    );
  }

  const orderLocationId =
    order.locationId;

  if (
    order.orderItems.length === 0
  ) {
    throw new Error(
      "Order has no items"
    );
  }

  /*
   * ==========================================
   * VERIFY EXACT PAID AMOUNT
   * ==========================================
   */
  const requiredAmountPesewas =
    getRequiredOrderAmountPesewas(
      order
    );

  if (
    amountPesewas !==
    requiredAmountPesewas
  ) {
    throw new Error(
      `Payment amount mismatch: expected ${requiredAmountPesewas} pesewas but received ${amountPesewas}`
    );
  }

  /*
   * ==========================================
   * EXISTING FINALISATION STATES
   * ==========================================
   */
  if (
    order.stockReduced &&
    order.paymentStatus ===
      PaymentStatus.PAID
  ) {
    /*
     * Older website orders may already have been
     * safely finalised before digital receipt
     * generation was introduced.
     *
     * Backfill only the receipt token. No payment,
     * inventory or stock state is touched here.
     */
    if (!order.receiptToken) {
      await prisma.order.updateMany({
        where: {
          id:
            order.id,

          receiptToken:
            null,
        },

        data: {
          receiptToken:
            createReceiptToken(),
        },
      });
    }

    return {
      orderId:
        order.orderId,

      paymentConfirmed:
        true,

      orderFinalized:
        true,

      alreadyFinalized:
        true,

      requiresAttention:
        false,
    };
  }

  /*
   * A historical website order may have been marked
   * PAID by the old /verify route while stockReduced
   * remained false.
   *
   * That old route may already have reduced Inventory,
   * so automatically reducing stock again would risk
   * a double sale deduction.
   *
   * Preserve the payment and require reconciliation
   * instead of guessing.
   */
  if (
    order.paymentStatus ===
      PaymentStatus.PAID &&
    !order.stockReduced
  ) {
    console.error(
      "Website order is PAID but stockReduced is false; manual reconciliation required:",
      {
        orderId:
          order.orderId,
        reference:
          cleanReference,
      }
    );

    return {
      orderId:
        order.orderId,

      paymentConfirmed:
        true,

      orderFinalized:
        false,

      alreadyFinalized:
        false,

      requiresAttention:
        true,
    };
  }

  const receiptToken =
    order.receiptToken ??
    createReceiptToken();

  /*
   * ==========================================
   * ATOMIC PAYMENT + STOCK FINALISATION
   * ==========================================
   *
   * stockReduced is claimed inside the same database
   * transaction as the stock movements.
   *
   * Concurrent webhook/callback requests therefore
   * cannot both finalise the same order successfully.
   *
   * If any stock operation fails, the transaction
   * rolls back the claim and the order remains safe
   * for controlled retry/reconciliation.
   */
  const transactionResult =
    await prisma.$transaction(
      async (tx) => {
        const claim =
          await tx.order.updateMany({
            where: {
              id:
                order.id,

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
                orderId: true,
                paymentStatus: true,
                stockReduced: true,
                receiptToken: true,
              },
            });

          if (
            current?.paymentStatus ===
              PaymentStatus.PAID &&
            current.stockReduced
          ) {
            if (
              !current.receiptToken
            ) {
              await tx.order.updateMany({
                where: {
                  id:
                    order.id,

                  receiptToken:
                    null,
                },

                data: {
                  receiptToken:
                    receiptToken,
                },
              });
            }

            return {
              alreadyFinalized:
                true,
            };
          }

          throw new Error(
            "Order payment finalisation is already being processed or requires reconciliation"
          );
        }

        /*
         * Each website sale uses the authoritative
         * Branch Inventory ledger.
         */
        for (
          const item of
          order.orderItems
        ) {
          if (
            !Number.isInteger(
              item.quantity
            ) ||
            item.quantity <= 0
          ) {
            throw new Error(
              `Invalid order quantity for ${item.product?.name || item.productId}`
            );
          }

          const movement =
            await tx.stockMovement.create({
              data: {
                productId:
                  item.productId,

                type:
                  MovementType.SALE,

                quantity:
                  item.quantity,

                fromLocationType:
                  LocationType.BRANCH,

                fromLocationId:
                  orderLocationId,

                createdByStaffId:
                  WEBSITE_SYSTEM_ACTOR,

                status:
                  "COMPLETED",
              },
            });

          /*
           * applyStockMovement provides the atomic
           * quantity >= sale quantity protection.
           */
          await applyStockMovement(
            tx,
            movement.id
          );

          /*
           * Product.stockQty remains a compatibility
           * mirror of current Branch inventory.
           */
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
                      orderLocationId,
                  },
              },

              select: {
                quantity: true,
              },
            });

          if (!updatedInventory) {
            throw new Error(
              `Branch inventory missing after sale for ${item.product?.name || item.productId}`
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

          /*
           * Preserve the existing order-linked
           * InventoryMovement audit trail while
           * StockMovement remains authoritative.
           */
          await tx.inventoryMovement.create({
            data: {
              productId:
                item.productId,

              orderId:
                order.id,

              type:
                InventoryMovementType.SALE,

              quantity:
                item.quantity,

              note:
                `Online sale for order ${order.orderId} - ${cleanReference}`,
            },
          });
        }

        await tx.order.update({
          where: {
            id:
              order.id,
          },

          data: {
            paymentStatus:
              PaymentStatus.PAID,

            paymentMethod:
              "ONLINE_CARD",

            reference:
              cleanReference,

            stockReduced:
              true,

            receiptToken:
              receiptToken,
          },
        });

        return {
          alreadyFinalized:
            false,
        };
      },

      /*
       * Neon has already demonstrated transaction
       * latency above Prisma's default 5-second
       * interactive transaction timeout during UAT.
       */
      {
        maxWait:
          10000,

        timeout:
          30000,
      }
    );

  return {
    orderId:
      order.orderId,

    paymentConfirmed:
      true,

    orderFinalized:
      true,

    alreadyFinalized:
      transactionResult
        .alreadyFinalized,

    requiresAttention:
      false,
  };
}