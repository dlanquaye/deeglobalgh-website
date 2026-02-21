export type CartProduct = {
  id: string;
  name: string;
  slug: string;
  retailPrice: number;
  quantity: number;   // ✅ ADD THIS
  imageSrc?: string | null;
  stockQty?: number;
};
