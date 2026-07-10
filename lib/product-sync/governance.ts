/**
 * Enterprise Product Synchronization Governance
 *
 * This file is the single source of truth for which Product
 * fields may or may not be synchronized from the master catalogue.
 */

/**
 * Fields that should NEVER be overwritten.
 */
export const IMMUTABLE_FIELDS = [
  "id",
  "createdAt",
  "updatedAt",
] as const;

/**
 * Inventory is owned exclusively by the Inventory module.
 */
export const INVENTORY_FIELDS = [
  "stock",
  "stockQty",
  "lowStockThreshold",
] as const;

/**
 * Commercial information may safely be updated.
 */
export const COMMERCIAL_FIELDS = [
  "costPrice",
  "retailPrice",
  "wholesalePrice",
  "distributorPrice",
] as const;

/**
 * Product information.
 */
export const PRODUCT_INFO_FIELDS = [
  "name",
  "brand",
  "publisher",
  "author",
  "shortSummary",
  "fullDescription",
] as const;

/**
 * Classification.
 */
export const CLASSIFICATION_FIELDS = [
  "categorySlug",
  "subCategorySlug",
  "levelSlugs",
  "tags",
] as const;

/**
 * Media assets.
 */
export const MEDIA_FIELDS = [
  "imageSrc",
  "imageAlt",
  "imageTitle",
  "imageCaption",
  "imageDescription",
] as const;

/**
 * SEO fields.
 */
export const SEO_FIELDS = [
  "metaTitle",
  "metaDescription",
  "focusKeyphrase",
  "socialTitle",
  "socialDescription",
] as const;

/**
 * Existing product slugs should never be overwritten automatically.
 */
export const PROTECTED_FIELDS = [
  "slug",
] as const;

/**
 * Fields that are permitted to be synchronized.
 */
export const EDITABLE_FIELDS = [
  ...COMMERCIAL_FIELDS,
  ...PRODUCT_INFO_FIELDS,
  ...CLASSIFICATION_FIELDS,
  ...MEDIA_FIELDS,
  ...SEO_FIELDS,
] as const;