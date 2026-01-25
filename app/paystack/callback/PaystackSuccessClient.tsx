"use client";

import { useEffect, useState } from "react";
import { updateOrderById } from "@/app/lib/orders";

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
      const orderId = snapshot?.orderId;
      if (!orderId) return;

      // ✅ Ensure order is marked PAID (idempotent)
      updateOrderById(orderId, {
        paymentStatus: "PAID",
        orderStatus: "PAID",
        paystackReference: reference,
        paystackStatus: "success",
      });

      // ✅ Build WhatsApp confirmation message
      const lines: string[] = [];

      lines.push("Hello DeeglobalGh, I have completed payment.");
      lines.push("");
      lines.push("PAYMENT DETAILS");
      lines.push(`Paystack Reference: ${reference}`);
      lines.push("Payment Status: VERIFIED (SUCCESS)");
      lines.push("");
      lines.push("CUSTOMER DETAILS");
      lines.push(`Name: ${snapshot.customer.fullName}`);
      lines.push(`Phone: ${snapshot.customer.phone}`);
      lines.push(`Delivery Area: ${snapshot.customer.area}`);
      lines.push(`Location/Landmark: ${snapshot.customer.location}`);

      if (snapshot.customer.notes) {
        lines.push(`Notes: ${snapshot.customer.notes}`);
      }

      lines.push("");
      lines.push("ORDER ITEMS");

      snapshot.items.forEach((x: any, idx: number) => {
        lines.push(
          `${idx + 1}. ${x.name} x${x.qty} (GH₵ ${x.price.toFixed(2)})`
        );
      });

      lines.push("");
      lines.push(`SUBTOTAL: GH₵ ${snapshot.subtotal.toFixed(2)}`);
      lines.push("");
      lines.push("Please confirm delivery fee and delivery time. Thank you.");

      const waNumber = "233246011773";
      const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(
        lines.join("\n")
      )}`;

      setWhatsAppUrl(url);
    } catch {
      // silent fail — payment already verified
    }
  }, [reference, status]);

  if (status !== "success") return null;

  return (
    <div className="mt-6 rounded-2xl border bg-green-50 p-5">
      <div className="font-bold text-green-700 flex items-center gap-2">
        Payment Confirmed ✅
      </div>

      <p className="mt-2 text-sm text-green-800">
        Your payment has been verified successfully.
      </p>

      <p className="mt-3 text-sm text-gray-700">
        To complete your order, please send your order and payment confirmation
        on WhatsApp so we can confirm delivery details.
      </p>

      {whatsAppUrl && (
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:opacity-90"
        >
          Send Order & Payment Confirmation on WhatsApp
        </a>
      )}
    </div>
  );
}
