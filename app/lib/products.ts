import productsData from "../data/products.json";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  categorySlug: string;
  levelSlugs: string[];
};

export const products: Product[] = productsData as Product[];
