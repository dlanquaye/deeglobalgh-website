import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

type StockLocation = {
  locationType: "BRANCH" | "WAREHOUSE";
  locationId: string;
  name: string;
  location: string;
};

export async function GET() {
  try {
    const session = await requireAdmin();

    const isSuperAdmin =
      session.role === "SUPER_ADMIN";

    if (!isSuperAdmin && !session.staffId) {
      return NextResponse.json(
        {
          success: false,
          message: "A linked staff account is required.",
        },
        { status: 403 }
      );
    }

    const staff = session.staffId
      ? await prisma.staff.findUnique({
          where: {
            id: session.staffId,
          },
          select: {
            id: true,
            role: true,
            isActive: true,
            branchId: true,
          },
        })
      : null;

    if (
      staff &&
      !staff.isActive
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Inactive staff cannot access stock locations.",
        },
        { status: 403 }
      );
    }

    if (!isSuperAdmin && !staff) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff account not found.",
        },
        { status: 403 }
      );
    }

    const locations: StockLocation[] = [];

    if (isSuperAdmin) {
      const [branches, warehouses] =
        await Promise.all([
          prisma.branch.findMany({
            select: {
              id: true,
              name: true,
              location: true,
            },
            orderBy: {
              name: "asc",
            },
          }),

          prisma.warehouse.findMany({
            select: {
              id: true,
              name: true,
              location: true,
            },
            orderBy: {
              name: "asc",
            },
          }),
        ]);

      for (const branch of branches) {
        locations.push({
          locationType: "BRANCH",
          locationId: branch.id,
          name: branch.name,
          location: branch.location,
        });
      }

      for (const warehouse of warehouses) {
        locations.push({
          locationType: "WAREHOUSE",
          locationId: warehouse.id,
          name: warehouse.name,
          location: warehouse.location,
        });
      }
    } else if (
      staff?.role === "MANAGER" &&
      staff.branchId
    ) {
      const branch =
        await prisma.branch.findUnique({
          where: {
            id: staff.branchId,
          },
          select: {
            id: true,
            name: true,
            location: true,
          },
        });

      if (branch) {
        locations.push({
          locationType: "BRANCH",
          locationId: branch.id,
          name: branch.name,
          location: branch.location,
        });
      }
    } else if (
      staff?.role === "WAREHOUSE_MANAGER"
    ) {
      const warehouses =
        await prisma.warehouse.findMany({
          select: {
            id: true,
            name: true,
            location: true,
          },
          orderBy: {
            name: "asc",
          },
        });

      for (const warehouse of warehouses) {
        locations.push({
          locationType: "WAREHOUSE",
          locationId: warehouse.id,
          name: warehouse.name,
          location: warehouse.location,
        });
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have permission to adjust inventory.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      locations,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (
        error.message === "Unauthorized" ||
        error.message === "CredentialChangeRequired"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    console.error(
      "Inventory location lookup failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve stock locations.",
      },
      { status: 500 }
    );
  }
}
