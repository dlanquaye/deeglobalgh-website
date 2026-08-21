export const runtime = "nodejs";

import {
  LocationType,
  PaymentStatus,
} from "@prisma/client";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function getDeliveryFeePesewas(
  location: string
): number | null {
  const loc =
    location
      .trim()
      .toLowerCase();

  if (loc.includes("kasoa")) {
    return 3000;
  }

  /*
   * Outside Kasoa delivery is confirmed
   * manually before payment.
   *
   * The checkout UI already warns the
   * customer about this.
   */
  return null;
}

function getPositiveWholeQuantity(
  value: unknown
) {
  const quantity =
    typeof value === "number"
      ? value
      : Number(value);

  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    return null;
  }

  return quantity;
}

function getString(
  value: unknown
) {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json();

    const orderId =
      getString(body?.orderId);

    const customer =
      body?.customer;

    const fullName =
      getString(
        customer?.fullName
      );

    const email =
      getString(
        customer?.email
      );

    const phone =
      getString(
        customer?.phone
      );

    const location =
      getString(
        customer?.location
      );

    const items =
      body?.items;

    /*
     * ==========================================
     * BASIC VALIDATION
     * ==========================================
     */
    if (
      !orderId ||
      !fullName ||
      !email ||
      !phone ||
      !location ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid order data",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ==========================================
     * VALIDATE + NORMALISE CART QUANTITIES
     * ==========================================
     *
     * Aggregate repeated product IDs so a
     * malicious or malformed cart cannot evade
     * stock validation by submitting the same
     * product on several separate lines.
     */
    const quantityByProduct =
      new Map<string, number>();

    for (const item of items) {
      const productId =
        getString(
          item?.productId
        );

      const quantity =
        getPositiveWholeQuantity(
          item?.quantity
        );

      if (
        !productId ||
        quantity === null
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Each cart item must have a valid product and positive whole quantity",
          },
          {
            status: 400,
          }
        );
      }

      quantityByProduct.set(
        productId,
        (
          quantityByProduct.get(
            productId
          ) ?? 0
        ) + quantity
      );
    }

    const normalisedItems =
      Array.from(
        quantityByProduct.entries()
      ).map(
        ([
          productId,
          quantity,
        ]) => ({
          productId,
          quantity,
        })
      );

    /*
     * ==========================================
     * PREVENT DUPLICATE ORDER ID
     * ==========================================
     */
    const existingOrder =
      await prisma.order.findUnique({
        where: {
          orderId,
        },
        select: {
          id: true,
        },
      });

    if (existingOrder) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order already exists",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * ==========================================
     * RESOLVE WEBSITE SALES BRANCH
     * ==========================================
     *
     * Legacy website code used "shop-kasoa".
     *
     * That is not an Inventory location in the
     * current database. Inventory is keyed by
     * the real Branch record.
     */
    const branch =
      await prisma.branch.findFirst({
        where: {
          OR: [
            {
              name:
                "Kasoa, New Market",
            },
            {
              location:
                "Kasoa",
            },
          ],
        },
        select: {
          id: true,
          name: true,
        },
      });

    if (!branch) {
      console.error(
        "Website checkout branch not found"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Checkout is temporarily unavailable",
        },
        {
          status: 500,
        }
      );
    }

    const productIds =
      normalisedItems.map(
        (item) =>
          item.productId
      );

    /*
     * ==========================================
     * FETCH PUBLICLY SALEABLE PRODUCTS
     * ==========================================
     *
     * Website checkout must enforce the same
     * visibility boundary as public catalogue
     * pages:
     *
     *   isActive
     *   + websiteVisible
     *   + valid imageSrc
     *
     * POS-only products must never be made
     * purchasable merely by submitting an ID
     * directly to this endpoint.
     */
    const products =
      await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
          isActive: true,
          websiteVisible: true,
        },
      });

    const productById =
      new Map(
        products.map(
          (product) => [
            product.id,
            product,
          ]
        )
      );

    /*
     * ==========================================
     * FETCH AUTHORITATIVE BRANCH INVENTORY
     * ==========================================
     */
    const inventories =
      await prisma.inventory.findMany({
        where: {
          productId: {
            in: productIds,
          },
          locationType:
            LocationType.BRANCH,
          locationId:
            branch.id,
        },
        select: {
          productId: true,
          quantity: true,
        },
      });

    const inventoryByProduct =
      new Map(
        inventories.map(
          (inventory) => [
            inventory.productId,
            inventory.quantity,
          ]
        )
      );

    /*
     * ==========================================
     * AVAILABILITY + STOCK VALIDATION
     * ==========================================
     */
    for (
      const item of
      normalisedItems
    ) {
      const product =
        productById.get(
          item.productId
        );

      if (
        !product ||
        !product.imageSrc?.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "A product in your cart is no longer available online",
          },
          {
            status: 400,
          }
        );
      }

      const availableQty =
        inventoryByProduct.get(
          item.productId
        ) ?? 0;

      if (
        availableQty <
        item.quantity
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Only ${availableQty} item${availableQty === 1 ? "" : "s"} left in stock for ${product.name}`,
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
     * ==========================================
     * CALCULATE AUTHORITATIVE TOTAL
     * ==========================================
     *
     * Money is calculated in integer pesewas.
     * Order.amount remains populated only as
     * the legacy GHS compatibility field.
     */
    let merchandisePesewas =
      0;

    const preparedItems =
      normalisedItems.map(
        (item) => {
          const product =
            productById.get(
              item.productId
            )!;

          const unitPriceGhs =
            Number(
              product.retailPrice
            );

          const unitPricePesewas =
            Math.round(
              unitPriceGhs * 100
            );

          const totalPricePesewas =
            unitPricePesewas *
            item.quantity;

          merchandisePesewas +=
            totalPricePesewas;

          return {
            productId:
              product.id,
            quantity:
              item.quantity,
            unitPriceGhs,
            totalPriceGhs:
              totalPricePesewas /
              100,
          };
        }
      );

    const deliveryFeePesewas =
      getDeliveryFeePesewas(
        location
      );

    const totalAmountPesewas =
  merchandisePesewas +
  (deliveryFeePesewas ?? 0);

    if (
      totalAmountPesewas <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order total must be greater than zero",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ==========================================
     * CREATE PENDING ORDER ATOMICALLY
     * ==========================================
     *
     * Stock is deliberately NOT deducted here.
     * Stock moves only after independently
     * confirmed successful payment.
     */
    const result =
      await prisma.$transaction(
        async (tx) => {
          const order =
            await tx.order.create({
              data: {
                orderId,
                reference:
                  orderId,

                customerName:
                  fullName,
                email,
                phone,

                amount:
                  Math.round(
                    totalAmountPesewas /
                      100
                  ),

                amountPesewas:
                  totalAmountPesewas,

                deliveryFee:
  deliveryFeePesewas === null
    ? null
    : Math.round(
        deliveryFeePesewas /
          100
      ),

                paymentStatus:
                  PaymentStatus.PENDING,

                status:
                  "PENDING",

                locationId:
                  branch.id,

                stockReduced:
                  false,
              },
            });

          for (
            const item of
            preparedItems
          ) {
            await tx.orderItem.create({
              data: {
                orderId:
                  order.id,

                productId:
                  item.productId,

                quantity:
                  item.quantity,

                unitPrice:
                  item.unitPriceGhs,

                totalPrice:
                  item.totalPriceGhs,
              },
            });
          }

          return order;
        }
      );

    return NextResponse.json({
      ok: true,
      orderId:
        result.orderId,
      amount:
        result.amount,
      amountPesewas:
        result.amountPesewas,
      locationId:
        result.locationId,
    });
  } catch (error) {
    console.error(
      "Order creation failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create order",
      },
      {
        status: 400,
      }
    );
  }
}
