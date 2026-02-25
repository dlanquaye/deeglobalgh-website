import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Normalize Ghana phone numbers to 233XXXXXXXXX format
 */
function normalizeGhanaPhone(phone: string) {
  let p = phone.replace(/\s+/g, "").replace(/^\+/, "");

  if (p.startsWith("0") && p.length === 10) {
    return "233" + p.substring(1);
  }

  if (p.startsWith("233") && p.length === 12) {
    return p;
  }

  return p;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { error: "Missing PAYSTACK_SECRET_KEY in env" },
        { status: 500 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const { email, phone: rawPhone, orderId } = body;

    // ❌ Removed "amount" from frontend

    if (!email || !rawPhone || !orderId) {
      return NextResponse.json(
        { error: "Email, phone, and orderId are required" },
        { status: 400 }
      );
    }

    // 🔒 1. Fetch order from database
    const order = await prisma.order.findUnique({
  where: { orderId },
});

    if (!order) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }

    // 🔒 2. Prevent duplicate payment
    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        { error: "Order already paid" },
        { status: 400 }
      );
    }

    const phone = normalizeGhanaPhone(rawPhone);

    // 🔒 3. Use authoritative amount from database
    const amountInPesewas = Number(order.amount) * 100;

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        email,
        amount: amountInPesewas,
        currency: "GHS",
        reference: orderId,
        callback_url: `${siteUrl}/payment-success`,
        metadata: {
          orderId,
          phone,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: "Paystack error", details: data },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}