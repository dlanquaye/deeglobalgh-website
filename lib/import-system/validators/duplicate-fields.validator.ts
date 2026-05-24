import {
  ProductImportRow,
  ProductValidationResult,
  ValidationError,
} from "../types/product-import.types";

export function validateDuplicateFields(
  product: ProductImportRow,
  existingProducts: ProductImportRow[]
): ProductValidationResult {
  const errors: ValidationError[] = [];

  const duplicateSKU = existingProducts.find(
    (existing) =>
      existing.sku.trim().toLowerCase() ===
      product.sku.trim().toLowerCase()
  );

  if (duplicateSKU) {
    errors.push({
      field: "sku",
      message: `Duplicate SKU detected: ${product.sku}`,
    });
  }

  const duplicateSlug = existingProducts.find(
    (existing) =>
      existing.slug.trim().toLowerCase() ===
      product.slug.trim().toLowerCase()
  );

  if (duplicateSlug) {
    errors.push({
      field: "slug",
      message: `Duplicate slug detected: ${product.slug}`,
    });
  }

  const duplicateName = existingProducts.find(
    (existing) =>
      existing.name.trim().toLowerCase() ===
      product.name.trim().toLowerCase()
  );

  if (duplicateName) {
    errors.push({
      field: "name",
      message: `Duplicate product name detected: ${product.name}`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}