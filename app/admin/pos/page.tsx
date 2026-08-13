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

type PaymentMode =
  | "MOMO"
  | "SPLIT";

type PendingMomoPayment = {
  orderId: string;
  paymentId: string;
  reference: string;
  expiresInSeconds: number;

  /*
   * Existing pure MoMo payments do not need
   * split allocation values, so these remain
   * optional.
   */
  mode?: PaymentMode;

  cashAmountPesewas?: number;
  momoAmountPesewas?: number;
};

type FailedSplitPayment = {
  orderId: string;
  cashAmountPesewas: number;
  momoAmountPesewas: number;
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
  paymentMethod?: string;

  displayText?: string;
  expiresInSeconds?: number;

  orderAmountPesewas?: number;
  requiredAmountPesewas?: number;
  confirmedAmountPesewas?: number;

  cashAmountPesewas?: number;
  momoAmountPesewas?: number;

  cashPaymentStatus?: string;
  momoPaymentStatus?: string;

  existingPayment?: boolean;
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
    splitCashAmount,
    setSplitCashAmount,
  ] = useState("");

  const [
    failedSplitPayment,
    setFailedSplitPayment,
  ] =
    useState<FailedSplitPayment | null>(
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

  /*
   * The cart must remain locked while:
   *
   * 1. any MoMo payment is unresolved, OR
   * 2. a split payment has a confirmed Cash
   *    allocation but its MoMo allocation
   *    failed and requires recovery.
   *
   * This prevents the cashier from modifying
   * the cart or accidentally creating another
   * split order for Cash already received.
   */
  const momoPaymentLocked =
    pendingMomo !== null ||
    failedSplitPayment !== null;

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

        /*
         * Pure MoMo:
         * the failed attempt can simply end.
         *
         * Split tender:
         * Cash has already been recorded as
         * CONFIRMED, so retain the split order
         * for the controlled retry workflow.
         */
        if (
          payment.mode ===
          "SPLIT"
        ) {
          setFailedSplitPayment({
            orderId:
              payment.orderId,

            cashAmountPesewas:
              payment.cashAmountPesewas ??
              0,

            momoAmountPesewas:
              payment.momoAmountPesewas ??
              0,
          });

          setMomoMessage(
            data.message ||
              "The Mobile Money part of this split payment failed. The Cash payment is still recorded. Retry the remaining Mobile Money balance for this same order."
          );
        } else {
          setMomoMessage(
            data.message ||
              "The Mobile Money payment was not completed."
          );
        }

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
  // START CASH + MOMO SPLIT PAYMENT
  // ==========================================
  const handleSplitCheckout =
    async () => {
      if (
        isProcessing ||
        pendingMomo ||
        failedSplitPayment
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

      const cashText =
        splitCashAmount.trim();

      if (
        !/^\d+(\.\d{1,2})?$/.test(
          cashText
        )
      ) {
        alert(
          "Enter a valid Cash amount with no more than two decimal places"
        );

        return;
      }

      const [
        cashCedisText,
        cashPesewasText = "",
      ] =
        cashText.split(".");

      const cashAmountPesewas =
        Number(
          cashCedisText
        ) *
          100 +
        Number(
          cashPesewasText.padEnd(
            2,
            "0"
          )
        );

      /*
       * Match the current backend Order.amount
       * architecture, which stores whole GHS.
       *
       * This is only an early cashier-side
       * validation. The backend recalculates
       * the authoritative order total from the
       * database before creating the payment.
       */
      const orderAmountPesewas =
        Math.round(
          total
        ) * 100;

      if (
        !Number.isSafeInteger(
          cashAmountPesewas
        ) ||
        cashAmountPesewas <=
          0
      ) {
        alert(
          "Cash amount must be greater than zero"
        );

        return;
      }

      if (
        cashAmountPesewas >=
        orderAmountPesewas
      ) {
        alert(
          "Cash amount must be less than the order total for a split payment"
        );

        return;
      }

      setIsProcessing(
        true
      );

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
            "/api/pos/split/initiate",
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

                  cashAmount:
                    splitCashAmount,

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
            "Split payment service returned an invalid response"
          );
        }

        const returnedCashPesewas =
          data.cashAmountPesewas ??
          cashAmountPesewas;

        const returnedMomoPesewas =
          data.momoAmountPesewas ??
          Math.max(
            0,
            orderAmountPesewas -
              returnedCashPesewas
          );

        /*
         * The split endpoint may have already
         * recorded the Cash allocation before
         * Paystack returns an error.
         *
         * We must distinguish:
         *
         * 1. ambiguous/network response:
         *    MoMo remains PENDING -> verify it.
         *
         * 2. definitive Paystack failure:
         *    Cash remains CONFIRMED -> retain the
         *    same split order for controlled retry.
         */
        if (!res.ok) {
          if (
            data.orderId &&
            data.paymentId &&
            data.reference
          ) {
            if (
              data.momoPaymentStatus ===
                "FAILED" ||
              data.paymentStatus ===
                "FAILED"
            ) {
              setFailedSplitPayment({
                orderId:
                  data.orderId,

                cashAmountPesewas:
                  returnedCashPesewas,

                momoAmountPesewas:
                  returnedMomoPesewas,
              });

              setPendingMomo(
                null
              );

              setMomoSecondsRemaining(
                0
              );

              setMomoMessageType(
                "error"
              );

              setMomoMessage(
                data.error ||
                  data.details ||
                  "The Mobile Money part of the split payment failed. The Cash payment is still recorded. Retry the remaining Mobile Money balance for this same order."
              );

              return;
            }

            const payment:
              PendingMomoPayment =
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

                mode:
                  "SPLIT",

                cashAmountPesewas:
                  returnedCashPesewas,

                momoAmountPesewas:
                  returnedMomoPesewas,
              };

            setPendingMomo(
              payment
            );

            setMomoMessageType(
              "warning"
            );

            setMomoMessage(
              data.error ||
                "The Paystack request could not be confirmed. The Cash payment is recorded. Checking this same Mobile Money payment before any retry."
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
              "Unable to start the split payment."
          );

          return;
        }

        if (
          !data.orderId ||
          !data.paymentId ||
          !data.reference
        ) {
          throw new Error(
            "Split payment was started without a complete payment reference"
          );
        }

        const payment:
          PendingMomoPayment =
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

            mode:
              "SPLIT",

            cashAmountPesewas:
              returnedCashPesewas,

            momoAmountPesewas:
              returnedMomoPesewas,
          };

        setPendingMomo(
          payment
        );

        setFailedSplitPayment(
          null
        );

        setMomoSecondsRemaining(
          payment.expiresInSeconds
        );

        setMomoMessageType(
          "info"
        );

        setMomoMessage(
          data.displayText ||
            "Cash has been recorded. Please ask the customer to approve the remaining Mobile Money balance on their phone."
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
            : "Unable to start split payment"
        );
      } finally {
        setIsProcessing(
          false
        );
      }
    };

  // ==========================================
  // RETRY FAILED SPLIT MOMO BALANCE
  // ==========================================
  const handleSplitRetry =
    async () => {
      if (
        isProcessing ||
        pendingMomo ||
        !failedSplitPayment
      ) {
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

      setIsProcessing(
        true
      );

      setMomoMessageType(
        "info"
      );

      setMomoMessage(
        "Requesting the remaining Mobile Money balance..."
      );

      setMomoSecondsRemaining(
        180
      );

      try {
        const res =
          await fetch(
            "/api/pos/split/retry",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  orderId:
                    failedSplitPayment.orderId,

                  provider:
                    momoProvider,

                  customerPhone,
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
            "Split payment retry service returned an invalid response"
          );
        }

        const retryCashPesewas =
          data.cashAmountPesewas ??
          failedSplitPayment.cashAmountPesewas;

        const retryMomoPesewas =
          data.momoAmountPesewas ??
          failedSplitPayment.momoAmountPesewas;

        /*
         * The retry endpoint deliberately
         * refuses to create another payment if
         * one is already PENDING.
         *
         * If it returns that existing payment,
         * adopt the same reference and verify it.
         */
        if (!res.ok) {
          if (
            data.orderId &&
            data.paymentId &&
            data.reference &&
            (
              data.existingPayment ||
              data.paymentStatus ===
                "PENDING"
            )
          ) {
            const payment:
              PendingMomoPayment =
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

                mode:
                  "SPLIT",

                cashAmountPesewas:
                  retryCashPesewas,

                momoAmountPesewas:
                  retryMomoPesewas,
              };

            setPendingMomo(
              payment
            );

            setFailedSplitPayment(
              null
            );

            setMomoMessageType(
              "warning"
            );

            setMomoMessage(
              data.error ||
                "An existing Mobile Money payment is still pending. Checking that same payment instead of creating another one."
            );

            await pollMomoStatus(
              payment
            );

            return;
          }

          /*
           * A retry can itself fail
           * definitively.
           *
           * Keep failedSplitPayment intact so
           * the confirmed Cash allocation stays
           * represented and the cart stays
           * locked for another controlled retry.
           */
          setMomoSecondsRemaining(
            0
          );

          setMomoMessageType(
            "error"
          );

          setMomoMessage(
            data.error ||
              data.details ||
              "Unable to retry the remaining Mobile Money balance."
          );

          return;
        }

        if (
          !data.orderId ||
          !data.paymentId ||
          !data.reference
        ) {
          throw new Error(
            "Split payment retry started without a complete payment reference"
          );
        }

        const payment:
          PendingMomoPayment =
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

            mode:
              "SPLIT",

            cashAmountPesewas:
              retryCashPesewas,

            momoAmountPesewas:
              retryMomoPesewas,
          };

        /*
         * We now have another active Paystack
         * allocation, so the pending-payment
         * lock replaces the failed-split lock.
         */
        setPendingMomo(
          payment
        );

        setFailedSplitPayment(
          null
        );

        setMomoSecondsRemaining(
          payment.expiresInSeconds
        );

        setMomoMessageType(
          "info"
        );

        setMomoMessage(
          data.displayText ||
            "Please ask the customer to approve the remaining Mobile Money balance on their phone."
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
            : "Unable to retry split Mobile Money payment"
        );
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

      if (
        paymentMethod ===
        "SPLIT"
      ) {
        await handleSplitCheckout();

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

  /*
   * Cashier-facing split-payment preview.
   *
   * The backend remains authoritative and
   * recalculates the order amount from the
   * database before accepting payment.
   */
  const splitOrderAmount =
    Math.round(
      total
    );

  const splitCashNumber =
    splitCashAmount.trim() &&
    /^\d+(\.\d{1,2})?$/.test(
      splitCashAmount.trim()
    )
      ? Number(
          splitCashAmount
        )
      : 0;

  const splitMomoBalance =
    Math.max(
      0,
      Math.round(
        (
          splitOrderAmount -
          splitCashNumber
        ) * 100
      ) / 100
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
                pendingMomo !==
                null
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

              <option value="SPLIT">
                Split Payment
                (Cash + MoMo)
              </option>

              <option value="BANK_TRANSFER">
                Bank Transfer
              </option>
            </select>

            {(
              paymentMethod ===
                "MOMO" ||
              paymentMethod ===
                "SPLIT"
            ) && (
              <div className="space-y-3 border rounded-lg p-3 bg-gray-50">
                {paymentMethod ===
                  "SPLIT" && (
                  <div className="space-y-2 border-b pb-3">
                    <label className="block text-sm font-medium">
                      Cash Amount
                      (GHS)
                    </label>

                    <input
                      type="text"
                      inputMode="decimal"
                      value={
                        splitCashAmount
                      }
                      onChange={(
                        e
                      ) =>
                        setSplitCashAmount(
                          e.target
                            .value
                        )
                      }
                      placeholder="e.g. 40.00"
                      disabled={
                        pendingMomo !==
                          null ||
                        failedSplitPayment !==
                          null
                      }
                      className="w-full border p-2 rounded-lg bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />

                    <div className="rounded-lg border bg-white p-3 space-y-2 text-sm">
                      <div className="flex justify-between gap-3">
                        <span>
                          Order Total
                        </span>

                        <span className="font-semibold">
                          GHS{" "}
                          {splitOrderAmount.toFixed(
                            2
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span>
                          Cash
                        </span>

                        <span className="font-semibold">
                          GHS{" "}
                          {splitCashNumber.toFixed(
                            2
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3 border-t pt-2">
                        <span>
                          MoMo Balance
                        </span>

                        <span className="font-bold">
                          GHS{" "}
                          {splitMomoBalance.toFixed(
                            2
                          )}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600">
                      Enter only the
                      Cash physically
                      received. The POS
                      calculates the
                      remaining Mobile
                      Money balance
                      automatically.
                    </p>
                  </div>
                )}
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
                      pendingMomo !==
                      null
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

            {failedSplitPayment && (
              <div className="border border-amber-300 bg-amber-50 text-amber-900 rounded-lg p-3 space-y-3">
                <div className="font-semibold">
                  Split Payment
                  Requires Recovery
                </div>

                <div className="text-sm">
                  Order:{" "}
                  {
                    failedSplitPayment.orderId
                  }
                </div>

                <div className="rounded-lg border border-amber-200 bg-white p-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span>
                      Cash already
                      recorded
                    </span>

                    <span className="font-semibold">
                      GHS{" "}
                      {(
                        failedSplitPayment.cashAmountPesewas /
                        100
                      ).toFixed(
                        2
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span>
                      MoMo still
                      required
                    </span>

                    <span className="font-bold">
                      GHS{" "}
                      {(
                        failedSplitPayment.momoAmountPesewas /
                        100
                      ).toFixed(
                        2
                      )}
                    </span>
                  </div>
                </div>

                <p className="text-sm">
                  The Cash portion is
                  already confirmed.
                  Do not create a new
                  sale and do not take
                  the Cash again.
                  Correct the customer's
                  Mobile Money number or
                  network if necessary,
                  then retry only the
                  outstanding MoMo
                  balance.
                </p>

                <button
                  type="button"
                  onClick={
                    handleSplitRetry
                  }
                  disabled={
                    isProcessing ||
                    pendingMomo !==
                      null
                  }
                  className="w-full bg-amber-700 text-white px-3 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing
                    ? "Requesting MoMo..."
                    : "Retry Remaining MoMo"}
                </button>
              </div>
            )}

            {pendingMomo && (
              <div
                className={`border rounded-lg p-3 ${momoMessageClass}`}
              >
                <div className="font-semibold">
                  {pendingMomo.mode ===
                  "SPLIT"
                    ? "Split Payment — Mobile Money Balance"
                    : "Mobile Money Payment"}
                </div>

                {pendingMomo.mode ===
                  "SPLIT" && (
                  <div className="mt-2 rounded-lg border border-current/20 p-2 text-sm space-y-1">
                    <div className="flex justify-between gap-3">
                      <span>
                        Cash
                      </span>

                      <span className="font-medium">
                        GHS{" "}
                        {(
                          (
                            pendingMomo.cashAmountPesewas ??
                            0
                          ) / 100
                        ).toFixed(
                          2
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span>
                        MoMo
                      </span>

                      <span className="font-medium">
                        GHS{" "}
                        {(
                          (
                            pendingMomo.momoAmountPesewas ??
                            0
                          ) / 100
                        ).toFixed(
                          2
                        )}
                      </span>
                    </div>
                  </div>
                )}

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
                : paymentMethod ===
                    "SPLIT"
                  ? isProcessing
                    ? "Waiting for Split Payment..."
                    : "Request Split Payment"
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