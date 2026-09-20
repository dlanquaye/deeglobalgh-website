import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

const ALLOWED_STAFF_ROLES = new Set([
  "SUPER_ADMIN",
  "MANAGER",
  "WAREHOUSE_MANAGER",
]);

export async function POST(
  request: Request
) {
  try {
    const session =
      await requireAdmin();

    if (!session.staffId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This account is not linked to a staff record.",
        },
        {
          status: 403,
        }
      );
    }

    const staffId = session.staffId;

    const staff =
      session.staffId
        ? await prisma.staff.findUnique({
            where: {
              id: session.staffId,
            },
            select: {
              id: true,
              role: true,
              isActive: true,
              branchId: true,
            },
          })
        : null;

    const isSuperAdmin =
      session.role ===
      "SUPER_ADMIN";

    if (
      !isSuperAdmin &&
      (
        !staff ||
        !staff.isActive ||
        !ALLOWED_STAFF_ROLES.has(
          staff.role
        )
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You do not have permission to adjust inventory.",
        },
        {
          status: 403,
        }
      );
    }

    const body =
      await request.json();

    const productId =
      typeof body?.productId ===
      "string"
        ? body.productId.trim()
        : "";

    const locationType =
      typeof body?.locationType ===
      "string"
        ? body.locationType.trim()
        : "";

    const adjustment =
      Number(body?.quantity);

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      locationType !==
        "BRANCH" &&
      locationType !==
        "WAREHOUSE"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid inventory location type.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(
        adjustment
      ) ||
      adjustment === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Adjustment quantity must be a non-zero whole number.",
        },
        {
          status: 400,
        }
      );
    }

    const inventory =
      await prisma.inventory.findFirst({
        where: {
          productId,
          locationType,
        },
        select: {
          id: true,
          productId: true,
          locationType: true,
          locationId: true,
          quantity: true,
        },
      });

    if (!inventory) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Inventory record not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * A normal branch manager must only
     * adjust stock belonging to their
     * own branch.
     *
     * SUPER_ADMIN remains unrestricted.
     * WAREHOUSE_MANAGER may operate on
     * warehouse stock.
     */
    if (
      !isSuperAdmin &&
      staff
    ) {
      if (
        locationType ===
          "BRANCH" &&
        staff.role !==
          "SUPER_ADMIN" &&
        (
          staff.role !==
            "MANAGER" ||
          staff.branchId !==
            inventory.locationId
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You do not have permission to adjust stock for this branch.",
          },
          {
            status: 403,
          }
        );
      }

      if (
        locationType ===
          "WAREHOUSE" &&
        staff.role !==
          "SUPER_ADMIN" &&
        staff.role !==
          "WAREHOUSE_MANAGER"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Warehouse inventory adjustments require Warehouse Manager authority.",
          },
          {
            status: 403,
          }
        );
      }
    }

    const currentStock =
      inventory.quantity;

    const newStock =
      currentStock +
      adjustment;

    if (newStock < 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Adjustment would create negative stock.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await prisma.$transaction(
        async (tx) => {
          const updated =
            await tx.inventory.updateMany({
              where: {
                id:
                  inventory.id,
                quantity:
                  currentStock,
              },
              data: {
                quantity:
                  newStock,
              },
            });

          if (
            updated.count !== 1
          ) {
            throw new Error(
              "InventoryChanged"
            );
          }

          /*
           * Product.stockQty is the
           * branch-stock mirror used by
           * parts of the catalogue/POS.
           *
           * Keep it synchronised whenever
           * branch stock is adjusted.
           */
          if (
            inventory.locationType ===
            "BRANCH"
          ) {
            await tx.product.update({
              where: {
                id:
                  inventory.productId,
              },
              data: {
                stockQty:
                  newStock,
              },
            });
          }

          await tx.stockMovement.create({
            data: {
              productId:
                inventory.productId,

              type:
                "ADJUSTMENT",

              quantity:
                adjustment,

              fromLocationType:
                inventory.locationType,

              fromLocationId:
                inventory.locationId,

              createdByStaffId:
                staffId,

              status:
                "COMPLETED",
            },
          });

          return {
            previousQuantity:
              currentStock,

            newQuantity:
              newStock,
          };
        }
      );

    return NextResponse.json({
      success: true,
      message:
        `Stock updated from ${result.previousQuantity} to ${result.newQuantity}`,
      previousQuantity:
        result.previousQuantity,
      newQuantity:
        result.newQuantity,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "InventoryChanged"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Inventory changed while this adjustment was being processed. Refresh and try again.",
        },
        {
          status: 409,
        }
      );
    }

    if (
      error instanceof Error &&
      (
        error.message ===
          "Unauthorized" ||
        error.message ===
          "CredentialChangeRequired"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    console.error(
      "Inventory adjustment failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to adjust inventory.",
      },
      {
        status: 500,
      }
    );
  }
}
