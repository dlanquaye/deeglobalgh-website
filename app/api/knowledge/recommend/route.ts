import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          message: "Knowledge node code is required.",
        },
        {
          status: 400,
        }
      );
    }

    const node = await prisma.knowledgeNode.findUnique({
      where: {
        code,
      },
    });

    if (!node) {
      return NextResponse.json(
        {
          success: false,
          message: "Knowledge node not found.",
        },
        {
          status: 404,
        }
      );
    }

    const relationships = await prisma.knowledgeRelationship.findMany({
      where: {
        sourceId: node.id,
      },
      include: {
        target: true,
      },
    });

    return NextResponse.json({
      success: true,
      node,
      recommendations: relationships.map((r) => ({
        relationship: r.relationshipType,
        weight: r.weight,
        node: r.target,
      })),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate recommendations.",
      },
      {
        status: 500,
      }
    );
  }
}