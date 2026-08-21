"use client";

import {
  useState,
} from "react";

type PaymentButtonProps = {
  orderId: string;
  email: string;
  phone: string;
};

export default function PaymentButton({
  orderId,
  email,
  phone,
}: PaymentButtonProps) {
  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const handlePayment =
    async () => {
      if (loading) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const payRes =
          await fetch(
            "/api/paystack/initialize",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  email,
                  phone,
                  orderId,
                }),
            }
          );

        const payData =
          await payRes.json();

        if (!payRes.ok) {
          throw new Error(
            payData?.error ||
              "Payment initialisation failed"
          );
        }

        const url =
          payData?.data
            ?.authorization_url;

        if (
          typeof url !==
            "string" ||
          !url
        ) {
          throw new Error(
            "Payment could not be started."
          );
        }

        window.location.href =
          url;
      } catch (
        paymentError
      ) {
        setError(
          paymentError instanceof
            Error
            ? paymentError.message
            : "Payment failed"
        );

        setLoading(false);
      }
    };

  return (
    <div>
      {error && (
        <div
          style={{
            marginBottom:
              "14px",
            padding:
              "12px 14px",
            border:
              "1px solid #fecaca",
            borderRadius:
              "10px",
            background:
              "#fef2f2",
            color:
              "#b91c1c",
            fontSize:
              "14px",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={
          handlePayment
        }
        disabled={
          loading
        }
        style={{
          width:
            "100%",
          border:
            "none",
          borderRadius:
            "10px",
          padding:
            "14px 18px",
          background:
            loading
              ? "#6b7280"
              : "#111827",
          color:
            "#ffffff",
          fontSize:
            "16px",
          fontWeight:
            800,
          cursor:
            loading
              ? "not-allowed"
              : "pointer",
        }}
      >
        {loading
          ? "Opening Secure Payment…"
          : "Pay Now"}
      </button>

      <div
        style={{
          marginTop:
            "10px",
          color:
            "#6b7280",
          fontSize:
            "12px",
          lineHeight:
            1.5,
          textAlign:
            "center",
        }}
      >
        You will be redirected
        to Paystack to complete
        your payment securely.
      </div>
    </div>
  );
}
