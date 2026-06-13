import { NextResponse } from "next/server";

import { transferInventory } from "@/lib/inventory/transfer";
import { LocationType } from "@prisma/client";

const WAREHOUSE_ID = "cmq4b5g1j0001g3jgy501zz76";
const BRANCH_ID = "cmq4b407s0000g3jg31elgm80";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { productId, quantity } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product is required" },
        { status: 400 }
      );
    }

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "Quantity must be greater than zero" },
        { status: 400 }
      );
    }

    const result = await transferInventory({
      productId,
      quantity,

      fromLocationType: LocationType.WAREHOUSE,
fromLocationId: WAREHOUSE_ID,

toLocationType: LocationType.BRANCH,
toLocationId: BRANCH_ID,

      createdByStaffId: "DG001",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Transfer failed" },
      { status: 500 }
    );
  }
}