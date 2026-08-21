"use client";

import {
  useEffect,
  useState,
} from "react";

import { useCart } from "@/app/context/CartContext";

const CUSTOMER_PROFILE_KEY =
  "dg_customer_v1";

type CustomerProfile = {
  fullName: string;
  email: string;
  phone: string;
  area: string;
  location: string;
};

function safeParse<T>(
  raw: string | null
): T | null {
  try {
    return raw
      ? (JSON.parse(raw) as T)
      : null;
  } catch {
    return null;
  }
}

export default function CheckoutPage() {
  const {
    items,
  } = useCart();

  const [
    fullName,
    setFullName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    area,
    setArea,
  ] = useState(
    "Kasoa"
  );

  const [
    location,
    setLocation,
  ] = useState("");

  const [
    payLoading,
    setPayLoading,
  ] = useState(
    false
  );

  const [
    payError,
    setPayError,
  ] = useState<
    string | null
  >(null);

  const [
    currentOrderId,
    setCurrentOrderId,
  ] = useState<
    string | null
  >(null);

  /*
   * ==========================================
   * LOAD SAVED CUSTOMER PROFILE
   * ==========================================
   */
  useEffect(() => {
    const saved =
      safeParse<CustomerProfile>(
        typeof window !==
          "undefined"
          ? localStorage.getItem(
              CUSTOMER_PROFILE_KEY
            )
          : null
      );

    if (!saved) {
      return;
    }

    setFullName(
      saved.fullName ||
        ""
    );

    setEmail(
      saved.email ||
        ""
    );

    setPhone(
      saved.phone ||
        ""
    );

    setLocation(
      saved.location ||
        ""
    );

    if (saved.area) {
      setArea(
        saved.area
      );
    }
  }, []);

  const saveCustomerProfile =
    () => {
      localStorage.setItem(
        CUSTOMER_PROFILE_KEY,

        JSON.stringify({
          fullName,
          email,
          phone,
          area,
          location,
        })
      );
    };

  /*
   * ==========================================
   * DELIVERY
   * ==========================================
   */
  const normalizedLocation =
    location
      .trim()
      .toLowerCase();

  const isKasoaLocation =
    normalizedLocation.includes(
      "kasoa"
    );

  const hasLocation =
    location
      .trim()
      .length > 0;

  const deliveryFee =
    isKasoaLocation
      ? 30
      : null;

  const subtotal =
    items.reduce(
      (
        sum,
        item
      ) =>
        sum +
        item.retailPrice *
          item.qty,

      0
    );

  const total =
    deliveryFee !==
    null
      ? subtotal +
        deliveryFee
      : subtotal;

  const canPayNow =
    hasLocation &&
    isKasoaLocation &&
    items.length > 0 &&
    !payLoading;

  /*
   * ==========================================
   * PAYMENT STATUS POLLING
   * ==========================================
   */
  useEffect(() => {
    if (
      !currentOrderId
    ) {
      return;
    }

    const interval =
      setInterval(
        async () => {
          try {
            const res =
              await fetch(
                `/api/orders/status?orderId=${currentOrderId}`
              );

            const data =
              await res.json();

            if (
              data?.paymentStatus ===
              "PAID"
            ) {
              clearInterval(
                interval
              );

              window.location.href =
                `/payment-success?reference=${currentOrderId}`;
            }
          } catch {
            // Polling can safely retry.
          }
        },

        3000
      );

    return () =>
      clearInterval(
        interval
      );
  }, [
    currentOrderId,
  ]);

  /*
   * ==========================================
   * PAYSTACK
   * ==========================================
   */
  const payNowWithPaystack =
    async () => {
      if (
        !fullName.trim()
      ) {
        setPayError(
          "Please enter your full name"
        );
        return;
      }

      if (
        !email.trim()
      ) {
        setPayError(
          "Please enter your email"
        );
        return;
      }

      if (
        !phone.trim()
      ) {
        setPayError(
          "Please enter your phone number"
        );
        return;
      }

      if (
        !location.trim()
      ) {
        setPayError(
          "Please enter your delivery location"
        );
        return;
      }

      if (
        items.length ===
        0
      ) {
        setPayError(
          "Your cart is empty"
        );
        return;
      }

      /*
       * Outside-Kasoa delivery does not yet have
       * an authoritative checkout delivery fee.
       *
       * Prevent payment until DeeGlobalGH has
       * confirmed that charge with the customer.
       */
      if (
        !isKasoaLocation
      ) {
        setPayError(
          "Please confirm your delivery cost via WhatsApp before making payment."
        );

        window.scrollTo({
          top: 0,
          behavior:
            "smooth",
        });

        return;
      }

      saveCustomerProfile();

      setPayError(
        null
      );

      setPayLoading(
        true
      );

      try {
        const orderId =
          `DG-${Date.now()}`;

        setCurrentOrderId(
          orderId
        );

        const payload = {
          orderId,

          customer: {
            fullName,
            email,
            phone,
            area,
            location,
          },

          items:
            items.map(
              (item) => ({
                productId:
                  item.id,

                quantity:
                  item.qty,
              })
            ),
        };

        const createRes =
          await fetch(
            "/api/orders/create",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        const createData =
          await createRes.json();

        if (
          !createRes.ok
        ) {
          throw new Error(
            createData
              ?.message ||
              createData
                ?.error ||
              "Order failed"
          );
        }

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

        if (
          !payRes.ok
        ) {
          throw new Error(
            payData
              ?.error ||
              "Payment initialisation failed"
          );
        }

        const url =
          payData
            ?.data
            ?.authorization_url;

        if (!url) {
          throw new Error(
            "Payment failed"
          );
        }

        window.location.href =
          url;
      } catch (
        err
      ) {
        setPayError(
          err instanceof
            Error
            ? err.message
            : "Payment failed"
        );

        setPayLoading(
          false
        );
      }
    };

  /*
   * ==========================================
   * WHATSAPP CHECKOUT
   * ==========================================
   */
  const handleWhatsAppOrder =
    () => {
      if (
        !fullName.trim()
      ) {
        setPayError(
          "Please enter your full name"
        );

        window.scrollTo({
          top: 0,
          behavior:
            "smooth",
        });

        return;
      }

      if (
        !email.trim()
      ) {
        setPayError(
          "Please enter your email"
        );

        window.scrollTo({
          top: 0,
          behavior:
            "smooth",
        });

        return;
      }

      if (
        !phone.trim()
      ) {
        setPayError(
          "Please enter your phone number"
        );

        window.scrollTo({
          top: 0,
          behavior:
            "smooth",
        });

        return;
      }

      if (
        !location.trim()
      ) {
        setPayError(
          "Please enter your delivery location"
        );

        window.scrollTo({
          top: 0,
          behavior:
            "smooth",
        });

        return;
      }

      if (
        items.length ===
        0
      ) {
        setPayError(
          "Your cart is empty"
        );
        return;
      }

      saveCustomerProfile();

      setPayError(
        null
      );

      const orderLines =
        items
          .map(
            (
              item,
              index
            ) =>
              `${index + 1}. ${item.name} (x${item.qty}) - GH₵ ${
                item.retailPrice *
                item.qty
              }`
          )
          .join(
            "\n"
          );

      const message =
        `Hello, I want to order:\n\n` +
        `${orderLines}\n\n` +
        `Subtotal: GH₵ ${subtotal}\n` +
        `Delivery: ${
          deliveryFee !==
          null
            ? `GH₵ ${deliveryFee}`
            : "To be confirmed"
        }\n` +
        `${
          deliveryFee !==
          null
            ? "Total"
            : "Estimated Total"
        }: GH₵ ${total}\n\n` +
        `Name: ${fullName}\n` +
        `Phone: ${phone}\n` +
        `Location: ${location}\n` +
        `Area: ${area}`;

      const encoded =
        encodeURIComponent(
          message
        );

      window.open(
        `https://wa.me/233270030000?text=${encoded}`,
        "_blank"
      );
    };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-center">
      <h1 className="text-3xl font-extrabold text-blue-900">
        Checkout
      </h1>

      {payError && (
        <div className="mt-4 rounded-lg border border-red-500 bg-red-100 p-3 text-sm font-semibold text-red-700">
          {payError}
        </div>
      )}

      {/* CUSTOMER DETAILS */}
      <section className="mt-8 rounded-2xl border bg-white p-10">
        <h2 className="text-xl font-extrabold">
          Customer Details
        </h2>

        <div className="mx-auto mt-6 max-w-xl space-y-4">
          {fullName && (
            <p className="font-semibold text-green-700">
              Welcome back,{" "}
              {
                fullName.split(
                  " "
                )[0]
              }{" "}
              👋
            </p>
          )}

          <input
            className="input-brand w-full text-center"
            placeholder="Full Name"
            value={
              fullName
            }
            onChange={(
              event
            ) =>
              setFullName(
                event
                  .target
                  .value
              )
            }
          />

          <input
            className="input-brand w-full text-center"
            placeholder="Email"
            value={
              email
            }
            onChange={(
              event
            ) =>
              setEmail(
                event
                  .target
                  .value
              )
            }
          />

          <input
            className="input-brand w-full text-center"
            placeholder="Phone"
            value={
              phone
            }
            onChange={(
              event
            ) =>
              setPhone(
                event
                  .target
                  .value
              )
            }
          />

          <input
            className="input-brand w-full text-center"
            placeholder="Delivery Location (Kasoa or outside Kasoa)"
            value={
              location
            }
            onChange={(
              event
            ) => {
              setLocation(
                event
                  .target
                  .value
              );

              if (
                payError
              ) {
                setPayError(
                  null
                );
              }
            }}
          />
        </div>

        <div className="mt-6 rounded bg-green-100 p-3">
          🚚 We deliver to your location. Enter a clear landmark.
        </div>
      </section>

      {/* ORDER SUMMARY */}
      <section className="mt-8 rounded-2xl border bg-white p-6 text-left">
        <h2 className="mb-4 text-xl font-extrabold">
          Your Order
        </h2>

        <div className="space-y-3">
          {items.map(
            (item) => (
              <div
                key={
                  item.id
                }
                className="flex justify-between border-b pb-2"
              >
                <span>
                  {
                    item.name
                  }{" "}
                  (x
                  {
                    item.qty
                  }
                  )
                </span>

                <span className="font-semibold">
                  GH₵{" "}
                  {
                    item.retailPrice *
                    item.qty
                  }
                </span>
              </div>
            )
          )}
        </div>

        {isKasoaLocation &&
          hasLocation && (
            <div className="mt-3 rounded-lg border border-green-500 bg-green-100 p-3 text-sm font-semibold text-green-700">
              ✅ Fast delivery within Kasoa. Your order will be processed quickly.
            </div>
          )}

        {!isKasoaLocation &&
          hasLocation && (
            <div className="mt-4 rounded-lg border border-red-500 bg-red-100 p-4 text-sm font-semibold text-red-700">
              ⚠️ Important Notice:
              <br />
              We are located in Kasoa. Delivery outside Kasoa may cost GH₵ 50 or more depending on distance and items.
              <br />
              Please confirm delivery cost via WhatsApp before making payment.
            </div>
          )}

        <div className="mt-4 space-y-1 text-right text-lg font-bold">
          <div>
            Subtotal: GH₵{" "}
            {
              subtotal
            }
          </div>

          <div>
            Delivery:{" "}
            {deliveryFee !==
            null
              ? `GH₵ ${deliveryFee}`
              : "To be confirmed"}
          </div>

          <div className="text-xl">
            {deliveryFee !==
            null
              ? "Payable Now:"
              : "Estimated Total:"}{" "}
            GH₵{" "}
            {
              total
            }
          </div>
        </div>
      </section>

      <p className="mb-3 text-sm text-gray-600">
        ⚡ Orders are processed quickly. Confirm now to avoid delays.
      </p>

      {/* ACTION BUTTONS */}
      <section className="mt-8 rounded-2xl border bg-white p-6">
        <button
          onClick={
            payNowWithPaystack
          }
          disabled={
            !canPayNow
          }
          className={`w-full rounded-xl py-4 font-bold ${
            canPayNow
              ? "bg-yellow-500"
              : "cursor-not-allowed bg-gray-300 text-gray-600"
          }`}
        >
          {payLoading
            ? "Processing..."
            : !hasLocation
              ? "Enter Delivery Location to Pay"
              : !isKasoaLocation
                ? "Confirm Delivery Cost Before Payment"
                : "Pay Now"}
        </button>

        {!isKasoaLocation &&
          hasLocation && (
            <p className="mt-3 text-sm font-semibold text-red-700">
              Online payment is available after the delivery charge has been confirmed. Please use WhatsApp below.
            </p>
          )}

        <button
          onClick={
            handleWhatsAppOrder
          }
          className="mt-4 w-full rounded-xl bg-green-600 py-4 font-bold text-white"
        >
          Order via WhatsApp (Pay on Delivery)
        </button>

        <p className="mt-3 text-sm text-gray-500">
          You can pay now or confirm your order via WhatsApp.
        </p>

        <p className="mt-2 text-sm text-gray-600">
          Prefer to confirm delivery cost first? Chat with us instantly on WhatsApp.
        </p>
      </section>
    </main>
  );
}
