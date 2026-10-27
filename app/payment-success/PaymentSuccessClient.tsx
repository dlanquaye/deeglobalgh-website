"use client";

import {
  useEffect,
  useState,
} from "react";

import { useCart } from "@/app/context/CartContext";

type Props = {
  reference: string | null;
};

type PaymentState =
  | "VERIFYING"
  | "PAID"
  | "PENDING"
  | "ERROR";

type OrderResponse = {
  orderId: string;
  email: string;
  phone: string;
  amount: number;
  amountPesewas: number | null;
  paymentStatus: string;
  customerName?: string | null;
  orderItems?: {
    productId: string;

    quantity: number;

    unitPrice: number;
    product?: {
      id?: string | null;
      name?: string | null;
    } | null;
  }[];
};

function getOrderAmountGhs(
  order: OrderResponse
) {
  if (
    Number.isSafeInteger(
      order.amountPesewas
    ) &&
    order.amountPesewas !== null
  ) {
    return (
      order.amountPesewas /
      100
    );
  }

  return Number(
    order.amount
  );
}

export default function PaymentSuccessClient({
  reference,
}: Props) {
  const {
    clearCart,
  } = useCart();

  const [
    paymentState,
    setPaymentState,
  ] =
    useState<PaymentState>(
      "VERIFYING"
    );

  const [
    order,
    setOrder,
  ] =
    useState<OrderResponse | null>(
      null
    );

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null
    );

  /*
   * ==========================================
   * VERIFY PAYMENT FIRST
   * ==========================================
   *
   * Nothing on this page is treated as paid
   * merely because Paystack redirected the
   * browser here.
   *
   * The server verification endpoint must
   * confirm the provider payment and run the
   * hardened website payment finaliser first.
   * ==========================================
   */
  useEffect(() => {
    if (!reference) {
      setPaymentState(
        "ERROR"
      );

      setErrorMessage(
        "Payment reference is missing."
      );

      return;
    }

    let cancelled =
      false;

    async function verifyAndLoadOrder() {
      try {
        setPaymentState(
          "VERIFYING"
        );

        setErrorMessage(
          null
        );

        const verifyRes =
          await fetch(
            `/api/paystack/verify?reference=${encodeURIComponent(
              reference as string
            )}`,
            {
              cache:
                "no-store",
            }
          );

        const verifyData =
          await verifyRes.json();

        if (!verifyRes.ok) {
          throw new Error(
            verifyData?.error ||
              verifyData?.message ||
              "Payment verification failed."
          );
        }

        if (
          verifyData?.requiresAttention
        ) {
          throw new Error(
            "Your payment requires manual confirmation. Please contact DeeGlobalGH before trying again."
          );
        }

        /*
         * Load the authoritative database order
         * only AFTER provider verification.
         */
        const orderRes =
          await fetch(
            `/api/order-by-reference?reference=${encodeURIComponent(
              reference as string
            )}`,
            {
              cache:
                "no-store",
            }
          );

        const orderData =
          await orderRes.json();

        if (!orderRes.ok) {
          throw new Error(
            orderData?.error ||
              "Unable to load your order."
          );
        }

        if (cancelled) {
          return;
        }

        setOrder(
          orderData
        );

        /*
         * The success UI must only be displayed
         * after the database itself confirms PAID.
         */
        if (
          orderData.paymentStatus !==
          "PAID"
        ) {
          setPaymentState(
            "PENDING"
          );

          setErrorMessage(
            "Your payment is still being confirmed. Please do not make another payment."
          );

          return;
        }

        /*
         * Clear the cart only after confirmed PAID.
         */
        clearCart();

        setPaymentState(
          "PAID"
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Payment verification failed:",
          error
        );

        setPaymentState(
          "ERROR"
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Payment verification failed."
        );
      }
    }

    verifyAndLoadOrder();

    return () => {
      cancelled =
        true;
    };
  }, [
    reference,
    clearCart,
  ]);

  /*
   * ==========================================
   * META PURCHASE EVENT
   * ==========================================
   *
   * Fires only after the database confirms PAID.
   * Prevents duplicate browser events if the
   * customer refreshes the success page.
   * ==========================================
   */
  useEffect(() => {
    if (
      paymentState !==
        "PAID" ||
      !order
    ) {
      return;
    }

    const purchaseKey =
      `meta_purchase_sent_${order.orderId}`;

    if (
      localStorage.getItem(
        purchaseKey
      )
    ) {
      return;
    }

    let attempts = 0;
    const maxAttempts = 20;

    const sendPurchase = () => {
      if (!window.fbq) {
        return false;
      }

      const totalPaid =
        getOrderAmountGhs(
          order
        );

      const contents =
        order.orderItems
          ?.filter(
            (item) =>
              Boolean(
                item.productId
              )
          )
          .map((item) => ({
            id: item.productId,
            quantity: item.quantity,
            item_price: Number(
              item.unitPrice
            ),
          })) ?? [];

      const contentIds =
        contents.map(
          (item) => item.id
        );

      const numItems =
        contents.reduce(
          (total, item) =>
            total +
            item.quantity,
          0
        );

      window.fbq(
        "track",
        "Purchase",
        {
          content_ids: contentIds,
          contents,
          content_type: "product",
          num_items: numItems,
          value: totalPaid,
          currency: "GHS",
          order_id: order.orderId,
        },
        {
          eventID:
            `purchase_${order.orderId}`,
        }
      );

      localStorage.setItem(
        purchaseKey,
        "true"
      );

      return true;
    };

    if (sendPurchase()) {
      return;
    }

    const interval =
      window.setInterval(
        () => {
          attempts += 1;

          if (
            sendPurchase() ||
            attempts >=
              maxAttempts
          ) {
            window.clearInterval(
              interval
            );
          }
        },
        250
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    paymentState,
    order,
  ]);
  /*
   * ==========================================
   * WHATSAPP PAYMENT CONFIRMATION
   * ==========================================
   *
   * Customer chooses when to open WhatsApp.
   * Order details are pre-filled. The customer
   * can then attach the payment screenshot.
   * ==========================================
   */
  const handleWhatsAppConfirmation = () => {
    if (!order) {
      return;
    }

    const totalPaid =
      getOrderAmountGhs(
        order
      );

    const message =
      `Hello DeeGlobalGH, I have completed payment for Order ${order.orderId}. ` +
      `Amount paid: GHS ${totalPaid.toFixed(2)}. ` +
      `I am attaching my payment confirmation screenshot.`;

    const url =
      `https://wa.me/233270030000?text=${encodeURIComponent(
        message
      )}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };
  /*
   * ==========================================
   * UI
   * ==========================================
   */
  if (
    paymentState ===
    "VERIFYING"
  ) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-blue-900">
          Confirming Your Payment
        </h1>

        <p className="mt-4 text-lg text-gray-700">
          Please wait while we securely confirm your payment with Paystack.
        </p>

        <p className="mt-6 text-sm text-gray-500">
          Please do not close this page or make another payment.
        </p>
      </main>
    );
  }

  if (
    paymentState ===
    "PENDING"
  ) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-amber-600">
          Payment Confirmation Pending
        </h1>

        <p className="mt-4 text-lg text-gray-700">
          {errorMessage}
        </p>

        <p className="mt-6 text-gray-600">
          DeeGlobalGH will process your order once payment confirmation is complete.
        </p>
      </main>
    );
  }

  if (
    paymentState ===
    "ERROR"
  ) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-red-600">
          Payment Confirmation Problem
        </h1>

        <p className="mt-4 text-lg text-gray-700">
          {errorMessage ||
            "We could not confirm your payment."}
        </p>

        <p className="mt-6 text-gray-600">
          Please do not make another payment. Contact DeeGlobalGH if you need assistance.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-green-600">
        Payment Successful
      </h1>

      <p className="mt-4 text-lg text-gray-700">
        Your payment has been received successfully.
      </p>

      {order && (
        <div className="mx-auto mt-6 max-w-md rounded-xl border bg-white p-5 text-left">
          <p>
            <strong>
              Order:
            </strong>{" "}
            {order.orderId}
          </p>

          <p className="mt-2">
            <strong>
              Amount Paid:
            </strong>{" "}
            GHS{" "}
            {getOrderAmountGhs(
              order
            ).toFixed(
              2
            )}
          </p>
        </div>
      )}

      <div className="mx-auto mt-6 max-w-md">
        <p className="text-sm font-medium text-gray-700">
          Please take a screenshot of this page for your records.
        </p>

        <p className="mt-2 text-sm text-gray-600">
          You can also send your payment confirmation to DeeGlobalGH on WhatsApp.
        </p>

        <button
          type="button"
          onClick={handleWhatsAppConfirmation}
          className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          Send Payment Confirmation on WhatsApp
        </button>
      </div>

      <p className="mt-6 text-gray-700">
        We are processing your order and will contact you shortly for delivery.
      </p>
    </main>
  );
}