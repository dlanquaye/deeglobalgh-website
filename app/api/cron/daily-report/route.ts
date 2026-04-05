export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET() {
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
       📲 PREPARE WHATSAPP LINK
    =============================== */
    const phone = "233246011773";

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
      message
    )}`;

    console.log("📊 DAILY REPORT READY:");
    console.log(message);

    return NextResponse.json({
      success: true,
      whatsappUrl,
      message,
    });

  } catch (error) {
    console.error("CRON DAILY REPORT ERROR:", error);

    return NextResponse.json(
      { error: "Cron failed" },
      { status: 500 }
    );
  }
}