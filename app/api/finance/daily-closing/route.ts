import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
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

class DailyClosingError extends Error {
  status: number;

  constructor(
    message: string,
    status = 400
  ) {
    super(message);
    this.name = "DailyClosingError";
    this.status = status;
  }
}

function parseBusinessDate(
  value: unknown
) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    throw new DailyClosingError(
      "A valid business date is required"
    );
  }

  const startOfDay = new Date(
    `${value}T00:00:00.000Z`
  );

  if (
    Number.isNaN(
      startOfDay.getTime()
    )
  ) {
    throw new DailyClosingError(
      "A valid business date is required"
    );
  }

  const endOfDay = new Date(
    `${value}T23:59:59.999Z`
  );

  const today = new Date();

  const todayDate =
    `${today.getUTCFullYear()}-` +
    `${String(
      today.getUTCMonth() + 1
    ).padStart(2, "0")}-` +
    `${String(
      today.getUTCDate()
    ).padStart(2, "0")}`;

  if (value > todayDate) {
    throw new DailyClosingError(
      "Future business dates are not allowed"
    );
  }

  return {
    businessDate: startOfDay,
    startOfDay,
    endOfDay,
  };
}

function parseGhsToPesewas(
  value: unknown,
  fieldName: string
) {
  const text =
    typeof value === "number"
      ? value.toFixed(2)
      : typeof value === "string"
        ? value.trim()
        : "";

  if (
    !/^\d+(\.\d{1,2})?$/.test(
      text
    )
  ) {
    throw new DailyClosingError(
      `${fieldName} must be a valid amount with no more than two decimal places`
    );
  }

  const [
    cedisPart,
    pesewasPart = "",
  ] = text.split(".");

  const cedis =
    Number(cedisPart);

  const pesewas =
    Number(
      pesewasPart.padEnd(
        2,
        "0"
      )
    );

  const result =
    cedis * 100 +
    pesewas;

  if (
    !Number.isSafeInteger(
      result
    ) ||
    result < 0
  ) {
    throw new DailyClosingError(
      `${fieldName} is invalid`
    );
  }

  return result;
}

function decimalGhsToPesewas(
  value: {
    toString(): string;
  } | null
) {
  if (!value) {
    return 0;
  }

  const text =
    value.toString();

  const match =
    text.match(
      /^(-?)(\d+)(?:\.(\d{1,2}))?$/
    );

  if (!match) {
    throw new DailyClosingError(
      "Unable to reconcile a finance amount",
      500
    );
  }

  const sign =
    match[1] === "-"
      ? -1
      : 1;

  const cedis =
    Number(match[2]);

  const pesewas =
    Number(
      (match[3] ?? "").padEnd(
        2,
        "0"
      )
    );

  const result =
    sign *
    (cedis * 100 + pesewas);

  if (
    !Number.isSafeInteger(
      result
    )
  ) {
    throw new DailyClosingError(
      "Unable to reconcile a finance amount",
      500
    );
  }

  return result;
}

function pesewasToGhs(
  amountPesewas: number
) {
  return amountPesewas / 100;
}

async function getSession() {
  const session =
    (await requireAdmin()) as AdminSession;

  if (!session.staffId) {
    throw new DailyClosingError(
      "Your admin account is not linked to a staff record.",
      401
    );
  }

  if (!session.branchId) {
    throw new DailyClosingError(
      "Your staff account is not assigned to a branch.",
      400
    );
  }

  return {
    staffId:
      session.staffId,
    branchId:
      session.branchId,
  };
}

