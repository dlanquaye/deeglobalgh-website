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

export type OrderRecord = {
  id: string; // DG-YYYYMMDD-XXXX
  createdAt: string;

  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;

  paymentMethod: OrderPaymentMethod;

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

export function generateOrderId(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  const rand = Math.floor(1000 + Math.random() * 9000); // 4 digits
  return `DG-${yyyy}${mm}${dd}-${rand}`;
}

export function loadOrders(): OrderRecord[] {
  if (typeof window === "undefined") return [];
  const raw = safeParse<OrderRecord[]>(localStorage.getItem(ORDERS_KEY));
  return Array.isArray(raw) ? raw : [];
}

export function saveOrders(orders: OrderRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function addOrder(order: OrderRecord) {
  const existing = loadOrders();
  saveOrders([order, ...existing]); // newest first
}

export function clearOrders() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ORDERS_KEY);
}
