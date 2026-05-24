import {
  ProductImportRow,
  ProductValidationResult,
  ValidationError,
} from "../types/product-import.types";

import {
  APPROVED_CATEGORIES,
  APPROVED_SUBCATEGORIES,
  APPROVED_LEVELS,
} from "../utils/approved-taxonomies";

export function validateTaxonomies(
  product: ProductImportRow
): ProductValidationResult {
  const errors: ValidationError[] = [];

  if (
    !APPROVED_CATEGORIES.includes(
      product.categorySlug
    )
  ) {
    errors.push({
      field: "categorySlug",
      message: `invalid category: ${product.categorySlug}`,
    });
  }

  if (
    !APPROVED_SUBCATEGORIES.includes(
      product.subcategorySlug
    )
  ) {
    errors.push({
      field: "subcategorySlug",
      message: `invalid subcategory: ${product.subcategorySlug}`,
    });
  }

  if (product.levelSlugs?.length) {
    product.levelSlugs.forEach((level) => {
      if (!APPROVED_LEVELS.includes(level)) {
        errors.push({
          field: "levelSlugs",
          message: `invalid level: ${level}`,
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
