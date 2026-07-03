import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const file = formData.get("file") as File | null;

  const importType = formData.get("importType");

  if (!file) {
    return NextResponse.json(
      {
        success: false,
        error: "No file uploaded.",
      },
      { status: 400 }
    );
  }

  console.log({
  fileName: file.name,
  fileSize: file.size,
  importType,
});

  return NextResponse.json({
    success: true,

    analysis: {
      fileName: file.name,
      fileSize: file.size,
      importType,
      status: "READY_FOR_ANALYSIS",
    },
  });
}