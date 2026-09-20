export const runtime = "nodejs";

import {
  PaymentStatus,
} from "@prisma/client";
import {
  endOfDay,
  startOfDay,
} from "date-fns";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    const staff =
      await prisma.staff.findUnique({
        where: {
          id: session.staffId,
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

    const canViewDailyReport =
      isSuperAdmin ||
      staff.role ===
        "MANAGER";

    if (!canViewDailyReport) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to view the daily report.",
        },
        {
          status: 403,
        }
      );
    }

    const todayStart =
      startOfDay(new Date());

    const todayEnd =
      endOfDay(new Date());

    /*
     * GET TODAY'S ORDERS
     */
    const orders =
      await prisma.order.findMany({
        where: {
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      });

    /*
     * CALCULATIONS
     */
    const totalOrders =
      orders.length;

    const totalRevenue =
      orders
        .filter(
          (order) =>
            order.paymentStatus ===
            PaymentStatus.COMPLETED
        )
        .reduce(
          (sum, order) =>
            sum + order.amount,
          0
        );

    const processingCount =
      orders.filter(
        (order) =>
          order.paymentStatus ===
          PaymentStatus.DELIVERING
      ).length;

    const deliveredCount =
      orders.filter(
        (order) =>
          order.paymentStatus ===
          PaymentStatus.COMPLETED
      ).length;

    const cancelledCount =
      orders.filter(
        (order) =>
          order.paymentStatus ===
          PaymentStatus.CANCELLED
      ).length;

    /*
     * WHATSAPP-FRIENDLY MESSAGE
     *
     * Plain Unicode-safe text is used
     * here to avoid the mojibake that
     * existed in the previous file.
     */
    const message =
      `DeeglobalGH Daily Report

Orders: ${totalOrders}
Revenue: GHS ${totalRevenue}
Delivering: ${processingCount}
Completed: ${deliveredCount}
Cancelled: ${cancelledCount}`;

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      processingCount,
      deliveredCount,
      cancelledCount,
      message,
    });
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
      "DAILY REPORT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to generate report",
      },
      {
        status: 500,
      }
    );
  }
}
