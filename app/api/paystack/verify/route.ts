import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      return NextResponse.json(
        { error: "Missing PAYSTACK_SECRET_KEY in env" },
        { status: 500 }
      );
    }

    const url = new URL(req.url);
    const reference = url.searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secret}`,
        },
        cache: "no-store",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: "Paystack verify error", details: data },
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
