import {
  randomBytes,
} from "node:crypto";

import {
  cookies,
} from "next/headers";

import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/prisma";

type AdminSession = {
  adminId?: string;
  role?: string;
  staffId?: string | null;
  branchId?: string | null;
  staffName?: string | null;
};

type HeldCartItemInput = {
  id: string;
  name: string;
  retailPrice: number;
  quantity: number;
};

type HeldDiscountInput = {
  enabled: boolean;
  type: string;
  value: string;
  reason: string;
  note: string;
};

class HeldSaleError extends Error {
  status: number;

  constructor(
    message: string,
    status = 400
  ) {
    super(message);

    this.name =
      "HeldSaleError";

    this.status =
      status;
  }
}

async function getAdminSession():
  Promise<AdminSession | null> {
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

function createHoldNumber() {
  return (
    `HOLD-${Date.now()}-` +
    randomBytes(
      3
    ).toString("hex")
      .toUpperCase()
  );
}

function normaliseCart(
  value: unknown
): HeldCartItemInput[] {
  if (
    !Array.isArray(value) ||
    value.length === 0
  ) {
    throw new HeldSaleError(
      "Cannot hold an empty cart"
    );
  }

  const cart:
    HeldCartItemInput[] = [];

  for (
    const rawItem of value
  ) {
    if (
      !rawItem ||
      typeof rawItem !==
        "object" ||
      !("id" in rawItem) ||
      !("name" in rawItem) ||
      !("retailPrice" in rawItem) ||
      !("quantity" in rawItem)
    ) {
      throw new HeldSaleError(
        "Invalid held-sale cart item"
      );
    }

    const id =
      String(
        rawItem.id
      ).trim();

    const name =
      String(
        rawItem.name
      ).trim();

    const retailPrice =
      Number(
        rawItem.retailPrice
      );

    const quantity =
      Number(
        rawItem.quantity
      );

    if (
      !id ||
      !name
    ) {
      throw new HeldSaleError(
        "Held-sale item is missing product information"
      );
    }

    if (
      !Number.isFinite(
        retailPrice
      ) ||
      retailPrice <= 0
    ) {
      throw new HeldSaleError(
        `Invalid price for ${name}`
      );
    }

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity <= 0
    ) {
      throw new HeldSaleError(
        `Invalid quantity for ${name}`
      );
    }

    cart.push({
      id,
      name,
      retailPrice,
      quantity,
    });
  }

  return cart;
}

function normaliseText(
  value: unknown
) {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
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

    if (
      !session.branchId
    ) {
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

    const heldSales =
      await prisma.posHeldSale.findMany({
        where: {
          branchId:
            session.branchId,

          status:
            "HELD",
        },

        orderBy: {
          createdAt:
            "asc",
        },
      });

    return NextResponse.json({
      success:
        true,

      heldSales,
    });
  } catch (error) {
    console.error(
      "Load held POS sales error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load held sales",
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

    if (
      !session.branchId
    ) {
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

    const actorId =
      session.staffId ??
      session.adminId;

    if (!actorId) {
      return NextResponse.json(
        {
          error:
            "No staff or admin identity is available",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await req.json();

    const cart =
      normaliseCart(
        body.cart
      );

    /*
     * A real payment must never be converted
     * into a generic held sale.
     *
     * Once Paystack has been contacted or
     * confirmed Split Cash exists, the payment
     * recovery workflow is authoritative.
     */
    if (
      body.hasPendingMomo ===
        true ||
      body.hasFailedSplitPayment ===
        true
    ) {
      throw new HeldSaleError(
        "This sale already has payment activity and cannot be held. Complete or recover the existing payment instead."
      );
    }

    const paymentMethod =
      normaliseText(
        body.paymentMethod
      ).toUpperCase() ||
      "CASH";

    if (
      ![
        "CASH",
        "BANK_TRANSFER",
        "MOMO",
        "SPLIT",
      ].includes(
        paymentMethod
      )
    ) {
      throw new HeldSaleError(
        "Invalid payment method"
      );
    }

    const subtotalPesewas =
      cart.reduce(
        (
          sum,
          item
        ) =>
          sum +
          Math.round(
            item.retailPrice *
              100
          ) *
            item.quantity,
        0
      );

    if (
      !Number.isSafeInteger(
        subtotalPesewas
      ) ||
      subtotalPesewas <=
        0
    ) {
      throw new HeldSaleError(
        "Invalid held-sale subtotal"
      );
    }

    const itemCount =
      cart.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.quantity,
        0
      );

    const rawDiscount =
      body.discount;

    let discountSnapshot:
      HeldDiscountInput |
      null = null;

    if (
      rawDiscount &&
      typeof rawDiscount ===
        "object" &&
      !Array.isArray(
        rawDiscount
      )
    ) {
      discountSnapshot = {
        enabled:
          rawDiscount.enabled ===
          true,

        type:
          normaliseText(
            rawDiscount.type
          ),

        value:
          normaliseText(
            rawDiscount.value
          ),

        reason:
          normaliseText(
            rawDiscount.reason
          ),

        note:
          normaliseText(
            rawDiscount.note
          ),
      };
    }

    const heldSale =
      await prisma.posHeldSale.create({
        data: {
          holdNumber:
            createHoldNumber(),

          branchId:
            session.branchId,

          createdByStaffId:
            actorId,

          createdByName:
            session.staffName ??
            null,

          label:
            normaliseText(
              body.label
            ) ||
            null,

          customerName:
            normaliseText(
              body.customerName
            ) ||
            null,

          customerPhone:
            normaliseText(
              body.customerPhone
            ) ||
            null,

          paymentMethod,

          momoProvider:
            normaliseText(
              body.momoProvider
            ) ||
            null,

          splitCashAmount:
            normaliseText(
              body.splitCashAmount
            ) ||
            null,

          itemCount,

          subtotalPesewas,

          cartSnapshot:
            cart,

          ...(discountSnapshot
            ? {
                discountSnapshot,
              }
            : {}),
        },
      });

    return NextResponse.json(
      {
        success:
          true,

        heldSale,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Hold POS sale error:",
      error
    );

    if (
      error instanceof
      HeldSaleError
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

    return NextResponse.json(
      {
        error:
          "Unable to hold sale",
      },
      {
        status: 500,
      }
    );
  }
}
