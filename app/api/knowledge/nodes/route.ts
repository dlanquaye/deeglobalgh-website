import { NextResponse } from "next/server";
import { knowledgeService } from "@/lib/knowledge/service";

export async function GET() {
  try {
    const nodes = await knowledgeService.listNodes();

    return NextResponse.json({
      success: true,
      count: nodes.length,
      data: nodes,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch knowledge nodes.",
      },
      {
        status: 500,
      }
    );
  }
}