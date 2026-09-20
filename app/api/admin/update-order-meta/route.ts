import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  PaymentStatus,
} from "@prisma/client";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const runtime =
  "nodejs";

function toPesewas(
  amountGhs: number
) {
  return Math.round(
    amountGhs * 100
  );
}

async function requireOrderManager() {
  const session =
    await requireAdmin();

  if (!session.staffId) {
    throw new Error(
      "StaffAccountRequired"
    );
  }

  const staff =
    await prisma.staff.findUnique({
      where: {
        id:
          session.staffId,
      },
      select: {
        id: true,
        role: true,
        isActive: true,
        branchId: true,
      },
    });

  if (
    !staff ||
    !staff.isActive
  ) {
    throw new Error(
      "InactiveStaff"
    );
  }

  const isSuperAdmin =
    session.role ===
      "SUPER_ADMIN" ||
    staff.role ===
      "SUPER_ADMIN";

  const canManageOrderMeta =
    isSuperAdmin ||
    staff.role ===
      "MANAGER";

  if (!canManageOrderMeta) {
    throw new Error(
      "OrderManagementForbidden"
    );
  }

  if (!session.branchId) {
    throw new Error(
      "BranchRequired"
    );
  }

  /*
   * The authenticated branch carried by the
   * signed session must agree with the linked
   * Staff record for normal managers.
   *
   * We intentionally do not compare Order.locationId
   * here yet because legacy/web orders can use
   * non-Branch identifiers such as shop-kasoa.
   */
  if (
    !isSuperAdmin &&
    staff.branchId !==
      session.branchId
  ) {
    throw new Error(
      "BranchManagementForbidden"
    );
  }

  return {
    session,
    staff,
    isSuperAdmin,
  };
}

