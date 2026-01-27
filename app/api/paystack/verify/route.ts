import { NextResponse } from "next/server";
import { sendOrderSMS } from "@/app/lib/hubtelSms";

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

    /* ===============================
       PAYMENT SUCCESS → SEND SMS
       =============================== */
    if (data?.data?.status === "success") {
      const amountGHS = data.data.amount / 100;

      const phone =
        data.data.customer?.phone ||
        data.data.metadata?.phone ||
        "";

      if (phone) {
        try {
          await sendOrderSMS({
            phone,
            message: `DeeglobalGh: Payment confirmed ✅
Order: ${reference}
Amount: GHS ${amountGHS}

Thank you for shopping with us.
WhatsApp: 0246 011 773`,
          });
        } catch (smsError) {
          console.error("SMS sending failed:", smsError);
          // Do NOT block payment success because SMS failed
        }
      }
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
