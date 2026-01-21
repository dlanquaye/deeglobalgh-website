import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("PAYSTACK INIT BODY:", body);

    const secret = process.env.PAYSTACK_SECRET_KEY;
    console.log("PAYSTACK SECRET EXISTS:", !!secret);

    if (!secret) {
      return NextResponse.json(
        { error: "Missing PAYSTACK_SECRET_KEY in env" },
        { status: 500 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const { email, amount } = body;

    if (!email || !amount) {
      return NextResponse.json(
        { error: "Email and amount are required" },
        { status: 400 }
      );
    }

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Number(amount) * 100, // convert GHS to pesewas
        currency: "GHS",
        callback_url: `${siteUrl}/paystack/callback`,
      }),
    });

    const data = await res.json();
    console.log("PAYSTACK RESPONSE:", data);

    if (!res.ok) {
      return NextResponse.json(
        { error: "Paystack error", details: data },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.log("PAYSTACK INIT ERROR:", err?.message || err);
    return NextResponse.json(
      { error: "Server error", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
