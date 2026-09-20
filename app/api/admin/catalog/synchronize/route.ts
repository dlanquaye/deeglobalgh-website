import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { synchronizeCatalog } from "@/lib/catalog-sync";

export async function POST(
  req: Request
) {
  try {
    const session =
      await requireAdmin();

    if (!session.staffId) {
      return NextResponse.json(
        {
          success: false,
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
          success: false,
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

    const canSynchronizeCatalogue =
      isSuperAdmin ||
      staff.role ===
        "MANAGER";

    if (!canSynchronizeCatalogue) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You do not have permission to synchronise the catalogue.",
        },
        {
          status: 403,
        }
      );
    }

    const body =
      await req.json();

    const syncItems =
      body?.syncItems;

    if (
      !Array.isArray(
        syncItems
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid synchronisation payload.",
        },
        {
          status: 400,
        }
      );
    }

    const report =
      await synchronizeCatalog(
        syncItems,
        false
      );

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "Unauthorized"
    ) {
      return NextResponse.json(
        {
          success: false,
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
          success: false,
          error:
            "Credential change required.",
        },
        {
          status: 403,
        }
      );
    }

    console.error(
      "Catalogue synchronisation failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to synchronise catalogue.",
      },
      {
        status: 500,
      }
    );
  }
}