function authErrorResponse(
  error: unknown
) {
  if (!(error instanceof Error)) {
    return null;
  }

  if (
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

  if (
    error.message ===
      "StaffAccountRequired" ||
    error.message ===
      "InactiveStaff"
  ) {
    return NextResponse.json(
      {
        error:
          "An active linked staff account is required.",
      },
      {
        status: 403,
      }
    );
  }

  if (
    error.message ===
    "OrderManagementForbidden"
  ) {
    return NextResponse.json(
      {
        error:
          "You do not have permission to modify order metadata.",
      },
      {
        status: 403,
      }
    );
  }

  if (
    error.message ===
    "BranchRequired"
  ) {
    return NextResponse.json(
      {
        error:
          "Your staff account is not assigned to a branch.",
      },
      {
        status: 400,
      }
    );
  }

  if (
    error.message ===
    "BranchManagementForbidden"
  ) {
    return NextResponse.json(
      {
        error:
          "You do not have permission to manage orders for this branch.",
      },
      {
        status: 403,
      }
    );
  }

  return null;
}

export async function POST(
  req: NextRequest
) {
  try {
    await requireOrderManager();

    let body: unknown;

    try {
      body =
        await req.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid JSON request body.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body !==
        "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const record =
      body as Record<
        string,
        unknown
      >;

    const orderId =
      typeof record.orderId ===
        "string"
        ? record.orderId.trim()
        : typeof record.reference ===
            "string"
          ? record.reference.trim()
          : "";

    if (!orderId) {
      return NextResponse.json(
        {
          error:
            "Missing order identifier.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ==========================================
     * LOAD ORDER + STORED ITEMS
     * ==========================================
     */
    const order =
      await prisma.order.findUnique({
        where: {
          orderId,
        },

        include: {
          orderItems: {
            select: {
              totalPrice: true,
            },
          },
        },
      });

    if (!order) {
      return NextResponse.json(
        {
          error:
            "Order not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * ==========================================
     * FINANCIAL LOCK
     * ==========================================
     *
     * Once payment is confirmed or fulfilment
     * has begun, delivery/total values are no
     * longer editable.
     */
    const isFinanciallyLocked =
      order.paymentStatus ===
        PaymentStatus.PAID ||
      order.paymentStatus ===
        PaymentStatus.DELIVERING ||
      order.paymentStatus ===
        PaymentStatus.COMPLETED;

    const hasDeliveryFee =
      Object.prototype.hasOwnProperty.call(
        record,
        "deliveryFee"
      );

    const hasAdminNotes =
      Object.prototype.hasOwnProperty.call(
        record,
        "adminNotes"
      );

    if (
      !hasDeliveryFee &&
      !hasAdminNotes
    ) {
      return NextResponse.json(
        {
          error:
            "Provide deliveryFee or adminNotes to update the order.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      isFinanciallyLocked &&
      hasDeliveryFee
    ) {
      return NextResponse.json(
        {
          error:
            "Delivery fee cannot be modified after payment is confirmed.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * ==========================================
     * PREPARE UPDATE
     * ==========================================
     */
    const updateData: {
      deliveryFee?:
        number | null;
      adminNotes?:
        string | null;
      amount?:
        number;
      amountPesewas?:
        number;
    } = {};

    /*
     * Admin notes remain editable regardless
     * of payment state.
     */
    if (hasAdminNotes) {
      if (
        record.adminNotes !==
          null &&
        typeof record.adminNotes !==
          "string"
      ) {
        return NextResponse.json(
          {
            error:
              "Admin notes must be text.",
          },
          {
            status: 400,
          }
        );
      }

      const notes =
        typeof record.adminNotes ===
          "string"
          ? record.adminNotes.trim()
          : "";

      updateData.adminNotes =
        notes || null;
    }

    /*
     * ==========================================
     * DELIVERY FEE + TOTAL RECALCULATION
     * ==========================================
     */
    if (
      !isFinanciallyLocked &&
      hasDeliveryFee
    ) {
      const deliveryFee =
        record.deliveryFee;

      if (
        typeof deliveryFee !==
          "number" ||
        !Number.isFinite(
          deliveryFee
        ) ||
        deliveryFee < 0
      ) {
        return NextResponse.json(
          {
            error:
              "Delivery fee must be zero or a positive amount.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * Stored OrderItem totals are authoritative
       * for merchandise value of this already
       * created pending order.
       */
      const merchandisePesewas =
        order.orderItems.reduce(
          (
            total,
            item
          ) => {
            const itemTotal =
              Number(
                item.totalPrice
              );

            if (
              !Number.isFinite(
                itemTotal
              ) ||
              itemTotal < 0
            ) {
              throw new Error(
                "Order contains an invalid item total."
              );
            }

            return (
              total +
              toPesewas(
                itemTotal
              )
            );
          },
          0
        );

      const deliveryFeePesewas =
        toPesewas(
          deliveryFee
        );

      const totalAmountPesewas =
        merchandisePesewas +
        deliveryFeePesewas;

      if (
        !Number.isSafeInteger(
          totalAmountPesewas
        ) ||
        totalAmountPesewas <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "Order total must be greater than zero.",
          },
          {
            status: 400,
          }
        );
      }

      updateData.deliveryFee =
        deliveryFee;

      updateData.amountPesewas =
        totalAmountPesewas;

      /*
       * Legacy compatibility field.
       * Modern payment logic uses amountPesewas.
       */
      updateData.amount =
        Math.round(
          totalAmountPesewas /
            100
        );
    }

    const updatedOrder =
      await prisma.order.update({
        where: {
          id:
            order.id,
        },

        data:
          updateData,

        select: {
          orderId: true,
          deliveryFee: true,
          amount: true,
          amountPesewas: true,
          adminNotes: true,
          paymentStatus: true,
        },
      });

    return NextResponse.json({
      success: true,

      order:
        updatedOrder,
    });
  } catch (error) {
    const authResponse =
      authErrorResponse(
        error
      );

    if (authResponse) {
      return authResponse;
    }

    console.error(
      "update-order-meta error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update order meta.",
      },
      {
        status: 500,
      }
    );
  }
}
