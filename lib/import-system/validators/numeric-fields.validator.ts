import {
  ProductImportRow,
  ProductValidationResult,
  ValidationError,
} from "../types/product-import.types";

export function validateNumericFields(
  product: ProductImportRow
): ProductValidationResult {
  const errors: ValidationError[] = [];

  if (product.retailPrice < 0) {
    errors.push({
      field: "retailPrice",
      message: "Retail price cannot be negative",
    });
  }

  if (
    product.wholesalePrice !== undefined &&
    product.wholesalePrice < 0
  ) {
    errors.push({
      field: "wholesalePrice",
      message: "Wholesale price cannot be negative",
    });
  }

  if (
    product.distributorPrice !== undefined &&
    product.distributorPrice < 0
  ) {
    errors.push({
      field: "distributorPrice",
      message: "Distributor price cannot be negative",
    });
  }

  if (product.stockQuantity < 0) {
    errors.push({
      field: "stockQuantity",
      message: "Stock quantity cannot be negative",
    });
  }

  if (!Number.isFinite(product.retailPrice)) {
    errors.push({
      field: "retailPrice",
      message: "Retail price must be a valid number",
    });
  }

  if (
    product.wholesalePrice !== undefined &&
    !Number.isFinite(product.wholesalePrice)
  ) {
    errors.push({
      field: "wholesalePrice",
      message: "Wholesale price must be a valid number",
    });
  }

  if (
    product.distributorPrice !== undefined &&
    !Number.isFinite(product.distributorPrice)
  ) {
    errors.push({
      field: "distributorPrice",
      message: "Distributor price must be a valid number",
    });
  }

  if (!Number.isInteger(product.stockQuantity)) {
    errors.push({
      field: "stockQuantity",
      message: "Stock quantity must be a whole number",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}