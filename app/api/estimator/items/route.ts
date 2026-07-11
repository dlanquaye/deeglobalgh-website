import { NextResponse } from "next/server";
import {
  createEstimateItem,
  findEstimateRequest,
} from "@/lib/estimator";

export async function POST(request: Request) {
  const body = await request.json();

  const { estimateId, productName, quantity } = body;

  if (!estimateId || !productName || !quantity) {
    return NextResponse.json(
      {
        success: false,
        message: "estimateId, productName and quantity are required.",
      },
      { status: 400 }
    );
  }

  try {
  
const estimate = await findEstimateRequest(estimateId);
    if (!estimate) {
      return NextResponse.json(
        {
          success: false,
          message: "Estimate request not found.",
        },
        { status: 404 }
      );
    }

    const item = await createEstimateItem(
  estimateId,
  productName,
  quantity
);

return NextResponse.json({
  success: true,
  item,
});

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}