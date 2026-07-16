import { NextRequest, NextResponse } from "next/server";
import { getProductsForKnowledgeNode } from "@/lib/knowledge/classification";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { success: false, message: "Knowledge node code is required." },
      { status: 400 }
    );
  }

  const products = await getProductsForKnowledgeNode(code);

  return NextResponse.json({
    success: true,
    count: products.length,
    products,
  });
}