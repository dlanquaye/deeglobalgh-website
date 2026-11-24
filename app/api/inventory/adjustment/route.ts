import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

import {
  canAdjustInventoryAtLocation,
  validateAdjustmentLocation,
} from "@/lib/inventory/adjustmentLocation";

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();

    if (!session.staffId) {
      return NextResponse.json(
        {
          success: false,
          message: "This account is not linked to a staff record.",
        },
        { status: 403 }
      );
    }

    const staff = await prisma.staff.findUnique({
      where: {
        id: session.staffId,
      },
      select: {
        id: true,
        role: true,
        isActive: true,
        branchId: true,
      },
    });

    if (!staff || !staff.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "An active staff account is required.",
        },
        { status: 403 }
      );
    }

    const effectiveRole =
      session.role === "SUPER_ADMIN"
        ? "SUPER_ADMIN"
        : staff.role;

    if (
      effectiveRole !== "SUPER_ADMIN" &&
      effectiveRole !== "MANAGER" &&
      effectiveRole !== "WAREHOUSE_MANAGER"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have permission to adjust inventory.",
        },
        { status: 403 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request.",
        },
        { status: 400 }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid adjustment request.",
        },
        { status: 400 }
      );
    }

    const input = body as Record<string, unknown>;

    const productId =
      typeof input.productId === "string"
        ? input.productId.trim()
        : "";

    const location = validateAdjustmentLocation({
      locationType: input.locationType,
      locationId: input.locationId,
    });

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product is required.",
        },
        { status: 400 }
      );
    }

    if (!location.valid) {
      return NextResponse.json(
        {
          success: false,
          message: location.message,
        },
        { status: 400 }
      );
    }

    const adjustment =
      typeof input.quantity === "number" ||
      typeof input.quantity === "string"
        ? Number(input.quantity)
        : NaN;

    if (
      !Number.isSafeInteger(adjustment) ||
      adjustment === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Adjustment must be a non-zero whole number.",
        },
        { status: 400 }
      );
    }

    const authorised = canAdjustInventoryAtLocation({
      role: effectiveRole,
      isActive: staff.isActive,
      staffBranchId: staff.branchId,
      locationType: location.locationType,
      locationId: location.locationId,
    });

    if (!authorised) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot adjust stock at this location.",
        },
        { status: 403 }
      );
    }

    // Confirm that the requested location is a real record.
    // A client-supplied ID is never trusted on its own.
    const existingLocation =
      location.locationType === "BRANCH"
        ? await prisma.branch.findUnique({
            where: { id: location.locationId },
            select: { id: true },
          })
        : await prisma.warehouse.findUnique({
            where: { id: location.locationId },
            select: { id: true },
          });

    if (!existingLocation) {
      return NextResponse.json(
        {
          success: false,
          message: "Stock location not found.",
        },
        { status: 404 }
      );
    }

    // The compound key uniquely identifies ONE product
    // at ONE exact branch or warehouse.
    const inventory = await prisma.inventory.findUnique({
      where: {
        productId_locationType_locationId: {
          productId,
          locationType: location.locationType,
          locationId: location.locationId,
        },
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
          message: "Inventory record not found at this location.",
        },
        { status: 404 }
      );
    }

    const newStock = inventory.quantity + adjustment;

    if (
      !Number.isSafeInteger(newStock) ||
      newStock < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Adjustment would create invalid or negative stock.",
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Compare-and-update protects against concurrent
      // adjustments made to the same inventory record.
      const updated = await tx.inventory.updateMany({
        where: {
          id: inventory.id,
          quantity: inventory.quantity,
        },
        data: {
          quantity: newStock,
        },
      });

      if (updated.count !== 1) {
        throw new Error("InventoryChanged");
      }

      // Existing compatibility behaviour is retained
      // temporarily. This must be redesigned before
      // the second branch is activated in production.
      if (
        inventory.locationType === "BRANCH" &&
        inventory.locationId === "cmq4b407s0000g3jg31elgm80"
      ) {
        await tx.product.update({
          where: {
            id: inventory.productId,
          },
          data: {
            stockQty: newStock,
          },
        });
      }

      // The current StockMovement model has no reason
      // field. We will address that in a separate,
      // reviewed audit-trail change.
      await tx.stockMovement.create({
        data: {
          productId: inventory.productId,
          type: "ADJUSTMENT",
          quantity: adjustment,
          fromLocationType: inventory.locationType,
          fromLocationId: inventory.locationId,
          createdByStaffId: staff.id,
          status: "COMPLETED",
        },
      });

      return {
        previousQuantity: inventory.quantity,
        newQuantity: newStock,
      };
    });

    return NextResponse.json({
      success: true,
      message:
        `Stock updated from ${result.previousQuantity} ` +
        `to ${result.newQuantity}`,
      previousQuantity: result.previousQuantity,
      newQuantity: result.newQuantity,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "InventoryChanged"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Inventory changed while this adjustment was being processed. " +
            "Refresh and try again.",
        },
        { status: 409 }
      );
    }

    if (
      error instanceof Error &&
      (
        error.message === "Unauthorized" ||
        error.message === "CredentialChangeRequired"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    console.error("Inventory adjustment failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to adjust inventory.",
      },
      { status: 500 }
    );
  }
}
