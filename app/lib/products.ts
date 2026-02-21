// Legacy type definitions (no runtime product data)
// Runtime products are now powered by Prisma database.

export type LegacyProductImage = {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
  description?: string;
};

export type LegacyProductSEO = {
  focusKeyphrase?: string;
  metaTitle?: string;
  metaDescription?: string;
  socialTitle?: string;
  socialDescription?: string;
  shortSummary?: string;
  fullDescription?: string;
  tags?: string[];
  brand?: string;
};

export type LegacyProduct = {
  id: string;
  name: string;
  slug: string;
  retailPrice: number;
  image: LegacyProductImage;
  categorySlug: string;
  levelSlugs: string[];
  stockQty?: number;
  lowStockThreshold?: number;
  seo?: LegacyProductSEO;
};
