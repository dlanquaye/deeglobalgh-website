import { NextResponse } from "next/server";

import {
  createEstimateItem,
  findEstimateRequest,
} from "@/lib/estimator";

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const {
      estimateId,
      productId,
      productName,
      quantity,
      unitPrice,
      manualItem,
    } = body;

    // ==========================================
    // BASIC VALIDATION
    // ==========================================
    if (
      !estimateId ||
      !productName ||
      !quantity
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "estimateId, productName and quantity are required.",
        },
        {
          status: 400,
        }
      );
    }

    const parsedQuantity =
      Number(quantity);

    if (
      !Number.isInteger(
        parsedQuantity
      ) ||
      parsedQuantity <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Quantity must be a whole number greater than 0.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // QUOTATION PRICE
    // ==========================================
    //
    // undefined means:
    // use the normal catalogue price if available.
    //
    // 0 is deliberately valid because an admin
    // may still be preparing the quotation.
    // ==========================================
    let parsedUnitPrice:
      | number
      | undefined;

    if (
      unitPrice !== undefined &&
      unitPrice !== null &&
      unitPrice !== ""
    ) {
      parsedUnitPrice =
        Number(unitPrice);

      if (
        !Number.isFinite(
          parsedUnitPrice
        ) ||
        parsedUnitPrice < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Unit price must be 0 or greater.",
          },
          {
            status: 400,
          }
        );
      }
    }

    // ==========================================
    // ESTIMATE EXISTS
    // ==========================================
    const estimate =
      await findEstimateRequest(
        estimateId
      );

    if (!estimate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Estimate request not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================================
    // CREATE ITEM
    // ==========================================
    const item =
      await createEstimateItem(
        estimateId,
        String(
          productName
        ),
        parsedQuantity,
        productId
          ? String(
              productId
            )
          : undefined,
        {
          unitPrice:
            parsedUnitPrice,

          manualItem:
            manualItem ===
            true,
        }
      );

    return NextResponse.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error(
      "Estimator item creation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to add estimate item.",
      },
      {
        status: 500,
      }
    );
  }
}
