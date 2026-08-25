export const runtime = "nodejs";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  OrderPaymentStatus,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  getRequiredOrderAmountPesewas,
} from "@/lib/pos/orderMoney";

type AdminSession = {
  adminId?: string;
  role?: string;
  staffId?: string | null;
  branchId?: string | null;
  staffName?: string | null;
};

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

export async function GET() {
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

    const orders =
      await prisma.order.findMany({
        where: {
          locationId:
            session.branchId,

          paymentStatus:
            PaymentStatus.PENDING,

          paymentMethod:
            "SPLIT",

          stockReduced:
            false,

          payments: {
            some: {
              method:
                PaymentMethod.CASH,

              status:
                OrderPaymentStatus.CONFIRMED,
            },
          },
        },

        orderBy: {
          createdAt:
            "desc",
        },

        take:
          20,

        include: {
          payments: {
            orderBy: {
              createdAt:
                "asc",
            },
          },

          orderItems: {
            include: {
              product: {
                select: {
                  id:
                    true,

                  name:
                    true,

                  sku:
                    true,

                  stockQty:
                    true,
                },
              },
            },
          },
        },
      });

    const recoverableOrders =
      orders
        .map((order) => {
          const requiredAmountPesewas =
            getRequiredOrderAmountPesewas(
              order
            );

          const confirmedPayments =
            order.payments.filter(
              (payment) =>
                payment.status ===
                OrderPaymentStatus.CONFIRMED
            );

          const confirmedAmountPesewas =
            confirmedPayments.reduce(
              (
                total,
                payment
              ) =>
                total +
                payment.amountPesewas,
              0
            );

          const confirmedCashPesewas =
            confirmedPayments
              .filter(
                (payment) =>
                  payment.method ===
                  PaymentMethod.CASH
              )
              .reduce(
                (
                  total,
                  payment
                ) =>
                  total +
                  payment.amountPesewas,
                0
              );

          const outstandingAmountPesewas =
            Math.max(
              0,
              requiredAmountPesewas -
                confirmedAmountPesewas
            );

          const pendingMomo =
            order.payments.find(
              (payment) =>
                payment.method ===
                  PaymentMethod.MOMO &&
                payment.provider ===
                  "PAYSTACK" &&
                payment.status ===
                  OrderPaymentStatus.PENDING
            );

          const failedMomoPayments =
            order.payments.filter(
              (payment) =>
                payment.method ===
                  PaymentMethod.MOMO &&
                payment.provider ===
                  "PAYSTACK" &&
                payment.status ===
                  OrderPaymentStatus.FAILED
            );

          const latestMomo =
            [...order.payments]
              .reverse()
              .find(
                (payment) =>
                  payment.method ===
                    PaymentMethod.MOMO &&
                  payment.provider ===
                    "PAYSTACK"
              );

          const safeToRetry =
            outstandingAmountPesewas >
              0 &&
            !pendingMomo &&
            failedMomoPayments.length >
              0;

          return {
            orderId:
              order.orderId,

            createdAt:
              order.createdAt,

            customerName:
              order.customerName,

            customerPhone:
              order.phone,

            requiredAmountPesewas,

            confirmedAmountPesewas,

            confirmedCashPesewas,

            outstandingAmountPesewas,

            stockReduced:
              order.stockReduced,

            paymentStatus:
              order.paymentStatus,

            provider:
              latestMomo
                ?.providerCode ??
              null,

            momoPhone:
              latestMomo
                ?.phone ??
              order.phone,

            hasPendingMomo:
              Boolean(
                pendingMomo
              ),

            pendingMomo:
              pendingMomo
                ? {
                    paymentId:
                      pendingMomo.id,

                    reference:
                      pendingMomo.providerReference,

                    amountPesewas:
                      pendingMomo.amountPesewas,

                    providerStatus:
                      pendingMomo.providerStatus,
                  }
                : null,

            failedMomoAttempts:
              failedMomoPayments.map(
                (payment) => ({
                  paymentId:
                    payment.id,

                  reference:
                    payment.providerReference,

                  amountPesewas:
                    payment.amountPesewas,

                  providerStatus:
                    payment.providerStatus,

                  createdAt:
                    payment.createdAt,
                })
              ),

            safeToRetry,

            items:
              order.orderItems.map(
                (item) => ({
                  productId:
                    item.productId,

                  name:
                    item.product.name,

                  sku:
                    item.product.sku,

                  quantity:
                    item.quantity,

                  currentStockQty:
                    item.product.stockQty,
                })
              ),
          };
        })
        .filter(
          (order) =>
            order.outstandingAmountPesewas >
            0
        );

    return NextResponse.json(
      {
        success:
          true,

        orders:
          recoverableOrders,
      },
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "POS split recovery lookup error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load recoverable split payments",
      },
      {
        status: 500,
      }
    );
  }
}