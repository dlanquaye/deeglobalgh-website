"use client";

import { useEffect } from "react";
import { updateOrderById } from "@/app/lib/orders";

const SNAPSHOT_KEY = "dg_paystack_order_snapshot_v1";

export default function PaystackSuccessClient({
  reference,
  status,
}: {
  reference: string;
  status: string;
}) {
  useEffect(() => {
    if (status !== "success") return;

    try {
      const raw = localStorage.getItem(SNAPSHOT_KEY);
      if (!raw) return;

      const snapshot = JSON.parse(raw);
      const orderId = snapshot?.orderId;
      if (!orderId) return;

      updateOrderById(orderId, {
        paymentStatus: "PAID",      // ✅ FORCE FINAL STATE
        orderStatus: "PAID",        // ✅ FORCE FINAL STATE
        paystackReference: reference,
        paystackStatus: "success",
      });
    } catch {
      // silent fail — payment already verified server-side
    }
  }, [reference, status]);

  return null;
}
