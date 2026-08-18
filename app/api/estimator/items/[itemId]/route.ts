import { NextResponse } from "next/server";

import { updateEstimateItem } from "@/lib/estimator/updateEstimateItem";

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      itemId: string;
    }>;
  }
) {
  try {
    const { itemId } =
      await context.params;

    const body =
      await request.json();

    const {
      estimateId,
      description,
      quantity,
      unitPrice,
    } = body;

    if (
      !estimateId ||
      !itemId ||
      !description
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "estimateId, itemId and description are required.",
        },
        {
          status: 400,
        }
      );
    }

    const parsedQuantity =
      Number(quantity);

    const parsedUnitPrice =
      Number(unitPrice);

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

    const item =
      await updateEstimateItem(
        String(
          estimateId
        ),
        itemId,
        {
          description:
            String(
              description
            ),
          quantity:
            parsedQuantity,
          unitPrice:
            parsedUnitPrice,
        }
      );

    return NextResponse.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error(
      "Estimator item update error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to update quotation item.",
      },
      {
        status: 500,
      }
    );
  }
}
