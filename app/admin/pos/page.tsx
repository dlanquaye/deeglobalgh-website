"use client";

import {
  useRef,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

type Product = {
  id: string;
  sku: string | null;
  name: string;
  retailPrice: number;
};

type CartItem = {
  id: string;
  name: string;
  retailPrice: number;
  quantity: number;
};

type MomoProvider =
  | ""
  | "mtn"
  | "atl"
  | "vod";

type PendingMomoPayment = {
  orderId: string;
  paymentId: string;
  reference: string;
  expiresInSeconds: number;
};

type MomoInitiateResponse = {
  success?: boolean;
  error?: string;
  details?: string | null;

  orderId?: string;
  paymentId?: string;
  reference?: string;

  paymentStatus?: string;
  providerStatus?: string;

  displayText?: string;
  expiresInSeconds?: number;
};

type MomoStatusResponse = {
  success?: boolean;
  error?: string;

  orderId?: string;
  paymentId?: string;
  reference?: string;

  paymentStatus?: string;
  providerStatus?: string;
  orderStatus?: string;

  orderFinalized?: boolean;
  alreadyFinalized?: boolean;
  requiresAttention?: boolean;

  confirmedAmountPesewas?: number;
  requiredAmountPesewas?: number;

  message?: string;
};

type MomoCheckResult =
  | "FINALIZED"
  | "PENDING"
  | "FAILED"
  | "ATTENTION";

function sleep(
  milliseconds: number
) {
  return new Promise<void>(
    (resolve) => {
      window.setTimeout(
        resolve,
        milliseconds
      );
    }
  );
}

export default function POSPage() {
  const [cart, setCart] =
    useState<CartItem[]>([]);

  const [query, setQuery] =
    useState("");

  const [results, setResults] =
    useState<Product[]>([]);

  const [
    scanValue,
    setScanValue,
  ] = useState("");

  const [
    isScanning,
    setIsScanning,
  ] = useState(false);

  const [
    scanMessage,
    setScanMessage,
  ] = useState("");

  const [
    scanSuccess,
    setScanSuccess,
  ] = useState(false);

  const scanInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [
    customerName,
    setCustomerName,
  ] = useState("");

  const [
    customerPhone,
    setCustomerPhone,
  ] = useState("");

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState("CASH");

  const [
    isProcessing,
    setIsProcessing,
  ] = useState(false);

  const [
    momoProvider,
    setMomoProvider,
  ] =
    useState<MomoProvider>("");

  const [
    pendingMomo,
    setPendingMomo,
  ] =
    useState<PendingMomoPayment | null>(
      null
    );

  const [
    momoMessage,
    setMomoMessage,
  ] = useState("");

  const [
    momoMessageType,
    setMomoMessageType,
  ] =
    useState<
      | "info"
      | "success"
      | "error"
      | "warning"
    >("info");

  const [
    momoSecondsRemaining,
    setMomoSecondsRemaining,
  ] = useState(0);

  const momoPaymentLocked =
    pendingMomo !== null;

  // ==========================================
  // NORMAL PRODUCT SEARCH
  // ==========================================
  const handleSearch = async (
    value: string
  ) => {
    if (momoPaymentLocked) {
      return;
    }

    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      const res =
        await fetch(
          `/api/pos/search?q=${encodeURIComponent(
            value
          )}`
        );

      const data =
        await res.json();

      if (
        !res.ok ||
        !Array.isArray(data)
      ) {
        setResults([]);
        return;
      }

      setResults(data);
    } catch {
      setResults([]);
    }
  };

  // ==========================================
  // ADD PRODUCT TO CART
  // ==========================================
  const addToCart = (
    product: Product
  ) => {
    if (momoPaymentLocked) {
      return;
    }

    setCart((prev) => {
      const existing =
        prev.find(
          (item) =>
            item.id ===
            product.id
        );

      if (existing) {
        return prev.map(
          (item) =>
            item.id ===
            product.id
              ? {
                  ...item,
                  quantity:
                    item.quantity +
                    1,
                }
              : item
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name:
            product.name,
          retailPrice:
            product.retailPrice,
          quantity: 1,
        },
      ];
    });
  };

  // ==========================================
  // SCANNER / EXACT SKU LOOKUP
  // ==========================================
  const handleScan = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (momoPaymentLocked) {
      setScanMessage(
        "The cart is locked while a Mobile Money payment is awaiting confirmation."
      );

      setScanSuccess(false);

      return;
    }

    const scannedSku =
      scanValue.trim();

    if (
      !scannedSku ||
      isScanning
    ) {
      return;
    }

    setIsScanning(true);
    setScanMessage("");
    setScanSuccess(false);

    try {
      const res =
        await fetch(
          `/api/pos/search?q=${encodeURIComponent(
            scannedSku
          )}`
        );

      const data =
        await res.json();

      if (
        !res.ok ||
        !Array.isArray(data)
      ) {
        throw new Error(
          "Unable to identify scanned product"
        );
      }

      const exactProduct =
        data.find(
          (
            product: Product
          ) =>
            product.sku
              ?.trim()
              .toLowerCase() ===
            scannedSku.toLowerCase()
        );

      if (!exactProduct) {
        setScanMessage(
          `No active product found for SKU: ${scannedSku}`
        );

        setScanSuccess(
          false
        );

        return;
      }

      addToCart(
        exactProduct
      );

      setScanMessage(
        `${exactProduct.name} added to cart`
      );

      setScanSuccess(true);
      setScanValue("");
    } catch (error) {
      setScanMessage(
        error instanceof Error
          ? error.message
          : "Unable to scan product"
      );

      setScanSuccess(false);
    } finally {
      setIsScanning(false);

      requestAnimationFrame(
        () => {
          scanInputRef.current?.focus();
        }
      );
    }
  };

  // ==========================================
  // REMOVE PRODUCT
  // ==========================================
  const removeFromCart = (
    productId: string
  ) => {
    if (momoPaymentLocked) {
      return;
    }

    setCart((prev) =>
      prev.filter(
        (item) =>
          item.id !==
          productId
      )
    );
  };

  // ==========================================
  // UPDATE QUANTITY
  // ==========================================
  const updateQuantity = (
    productId: string,
    type: "inc" | "dec"
  ) => {
    if (momoPaymentLocked) {
      return;
    }

    setCart((prev) =>
      prev
        .map((item) => {
          if (
            item.id !==
            productId
          ) {
            return item;
          }

          if (
            type === "inc"
          ) {
            return {
              ...item,
              quantity:
                item.quantity +
                1,
            };
          }

          if (
            type === "dec"
          ) {
            const newQty =
              item.quantity -
              1;

            return newQty >
              0
              ? {
                  ...item,
                  quantity:
                    newQty,
                }
              : null;
          }

          return item;
        })
        .filter(
          Boolean
        ) as CartItem[]
    );
  };

  // ==========================================
  // CLEAR CART
  // ==========================================
  const clearCart = () => {
    if (momoPaymentLocked) {
      return;
    }

    setCart([]);
  };

  // ==========================================
  // STANDARD CHECKOUT
  // CASH / BANK TRANSFER
  // ==========================================
  const handleStandardCheckout =
    async () => {
      if (isProcessing) {
        return;
      }

      if (
        cart.length === 0
      ) {
        alert(
          "Cart is empty"
        );

        return;
      }

      setIsProcessing(true);

      try {
        const res =
          await fetch(
            "/api/pos/checkout",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  customerName,
                  customerPhone,
                  paymentMethod,

                  items:
                    cart.map(
                      (
                        item
                      ) => ({
                        id:
                          item.id,

                        quantity:
                          item.quantity,
                      })
                    ),
                }),
            }
          );

        const data =
          await res.json();

        console.log(
          "CHECKOUT RESPONSE:",
          data
        );

        if (!res.ok) {
          alert(
            data.error ||
              "Checkout failed"
          );

          return;
        }

        window.location.href =
          `/admin/orders/${data.orderId}/receipt?source=pos`;
      } catch {
        alert(
          "Something went wrong"
        );
      } finally {
        setIsProcessing(
          false
        );
      }
    };

  // ==========================================
  // CHECK ONE MOMO PAYMENT STATUS
  // ==========================================
  const checkMomoStatus =
    async (
      payment: PendingMomoPayment
    ): Promise<MomoCheckResult> => {
      let res: Response;

      try {
        res =
          await fetch(
            `/api/pos/momo/status?paymentId=${encodeURIComponent(
              payment.paymentId
            )}&reference=${encodeURIComponent(
              payment.reference
            )}`,
            {
              method: "GET",
              cache:
                "no-store",
            }
          );
      } catch {
        setMomoMessageType(
          "warning"
        );

        setMomoMessage(
          "Unable to reach the payment-status service. The payment has not been marked failed."
        );

        return "PENDING";
      }

      let data:
        MomoStatusResponse;

      try {
        data =
          (await res.json()) as
            MomoStatusResponse;
      } catch {
        setMomoMessageType(
          "warning"
        );

        setMomoMessage(
          "Received an invalid payment-status response. The payment has not been marked failed."
        );

        return "PENDING";
      }

      if (!res.ok) {
        /*
         * A Paystack/network verification
         * problem does NOT mean the customer
         * did not pay.
         *
         * 502 is therefore treated as
         * unresolved and may be checked again.
         */
        if (
          res.status === 502
        ) {
          setMomoMessageType(
            "warning"
          );

          setMomoMessage(
            data.error ||
              "Unable to reach Paystack. Retrying payment verification..."
          );

          return "PENDING";
        }

        setMomoMessageType(
          data.requiresAttention
            ? "error"
            : "warning"
        );

        setMomoMessage(
          data.error ||
            "Unable to verify the Mobile Money payment."
        );

        return data.requiresAttention
          ? "ATTENTION"
          : "PENDING";
      }

      if (
        data.requiresAttention
      ) {
        setMomoMessageType(
          "error"
        );

        setMomoMessage(
          data.message ||
            data.error ||
            "The customer payment was confirmed, but the sale requires attention before it can be completed."
        );

        return "ATTENTION";
      }

      if (
        data.orderFinalized
      ) {
        setMomoMessageType(
          "success"
        );

        setMomoMessage(
          data.message ||
            "Payment confirmed. Sale completed."
        );

        setMomoSecondsRemaining(
          0
        );

        window.location.href =
          `/admin/orders/${payment.orderId}/receipt?source=pos`;

        return "FINALIZED";
      }

      if (
        data.paymentStatus ===
          "FAILED"
      ) {
        setMomoMessageType(
          "error"
        );

        setMomoMessage(
          data.message ||
            "The Mobile Money payment was not completed."
        );

        setPendingMomo(
          null
        );

        setMomoSecondsRemaining(
          0
        );

        return "FAILED";
      }

      setMomoMessageType(
        "info"
      );

      setMomoMessage(
        data.message ||
          "Waiting for the customer to approve the Mobile Money payment."
      );

      return "PENDING";
    };

  // ==========================================
  // AUTOMATIC MOMO STATUS CHECKING
  // ==========================================
  const pollMomoStatus =
    async (
      payment: PendingMomoPayment
    ) => {
      /*
 * Paystack webhooks are the primary
 * confirmation path.
 *
 * Verification is only a fallback,
 * so checks are deliberately spaced
 * to avoid aggressive Paystack API
 * polling.
 */
      const intervalSeconds =
  30;

      let remaining =
        payment.expiresInSeconds >
        0
          ? payment.expiresInSeconds
          : 180;

      while (
        remaining > 0
      ) {
        setMomoSecondsRemaining(
          remaining
        );

        const result =
          await checkMomoStatus(
            payment
          );

        if (
          result ===
            "FINALIZED" ||
          result ===
            "FAILED" ||
          result ===
            "ATTENTION"
        ) {
          setIsProcessing(
            false
          );

          return;
        }

        await sleep(
          intervalSeconds *
            1000
        );

        remaining =
          Math.max(
            0,
            remaining -
              intervalSeconds
          );
      }

      setMomoSecondsRemaining(
        0
      );

      setMomoMessageType(
        "warning"
      );

      setMomoMessage(
        "Automatic checking has paused because the approval window has elapsed. Do not start another payment yet. Use “Check Payment Status” below to confirm the existing payment first."
      );

      setIsProcessing(
        false
      );
    };

  // ==========================================
  // START PAYSTACK MOMO PAYMENT
  // ==========================================
  const handleMomoCheckout =
    async () => {
      if (
        isProcessing ||
        pendingMomo
      ) {
        return;
      }

      if (
        cart.length === 0
      ) {
        alert(
          "Cart is empty"
        );

        return;
      }

      if (
        !momoProvider
      ) {
        alert(
          "Select the customer's Mobile Money network"
        );

        return;
      }

      if (
        !customerPhone.trim()
      ) {
        alert(
          "Enter the customer's Mobile Money number"
        );

        return;
      }

      setIsProcessing(true);

      setMomoMessage("");
      setMomoMessageType(
        "info"
      );

      setMomoSecondsRemaining(
        180
      );

      try {
        const res =
          await fetch(
            "/api/pos/momo/initiate",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  customerName,

                  customerPhone,

                  provider:
                    momoProvider,

                  items:
                    cart.map(
                      (
                        item
                      ) => ({
                        id:
                          item.id,

                        quantity:
                          item.quantity,
                      })
                    ),
                }),
            }
          );

        let data:
          MomoInitiateResponse;

        try {
          data =
            (await res.json()) as
              MomoInitiateResponse;
        } catch {
          throw new Error(
            "Paystack returned an invalid response"
          );
        }

        /*
         * Special safety case:
         *
         * The initiation endpoint may return
         * a network error after creating our
         * PENDING payment.
         *
         * A timeout does not prove Paystack
         * did not receive the charge request,
         * so if paymentId + reference exist
         * we MUST verify that same payment
         * instead of starting another one.
         */
        if (!res.ok) {
          if (
            data.orderId &&
            data.paymentId &&
            data.reference
          ) {
            const payment: PendingMomoPayment =
              {
                orderId:
                  data.orderId,

                paymentId:
                  data.paymentId,

                reference:
                  data.reference,

                expiresInSeconds:
                  data.expiresInSeconds ??
                  180,
              };

            setPendingMomo(
              payment
            );

            setMomoMessageType(
              "warning"
            );

            setMomoMessage(
              data.error ||
                "The Paystack request could not be confirmed. Checking the existing payment before any retry."
            );

            await pollMomoStatus(
              payment
            );

            return;
          }

          setMomoMessageType(
            "error"
          );

          setMomoMessage(
            data.error ||
              data.details ||
              "Unable to start the Mobile Money payment."
          );

          return;
        }

        if (
          !data.orderId ||
          !data.paymentId ||
          !data.reference
        ) {
          throw new Error(
            "Mobile Money payment was started without a complete payment reference"
          );
        }

        const payment: PendingMomoPayment =
          {
            orderId:
              data.orderId,

            paymentId:
              data.paymentId,

            reference:
              data.reference,

            expiresInSeconds:
              data.expiresInSeconds ??
              180,
          };

        setPendingMomo(
          payment
        );

        setMomoSecondsRemaining(
          payment.expiresInSeconds
        );

        setMomoMessageType(
          "info"
        );

        setMomoMessage(
          data.displayText ||
            "Please ask the customer to approve the Mobile Money payment on their phone."
        );

        await pollMomoStatus(
          payment
        );
      } catch (error) {
        setMomoMessageType(
          "error"
        );

        setMomoMessage(
          error instanceof Error
            ? error.message
            : "Unable to start Mobile Money payment"
        );
      } finally {
        setIsProcessing(
          false
        );
      }
    };

  // ==========================================
  // MANUAL MOMO STATUS CHECK
  // ==========================================
  const handleManualMomoStatusCheck =
    async () => {
      if (
        !pendingMomo ||
        isProcessing
      ) {
        return;
      }

      setIsProcessing(true);

      try {
        const result =
          await checkMomoStatus(
            pendingMomo
          );

        if (
          result ===
          "PENDING"
        ) {
          setMomoMessageType(
            "info"
          );
        }
      } finally {
        setIsProcessing(
          false
        );
      }
    };

  // ==========================================
  // CHECKOUT ROUTER
  // ==========================================
  const handleCheckout =
    async () => {
      if (
        paymentMethod ===
        "MOMO"
      ) {
        await handleMomoCheckout();

        return;
      }

      await handleStandardCheckout();
    };

  const total =
    cart.reduce(
      (
        sum,
        item
      ) =>
        sum +
        item.retailPrice *
          item.quantity,
      0
    );

  const momoMessageClass =
    momoMessageType ===
    "success"
      ? "border-green-200 bg-green-50 text-green-800"
      : momoMessageType ===
          "error"
        ? "border-red-200 bg-red-50 text-red-800"
        : momoMessageType ===
            "warning"
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-blue-200 bg-blue-50 text-blue-800";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        POS System
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="md:col-span-2 space-y-6">
          {/* SCANNER */}
          <div className="border p-4 rounded-xl bg-blue-50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">
                  Scan Product
                </h2>

                <p className="text-sm text-gray-600 mt-1">
                  Scan a DeeglobalGH
                  SKU barcode. The
                  product will be added
                  directly to the cart.
                </p>
              </div>

              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {momoPaymentLocked
                  ? "Cart Locked"
                  : "Scanner Ready"}
              </span>
            </div>

            <form
              onSubmit={
                handleScan
              }
              className="mt-4"
            >
              <div className="flex gap-2">
                <input
                  ref={
                    scanInputRef
                  }
                  type="text"
                  value={
                    scanValue
                  }
                  onChange={(
                    e
                  ) =>
                    setScanValue(
                      e.target
                        .value
                    )
                  }
                  placeholder="Scan SKU barcode here..."
                  autoComplete="off"
                  autoFocus
                  disabled={
                    momoPaymentLocked
                  }
                  className="flex-1 border p-3 rounded-lg bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />

                <button
                  type="submit"
                  disabled={
                    isScanning ||
                    !scanValue.trim() ||
                    momoPaymentLocked
                  }
                  className="bg-blue-700 text-white px-5 py-3 rounded-lg disabled:opacity-50"
                >
                  {isScanning
                    ? "Scanning..."
                    : "Add"}
                </button>
              </div>
            </form>

            {scanMessage && (
              <div
                className={
                  scanSuccess
                    ? "mt-3 text-sm font-medium text-green-700"
                    : "mt-3 text-sm font-medium text-red-700"
                }
              >
                {
                  scanMessage
                }
              </div>
            )}
          </div>

          {/* NORMAL SEARCH */}
          <div className="border p-4 rounded-xl">
            <h2 className="font-semibold mb-4">
              Search Products
            </h2>

            <input
              type="text"
              value={query}
              onChange={(e) =>
                handleSearch(
                  e.target
                    .value
                )
              }
              placeholder="Search by product name or SKU..."
              disabled={
                momoPaymentLocked
              }
              className="w-full border p-2 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
            />

            <div className="mt-4 space-y-2">
              {results.length ===
              0 ? (
                <p className="text-sm text-gray-500">
                  No products found
                </p>
              ) : (
                results.map(
                  (
                    product
                  ) => (
                    <button
                      type="button"
                      key={
                        product.id
                      }
                      onClick={() =>
                        addToCart(
                          product
                        )
                      }
                      disabled={
                        momoPaymentLocked
                      }
                      className="w-full border p-2 rounded-lg flex justify-between items-center text-left hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div>
                        <div>
                          {
                            product.name
                          }
                        </div>

                        {product.sku && (
                          <div className="text-xs text-gray-500">
                            {
                              product.sku
                            }
                          </div>
                        )}
                      </div>

                      <span className="font-semibold">
                        GHS{" "}
                        {
                          product.retailPrice
                        }
                      </span>
                    </button>
                  )
                )
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: CART */}
        <div className="border p-4 rounded-xl">
          <h2 className="font-semibold mb-4">
            Cart
          </h2>

          {cart.length ===
          0 ? (
            <p className="text-sm text-gray-500">
              Cart is empty
            </p>
          ) : (
            <div>
              {cart.map(
                (item) => (
                  <div
                    key={
                      item.id
                    }
                    className="flex justify-between items-center text-sm mb-2"
                  >
                    <span className="pr-2">
                      {
                        item.name
                      }
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            "dec"
                          )
                        }
                        disabled={
                          momoPaymentLocked
                        }
                        className="px-2 bg-gray-200 rounded disabled:opacity-50"
                      >
                        -
                      </button>

                      <span>
                        {
                          item.quantity
                        }
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            "inc"
                          )
                        }
                        disabled={
                          momoPaymentLocked
                        }
                        className="px-2 bg-gray-200 rounded disabled:opacity-50"
                      >
                        +
                      </button>

                      <span className="ml-2 whitespace-nowrap">
                        GHS{" "}
                        {(
                          item.retailPrice *
                          item.quantity
                        ).toFixed(
                          2
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(
                            item.id
                          )
                        }
                        disabled={
                          momoPaymentLocked
                        }
                        className="text-red-500 text-xs ml-2 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* TOTAL + ACTIONS */}
          <div className="mt-4 space-y-3">
            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>
                Total
              </span>

              <span>
                GHS{" "}
                {total.toFixed(
                  2
                )}
              </span>
            </div>

            <input
              type="text"
              placeholder="Customer Name"
              value={
                customerName
              }
              onChange={(e) =>
                setCustomerName(
                  e.target
                    .value
                )
              }
              disabled={
                momoPaymentLocked
              }
              className="w-full border p-2 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
            />

            <input
              type="text"
              placeholder={
                paymentMethod ===
                "MOMO"
                  ? "Customer MoMo Number"
                  : "Customer Phone"
              }
              value={
                customerPhone
              }
              onChange={(e) =>
                setCustomerPhone(
                  e.target
                    .value
                )
              }
              disabled={
                momoPaymentLocked
              }
              className="w-full border p-2 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
            />

            <select
              value={
                paymentMethod
              }
              onChange={(e) => {
                setPaymentMethod(
                  e.target
                    .value
                );

                setMomoMessage(
                  ""
                );
              }}
              disabled={
                momoPaymentLocked
              }
              className="w-full border p-2 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="CASH">
                Cash
              </option>

              <option value="MOMO">
                Mobile Money
              </option>

              <option value="BANK_TRANSFER">
                Bank Transfer
              </option>
            </select>

            {paymentMethod ===
              "MOMO" && (
              <div className="space-y-3 border rounded-lg p-3 bg-gray-50">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Mobile Money
                    Network
                  </label>

                  <select
                    value={
                      momoProvider
                    }
                    onChange={(
                      e
                    ) =>
                      setMomoProvider(
                        e.target
                          .value as
                          MomoProvider
                      )
                    }
                    disabled={
                      momoPaymentLocked
                    }
                    className="w-full border p-2 rounded-lg bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      Select
                      network
                    </option>

                    <option value="mtn">
                      MTN
                    </option>

                    <option value="atl">
                      AT
                    </option>

                    <option value="vod">
                      Telecel
                    </option>
                  </select>
                </div>

                {!pendingMomo && (
                  <p className="text-xs text-gray-600">
                    The customer
                    must approve the
                    payment on the
                    phone before the
                    sale is completed
                    and stock is
                    reduced.
                  </p>
                )}
              </div>
            )}

            {pendingMomo && (
              <div
                className={`border rounded-lg p-3 ${momoMessageClass}`}
              >
                <div className="font-semibold">
                  Mobile Money
                  Payment
                </div>

                <div className="text-sm mt-1">
                  Order:{" "}
                  {
                    pendingMomo.orderId
                  }
                </div>

                <div className="text-xs mt-1 break-all">
                  Reference:{" "}
                  {
                    pendingMomo.reference
                  }
                </div>

                {momoSecondsRemaining >
                  0 && (
                  <div className="text-sm font-medium mt-2">
                    Checking
                    payment:{" "}
                    {
                      momoSecondsRemaining
                    }
                    s
                  </div>
                )}

                {momoMessage && (
                  <div className="text-sm mt-2">
                    {
                      momoMessage
                    }
                  </div>
                )}

                <button
                  type="button"
                  onClick={
                    handleManualMomoStatusCheck
                  }
                  disabled={
                    isProcessing
                  }
                  className="mt-3 w-full border border-current px-3 py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {isProcessing
                    ? "Checking..."
                    : "Check Payment Status"}
                </button>

                <p className="text-xs mt-2">
                  Do not start
                  another payment
                  for this sale
                  until this
                  reference has
                  been confirmed
                  or failed.
                </p>
              </div>
            )}

            {!pendingMomo &&
              momoMessage && (
                <div
                  className={`border rounded-lg p-3 text-sm ${momoMessageClass}`}
                >
                  {
                    momoMessage
                  }
                </div>
              )}

            <button
              type="button"
              onClick={
                clearCart
              }
              disabled={
                momoPaymentLocked
              }
              className="w-full bg-gray-200 text-black p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Cart
            </button>

            <button
              type="button"
              onClick={
                handleCheckout
              }
              disabled={
                isProcessing ||
                momoPaymentLocked
              }
              className="w-full bg-black text-white p-2 rounded-lg disabled:opacity-50"
            >
              {paymentMethod ===
              "MOMO"
                ? isProcessing
                  ? "Waiting for Payment..."
                  : "Request MoMo Payment"
                : isProcessing
                  ? "Processing..."
                  : "Complete Sale"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}