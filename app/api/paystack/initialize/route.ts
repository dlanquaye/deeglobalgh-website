import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequiredOrderAmountPesewas } from "@/lib/pos/orderMoney";

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
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const {
      email,
      phone: rawPhone,
      orderId,
    } = body;

    if (
      !email ||
      !rawPhone ||
      !orderId
    ) {
      return NextResponse.json(
        {
          error:
            "Email, phone, and orderId are required",
        },
        { status: 400 }
      );
    }

    /*
     * ==========================================
     * FETCH AUTHORITATIVE ORDER
     * ==========================================
     */
    const order =
      await prisma.order.findUnique({
        where: {
          orderId,
        },
      });

    if (!order) {
      return NextResponse.json(
        {
          error:
            "Invalid order ID",
        },
        { status: 400 }
      );
    }

    /*
     * ==========================================
     * PREVENT DUPLICATE PAYMENT
     * ==========================================
     */
    if (
      order.paymentStatus ===
      "PAID"
    ) {
      return NextResponse.json(
        {
          error:
            "Order already paid",
        },
        { status: 409 }
      );
    }

    /*
     * The customer email supplied by the browser
     * must match the email stored on the order.
     *
     * The browser cannot redirect payment for an
     * existing order to an unrelated email.
     */
    if (
      String(order.email)
        .trim()
        .toLowerCase() !==
      String(email)
        .trim()
        .toLowerCase()
    ) {
      return NextResponse.json(
        {
          error:
            "Order customer does not match",
        },
        { status: 400 }
      );
    }

    const phone =
      normalizeGhanaPhone(
        String(rawPhone)
      );

    /*
     * ==========================================
     * AUTHORITATIVE PAYMENT AMOUNT
     * ==========================================
     *
     * amountPesewas is authoritative for modern
     * orders. The shared helper safely supports
     * legacy orders that only have Order.amount.
     */
    const amountInPesewas =
      getRequiredOrderAmountPesewas(
        order
      );

    if (
      !Number.isInteger(
        amountInPesewas
      ) ||
      amountInPesewas <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid order amount",
        },
        { status: 400 }
      );
    }

    /*
     * ==========================================
     * INITIALISE PAYSTACK
     * ==========================================
     */
    const res =
      await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${secret}`,
            "Content-Type":
              "application/json",
          },

          cache:
            "no-store",

          body:
            JSON.stringify({
              email:
                order.email,

              amount:
                amountInPesewas,

              currency:
                "GHS",

              reference:
                order.orderId,

              callback_url:
                `${siteUrl}/payment-success`,

              metadata: {
                orderId:
                  order.orderId,

                phone,

                source:
                  "WEBSITE",
              },
            }),
        }
      );

    const data =
      await res.json();

    if (!res.ok) {
      console.error(
        "Paystack initialization failed:",
        data
      );

      return NextResponse.json(
        {
          error:
            "Paystack error",
          details:
            data,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      data
    );
  } catch (err) {
    console.error(
      "Paystack initialization error:",
      err
    );

    return NextResponse.json(
      {
        error:
          "Server error",
        details:
          err instanceof Error
            ? err.message
            : String(err),
      },
      { status: 500 }
    );
  }
}
