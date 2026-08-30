"use client";

import {
  useEffect,
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

type DiscountTypeOption =
  | "AMOUNT"
  | "PERCENTAGE";

type DiscountReasonOption =
  | ""
  | "CUSTOMER_NEGOTIATION"
  | "BULK_PURCHASE"
  | "SCHOOL_LIST"
  | "PROMOTION"
  | "LOYAL_CUSTOMER"
  | "DAMAGED_PACKAGING"
  | "MANAGER_ADJUSTMENT"
  | "OTHER";

type PosDiscountPayload = {
  type: DiscountTypeOption;
  value: string | number;
  reason: Exclude<
    DiscountReasonOption,
    ""
  >;
  note: string | null;

  approval?: {
    email: string;
    pin: string;
  };
};

type PendingMomoPayment = {
  orderId: string;
  paymentId: string;
  reference: string;
  expiresInSeconds: number;

  mode?: PaymentMode;

  cashAmountPesewas?: number;
  momoAmountPesewas?: number;
};

type FailedSplitPayment = {
  orderId: string;
  cashAmountPesewas: number;
  momoAmountPesewas: number;
};

type RecoverableSplitItem = {
  productId: string;
  name: string;
  sku: string | null;
  quantity: number;
  currentStockQty: number;
};

type RecoverableSplitOrder = {
  orderId: string;
  createdAt: string;
  customerName: string | null;
  customerPhone: string;
  requiredAmountPesewas: number;
  confirmedAmountPesewas: number;
  confirmedCashPesewas: number;
  outstandingAmountPesewas: number;
  stockReduced: boolean;
  paymentStatus: string;
  provider: string | null;
  momoPhone: string | null;
  hasPendingMomo: boolean;
  safeToRetry: boolean;
  items: RecoverableSplitItem[];
};

type RecoverableSplitResponse = {
  success?: boolean;
  error?: string;
  orders?: RecoverableSplitOrder[];
};

type HeldDiscountSnapshot = {
  enabled: boolean;
  type: string;
  value: string;
  reason: string;
  note: string;
};

type PosHeldSale = {
  id: string;
  holdNumber: string;
  branchId: string;
  createdByStaffId: string;
  createdByName: string | null;
  label: string | null;
  customerName: string | null;
  customerPhone: string | null;
  paymentMethod: string;
  momoProvider: string | null;
  splitCashAmount: string | null;
  itemCount: number;
  subtotalPesewas: number;
  cartSnapshot: unknown;
  discountSnapshot: unknown;
  status: string;
  createdAt: string;
  updatedAt: string;
  resumedAt: string | null;
  cancelledAt: string | null;
};

type HeldSalesResponse = {
  success?: boolean;
  error?: string;
  heldSales?: PosHeldSale[];
  heldSale?: PosHeldSale;
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

function parseGhsToPesewasForPreview(
  value: string
): number | null {
  const text =
    value.trim();

  if (
    !/^\d+(\.\d{1,2})?$/.test(
      text
    )
  ) {
    return null;
  }

  const [
    cedisText,
    pesewasText = "",
  ] = text.split(".");

  const cedis =
    Number(cedisText);

  const pesewas =
    Number(
      pesewasText.padEnd(
        2,
        "0"
      )
    );

  if (
    !Number.isSafeInteger(
      cedis
    ) ||
    !Number.isSafeInteger(
      pesewas
    )
  ) {
    return null;
  }

  const total =
    cedis * 100 +
    pesewas;

  return Number.isSafeInteger(
    total
  )
    ? total
    : null;
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

  // ==========================================
  // DISCOUNT / HAGGLING STATE
  // ==========================================
  const [
    discountEnabled,
    setDiscountEnabled,
  ] = useState(false);

  const [
    discountType,
    setDiscountType,
  ] =
    useState<DiscountTypeOption>(
      "PERCENTAGE"
    );

  const [
    discountValue,
    setDiscountValue,
  ] = useState("");

  const [
    discountReason,
    setDiscountReason,
  ] =
    useState<DiscountReasonOption>(
      ""
    );

  const [
    discountNote,
    setDiscountNote,
  ] = useState("");

  const [
    discountNeedsApproval,
    setDiscountNeedsApproval,
  ] = useState(false);

  const [
    managerEmail,
    setManagerEmail,
  ] = useState("");

  const [
    managerPin,
    setManagerPin,
  ] = useState("");

  const [
    discountMessage,
    setDiscountMessage,
  ] = useState("");

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
    recoverableSplitOrders,
    setRecoverableSplitOrders,
  ] =
    useState<RecoverableSplitOrder[]>(
      []
    );

  const [
    activeRecoveredSplitOrder,
    setActiveRecoveredSplitOrder,
  ] =
    useState<RecoverableSplitOrder | null>(
      null
    );

  const [
    isLoadingRecoverableSplits,
    setIsLoadingRecoverableSplits,
  ] = useState(false);

  const [
    recoverableSplitError,
    setRecoverableSplitError,
  ] = useState("");

  const [
    heldSales,
    setHeldSales,
  ] = useState<PosHeldSale[]>([]);

  const [
    isLoadingHeldSales,
    setIsLoadingHeldSales,
  ] = useState(false);

  const [
    heldSalesError,
    setHeldSalesError,
  ] = useState("");

  const [
    holdLabel,
    setHoldLabel,
  ] = useState("");

  const [
    activeHeldSale,
    setActiveHeldSale,
  ] =
    useState<PosHeldSale | null>(
      null
    );

  const [
    isHoldingSale,
    setIsHoldingSale,
  ] = useState(false);

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

  const loadRecoverableSplitOrders =
    async () => {
      setIsLoadingRecoverableSplits(
        true
      );

      setRecoverableSplitError("");

      try {
        const response =
          await fetch(
            "/api/pos/split/recover",
            {
              method:
                "GET",

              cache:
                "no-store",
            }
          );

        const data =
          (await response.json()) as
            RecoverableSplitResponse;

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load recoverable split sales"
          );
        }

        setRecoverableSplitOrders(
          data.orders ??
            []
        );
      } catch (error) {
        setRecoverableSplitOrders(
          []
        );

        setRecoverableSplitError(
          error instanceof Error
            ? error.message
            : "Unable to load recoverable split sales"
        );
      } finally {
        setIsLoadingRecoverableSplits(
          false
        );
      }
    };

  const loadHeldSales =
    async () => {
      setIsLoadingHeldSales(
        true
      );

      setHeldSalesError("");

      try {
        const response =
          await fetch(
            "/api/pos/held-sales",
            {
              method:
                "GET",

              cache:
                "no-store",
            }
          );

        const data =
          (await response.json()) as
            HeldSalesResponse;

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load held sales"
          );
        }

        setHeldSales(
          data.heldSales ??
            []
        );
      } catch (error) {
        setHeldSales([]);

        setHeldSalesError(
          error instanceof Error
            ? error.message
            : "Unable to load held sales"
        );
      } finally {
        setIsLoadingHeldSales(
          false
        );
      }
    };

  useEffect(() => {
    void loadRecoverableSplitOrders();
    void loadHeldSales();
  }, []);

  const resetDiscountApproval =
    () => {
      setDiscountNeedsApproval(
        false
      );

      setManagerEmail("");
      setManagerPin("");
      setDiscountMessage("");
    };

  const resetDiscountState =
    () => {
      setDiscountEnabled(
        false
      );

      setDiscountType(
        "PERCENTAGE"
      );

      setDiscountValue("");
      setDiscountReason("");
      setDiscountNote("");

      resetDiscountApproval();
    };

  /*
   * The cart must remain locked while:
   *
   * 1. any MoMo payment is unresolved, OR
   * 2. a split payment has a confirmed Cash
   *    allocation but its MoMo allocation
   *    failed and requires recovery.
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

    /*
     * Any prior manager approval prompt was
     * calculated against the old basket.
     */
    resetDiscountApproval();

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

    resetDiscountApproval();

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

    resetDiscountApproval();

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
  const resetCurrentDraftSale =
    () => {
      setCart([]);
      setQuery("");
      setResults([]);
      setScanValue("");
      setScanMessage("");
      setScanSuccess(false);

      setCustomerName("");
      setCustomerPhone("");

      setPaymentMethod(
        "CASH"
      );

      setMomoProvider("");
      setSplitCashAmount("");

      setHoldLabel("");
      setActiveHeldSale(null);

      resetDiscountState();
    };

  const clearCart = () => {
    if (momoPaymentLocked) {
      return;
    }

    setCart([]);
    resetDiscountState();
  };

  const normaliseHeldCartSnapshot =
    (
      value: unknown
    ): CartItem[] | null => {
      if (
        !Array.isArray(value) ||
        value.length === 0
      ) {
        return null;
      }

      const items:
        CartItem[] = [];

      for (const rawItem of value) {
        if (
          !rawItem ||
          typeof rawItem !==
            "object" ||
          !("id" in rawItem) ||
          !("name" in rawItem) ||
          !("retailPrice" in rawItem) ||
          !("quantity" in rawItem)
        ) {
          return null;
        }

        const id =
          String(
            rawItem.id
          ).trim();

        const name =
          String(
            rawItem.name
          ).trim();

        const retailPrice =
          Number(
            rawItem.retailPrice
          );

        const quantity =
          Number(
            rawItem.quantity
          );

        if (
          !id ||
          !name ||
          !Number.isFinite(
            retailPrice
          ) ||
          retailPrice <= 0 ||
          !Number.isInteger(
            quantity
          ) ||
          quantity <= 0
        ) {
          return null;
        }

        items.push({
          id,
          name,
          retailPrice,
          quantity,
        });
      }

      return items;
    };

  const holdCurrentSale =
    async () => {
      if (
        isHoldingSale ||
        isProcessing
      ) {
        return;
      }

      if (
        pendingMomo ||
        failedSplitPayment ||
        activeRecoveredSplitOrder
      ) {
        alert(
          "This sale already has payment activity. Complete or recover the existing payment instead of holding it."
        );

        return;
      }

      /*
       * A resumed held sale already has a persistent
       * database record.
       *
       * Creating another held-sale record here would
       * duplicate the same customer transaction.
       *
       * The cashier must either complete the resumed
       * sale or abandon its existing held record.
       */
      if (activeHeldSale) {
        alert(
          "This sale is already a resumed held sale. Complete it or abandon it instead of holding it again."
        );

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

      setIsHoldingSale(
        true
      );

      setHeldSalesError("");

      try {
        const response =
          await fetch(
            "/api/pos/held-sales",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  label:
                    holdLabel,

                  customerName,
                  customerPhone,
                  paymentMethod,
                  momoProvider,
                  splitCashAmount,

                  cart,

                  discount: {
                    enabled:
                      discountEnabled,

                    type:
                      discountType,

                    value:
                      discountValue,

                    reason:
                      discountReason,

                    note:
                      discountNote,
                  },

                  hasPendingMomo:
                    pendingMomo !==
                    null,

                  hasFailedSplitPayment:
                    failedSplitPayment !==
                    null,
                }),
            }
          );

        const data =
          (await response.json()) as
            HeldSalesResponse;

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to hold sale"
          );
        }

        resetCurrentDraftSale();

        await loadHeldSales();

        alert(
          data.heldSale
            ? `Sale held as ${data.heldSale.holdNumber}`
            : "Sale held successfully"
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to hold sale";

        setHeldSalesError(
          message
        );

        alert(message);
      } finally {
        setIsHoldingSale(
          false
        );
      }
    };

  const resumeHeldSale =
    async (
      heldSale: PosHeldSale
    ) => {
      if (
        isProcessing ||
        isHoldingSale ||
        pendingMomo ||
        failedSplitPayment ||
        activeRecoveredSplitOrder
      ) {
        return;
      }

      if (
        cart.length > 0 &&
        !window.confirm(
          "There is already another sale in the cart. Resume this held sale and replace the current cart?"
        )
      ) {
        return;
      }

      try {
        const response =
          await fetch(
            `/api/pos/held-sales/${encodeURIComponent(
              heldSale.id
            )}`,
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  action:
                    "RESUME",
                }),
            }
          );

        const data =
          (await response.json()) as
            HeldSalesResponse;

        if (
          !response.ok ||
          !data.heldSale
        ) {
          throw new Error(
            data.error ||
              "Unable to resume held sale"
          );
        }

        const resumedSale =
          data.heldSale;

        const restoredCart =
          normaliseHeldCartSnapshot(
            resumedSale.cartSnapshot
          );

        if (!restoredCart) {
          throw new Error(
            "This held sale contains an invalid cart snapshot and cannot be restored safely."
          );
        }

        resetCurrentDraftSale();

        setCart(
          restoredCart
        );

        setCustomerName(
          resumedSale.customerName ??
            ""
        );

        setCustomerPhone(
          resumedSale.customerPhone ??
            ""
        );

        if (
          [
            "CASH",
            "BANK_TRANSFER",
            "MOMO",
            "SPLIT",
          ].includes(
            resumedSale.paymentMethod
          )
        ) {
          setPaymentMethod(
            resumedSale.paymentMethod
          );
        }

        if (
          resumedSale.momoProvider ===
            "mtn" ||
          resumedSale.momoProvider ===
            "atl" ||
          resumedSale.momoProvider ===
            "vod"
        ) {
          setMomoProvider(
            resumedSale.momoProvider
          );
        }

        setSplitCashAmount(
          resumedSale.splitCashAmount ??
            ""
        );

        setHoldLabel(
          resumedSale.label ??
            ""
        );

        setActiveHeldSale(
          resumedSale
        );

        if (
          resumedSale.discountSnapshot &&
          typeof resumedSale.discountSnapshot ===
            "object" &&
          !Array.isArray(
            resumedSale.discountSnapshot
          )
        ) {
          const snapshot =
            resumedSale.discountSnapshot as
              Partial<HeldDiscountSnapshot>;

          setDiscountEnabled(
            snapshot.enabled ===
              true
          );

          if (
            snapshot.type ===
              "AMOUNT" ||
            snapshot.type ===
              "PERCENTAGE"
          ) {
            setDiscountType(
              snapshot.type
            );
          }

          setDiscountValue(
            typeof snapshot.value ===
              "string"
              ? snapshot.value
              : ""
          );

          if (
            [
              "",
              "CUSTOMER_NEGOTIATION",
              "BULK_PURCHASE",
              "SCHOOL_LIST",
              "PROMOTION",
              "LOYAL_CUSTOMER",
              "DAMAGED_PACKAGING",
              "MANAGER_ADJUSTMENT",
              "OTHER",
            ].includes(
              typeof snapshot.reason ===
                "string"
                ? snapshot.reason
                : ""
            )
          ) {
            setDiscountReason(
              (
                snapshot.reason ??
                ""
              ) as DiscountReasonOption
            );
          }

          setDiscountNote(
            typeof snapshot.note ===
              "string"
              ? snapshot.note
              : ""
          );

          resetDiscountApproval();
        }

        await loadHeldSales();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to resume held sale";

        setHeldSalesError(
          message
        );

        alert(message);

        await loadHeldSales();
      }
    };

  const abandonHeldSale =
    async (
      heldSale: PosHeldSale
    ) => {
      if (
        isProcessing ||
        isHoldingSale
      ) {
        return;
      }

      if (
        !window.confirm(
          `Abandon ${heldSale.holdNumber}? This removes it from active held sales. No stock movement has occurred.`
        )
      ) {
        return;
      }

      try {
        const response =
          await fetch(
            `/api/pos/held-sales/${encodeURIComponent(
              heldSale.id
            )}`,
            {
              method:
                "DELETE",
            }
          );

        const data =
          (await response.json()) as
            HeldSalesResponse;

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to abandon held sale"
          );
        }

        /*
         * If the cashier is abandoning the same
         * held sale currently restored into the
         * working cart, clear the local draft only
         * AFTER the database cancellation succeeds.
         *
         * This prevents the UI from losing the sale
         * if the DELETE request itself fails.
         */
        if (
          activeHeldSale?.id ===
          heldSale.id
        ) {
          resetCurrentDraftSale();
        }

        await loadHeldSales();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to abandon held sale";

        setHeldSalesError(
          message
        );

        alert(message);
      }
    };

  const abandonCurrentSale =
    async () => {
      if (
        pendingMomo ||
        failedSplitPayment ||
        activeRecoveredSplitOrder
      ) {
        alert(
          "This sale already has payment activity and cannot be abandoned here. Complete or recover the payment instead."
        );

        return;
      }

      /*
       * A resumed held sale is persisted in the
       * database. Abandoning it must cancel that
       * record rather than merely clearing the
       * browser state.
       *
       * abandonHeldSale() also clears the current
       * draft after the DELETE succeeds.
       */
      if (activeHeldSale) {
        await abandonHeldSale(
          activeHeldSale
        );

        return;
      }

      if (
        cart.length === 0
      ) {
        return;
      }

      if (
        !window.confirm(
          "Abandon this current sale? The cart and customer/payment selections will be cleared. Stock has not been reduced."
        )
      ) {
        return;
      }

      resetCurrentDraftSale();
    };

  // ==========================================
  // EXACT CASHIER-SIDE RETAIL TOTAL
  // ==========================================
  const retailSubtotalPesewas =
    cart.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Math.round(
          item.retailPrice *
          100
        ) *
          item.quantity,
      0
    );

  const total =
    retailSubtotalPesewas /
    100;

  // ==========================================
  // DISCOUNT PREVIEW
  // ==========================================
  const discountNumericValue =
    Number(
      discountValue
    );

  let previewDiscountPesewas =
    0;

  if (
    discountEnabled &&
    retailSubtotalPesewas >
      0
  ) {
    if (
      discountType ===
      "AMOUNT"
    ) {
      previewDiscountPesewas =
        parseGhsToPesewasForPreview(
          discountValue
        ) ?? 0;
    } else if (
      Number.isFinite(
        discountNumericValue
      ) &&
      discountNumericValue >
        0
    ) {
      previewDiscountPesewas =
        Math.round(
          retailSubtotalPesewas *
            (
              discountNumericValue /
              100
            )
        );
    }
  }

  const previewFinalPesewas =
    Math.max(
      0,
      retailSubtotalPesewas -
        previewDiscountPesewas
    );

  const previewDiscountInvalid =
    discountEnabled &&
    previewDiscountPesewas >
      0 &&
    previewDiscountPesewas >=
      retailSubtotalPesewas;

  // ==========================================
  // BUILD CONTROLLED DISCOUNT REQUEST
  // ==========================================
  //
  // Cash, Bank Transfer and pure MoMo now use
  // the SAME cashier-side validation and the
  // SAME backend discount contract.
  //
  // The browser preview is never authoritative.
  // Product floors, staff authority and the
  // final amount are recalculated server-side.
  const buildDiscountRequest =
    ():
      | {
          ok: true;
          discount:
            | PosDiscountPayload
            | null;
        }
      | {
          ok: false;
        } => {
      if (
        !discountEnabled
      ) {
        return {
          ok: true,
          discount: null,
        };
      }

      if (
        !discountValue.trim()
      ) {
        alert(
          "Enter the discount value"
        );

        return {
          ok: false,
        };
      }

      if (
        !Number.isFinite(
          discountNumericValue
        ) ||
        discountNumericValue <=
          0
      ) {
        alert(
          "Discount value must be greater than zero"
        );

        return {
          ok: false,
        };
      }

      if (
        discountType ===
          "PERCENTAGE" &&
        discountNumericValue >=
          100
      ) {
        alert(
          "Percentage discount must be less than 100%"
        );

        return {
          ok: false,
        };
      }

      if (
        discountType ===
        "AMOUNT"
      ) {
        const exactAmount =
          parseGhsToPesewasForPreview(
            discountValue
          );

        if (
          exactAmount ===
          null
        ) {
          alert(
            "Enter a valid discount amount with no more than two decimal places"
          );

          return {
            ok: false,
          };
        }

        if (
          exactAmount >=
          retailSubtotalPesewas
        ) {
          alert(
            "Discount cannot reduce the sale total to zero or below"
          );

          return {
            ok: false,
          };
        }
      }

      if (
        !discountReason
      ) {
        alert(
          "Select a discount reason"
        );

        return {
          ok: false,
        };
      }

      if (
        discountReason ===
          "OTHER" &&
        !discountNote.trim()
      ) {
        alert(
          "Enter a note for the Other discount reason"
        );

        return {
          ok: false,
        };
      }

      if (
        discountNeedsApproval &&
        (
          !managerEmail.trim() ||
          !managerPin.trim()
        )
      ) {
        alert(
          "Manager email and PIN are required"
        );

        return {
          ok: false,
        };
      }

      /*
       * Protect every discount type from a
       * cashier-side preview that rounds the
       * sale to zero.
       *
       * The server remains authoritative and
       * independently enforces this rule.
       */
      if (
        previewDiscountPesewas >=
        retailSubtotalPesewas
      ) {
        alert(
          "Discount cannot reduce the sale total to zero or below"
        );

        return {
          ok: false,
        };
      }

      const reason =
        discountReason as
          Exclude<
            DiscountReasonOption,
            ""
          >;

      return {
        ok: true,

        discount: {
          type:
            discountType,

          value:
            discountType ===
            "AMOUNT"
              ? discountValue
              : discountNumericValue,

          reason,

          note:
            discountNote.trim()
              ? discountNote.trim()
              : null,

          ...(discountNeedsApproval
            ? {
                approval: {
                  email:
                    managerEmail.trim(),

                  pin:
                    managerPin,
                },
              }
            : {}),
        },
      };
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

      const discountResult =
        buildDiscountRequest();

      if (
        !discountResult.ok
      ) {
        return;
      }

      const discountRequest =
        discountResult.discount;

      setIsProcessing(true);
      setDiscountMessage("");

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

                  heldSaleId:
                    activeHeldSale?.id ??
                    null,

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

                  discount:
                    discountRequest,
                }),
            }
          );

        const data =
          await res.json();

        if (!res.ok) {
          /*
           * Manager approval fields appear only
           * after the authoritative backend has
           * assessed the basket and explicitly
           * determined that approval is needed.
           */
          if (
            discountEnabled &&
            data.error ===
              "Manager approval is required for this discount."
          ) {
            setDiscountNeedsApproval(
              true
            );

            setManagerPin("");

            setDiscountMessage(
              data.error
            );

            return;
          }

          /*
           * If approval fields are already open,
           * keep the cashier on this basket so a
           * wrong PIN / insufficient authority
           * can be corrected without rebuilding
           * the sale.
           */
          if (
            discountEnabled &&
            discountNeedsApproval
          ) {
            setManagerPin("");

            setDiscountMessage(
              data.error ||
                "Discount approval failed"
            );

            return;
          }

          alert(
            data.error ||
              "Checkout failed"
          );

          return;
        }

        /*
         * Never retain a manager PIN after the
         * transaction has completed.
         */
        setManagerPin("");
        setManagerEmail("");
        setDiscountMessage("");

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

          setPendingMomo(
            null
          );

          setMomoSecondsRemaining(
            0
          );

          return "FAILED";
        }

        /*
         * PURE MOMO terminal failure.
         *
         * A real Order/payment attempt already
         * exists and is now definitively failed.
         *
         * Keep the audit history in the database,
         * but retire the failed transaction from
         * the working POS so the cashier cannot
         * Hold, Abandon or accidentally resubmit
         * the same cart as though it were fresh.
         */
        const failureMessage =
          data.message ||
          "The Mobile Money payment was not completed.";

        setPendingMomo(
          null
        );

        setMomoSecondsRemaining(
          0
        );

        resetCurrentDraftSale();

        setMomoMessageType(
          "error"
        );

        setMomoMessage(
          `${failureMessage} The failed payment has been recorded. Start a new sale if the customer wants to try again.`
        );

        await loadHeldSales();

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
       * so checks are deliberately spaced.
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
        "Automatic checking has paused because the approval window has elapsed. Do not start another payment yet. Use Check Payment Status to verify this existing payment before trying again."
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

      const discountResult =
        buildDiscountRequest();

      if (
        !discountResult.ok
      ) {
        return;
      }

      const discountRequest =
        discountResult.discount;

      setIsProcessing(true);

      setDiscountMessage("");

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

                  heldSaleId:
                    activeHeldSale?.id ??
                    null,

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

                  discount:
                    discountRequest,
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

        if (!res.ok) {
          /*
           * Discount approval happens BEFORE
           * the PENDING MoMo order is created.
           *
           * Therefore an approval-required
           * response has no Paystack payment
           * reference yet and it is safe to
           * show the manager fields.
           */
          if (
            discountEnabled &&
            data.error ===
              "Manager approval is required for this discount."
          ) {
            setDiscountNeedsApproval(
              true
            );

            setManagerPin("");

            setDiscountMessage(
              data.error
            );

            setMomoMessage("");
            setMomoSecondsRemaining(
              0
            );

            return;
          }

          /*
           * Wrong manager credentials or
           * insufficient manager authority
           * happen before an order/payment is
           * created as well.
           */
          if (
            discountEnabled &&
            discountNeedsApproval &&
            !data.orderId &&
            (
              res.status === 401 ||
              res.status === 403
            )
          ) {
            setManagerPin("");

            setDiscountMessage(
              data.error ||
                "Discount approval failed"
            );

            setMomoMessage("");
            setMomoSecondsRemaining(
              0
            );

            return;
          }

          /*
           * If an order ID now exists, the
           * manager approval step has already
           * succeeded. Never retain the PIN
           * while a Paystack payment is pending
           * or after Paystack initiation fails.
           */
          if (
            discountEnabled &&
            data.orderId
          ) {
            resetDiscountApproval();
          }

          /*
           * Once an Order ID exists, the backend has
           * crossed from held-draft lifecycle into the
           * real payment lifecycle.
           *
           * The held sale has already been converted
           * atomically with that Order. Never keep the
           * old held-sale ID active in browser state,
           * otherwise a second click could resend an
           * already-converted heldSaleId.
           */
          if (data.orderId) {
            setActiveHeldSale(
              null
            );

            setHoldLabel("");

            await loadHeldSales();
          }

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

        if (
          discountEnabled
        ) {
          /*
           * The order now contains the immutable
           * approver snapshot. Credentials have
           * served their purpose and must not
           * remain in browser state during
           * payment polling.
           */
          resetDiscountApproval();
        }

        /*
         * A successful initiation response means
         * a real Order/payment now owns this sale.
         * The original held draft must no longer
         * remain active in the cashier UI.
         */
        if (data.orderId) {
          setActiveHeldSale(
            null
          );

          setHoldLabel("");

          await loadHeldSales();
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

      /*
       * A Split discount must be fixed before
       * Cash is accepted.
       *
       * This is especially important because
       * the backend records the Cash allocation
       * as CONFIRMED before asking Paystack for
       * the remaining MoMo balance.
       */
      const discountResult =
        buildDiscountRequest();

      if (
        !discountResult.ok
      ) {
        return;
      }

      const discountRequest =
        discountResult.discount;

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
       * Cashier-side validation now mirrors the
       * exact-pesewa backend architecture.
       *
       * The backend still remains authoritative.
       */
      /*
       * When a discount is requested, Cash must
       * be validated against the discounted
       * preview total rather than retail total.
       *
       * The backend recalculates everything
       * independently from database prices.
       */
      const orderAmountPesewas =
        discountEnabled
          ? previewFinalPesewas
          : retailSubtotalPesewas;

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

                  heldSaleId:
                    activeHeldSale?.id ??
                    null,

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

                  discount:
                    discountRequest,
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

        if (!res.ok) {
          /*
           * Discount approval is resolved before
           * the Split order is created.
           *
           * Therefore when the backend asks for
           * manager approval, no Cash has been
           * recorded and no Paystack request has
           * been started yet.
           */
          if (
            discountEnabled &&
            data.error ===
              "Manager approval is required for this discount."
          ) {
            setDiscountNeedsApproval(
              true
            );

            setManagerPin("");

            setDiscountMessage(
              data.error
            );

            setMomoMessage("");

            setMomoSecondsRemaining(
              0
            );

            return;
          }

          /*
           * Wrong manager credentials or
           * insufficient manager authority also
           * happen before the Split order exists.
           */
          if (
            discountEnabled &&
            discountNeedsApproval &&
            !data.orderId &&
            (
              res.status === 401 ||
              res.status === 403
            )
          ) {
            setManagerPin("");

            setDiscountMessage(
              data.error ||
                "Discount approval failed"
            );

            setMomoMessage("");

            setMomoSecondsRemaining(
              0
            );

            return;
          }

          /*
           * If an order now exists, approval has
           * already succeeded and the immutable
           * audit snapshot has been stored.
           *
           * Clear manager credentials before the
           * Paystack payment enters verification
           * or recovery.
           */
          if (
            discountEnabled &&
            data.orderId
          ) {
            resetDiscountApproval();
          }

          /*
           * Once an Order ID exists, the backend has
           * crossed from held-draft lifecycle into the
           * real payment lifecycle.
           *
           * The held sale has already been converted
           * atomically with that Order. Never keep the
           * old held-sale ID active in browser state,
           * otherwise a second click could resend an
           * already-converted heldSaleId.
           */
          if (data.orderId) {
            setActiveHeldSale(
              null
            );

            setHoldLabel("");

            await loadHeldSales();
          }

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

              /*
               * Cash is already recorded on the real
               * Split Order. The editable basket must
               * therefore disappear.
               *
               * Do NOT call resetCurrentDraftSale()
               * here because that would also destroy
               * failedSplitPayment, which is required
               * for the safe retry workflow.
               */
              setCart([]);
              setQuery("");
              setResults([]);
              setScanValue("");
              setScanMessage("");

              setActiveHeldSale(
                null
              );

              setHoldLabel("");

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

        if (
          discountEnabled
        ) {
          /*
           * Approval credentials have served
           * their purpose. The database now
           * contains only the immutable approval
           * audit snapshot.
           */
          resetDiscountApproval();
        }

        /*
         * The Split Order and its Cash/MoMo
         * allocations now exist. The held draft
         * must no longer remain active in the POS.
         */
        if (data.orderId) {
          setActiveHeldSale(
            null
          );

          setHoldLabel("");

          await loadHeldSales();
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
  // RESUME RECOVERABLE SPLIT SALE
  // ==========================================
  const resumeRecoverableSplitOrder =
    (
      order: RecoverableSplitOrder
    ) => {
      if (
        isProcessing ||
        pendingMomo
      ) {
        return;
      }

      if (
        cart.length > 0 &&
        !window.confirm(
          "There is already another sale in the cart. Resume this saved Split sale and clear the current cart?"
        )
      ) {
        return;
      }

      setCart([]);
      setQuery("");
      setResults([]);
      setScanValue("");
      setScanMessage("");

      setActiveRecoveredSplitOrder(
        order
      );

      resetDiscountState();

      setCustomerName(
        order.customerName ??
          ""
      );

      setCustomerPhone(
        order.momoPhone ||
          order.customerPhone ||
          ""
      );

      if (
        order.provider ===
          "mtn" ||
        order.provider ===
          "atl" ||
        order.provider ===
          "vod"
      ) {
        setMomoProvider(
          order.provider
        );
      } else {
        setMomoProvider("");
      }

      setPaymentMethod(
        "SPLIT"
      );

      setSplitCashAmount(
        (
          order.confirmedCashPesewas /
          100
        ).toFixed(2)
      );

      setPendingMomo(
        null
      );

      setFailedSplitPayment({
        orderId:
          order.orderId,

        cashAmountPesewas:
          order.confirmedCashPesewas,

        momoAmountPesewas:
          order.outstandingAmountPesewas,
      });

      setMomoSecondsRemaining(
        0
      );

      setMomoMessageType(
        "warning"
      );

      setMomoMessage(
        `Recovered ${order.orderId}. Cash already recorded: GHS ${(order.confirmedCashPesewas / 100).toFixed(2)}. Remaining Mobile Money: GHS ${(order.outstandingAmountPesewas / 100).toFixed(2)}. Do not take the Cash again.`
      );
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

  /*
   * Cashier-facing split-payment preview.
   * The backend remains authoritative.
   */
  const splitOrderAmountPesewas =
    discountEnabled
      ? previewFinalPesewas
      : retailSubtotalPesewas;

  const splitOrderAmount =
    splitOrderAmountPesewas /
    100;

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
      (
        splitOrderAmountPesewas -
        (
          parseGhsToPesewasForPreview(
            splitCashAmount
          ) ?? 0
        )
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

  const discountSupportedPaymentMethod =
    paymentMethod ===
      "CASH" ||
    paymentMethod ===
      "BANK_TRANSFER" ||
    paymentMethod ===
      "MOMO" ||
    paymentMethod ===
      "SPLIT";

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

          {/* ==========================================
              HELD SALES
              ========================================== */}
          <div className="mb-4 border rounded-xl bg-slate-50 p-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-sm">
                  Held Sales
                </h3>

                <p className="text-xs text-gray-600 mt-1">
                  Save an unfinished sale, serve another customer, then resume it later.
                </p>
              </div>

              <span className="text-xs font-semibold bg-white border px-2 py-1 rounded-full">
                {heldSales.length}
              </span>
            </div>

            {heldSalesError && (
              <div className="border border-red-200 bg-red-50 text-red-800 rounded-lg p-2 text-xs">
                {heldSalesError}
              </div>
            )}

            {isLoadingHeldSales ? (
              <p className="text-xs text-gray-500">
                Loading held sales...
              </p>
            ) : heldSales.length === 0 ? (
              <p className="text-xs text-gray-500">
                No active held sales.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {heldSales.map(
                  (heldSale) => {
                    const isActive =
                      activeHeldSale?.id ===
                      heldSale.id;

                    const statusLabel =
                      heldSale.status ===
                      "RESUMED"
                        ? "Resumed"
                        : "Held";

                    return (
                      <div
                        key={
                          heldSale.id
                        }
                        className={`border rounded-lg p-3 bg-white ${
                          isActive
                            ? "ring-2 ring-blue-200 border-blue-300"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">
                              {heldSale.label ||
                                heldSale.customerName ||
                                heldSale.holdNumber}
                            </div>

                            <div className="text-xs text-gray-500 mt-1">
                              {
                                heldSale.holdNumber
                              }
                            </div>
                          </div>

                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${
                              heldSale.status ===
                              "RESUMED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {
                              statusLabel
                            }
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-600">
                          <div>
                            Items:{" "}
                            <span className="font-medium text-gray-900">
                              {
                                heldSale.itemCount
                              }
                            </span>
                          </div>

                          <div className="text-right">
                            GHS{" "}
                            <span className="font-medium text-gray-900">
                              {(
                                heldSale.subtotalPesewas /
                                100
                              ).toFixed(
                                2
                              )}
                            </span>
                          </div>
                        </div>

                        {heldSale.customerName && (
                          <div className="text-xs text-gray-600 mt-2">
                            Customer:{" "}
                            <span className="font-medium text-gray-900">
                              {
                                heldSale.customerName
                              }
                            </span>
                          </div>
                        )}

                        <div className="text-[11px] text-gray-400 mt-2">
                          {new Date(
                            heldSale.createdAt
                          ).toLocaleString(
                            "en-GB"
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() =>
                              void resumeHeldSale(
                                heldSale
                              )
                            }
                            disabled={
                              isProcessing ||
                              isHoldingSale ||
                              momoPaymentLocked ||
                              Boolean(
                                activeRecoveredSplitOrder
                              ) ||
                              isActive
                            }
                            className="border border-blue-300 bg-blue-50 text-blue-800 px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isActive
                              ? "Active"
                              : "Resume"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void abandonHeldSale(
                                heldSale
                              )
                            }
                            disabled={
                              isProcessing ||
                              isHoldingSale ||
                              momoPaymentLocked
                            }
                            className="border border-red-300 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Abandon
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {activeHeldSale && !activeRecoveredSplitOrder && (
            <div className="mb-4 border border-blue-300 bg-blue-50 rounded-lg p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-blue-950">
                    Resumed Held Sale
                  </div>

                  <div className="text-xs text-blue-800 mt-1">
                    {
                      activeHeldSale.holdNumber
                    }
                    {activeHeldSale.label
                      ? ` - ${activeHeldSale.label}`
                      : ""}
                  </div>
                </div>

                <span className="text-xs font-semibold bg-blue-200 text-blue-950 px-2 py-1 rounded">
                  Active
                </span>
              </div>

              <p className="text-xs text-blue-900 mt-3">
                This sale was restored from Held Sales. Prices and stock will be checked again when checkout is completed.
              </p>

              <p className="text-xs text-blue-900 mt-2">
                Do not hold it again. Complete the sale or use Abandon Sale below.
              </p>
            </div>
          )}

          {activeRecoveredSplitOrder ? (
            <div className="space-y-3">
              <div className="border border-amber-300 bg-amber-50 rounded-lg p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-amber-950">
                      Recovered Sale
                    </div>

                    <div className="text-xs text-amber-800 mt-1">
                      {
                        activeRecoveredSplitOrder.orderId
                      }
                    </div>
                  </div>

                  <span className="text-xs font-semibold bg-amber-200 text-amber-950 px-2 py-1 rounded">
                    Read Only
                  </span>
                </div>

                <p className="text-xs text-amber-900 mt-3">
                  This sale already exists
                  in the database. Its
                  products cannot be edited
                  here and the Cash already
                  recorded must not be taken
                  again.
                </p>
              </div>

              <div className="space-y-2">
                {activeRecoveredSplitOrder.items.map(
                  (item) => (
                    <div
                      key={
                        item.productId
                      }
                      className="border rounded-lg p-3 text-sm bg-gray-50"
                    >
                      <div className="font-medium">
                        {
                          item.name
                        }
                      </div>

                      <div className="flex items-center justify-between gap-3 mt-1 text-gray-600">
                        <span>
                          Qty:{" "}
                          {
                            item.quantity
                          }
                        </span>

                        {item.sku && (
                          <span className="text-xs">
                            {
                              item.sku
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span>
                    Original sale total
                  </span>

                  <span className="font-semibold">
                    GHS{" "}
                    {(
                      activeRecoveredSplitOrder.requiredAmountPesewas /
                      100
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between gap-3 text-green-800">
                  <span>
                    Cash already recorded
                  </span>

                  <span className="font-semibold">
                    GHS{" "}
                    {(
                      activeRecoveredSplitOrder.confirmedCashPesewas /
                      100
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between gap-3 text-amber-900">
                  <span>
                    Mobile Money remaining
                  </span>

                  <span className="font-bold">
                    GHS{" "}
                    {(
                      activeRecoveredSplitOrder.outstandingAmountPesewas /
                      100
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ) : cart.length ===
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

            {/* CONTROLLED DISCOUNT */}
            {discountSupportedPaymentMethod && (
              <div className="border rounded-lg p-3 bg-amber-50 space-y-3">
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <div className="font-semibold">
                      Discount / Haggling
                    </div>

                    <div className="text-xs text-gray-600 mt-1">
                      Retail price remains
                      the official price.
                      Discounts are controlled
                      and audited.
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={
                      discountEnabled
                    }
                    onChange={(
                      e
                    ) => {
                      if (
                        e.target
                          .checked
                      ) {
                        setDiscountEnabled(
                          true
                        );

                        resetDiscountApproval();
                      } else {
                        resetDiscountState();
                      }
                    }}
                    disabled={
                      momoPaymentLocked ||
                      isProcessing ||
                      cart.length ===
                        0
                    }
                    className="h-5 w-5"
                  />
                </label>

                {discountEnabled && (
                  <div className="space-y-3 border-t border-amber-200 pt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Discount Type
                        </label>

                        <select
                          value={
                            discountType
                          }
                          onChange={(
                            e
                          ) => {
                            setDiscountType(
                              e.target
                                .value as
                                DiscountTypeOption
                            );

                            setDiscountValue(
                              ""
                            );

                            resetDiscountApproval();
                          }}
                          disabled={
                            isProcessing
                          }
                          className="w-full border p-2 rounded-lg bg-white"
                        >
                          <option value="PERCENTAGE">
                            Percentage
                          </option>

                          <option value="AMOUNT">
                            Amount
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">
                          {discountType ===
                          "PERCENTAGE"
                            ? "Percent (%)"
                            : "Amount (GHS)"}
                        </label>

                        <input
                          type="text"
                          inputMode="decimal"
                          value={
                            discountValue
                          }
                          onChange={(
                            e
                          ) => {
                            setDiscountValue(
                              e.target
                                .value
                            );

                            resetDiscountApproval();
                          }}
                          placeholder={
                            discountType ===
                            "PERCENTAGE"
                              ? "e.g. 5"
                              : "e.g. 10.00"
                          }
                          disabled={
                            isProcessing
                          }
                          className="w-full border p-2 rounded-lg bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Reason
                      </label>

                      <select
                        value={
                          discountReason
                        }
                        onChange={(
                          e
                        ) => {
                          setDiscountReason(
                            e.target
                              .value as
                              DiscountReasonOption
                          );

                          resetDiscountApproval();
                        }}
                        disabled={
                          isProcessing
                        }
                        className="w-full border p-2 rounded-lg bg-white"
                      >
                        <option value="">
                          Select reason
                        </option>

                        <option value="CUSTOMER_NEGOTIATION">
                          Customer Negotiation
                        </option>

                        <option value="BULK_PURCHASE">
                          Bulk Purchase
                        </option>

                        <option value="SCHOOL_LIST">
                          School List
                        </option>

                        <option value="PROMOTION">
                          Promotion
                        </option>

                        <option value="LOYAL_CUSTOMER">
                          Loyal Customer
                        </option>

                        <option value="DAMAGED_PACKAGING">
                          Damaged Packaging
                        </option>

                        <option value="MANAGER_ADJUSTMENT">
                          Manager Adjustment
                        </option>

                        <option value="OTHER">
                          Other
                        </option>
                      </select>
                    </div>

                    {discountReason ===
                      "OTHER" && (
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Reason Note
                        </label>

                        <textarea
                          value={
                            discountNote
                          }
                          onChange={(
                            e
                          ) => {
                            setDiscountNote(
                              e.target
                                .value
                            );

                            resetDiscountApproval();
                          }}
                          disabled={
                            isProcessing
                          }
                          rows={2}
                          placeholder="Explain the discount..."
                          className="w-full border p-2 rounded-lg bg-white"
                        />
                      </div>
                    )}

                    <div className="rounded-lg border border-amber-200 bg-white p-3 space-y-2 text-sm">
                      <div className="flex justify-between gap-3">
                        <span>
                          Official Retail
                        </span>

                        <span className="font-semibold">
                          GHS{" "}
                          {(
                            retailSubtotalPesewas /
                            100
                          ).toFixed(
                            2
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3 text-green-700">
                        <span>
                          Savings Preview
                        </span>

                        <span className="font-semibold">
                          - GHS{" "}
                          {(
                            previewDiscountPesewas /
                            100
                          ).toFixed(
                            2
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3 border-t pt-2">
                        <span>
                          Preview Total
                        </span>

                        <span className="font-bold">
                          GHS{" "}
                          {(
                            previewFinalPesewas /
                            100
                          ).toFixed(
                            2
                          )}
                        </span>
                      </div>
                    </div>

                    {previewDiscountInvalid && (
                      <div className="text-xs font-medium text-red-700">
                        The discount cannot
                        reduce the sale total
                        to zero or below.
                      </div>
                    )}

                    <p className="text-xs text-gray-600">
                      This is a cashier
                      preview. The server
                      validates the actual
                      product selling floors
                      and staff authority
                      before completing the
                      sale.
                    </p>

                    {discountNeedsApproval && (
                      <div className="border border-orange-300 bg-orange-50 rounded-lg p-3 space-y-3">
                        <div>
                          <div className="font-semibold text-orange-900">
                            Manager Approval
                            Required
                          </div>

                          <p className="text-xs text-orange-800 mt-1">
                            The backend has
                            determined that
                            this discount is
                            above the cashier's
                            automatic authority.
                          </p>
                        </div>

                        <input
                          type="email"
                          value={
                            managerEmail
                          }
                          onChange={(
                            e
                          ) =>
                            setManagerEmail(
                              e.target
                                .value
                            )
                          }
                          placeholder="Manager Email"
                          autoComplete="off"
                          disabled={
                            isProcessing
                          }
                          className="w-full border p-2 rounded-lg bg-white"
                        />

                        <input
                          type="password"
                          value={
                            managerPin
                          }
                          onChange={(
                            e
                          ) =>
                            setManagerPin(
                              e.target
                                .value
                            )
                          }
                          placeholder="Manager PIN"
                          autoComplete="new-password"
                          disabled={
                            isProcessing
                          }
                          className="w-full border p-2 rounded-lg bg-white"
                        />

                        <p className="text-xs text-orange-800">
                          The manager PIN is
                          used only for this
                          approval and is not
                          stored with the sale.
                        </p>
                      </div>
                    )}

                    {discountMessage && (
                      <div className="border border-red-200 bg-red-50 text-red-800 rounded-lg p-2 text-sm">
                        {
                          discountMessage
                        }
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

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
                const nextMethod =
                  e.target
                    .value;

                setPaymentMethod(
                  nextMethod
                );

                setMomoMessage(
                  ""
                );

                /*
                 * All current POS payment
                 * methods now share the same
                 * controlled discount contract.
                 *
                 * Preserve the entered discount
                 * when the cashier changes
                 * payment method. The backend
                 * always recalculates it.
                 */
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

            {(isLoadingRecoverableSplits ||
              recoverableSplitError ||
              recoverableSplitOrders.length >
                0) && (
              <div className="border border-blue-300 bg-blue-50 text-blue-950 rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">
                    Recoverable Split
                    Sales
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void loadRecoverableSplitOrders()
                    }
                    disabled={
                      isLoadingRecoverableSplits
                    }
                    className="text-sm border border-blue-300 bg-white px-3 py-1 rounded-md disabled:opacity-50"
                  >
                    {isLoadingRecoverableSplits
                      ? "Refreshing..."
                      : "Refresh"}
                  </button>
                </div>

                <p className="text-sm">
                  These sales already
                  exist in the database.
                  Resume them instead of
                  creating a new sale or
                  taking the Cash again.
                </p>

                {recoverableSplitError && (
                  <div className="border border-red-300 bg-red-50 text-red-800 rounded-md p-2 text-sm">
                    {
                      recoverableSplitError
                    }
                  </div>
                )}

                {recoverableSplitOrders.map(
                  (order) => (
                    <div
                      key={
                        order.orderId
                      }
                      className="border border-blue-200 bg-white rounded-lg p-3 space-y-3"
                    >
                      <div className="font-semibold">
                        {
                          order.orderId
                        }
                      </div>

                      <div className="text-sm space-y-1">
                        <div>
                          Customer:{" "}
                          {order.customerName ||
                            "Walk-in customer"}
                        </div>

                        <div>
                          Phone:{" "}
                          {order.momoPhone ||
                            order.customerPhone ||
                            "-"}
                        </div>

                        <div>
                          Cash already
                          recorded:{" "}
                          <strong>
                            GHS{" "}
                            {(
                              order.confirmedCashPesewas /
                              100
                            ).toFixed(
                              2
                            )}
                          </strong>
                        </div>

                        <div>
                          MoMo still
                          required:{" "}
                          <strong>
                            GHS{" "}
                            {(
                              order.outstandingAmountPesewas /
                              100
                            ).toFixed(
                              2
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="text-sm">
                        <div className="font-medium mb-1">
                          Items
                        </div>

                        <ul className="list-disc pl-5 space-y-1">
                          {order.items.map(
                            (item) => (
                              <li
                                key={
                                  item.productId
                                }
                              >
                                {
                                  item.name
                                }{" "}
                                x{" "}
                                {
                                  item.quantity
                                }
                              </li>
                            )
                          )}
                        </ul>
                      </div>

                      {order.hasPendingMomo && (
                        <div className="text-sm border border-amber-300 bg-amber-50 text-amber-900 rounded-md p-2">
                          A Mobile Money
                          payment is already
                          pending for this
                          sale. Do not create
                          another payment.
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          resumeRecoverableSplitOrder(
                            order
                          )
                        }
                        disabled={
                          isProcessing ||
                          pendingMomo !==
                            null ||
                          !order.safeToRetry
                        }
                        className="w-full bg-blue-700 text-white px-3 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {order.safeToRetry
                          ? "Resume Sale"
                          : order.hasPendingMomo
                            ? "Payment Pending"
                            : "Not Ready to Resume"}
                      </button>
                    </div>
                  )
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
                    ? "Split Payment - Waiting for Approval"
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

            {!activeRecoveredSplitOrder && (
              <div className="border rounded-xl p-3 bg-amber-50 border-amber-200 space-y-3">
                <div>
                  <div className="font-semibold text-sm text-amber-950">
                    Hold / Suspend Sale
                  </div>

                  <p className="text-xs text-amber-800 mt-1">
                    Holding a sale does not take payment and does not reduce stock.
                  </p>
                </div>

                <input
                  type="text"
                  value={
                    holdLabel
                  }
                  onChange={(e) =>
                    setHoldLabel(
                      e.target.value
                    )
                  }
                  placeholder="Customer / reference for held sale (optional)"
                  disabled={
                    isProcessing ||
                    isHoldingSale ||
                    momoPaymentLocked ||
                    Boolean(
                      activeHeldSale
                    )
                  }
                  className="w-full border p-2 rounded-lg bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />

                <button
                  type="button"
                  onClick={() =>
                    void holdCurrentSale()
                  }
                  disabled={
                    cart.length ===
                      0 ||
                    isProcessing ||
                    isHoldingSale ||
                    momoPaymentLocked ||
                    Boolean(
                      activeHeldSale
                    )
                  }
                  className="w-full border border-amber-400 bg-amber-100 text-amber-950 p-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isHoldingSale
                    ? "Holding Sale..."
                    : activeHeldSale
                      ? "Sale Already Resumed"
                      : "Hold Sale"}
                </button>
              </div>
            )}

            {!activeRecoveredSplitOrder && (
              <button
                type="button"
                onClick={() =>
                  void abandonCurrentSale()
                }
                disabled={
                  cart.length ===
                    0 ||
                  isProcessing ||
                  isHoldingSale ||
                  momoPaymentLocked
                }
                className="w-full border border-red-300 bg-red-50 text-red-700 p-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {activeHeldSale
                  ? "Abandon Resumed Sale"
                  : "Abandon Sale"}
              </button>
            )}

            <button
              type="button"
              onClick={
                handleCheckout
              }
              disabled={
                isProcessing ||
                momoPaymentLocked ||
                Boolean(
                  activeRecoveredSplitOrder
                )
              }
              className="w-full bg-black text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                    : discountEnabled
                      ? "Complete Discounted Sale"
                      : "Complete Sale"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}