import { NextResponse } from "next/server";
import { createOrderAndWhatsAppLink } from "@/lib/order";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items } = body;

    const result = await createOrderAndWhatsAppLink("shop-kasoa", items);

    return NextResponse.json({
      link: result.link,
    });

  } catch (error: any) {
    console.error("CHECKOUT ERROR:", error);

    let message = "Checkout failed";

    try {
      const parsed = JSON.parse(error.message);

      if (parsed.type === "STOCK_ERROR") {
        message = parsed.message;
      }
    } catch {
      // fallback stays "Checkout failed"
    }

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    );
  }
}
