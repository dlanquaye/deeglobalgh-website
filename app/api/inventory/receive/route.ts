import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { receivePurchase } from "@/lib/inventory/receivePurchase";

const WAREHOUSE_ID =
  "cmq4b5g1j0001g3jgy501zz76";

export async function POST(
  req: Request
) {
  try {
    const session =
      await requireAdmin();

    if (!session.staffId) {
      return NextResponse.json(
        {
          error:
            "This account is not linked to a staff record.",
        },
        {
          status: 403,
        }
      );
    }

    const staffId =
      session.staffId;

    const staff =
      await prisma.staff.findUnique({
        where: {
          id: staffId,
        },
        select: {
          id: true,
          role: true,
          isActive: true,
        },
      });

    if (
      !staff ||
      !staff.isActive
    ) {
      return NextResponse.json(
        {
          error:
            "Active staff account required.",
        },
        {
          status: 403,
        }
      );
    }

    const isSuperAdmin =
      session.role ===
      "SUPER_ADMIN";

    const canReceiveStock =
      isSuperAdmin ||
      staff.role ===
        "WAREHOUSE_MANAGER";

    if (!canReceiveStock) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to receive warehouse stock.",
        },
        {
          status: 403,
        }
      );
    }

    const body =
      await req.json();

    const productId =
      typeof body?.productId ===
      "string"
        ? body.productId.trim()
        : "";

    const quantity =
      Number(body?.quantity);

    if (!productId) {
      return NextResponse.json(
        {
          error:
            "Product is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Quantity must be a positive whole number.",
        },
        {
          status: 400,
        }
      );
    }

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          id: true,
          isActive: true,
        },
      });

    if (!product) {
      return NextResponse.json(
        {
          error:
            "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (!product.isActive) {
      return NextResponse.json(
        {
          error:
            "Inactive products cannot receive stock.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await receivePurchase({
        productId,
        warehouseId:
          WAREHOUSE_ID,
        quantity,
        createdByStaffId:
          staffId,
      });

    return NextResponse.json(
      result
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "Unauthorized"
    ) {
      return NextResponse.json(
        {
          error:
            "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "CredentialChangeRequired"
    ) {
      return NextResponse.json(
        {
          error:
            "Credential change required.",
        },
        {
          status: 403,
        }
      );
    }

    console.error(
      "Receive stock failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to receive stock.",
      },
      {
        status: 500,
      }
    );
  }
}
