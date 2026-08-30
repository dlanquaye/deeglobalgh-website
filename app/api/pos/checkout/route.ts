import { randomBytes } from "node:crypto";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { LocationType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import {
  getLegacyOrderAmount,
  getOrderAmountGhs,
} from "@/lib/pos/orderMoney";

import {
  PosPricingPreparationError,
  preparePosPricing,
} from "@/lib/pos/preparePosPricing";

import type {
  RawPosDiscountInput,
} from "@/lib/pos/preparePosPricing";

import {
  PosDiscountActorError,
  resolvePosDiscountActor,
} from "@/lib/pos/resolvePosDiscountActor";

import type {
  DiscountActorInput,
  DiscountProductInput,
} from "@/lib/pos/discounts";

import { applyStockMovement } from "@/lib/stock";
import { sendOrderSMS } from "@/app/lib/hubtelSms";

type AdminSession = {
  adminId?: string;
  role?: string;
  staffId?: string | null;
  branchId?: string | null;
  staffName?: string | null;
};

type CheckoutItem = {
  id: string;
  quantity: number;
};

class CheckoutError extends Error {
  status: number;

  constructor(
    message: string,
    status = 400
  ) {
    super(message);
    this.name = "CheckoutError";
    this.status = status;
  }
}

async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore =
    await cookies();

  const rawCookie =
    cookieStore.get(
      "dg_admin"
    )?.value;

  if (!rawCookie) {
    return null;
  }

  try {
    return JSON.parse(
      decodeURIComponent(
        rawCookie
      )
    ) as AdminSession;
  } catch {
    return null;
  }
}

function normaliseItems(
  items: unknown
): CheckoutItem[] {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new CheckoutError(
      "No items provided"
    );
  }

  const quantitiesByProduct =
    new Map<string, number>();

  for (const item of items) {
    if (
      !item ||
      typeof item !==
        "object" ||
      !("id" in item) ||
      !("quantity" in item)
    ) {
      throw new CheckoutError(
        "Invalid checkout item"
      );
    }

    const id =
      String(item.id);

    const quantity =
      Number(
        item.quantity
      );

    if (!id) {
      throw new CheckoutError(
        "Invalid product"
      );
    }

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity <= 0
    ) {
      throw new CheckoutError(
        "Product quantity must be a positive whole number"
      );
    }

    quantitiesByProduct.set(
      id,
      (quantitiesByProduct.get(
        id
      ) ?? 0) + quantity
    );
  }

  return Array.from(
    quantitiesByProduct.entries(),
    ([id, quantity]) => ({
      id,
      quantity,
    })
  );
}

function normaliseDiscount(
  value: unknown
):
  | RawPosDiscountInput
  | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (
    typeof value !==
      "object" ||
    Array.isArray(value)
  ) {
    throw new CheckoutError(
      "Invalid discount request"
    );
  }

  return value as
    RawPosDiscountInput;
}

function formatPaymentMethod(
  value:
    | string
    | null
    | undefined
) {
  switch (value) {
    case "MOMO":
      return "Mobile Money";

    case "BANK_TRANSFER":
      return "Bank Transfer";

    case "ONLINE_CARD":
      return "Card";

    case "CASH":
    default:
      return "Cash";
  }
}

function createReceiptToken() {
  return randomBytes(
    24
  ).toString("base64url");
}

