import { NextResponse } from "next/server";

import { deleteEstimateItem } from "@/lib/estimator/deleteEstimateItem";
import { replaceEstimateItemProduct } from "@/lib/estimator/replaceEstimateItemProduct";
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

export async function PUT(
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
      productId,
    } = body;

    if (
      !estimateId ||
      !itemId ||
      !productId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "estimateId, itemId and productId are required.",
        },
        {
          status: 400,
        }
      );
    }

    const item =
      await replaceEstimateItemProduct(
        String(
          estimateId
        ),
        itemId,
        String(
          productId
        )
      );

    return NextResponse.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error(
      "Estimator item replacement error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to replace quotation product.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
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
    } = body;

    if (
      !estimateId ||
      !itemId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "estimateId and itemId are required.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await deleteEstimateItem(
        String(
          estimateId
        ),
        itemId
      );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "Estimator item deletion error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to delete quotation item.",
      },
      {
        status: 500,
      }
    );
  }
}