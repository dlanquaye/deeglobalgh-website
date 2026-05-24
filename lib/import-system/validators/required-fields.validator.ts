import {
  ProductImportRow,
  ProductValidationResult,
  ValidationError,
} from "../types/product-import.types";

export function validateRequiredFields(
  product: ProductImportRow
): ProductValidationResult {
  const errors: ValidationError[] = [];

  if (!product.sku?.trim()) {
    errors.push({
      field: "sku",
      message: "SKU is required",
    });
  }

  if (!product.name?.trim()) {
    errors.push({
      field: "name",
      message: "Product name is required",
    });
  }

  if (!product.slug?.trim()) {
    errors.push({
      field: "slug",
      message: "Slug is required",
    });
  }

  if (!product.categorySlug?.trim()) {
    errors.push({
      field: "categorySlug",
      message: "Category slug is required",
    });
  }

  if (!product.subcategorySlug?.trim()) {
    errors.push({
      field: "subcategorySlug",
      message: "Subcategory slug is required",
    });
  }

  if (product.retailPrice === undefined || product.retailPrice === null) {
    errors.push({
      field: "retailPrice",
      message: "Retail price is required",
    });
  }

  if (product.stockQuantity === undefined || product.stockQuantity === null) {
    errors.push({
      field: "stockQuantity",
      message: "Stock quantity is required",
    });
  }

  if (!product.imageSrc?.trim()) {
    errors.push({
      field: "imageSrc",
      message: "Image source is required",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}