import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import { join, extname } from "path";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const estimateId = formData.get("estimateId") as string | null;

    if (!file || !estimateId) {
      return NextResponse.json(
        {
          success: false,
          message: "Estimate ID and file are required.",
        },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only PDF, JPG and PNG files are allowed.",
        },
        { status: 400 }
      );
    }

    const uploadDir = join(
      process.cwd(),
      "uploads",
      "estimates"
    );

    await mkdir(uploadDir, {
      recursive: true,
    });

    const extension = extname(file.name);

    const uniqueName =
      `${randomUUID()}${extension}`;

    const filePath = join(
      uploadDir,
      uniqueName
    );

    const bytes = await file.arrayBuffer();

    await writeFile(
      filePath,
      Buffer.from(bytes)
    );

    const attachment =
      await prisma.estimateAttachment.create({
        data: {
          estimateRequestId: estimateId,

          fileName: file.name,

          filePath,

          fileSize: file.size,

          fileType:
            file.type === "application/pdf"
              ? "PDF"
              : "IMAGE",
        },
      });

    return NextResponse.json({
      success: true,
      attachment,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Upload failed.",
      },
      {
        status: 500,
      }
    );
  }
}