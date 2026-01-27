export type InventoryItem = {
  productId: string;
  stockQty: number;
  lowStockThreshold: number;
};

const INVENTORY_KEY = "dg_inventory_v1";

/**
 * Initialize inventory from products.ts (client-only)
 */
export async function initInventory() {
  if (typeof window === "undefined") return;

  const existing = localStorage.getItem(INVENTORY_KEY);
  if (existing) return;

  // ✅ Lazy import to avoid TS / runtime issues
  const mod = await import("./products");
  const products = mod.products;

  const initialInventory: InventoryItem[] = products.map((p: any) => ({
    productId: p.id,
    stockQty: p.stockQty,
    lowStockThreshold: p.lowStockThreshold ?? 3,
  }));

  localStorage.setItem(
    INVENTORY_KEY,
    JSON.stringify(initialInventory)
  );
}

/**
 * Load inventory
 */
export function loadInventory(): InventoryItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(INVENTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

/**
 * Save inventory
 */
function saveInventory(items: InventoryItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));
}

/**
 * Reduce stock safely
 */
export function reduceStock(
  productId: string,
  qty: number
) {
  const inventory = loadInventory();
  const idx = inventory.findIndex(
    (i) => i.productId === productId
  );
  if (idx === -1) return;

  inventory[idx].stockQty = Math.max(
    0,
    inventory[idx].stockQty - qty
  );

  saveInventory(inventory);
}

/**
 * Get stock for a product
 */
export function getStock(productId: string): InventoryItem | null {
  const inventory = loadInventory();
  return inventory.find((i) => i.productId === productId) || null;
}
