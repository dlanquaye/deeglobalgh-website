import { randomBytes } from "node:crypto";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { LocationType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
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
    } = body;

    // ==========================================
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
    //
    // Case-insensitive comparison also prevents
    // manually altered requests such as "momo"
    // or "split" from bypassing this protection.
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

    const branchId =
      session.branchId;

    const cleanCustomerPhone =
      typeof customerPhone ===
      "string"
        ? customerPhone.trim()
        : "";

    const receiptToken =
      createReceiptToken();

    const result =
      await prisma.$transaction(
        async (tx) => {
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

          let total = 0;

          for (
            const item of
            items
          ) {
            const product =
              productMap.get(
                item.id
              )!;

            total +=
              product.retailPrice *
              item.quantity;
          }

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
                  Math.round(
                    total
                  ),

                paymentStatus:
                  "PAID",

                locationId:
                  branchId,
              },
            });

          for (
            const item of
            items
          ) {
            const product =
              productMap.get(
                item.id
              )!;

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

                unitPrice:
                  product.retailPrice,

                totalPrice:
                  product.retailPrice *
                  item.quantity,
              },
            });
          }

          return order;
        }
      );

    // ==========================================
    // PAPERLESS POS RECEIPT SMS
    // ==========================================
    //
    // IMPORTANT:
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

        const message =
          `DeeGlobalGH Receipt\n` +
          `Order: ${result.orderId}\n` +
          `Items: ${totalItems}\n` +
          `Total: GHS ${result.amount.toFixed(
            2
          )}\n` +
          `Paid: ${formatPaymentMethod(
            result.paymentMethod
          )}\n` +
          `Receipt: ${digitalReceiptUrl}\n` +
          `Help: 0246 011 773\n` +
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