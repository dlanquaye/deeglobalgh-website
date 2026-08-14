"use client";

import { useEffect, useState } from "react";

const SNAPSHOT_KEY = "dg_paystack_order_snapshot_v1";

export default function PaystackSuccessClient({
  reference,
  status,
}: {
  reference: string;
  status: string;
}) {
  const [whatsAppUrl, setWhatsAppUrl] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "success") return;

    try {
      const raw = localStorage.getItem(SNAPSHOT_KEY);
      if (!raw) return;

      const snapshot = JSON.parse(raw);

      /* ===============================
         📲 BUILD WHATSAPP MESSAGE
         (CONFIRMATION ONLY – NO DB WRITE)
         =============================== */
      const lines: string[] = [];

      lines.push("Hello DeeGlobalGH,");
      lines.push("");
      lines.push("I have completed payment successfully.");
      lines.push("");
      lines.push("PAYMENT DETAILS");
      lines.push(`Paystack Reference: ${reference}`);
      lines.push("Payment Status: VERIFIED");
      lines.push("");
      lines.push("CUSTOMER DETAILS");
      lines.push(`Name: ${snapshot.customer.fullName}`);
      lines.push(`Phone: ${snapshot.customer.phone}`);
      lines.push(`Delivery Area: ${snapshot.customer.area}`);
      lines.push(`Location / Landmark: ${snapshot.customer.location}`);

      if (snapshot.customer.notes) {
        lines.push(`Notes: ${snapshot.customer.notes}`);
      }

      lines.push("");
      lines.push("ORDER SUMMARY");

      snapshot.items.forEach((x: any, idx: number) => {
        lines.push(
          `${idx + 1}. ${x.name} x${x.qty} (GH₵ ${x.price.toFixed(2)})`
        );
      });

      lines.push("");
      lines.push(`Subtotal: GH₵ ${snapshot.subtotal.toFixed(2)}`);
      lines.push("");
      lines.push(
        "Please confirm delivery fee and delivery time when convenient. Thank you."
      );

      const waNumber = "233270030000";
      const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(
        lines.join("\n")
      )}`;

      setWhatsAppUrl(url);

      // ✅ Clear snapshot after success to prevent duplicate sends
      localStorage.removeItem(SNAPSHOT_KEY);
    } catch {
      // Silent fail – payment already verified server-side
    }
  }, [reference, status]);

  if (status !== "success") return null;

  return (
    <div className="mt-6 rounded-2xl border bg-green-50 p-5">
      <div className="flex items-center gap-2 font-bold text-green-700">
        Payment Successful ✅
      </div>

      <p className="mt-2 text-sm text-green-800">
        Your payment has been received and verified successfully.
      </p>

      <p className="mt-3 text-sm text-gray-700">
        Our team will contact you shortly to confirm delivery details.
        This confirmation shows your order summary. Item details will be
        confirmed during delivery coordination.
      </p>

      <p className="mt-3 text-sm text-gray-700">
        If you would like to speed things up, you can send your order and
        payment confirmation on WhatsApp.
      </p>

      {whatsAppUrl && (
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:opacity-90"
        >
          Chat on WhatsApp
        </a>
      )}
    </div>
  );
}