export async function GET() {
  try {
    const session =
      await getSession();

    const closings =
      await prisma.dailyClosing.findMany({
        where: {
          branchId:
            session.branchId,
        },

        orderBy: {
          businessDate: "desc",
        },

        include: {
          branch: true,
          closedByStaff: true,
          expenses: true,
          purchases: true,
          bankDeposits: true,
        },
      });

    return NextResponse.json(
      closings
    );
  } catch (error) {
    console.error(
      "Daily closing loading error:",
      error
    );

    if (
      error instanceof
      DailyClosingError
    ) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: error.status,
        }
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "";

    if (message === "Unauthorized") {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Failed to fetch daily closings",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  req: Request
) {
  try {
    const session =
      await getSession();

    const body =
      await req.json();

    const {
      businessDate,
      startOfDay,
      endOfDay,
    } = parseBusinessDate(
      body?.businessDate
    );

    const openingFloatPesewas =
      parseGhsToPesewas(
        body?.openingFloat,
        "Opening Float"
      );

    const actualCashPesewas =
      parseGhsToPesewas(
        body?.actualCash,
        "Actual Cash"
      );

    const varianceReason =
      typeof body?.varianceReason ===
        "string" &&
      body.varianceReason.trim()
        ? body.varianceReason.trim()
        : null;

    const result =
      await prisma.$transaction(
        async (tx) => {
          const existingClosing =
            await tx.dailyClosing.findFirst({
              where: {
                branchId:
                  session.branchId,

                businessDate,
              },
            });

          if (existingClosing) {
            throw new DailyClosingError(
              "Daily closing already exists for this business date"
            );
          }

          /*
           * STANDARD CASH SALES
           *
           * Only successfully PAID orders count.
           *
           * amountPesewas is authoritative for
           * modern POS orders. Legacy orders fall
           * back safely through the shared money
           * helper.
           */
          const cashOrders =
            await tx.order.findMany({
              where: {
                locationId:
                  session.branchId,

                paymentStatus:
                  "PAID",

                paymentMethod:
                  "CASH",

                createdAt: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
              },

              select: {
                amount: true,
                amountPesewas: true,
              },
            });

          const standardCashSalesPesewas =
            cashOrders.reduce(
              (
                total,
                order
              ) =>
                total +
                getRequiredOrderAmountPesewas(
                  order
                ),
              0
            );

          /*
           * SPLIT CASH SALES
           *
           * A completed split sale stores the
           * Cash component in OrderPayment.
           *
           * We count only:
           *   - CASH allocations
           *   - CONFIRMED allocations
           *   - belonging to a PAID SPLIT order
           *   - belonging to this branch
           *   - whose order was created during
           *     this business date
           *
           * A Cash allocation attached to an
           * incomplete/failed split order must
           * not enter final daily sales.
           */
          const splitCashPayments =
            await tx.orderPayment.findMany({
              where: {
                method: "CASH",

                status:
                  "CONFIRMED",

                order: {
                  locationId:
                    session.branchId,

                  paymentStatus:
                    "PAID",

                  paymentMethod:
                    "SPLIT",

                  createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                  },
                },
              },

              select: {
                amountPesewas: true,
              },
            });

          const splitCashSalesPesewas =
            splitCashPayments.reduce(
              (
                total,
                payment
              ) =>
                total +
                payment.amountPesewas,
              0
            );

          const cashSalesPesewas =
            standardCashSalesPesewas +
            splitCashSalesPesewas;

          const [
            expenseTotals,
            purchaseTotals,
            bankDepositTotals,
          ] = await Promise.all([
            tx.expense.aggregate({
              _sum: {
                amount: true,
              },

              where: {
                branchId:
                  session.branchId,

                createdAt: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
              },
            }),

            tx.purchase.aggregate({
              _sum: {
                amount: true,
              },

              where: {
                branchId:
                  session.branchId,

                createdAt: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
              },
            }),

            tx.bankDeposit.aggregate({
              _sum: {
                amount: true,
              },

              where: {
                branchId:
                  session.branchId,

                createdAt: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
              },
            }),
          ]);

          const expenseTotalPesewas =
            decimalGhsToPesewas(
              expenseTotals._sum
                .amount
            );

          const purchaseTotalPesewas =
            decimalGhsToPesewas(
              purchaseTotals._sum
                .amount
            );

          const bankDepositTotalPesewas =
            decimalGhsToPesewas(
              bankDepositTotals._sum
                .amount
            );

          /*
           * Purchases are deliberately NOT
           * subtracted from expected till cash.
           *
           * The current Purchase model does not
           * record its payment method, so a
           * purchase could have been paid by
           * cash, bank transfer, credit, etc.
           *
           * Expenses and Bank Deposits are known
           * till-cash movements and therefore
           * affect expected cash.
           */
          const expectedCashPesewas =
            openingFloatPesewas +
            cashSalesPesewas -
            expenseTotalPesewas -
            bankDepositTotalPesewas;

          const variancePesewas =
            actualCashPesewas -
            expectedCashPesewas;

          const closing =
            await tx.dailyClosing.create({
              data: {
                businessDate,

                openingFloat:
                  pesewasToGhs(
                    openingFloatPesewas
                  ),

                expectedCash:
                  pesewasToGhs(
                    expectedCashPesewas
                  ),

                actualCash:
                  pesewasToGhs(
                    actualCashPesewas
                  ),

                variance:
                  pesewasToGhs(
                    variancePesewas
                  ),

                varianceReason,

                branchId:
                  session.branchId,

                closedByStaffId:
                  session.staffId,
              },
            });

          /*
           * Attach the day's finance records to
           * this closing for a durable audit
           * trail.
           *
           * Only currently-unattached rows are
           * linked so an older closing can never
           * be silently reassigned.
           */
          await tx.expense.updateMany({
            where: {
              branchId:
                session.branchId,

              dailyClosingId:
                null,

              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },

            data: {
              dailyClosingId:
                closing.id,
            },
          });

          await tx.purchase.updateMany({
            where: {
              branchId:
                session.branchId,

              dailyClosingId:
                null,

              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },

            data: {
              dailyClosingId:
                closing.id,
            },
          });

          await tx.bankDeposit.updateMany({
            where: {
              branchId:
                session.branchId,

              dailyClosingId:
                null,

              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },

            data: {
              dailyClosingId:
                closing.id,
            },
          });

          return {
            closing,

            cashSalesPesewas,

            standardCashSalesPesewas,

            splitCashSalesPesewas,

            expenseTotalPesewas,

            purchaseTotalPesewas,

            bankDepositTotalPesewas,

            expectedCashPesewas,

            variancePesewas,
          };
        },
        {
          maxWait: 10000,
          timeout: 30000,
        }
      );

    return NextResponse.json({
      ...result.closing,

      cashSales:
        pesewasToGhs(
          result.cashSalesPesewas
        ),

      standardCashSales:
        pesewasToGhs(
          result.standardCashSalesPesewas
        ),

      splitCashSales:
        pesewasToGhs(
          result.splitCashSalesPesewas
        ),

      expenseTotal:
        pesewasToGhs(
          result.expenseTotalPesewas
        ),

      purchaseTotal:
        pesewasToGhs(
          result.purchaseTotalPesewas
        ),

      bankDepositTotal:
        pesewasToGhs(
          result.bankDepositTotalPesewas
        ),

      expectedCash:
        pesewasToGhs(
          result.expectedCashPesewas
        ),

      variance:
        pesewasToGhs(
          result.variancePesewas
        ),
    });
  } catch (error) {
    console.error(
      "Daily closing creation error:",
      error
    );

    if (
      error instanceof
      DailyClosingError
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

    const message =
      error instanceof Error
        ? error.message
        : "";

    if (message === "Unauthorized") {
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

    return NextResponse.json(
      {
        error:
          "Failed to create daily closing",
      },
      {
        status: 500,
      }
    );
  }
}
