import {
  ProductImportRow,
  ProductValidationResult,
  ValidationError,
} from "../types/product-import.types";

import { validateRequiredFields } from "./required-fields.validator";
import { validateNumericFields } from "./numeric-fields.validator";
import { validateDuplicateFields } from "./duplicate-fields.validator";
import { validateTaxonomies } from "./taxonomy.validator";

export function validateProductImport(
  product: ProductImportRow,
  existingProducts: ProductImportRow[]
): ProductValidationResult {
  const allErrors: ValidationError[] = [];

  const requiredFieldsValidation =
    validateRequiredFields(product);

  const numericValidation =
    validateNumericFields(product);

  const duplicateValidation =
    validateDuplicateFields(
      product,
      existingProducts
      
    );

    const taxonomyValidation =
  validateTaxonomies(product);

  allErrors.push(
  ...requiredFieldsValidation.errors,
  ...numericValidation.errors,
  ...duplicateValidation.errors,
  ...taxonomyValidation.errors
  );

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}