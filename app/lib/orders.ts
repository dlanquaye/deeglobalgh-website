export type OrderItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
};

export type CustomerDetails = {
  fullName: string;
  phone: string;
  area: string;
  location: string;
  notes?: string;
};

export type OrderPaymentMethod = "PAYSTACK" | "PAY_ON_DELIVERY";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PACKED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PAID" | "UNKNOWN";

export type OrderRecord = {
  id: string; // DG-YYYYMMDD-XXXX
  createdAt: string;
  updatedAt?: string;

  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;

  paymentMethod: OrderPaymentMethod;
  
  // Inventory
stockDeducted?: boolean;


  // ✅ Operations tracking
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;

  // Paystack
  paystackReference?: string;
  paystackStatus?: "success" | "failed" | "abandoned" | "unknown";
};

const ORDERS_KEY = "dg_orders_v1";

function safeParse<T>(raw: string | null): T | null {
  try {
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/**
 * ✅ Backward compatibility (auto-fix older stored orders)
 */
function normalizeOrder(o: any): OrderRecord {
  const paymentMethod =
    o?.paymentMethod === "PAYSTACK" ? "PAYSTACK" : "PAY_ON_DELIVERY";

  let paymentStatus = o?.paymentStatus as any;
  let orderStatus = o?.orderStatus as any;

  // ✅ AUTO-FIX legacy Paystack success orders
  if (
    paymentMethod === "PAYSTACK" &&
    o?.paystackStatus === "success"
  ) {
    paymentStatus = "PAID";
    orderStatus = orderStatus || "PAID";
  }

  if (!paymentStatus) {
    paymentStatus =
      paymentMethod === "PAYSTACK" ? "UNKNOWN" : "UNPAID";
  }

  if (!orderStatus) {
    orderStatus = "PENDING";
  }

  return {
    ...o,
    paymentMethod,
    paymentStatus,
    orderStatus,
  } as OrderRecord;
}


/**
 * ✅ STEP 1: safer order ID generator (almost impossible to collide)
 */
export function generateOrderId(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  const time = String(date.getTime()).slice(-5); // last 5 digits of timestamp
  const rand = Math.floor(100 + Math.random() * 900); // 3 digits

  return `DG-${yyyy}${mm}${dd}-${time}${rand}`;
}

/**
 * ✅ STEP 2: loadOrders auto-normalizes older orders
 */
export function loadOrders(): OrderRecord[] {
  if (typeof window === "undefined") return [];
  const raw = safeParse<OrderRecord[]>(localStorage.getItem(ORDERS_KEY));
  const list = Array.isArray(raw) ? raw : [];
  return list.map(normalizeOrder);
}

export function saveOrders(orders: OrderRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function addOrder(order: OrderRecord) {
  const existing = loadOrders();
  saveOrders([order, ...existing]); // newest first
}

export function updateOrderById(orderId: string, patch: Partial<OrderRecord>) {
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return;

  const updated: OrderRecord = {
    ...orders[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  const next = [...orders];
  next[idx] = updated;
  saveOrders(next);
}

/**
 * ✅ STEP 3: delete one order
 */
export function deleteOrderById(orderId: string) {
  const orders = loadOrders();
  const next = orders.filter((o) => o.id !== orderId);
  saveOrders(next);
}

export function clearOrders() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ORDERS_KEY);
  
}