export async function POST(
  req: Request
) {
  try {
    const session =
      await getAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    if (!session.branchId) {
      return NextResponse.json(
        {
          error:
            "No branch is assigned to this account",
        },
        {
          status: 400,
        }
      );
    }

    const actorId =
      session.staffId ??
      session.adminId;

    if (!actorId) {
      return NextResponse.json(
        {
          error:
            "No staff or admin identity is available",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await req.json();

    const {
      items: rawItems,
      customerName,
      customerPhone,
      paymentMethod,
      heldSaleId:
        rawHeldSaleId,
      discount:
        rawDiscount,
    } = body;

    // ==========================================
    // PAYSTACK / SPLIT PAYMENT BYPASS PROTECTION
    // ==========================================
    //
    // Mobile Money and Split payments must
    // NEVER pass through this standard checkout
    // route because this route immediately marks
    // the order PAID and reduces stock.
    //
    // POS MoMo must use:
    //
    //   /api/pos/momo/initiate
    //
    // Cash + MoMo split tender must use:
    //
    //   /api/pos/split/initiate
    //
    // Both flows require independent Paystack
    // confirmation before the sale and stock
    // movement can be finalised.
    const protectedPaymentMethod =
      typeof paymentMethod === "string"
        ? paymentMethod
            .trim()
            .toUpperCase()
        : "";

    if (
      protectedPaymentMethod ===
        "MOMO" ||
      protectedPaymentMethod ===
        "SPLIT"
    ) {
      throw new CheckoutError(
        protectedPaymentMethod ===
          "SPLIT"
          ? "Split payments must be confirmed through the controlled split-payment workflow before the sale can be completed."
          : "Mobile Money payments must be confirmed through Paystack before the sale can be completed.",
        400
      );
    }

    const items =
      normaliseItems(
        rawItems
      );

    const discount =
      normaliseDiscount(
        rawDiscount
      );

    const discountRequested =
      discount !== null;

    const branchId =
      session.branchId;

    const cleanCustomerPhone =
      typeof customerPhone ===
      "string"
        ? customerPhone.trim()
        : "";

    const heldSaleId =
      typeof rawHeldSaleId ===
        "string"
        ? rawHeldSaleId.trim()
        : "";

    const receiptToken =
      createReceiptToken();

    const result =
      await prisma.$transaction(
        async (tx) => {
          // ======================================
          // OPTIONAL RESUMED HELD-SALE GUARD
          // ======================================
          //
          // A normal POS checkout has no heldSaleId
          // and continues exactly as before.
          //
          // When checkout originates from a resumed
          // held sale, that record must still:
          //
          // - belong to this branch;
          // - have status RESUMED;
          // - have no previous conversion.
          //
          // We deliberately do NOT mark it converted
          // yet. Conversion happens only after the
          // complete Order + inventory workflow below
          // has succeeded.
          //
          // Both actions occur inside this same Prisma
          // transaction so a conversion conflict rolls
          // the entire checkout back.
          if (heldSaleId) {
            const heldSale =
              await tx.posHeldSale.findFirst({
                where: {
                  id:
                    heldSaleId,

                  branchId,

                  status:
                    "RESUMED",

                  convertedAt:
                    null,

                  convertedOrderId:
                    null,
                },

                select: {
                  id:
                    true,
                },
              });

            if (!heldSale) {
              throw new CheckoutError(
                "This held sale is no longer available for checkout. Refresh the held-sales list before continuing.",
                409
              );
            }
          }

          const productIds =
            items.map(
              (item) =>
                item.id
            );

          const products =
            await tx.product.findMany({
              where: {
                id: {
                  in: productIds,
                },

                isActive:
                  true,
              },
            });

          const productMap =
            new Map(
              products.map(
                (product) => [
                  product.id,
                  product,
                ]
              )
            );

          for (
            const item of
            items
          ) {
            if (
              !productMap.has(
                item.id
              )
            ) {
              throw new CheckoutError(
                "Product not found or inactive",
                400
              );
            }
          }

          // ==============================
          // SELLING PRICE PROTECTION
          // ==============================
          for (
            const item of
            items
          ) {
            const product =
              productMap.get(
                item.id
              )!;

            if (
              !Number.isFinite(
                product.retailPrice
              ) ||
              product.retailPrice <=
                0
            ) {
              throw new CheckoutError(
                "This product has no selling price configured. Update the price before selling.",
                400
              );
            }
          }

          const inventories =
            await tx.inventory.findMany({
              where: {
                productId: {
                  in: productIds,
                },

                locationType:
                  LocationType.BRANCH,

                locationId:
                  branchId,
              },
            });

          const inventoryMap =
            new Map(
              inventories.map(
                (inventory) => [
                  inventory.productId,
                  inventory,
                ]
              )
            );

          // Friendly stock validation before
          // creating the order.
          //
          // applyStockMovement() performs the
          // final atomic protection.
          for (
            const item of
            items
          ) {
            const product =
              productMap.get(
                item.id
              )!;

            const inventory =
              inventoryMap.get(
                item.id
              );

            const availableQty =
              inventory?.quantity ??
              0;

            if (
              availableQty <
              item.quantity
            ) {
              throw new CheckoutError(
                `Not enough stock for ${product.name}. Available: ${availableQty}`,
                409
              );
            }
          }

          // ======================================
          // AUTHORITATIVE POS PRICING INPUT
          // ======================================
          const pricingProducts:
            DiscountProductInput[] =
            items.map(
              (item) => {
                const product =
                  productMap.get(
                    item.id
                  )!;

                return {
                  productId:
                    product.id,

                  productName:
                    product.name,

                  quantity:
                    item.quantity,

                  retailPrice:
                    product.retailPrice,

                  minimumSellingPrice:
                    product.minimumSellingPrice,

                  costPrice:
                    product.costPrice,
                };
              }
            );

          /*
           * No-discount checkout keeps its
           * historical ability to operate from
           * the authenticated admin/staff actor.
           *
           * A DISCOUNT, however, must resolve to
           * an active Staff record in the active
           * branch because discount authority is
           * stored on Staff.maxDiscountPercent.
           */
          let pricingActor:
            DiscountActorInput;

          if (
            discountRequested
          ) {
            pricingActor =
              await resolvePosDiscountActor({
                staffId:
                  session.staffId,

                branchId,

                dependencies: {
                  findStaffById:
                    async (
                      staffId
                    ) =>
                      tx.staff.findUnique({
                        where: {
                          id:
                            staffId,
                        },

                        select: {
                          id:
                            true,

                          name:
                            true,

                          role:
                            true,

                          isActive:
                            true,

                          branchId:
                            true,

                          maxDiscountPercent:
                            true,
                        },
                      }),
                },
              });
          } else {
            pricingActor = {
              id:
                actorId,

              name:
                session.staffName ??
                "POS Staff",

              role:
                session.role ??
                null,

              maxDiscountPercent:
                null,
            };
          }

          // ======================================
          // SHARED PRICING / DISCOUNT ENGINE
          // ======================================
          const pricing =
            await preparePosPricing({
              products:
                pricingProducts,

              actor:
                pricingActor,

              discount,

              /*
               * Manager lookup is deliberately
               * performed through this same
               * transaction client.
               *
               * PIN comparison remains inside
               * the approval service and the PIN
               * is never returned or persisted.
               */
              approvalDependencies:
                discountRequested
                  ? {
                      findAdminByEmail:
                        async (
                          email
                        ) =>
                          tx.admin.findUnique({
                            where: {
                              email,
                            },

                            select: {
                              id:
                                true,

                              name:
                                true,

                              email:
                                true,

                              pinHash:
                                true,

                              role:
                                true,

                              isActive:
                                true,

                              staff: {
                                select: {
                                  id:
                                    true,

                                  name:
                                    true,

                                  role:
                                    true,

                                  isActive:
                                    true,

                                  maxDiscountPercent:
                                    true,
                                },
                              },
                            },
                          }),
                    }
                  : undefined,
            });

          if (
            !Number.isSafeInteger(
              pricing.finalSubtotalPesewas
            ) ||
            pricing.finalSubtotalPesewas <=
              0
          ) {
            throw new CheckoutError(
              "Invalid final order amount",
              400
            );
          }

          /*
           * amountPesewas is authoritative.
           *
           * Order.amount remains populated for
           * backwards compatibility only.
           */
          const orderAmount =
            getLegacyOrderAmount(
              pricing.finalSubtotalPesewas
            );

          const order =
            await tx.order.create({
              data: {
                orderId:
                  `POS-${Date.now()}`,

                receiptToken,

                email:
                  "pos@shop.com",

                phone:
                  cleanCustomerPhone ||
                  "0000000000",

                customerName:
                  customerName ||
                  null,

                paymentMethod:
                  paymentMethod ||
                  "CASH",

                amount:
                  orderAmount,

                amountPesewas:
                  pricing.finalSubtotalPesewas,

                paymentStatus:
                  "PAID",

                locationId:
                  branchId,
              },
            });

          // ======================================
          // DISCOUNT AUDIT SNAPSHOT
          // ======================================
          //
          // Manager credentials are NOT stored.
          //
          // Only immutable requester / approver
          // snapshots and the financial outcome
          // are persisted.
          if (
            pricing.discount
          ) {
            const audit =
              pricing.discount;

            await tx.orderDiscount.create({
              data: {
                orderId:
                  order.id,

                type:
                  audit.type,

                value:
                  audit.value,

                reason:
                  audit.reason,

                note:
                  audit.note,

                originalSubtotal:
                  audit.originalSubtotalPesewas /
                  100,

                discountAmount:
                  audit.discountAmountPesewas /
                  100,

                finalSubtotal:
                  audit.finalSubtotalPesewas /
                  100,

                requestedById:
                  audit.requestedById,

                requestedByName:
                  audit.requestedByName,

                requestedByRole:
                  audit.requestedByRole,

                approvalRequired:
                  audit.approvalRequired,

                approvedById:
                  audit.approval
                    ?.approvedById ??
                  null,

                approvedByName:
                  audit.approval
                    ?.approvedByName ??
                  null,

                approvedByRole:
                  audit.approval
                    ?.approvedByRole ??
                  null,

                approvedAt:
                  audit.approval
                    ?.approvedAt ??
                  null,
              },
            });
          }

          const pricingLineMap =
            new Map(
              pricing.lines.map(
                (line) => [
                  line.productId,
                  line,
                ]
              )
            );

          for (
            const item of
            items
          ) {
            const product =
              productMap.get(
                item.id
              )!;

            const pricingLine =
              pricingLineMap.get(
                product.id
              );

            if (!pricingLine) {
              throw new CheckoutError(
                `Pricing result missing for ${product.name}`,
                500
              );
            }

            const movement =
              await tx.stockMovement.create({
                data: {
                  productId:
                    product.id,

                  quantity:
                    item.quantity,

                  type:
                    "SALE",

                  fromLocationType:
                    LocationType.BRANCH,

                  fromLocationId:
                    branchId,

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
                        product.id,

                      locationType:
                        LocationType.BRANCH,

                      locationId:
                        branchId,
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
              throw new CheckoutError(
                `Inventory record missing for ${product.name}`,
                409
              );
            }

            await tx.product.update({
              where: {
                id:
                  product.id,
              },

              data: {
                stockQty:
                  updatedInventory.quantity,
              },
            });

            await tx.orderItem.create({
              data: {
                orderId:
                  order.id,

                productId:
                  product.id,

                quantity:
                  item.quantity,

                /*
                 * unitPrice / totalPrice remain
                 * the ACTUAL final selling price.
                 *
                 * totalPrice is derived directly
                 * from the exact integer-pesewa
                 * line total.
                 */
                unitPrice:
                  pricingLine.finalUnitPricePesewas /
                  100,

                totalPrice:
                  pricingLine.finalTotalPesewas /
                  100,

                /*
                 * Original pricing is recorded
                 * only when a discount exists.
                 *
                 * Per-unit values may contain a
                 * fraction of one pesewa when an
                 * exact basket discount does not
                 * divide evenly by quantity.
                 *
                 * The authoritative exact value
                 * remains the line total.
                 */
                originalUnitPrice:
                  pricing.discount
                    ? pricingLine.originalUnitPricePesewas /
                      100
                    : null,

                discountPerUnit:
                  pricingLine.discountPerUnitPesewas /
                  100,

                originalTotalPrice:
                  pricing.discount
                    ? pricingLine.originalTotalPesewas /
                      100
                    : null,

                discountTotal:
                  pricingLine.discountTotalPesewas /
                  100,
              },
            });
          }

          // ======================================
          // FINALISE RESUMED HELD SALE
          // ======================================
          //
          // By this point the Order, OrderItems and
          // all SALE stock movements have completed
          // successfully inside this transaction.
          //
          // updateMany acts as the final atomic claim.
          // If another checkout has already converted
          // this same held sale, count will be zero and
          // throwing here rolls back THIS entire order
          // and its inventory movements.
          if (heldSaleId) {
            const heldSaleConversion =
              await tx.posHeldSale.updateMany({
                where: {
                  id:
                    heldSaleId,

                  branchId,

                  status:
                    "RESUMED",

                  convertedAt:
                    null,

                  convertedOrderId:
                    null,
                },

                data: {
                  status:
                    "CONVERTED",

                  convertedAt:
                    new Date(),

                  convertedOrderId:
                    order.orderId,
                },
              });

            if (
              heldSaleConversion.count !==
              1
            ) {
              throw new CheckoutError(
                "This held sale has already been completed in another checkout. No duplicate sale was created.",
                409
              );
            }
          }

          return order;
        }
      );

    // ==========================================
    // PAPERLESS POS RECEIPT SMS
    // ==========================================
    //
    // The sale, order and inventory transaction
    // above has already committed successfully.
    //
    // SMS failure must NEVER reverse the sale.
    let smsSent =
      false;

    if (
      cleanCustomerPhone
    ) {
      try {
        const totalItems =
          items.reduce(
            (
              sum,
              item
            ) =>
              sum +
              item.quantity,
            0
          );

        const digitalReceiptUrl =
          `https://www.shopdeeglobalgh.com/r/${result.receiptToken}`;

        const exactTotalGhs =
          getOrderAmountGhs(
            result
          );

        const message =
          `DeeGlobalGH Receipt\n` +
          `Order: ${result.orderId}\n` +
          `Items: ${totalItems}\n` +
          `Total: GHS ${exactTotalGhs.toFixed(
            2
          )}\n` +
          `Paid: ${formatPaymentMethod(
            result.paymentMethod
          )}\n` +
          `Receipt: ${digitalReceiptUrl}\n` +
          `Call: 0246 011 773\n` +
          `WhatsApp: 027 003 0000\n` +
          `Review: https://www.shopdeeglobalgh.com/review\n` +
          `Thank you.`;

        await sendOrderSMS({
          phone:
            cleanCustomerPhone,

          message,
        });

        await prisma.order.update({
          where: {
            orderId:
              result.orderId,
          },

          data: {
            smsSent:
              true,
          },
        });

        smsSent =
          true;
      } catch (
        smsError
      ) {
        console.error(
          "POS receipt SMS failed:",
          smsError
        );
      }
    }

    return NextResponse.json({
      success:
        true,

      orderId:
        result.orderId,

      amountPesewas:
        result.amountPesewas,

      sms: {
        requested:
          Boolean(
            cleanCustomerPhone
          ),

        sent:
          smsSent,
      },
    });
  } catch (error) {
    console.error(
      "POS checkout error:",
      error
    );

    if (
      error instanceof
      CheckoutError
    ) {
      return NextResponse.json(
        {
          error:
            error.message,
        },
        {
          status:
            error.status,
        }
      );
    }

    if (
      error instanceof
      PosPricingPreparationError
    ) {
      return NextResponse.json(
        {
          error:
            error.message,
        },
        {
          status:
            error.statusCode,
        }
      );
    }

    if (
      error instanceof
      PosDiscountActorError
    ) {
      return NextResponse.json(
        {
          error:
            error.message,
        },
        {
          status:
            error.statusCode,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Checkout failed",
      },
      {
        status: 500,
      }
    );
  }
}