export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  categorySlug: string;
  levelSlug: string;
};

export const products: Product[] = [
  {
    id: "p1",
    name: "Wise Ant Chemistry – SHS 1–3 Combined Edition",
    price: 200,
    image: "/products/wise-ant-chemistry-shs-1-3-combined-edition.webp",
    categorySlug: "shs-combined-edition-textbooks",
    levelSlug: "shs-1",
  },
  {
    id: "p2",
    name: "Wise Ant Biology – SHS 1–3 Combined Edition",
    price: 200,
    image: "/products/wise-ant-biology-shs-1-3-combined-edition.webp",
    categorySlug: "shs-combined-edition-textbooks",
    levelSlug: "shs-1",
  },
  {
    id: "p3",
    name: "Wise Ant Additional Mathematics – SHS Year 1",
    price: 200,
    image: "/products/wise-ant-additional-mathematics-shs-year-1.webp",
    categorySlug: "textbooks",
    levelSlug: "shs-1",
  },
];
