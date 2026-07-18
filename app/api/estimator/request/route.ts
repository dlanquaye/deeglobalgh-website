import { NextResponse } from "next/server";
import { createEstimateRequest } from "@/lib/estimator";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      customerName,
      phone,
      source,
      schoolName,
      className,
      academicYear,
      notes,
    } = body;

    if (!customerName || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer name and phone are required.",
        },
        { status: 400 }
      );
    }

    const estimate = await createEstimateRequest(
      customerName,
      phone,
      source ?? "WEBSITE",
      schoolName,
      className,
      academicYear,
      notes
    );

    return NextResponse.json({
      success: true,
      estimate,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create estimate",
      },
      { status: 500 }
    );
  }
}