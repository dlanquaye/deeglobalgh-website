

export type CartItem = {
  id: string;
  name: string;
  price: number;
  slug: string;
  qty: number;
};

const CART_KEY = "deeglobal_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(CART_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(item: CartItem) {
  const cart = getCart();

  const existing = cart.find((c) => c.id === item.id);

  if (existing) {
    existing.qty += item.qty;
  } else {
    cart.push(item);
  }

  saveCart(cart);
}

export function removeFromCart(id: string) {
  const cart = getCart().filter((item) => item.id !== id);
  saveCart(cart);
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}