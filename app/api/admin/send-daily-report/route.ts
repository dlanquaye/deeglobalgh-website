export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST() {
  try {
    /* ===============================
       📡 FETCH DAILY REPORT
    =============================== */
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/daily-report`
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error("Failed to fetch report");
    }

    const message = data.message;

    /* ===============================
       📲 SEND WHATSAPP MESSAGE
    =============================== */

    const phone = "233246011773"; // 👉 PUT YOUR NUMBER HERE

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
      message
    )}`;

    return NextResponse.json({
      success: true,
      whatsappUrl,
    });

  } catch (error) {
    console.error("SEND REPORT ERROR:", error);

    return NextResponse.json(
      { error: "Failed to send report" },
      { status: 500 }
    );
  }
}