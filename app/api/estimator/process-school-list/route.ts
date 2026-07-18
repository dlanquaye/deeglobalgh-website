import { NextRequest, NextResponse } from "next/server";
import { processSchoolList } from "@/lib/estimator/processSchoolList";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { attachmentId } = body;

    if (!attachmentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Attachment ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const text = await processSchoolList(
      attachmentId
    );

    return NextResponse.json({
      success: true,
      text,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "OCR processing failed.",
      },
      {
        status: 500,
      }
    );
  }
}