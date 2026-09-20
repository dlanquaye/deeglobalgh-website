
import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/prisma";

import {
  requireAdmin,
} from "@/app/lib/adminAuth";


type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};


// ==========================================
// GET ONE ACTIVE / RESUMED HELD SALE
// ==========================================
//
// Both HELD and RESUMED remain recoverable.
//
// A resumed sale must stay persistent until it
// is either:
// - converted into a real Order, or
// - explicitly abandoned.
//
export async function GET(
  _req: Request,
  context: RouteContext
) {
  try {
    let session;

    try {
      session =
        await requireAdmin();
    } catch {
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

    const {
      id,
    } = await context.params;

    const heldSale =
      await prisma.posHeldSale.findFirst({
        where: {
          id,

          branchId:
            session.branchId,

          status: {
            in: [
              "HELD",
              "RESUMED",
            ],
          },
        },
      });

    if (!heldSale) {
      return NextResponse.json(
        {
          error:
            "Held sale not found or is no longer recoverable",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success:
        true,

      heldSale,
    });
  } catch (error) {
    console.error(
      "Load held POS sale error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load held sale",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// PATCH / RESUME HELD SALE
// ==========================================
//
// First resume:
// HELD -> RESUMED
//
// A later resume attempt on an already RESUMED
// sale is allowed so that browser refresh or
// accidental navigation does not destroy the
// cashier's ability to recover the sale.
//
// No payment, stock or order activity occurs
// here.
//
export async function PATCH(
  req: Request,
  context: RouteContext
) {
  try {
    let session;

    try {
      session =
        await requireAdmin();
    } catch {
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

    const {
      id,
    } = await context.params;

    let body: unknown = null;

    try {
      body =
        await req.json();
    } catch {
      body = null;
    }

    if (
      !body ||
      typeof body !==
        "object" ||
      Array.isArray(body) ||
      !("action" in body) ||
      body.action !==
        "RESUME"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid held-sale action",
        },
        {
          status: 400,
        }
      );
    }

    const current =
      await prisma.posHeldSale.findFirst({
        where: {
          id,

          branchId:
            session.branchId,

          status: {
            in: [
              "HELD",
              "RESUMED",
            ],
          },
        },
      });

    if (!current) {
      return NextResponse.json(
        {
          error:
            "Held sale not found or has already been converted or abandoned",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * If already RESUMED, return it as-is.
     *
     * This is intentional and keeps recovery
     * idempotent after refresh/navigation.
     */
    if (
      current.status ===
      "RESUMED"
    ) {
      return NextResponse.json({
        success:
          true,

        heldSale:
          current,
      });
    }

    const result =
      await prisma.posHeldSale.updateMany({
        where: {
          id,

          branchId:
            session.branchId,

          status:
            "HELD",
        },

        data: {
          status:
            "RESUMED",

          resumedAt:
            new Date(),
        },
      });

    if (
      result.count !== 1
    ) {
      return NextResponse.json(
        {
          error:
            "This held sale changed in another session. Refresh the held-sales list and try again.",
        },
        {
          status: 409,
        }
      );
    }

    const resumedSale =
      await prisma.posHeldSale.findUnique({
        where: {
          id,
        },
      });

    if (!resumedSale) {
      return NextResponse.json(
        {
          error:
            "Unable to load resumed sale",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success:
        true,

      heldSale:
        resumedSale,
    });
  } catch (error) {
    console.error(
      "Resume held POS sale error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to resume held sale",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// DELETE / ABANDON HELD OR RESUMED SALE
// ==========================================
//
// HELD    -> CANCELLED
// RESUMED -> CANCELLED
//
// Still no stock reversal is required because
// these records have not yet been converted
// into a real Order.
//
// CONVERTED records are deliberately excluded.
//
export async function DELETE(
  _req: Request,
  context: RouteContext
) {
  try {
    let session;

    try {
      session =
        await requireAdmin();
    } catch {
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

    const {
      id,
    } = await context.params;

    const result =
      await prisma.posHeldSale.updateMany({
        where: {
          id,

          branchId:
            session.branchId,

          status: {
            in: [
              "HELD",
              "RESUMED",
            ],
          },
        },

        data: {
          status:
            "CANCELLED",

          cancelledAt:
            new Date(),
        },
      });

    if (
      result.count !== 1
    ) {
      return NextResponse.json(
        {
          error:
            "Held sale not found or is no longer available to abandon",
        },
        {
          status: 404,
        }
      );
    }

    const cancelledSale =
      await prisma.posHeldSale.findUnique({
        where: {
          id,
        },
      });

    return NextResponse.json({
      success:
        true,

      heldSale:
        cancelledSale,
    });
  } catch (error) {
    console.error(
      "Abandon held POS sale error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to abandon held sale",
      },
      {
        status: 500,
      }
    );
  }
}
