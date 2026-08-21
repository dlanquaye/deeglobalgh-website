import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/app/lib/adminAuth";
import { ensureOrderPaymentToken } from "@/lib/payments/ensureOrderPaymentToken";
import { getRequiredOrderAmountPesewas } from "@/lib/pos/orderMoney";

export const runtime = "nodejs";

function getSiteUrl(
  req: NextRequest
) {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (
    configuredUrl &&
    !configuredUrl.includes("localhost") &&
    !configuredUrl.includes("127.0.0.1")
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

export async function POST(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await requireAdmin();

    const { id } =
      await context.params;

    if (!id) {
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
          id,
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
      order.paymentStatus === "PAID" ||
      order.paymentStatus === "DELIVERING" ||
      order.paymentStatus === "COMPLETED"
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
     * A delivery fee must have been explicitly
     * confirmed by staff before a continuation
     * payment link can be issued.
     *
     * Zero remains valid for an explicitly agreed
     * free-delivery arrangement.
     */
    if (
      order.deliveryFee === null ||
      order.deliveryFee === undefined
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

    const paymentToken =
      await ensureOrderPaymentToken(
        order.id
      );

    const siteUrl =
      getSiteUrl(req);

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
