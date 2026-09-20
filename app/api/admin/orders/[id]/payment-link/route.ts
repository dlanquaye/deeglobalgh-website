import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { ensureOrderPaymentToken } from "@/lib/payments/ensureOrderPaymentToken";
import { getRequiredOrderAmountPesewas } from "@/lib/pos/orderMoney";

export const runtime =
  "nodejs";

function getSiteUrl(
  req: NextRequest
) {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (
    configuredUrl &&
    !configuredUrl.includes(
      "localhost"
    ) &&
    !configuredUrl.includes(
      "127.0.0.1"
    )
  ) {
    return configuredUrl.replace(
      /\/+$/,
      ""
    );
  }

  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    return "https://www.shopdeeglobalgh.com";
  }

  return req.nextUrl.origin;
}

async function requirePaymentLinkManager() {
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

  const canCreatePaymentLink =
    isSuperAdmin ||
    staff.role ===
      "MANAGER";

  if (
    !canCreatePaymentLink
  ) {
    throw new Error(
      "PaymentLinkForbidden"
    );
  }

  if (!session.branchId) {
    throw new Error(
      "BranchRequired"
    );
  }

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
    "PaymentLinkForbidden"
  ) {
    return NextResponse.json(
      {
        error:
          "You do not have permission to create payment links.",
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
          "You do not have permission to manage payment links for this branch.",
      },
      {
        status: 403,
      }
    );
  }

  return null;
}

export async function POST(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await requirePaymentLinkManager();

    const {
      id,
    } =
      await context.params;

    const cleanId =
      String(
        id ?? ""
      ).trim();

    if (!cleanId) {
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

    const order =
      await prisma.order.findUnique({
        where: {
          id:
            cleanId,
        },

        select: {
          id: true,
          orderId: true,
          paymentStatus: true,
          deliveryFee: true,
          amount: true,
          amountPesewas: true,
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

    if (
      order.paymentStatus ===
        "PAID" ||
      order.paymentStatus ===
        "DELIVERING" ||
      order.paymentStatus ===
        "COMPLETED"
    ) {
      return NextResponse.json(
        {
          error:
            "This order has already been paid.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * The delivery fee must have been explicitly
     * confirmed before a continuation payment
     * link can be issued.
     *
     * Zero remains valid for an explicitly
     * agreed free-delivery arrangement.
     */
    if (
      order.deliveryFee ===
        null ||
      order.deliveryFee ===
        undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Confirm and save the delivery fee before creating a payment link.",
        },
        {
          status: 400,
        }
      );
    }

    const amountPesewas =
      getRequiredOrderAmountPesewas(
        order
      );

    if (
      !Number.isSafeInteger(
        amountPesewas
      ) ||
      amountPesewas <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "The order does not have a valid payable total.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ensureOrderPaymentToken() reuses the
     * existing secure token when present rather
     * than creating a competing payment identity.
     */
    const paymentToken =
      await ensureOrderPaymentToken(
        order.id
      );

    const siteUrl =
      getSiteUrl(
        req
      );

    const paymentUrl =
      `${siteUrl}/pay/${paymentToken}`;

    return NextResponse.json({
      success: true,

      order: {
        id:
          order.id,

        orderId:
          order.orderId,

        deliveryFee:
          order.deliveryFee,

        amountPesewas,
      },

      paymentUrl,
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
      "create order payment link error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create payment link.",
      },
      {
        status: 500,
      }
    );
  }
}
