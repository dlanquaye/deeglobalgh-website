import {
  ImportReport,
  ProductValidationResult,
} from "../types/product-import.types";

export function generateImportReport(
  validationResults: ProductValidationResult[]
): ImportReport {
  let successfulImports = 0;
  let failedImports = 0;

  let duplicateSKUs = 0;
  let duplicateSlugs = 0;

  let missingFields = 0;

  let invalidCategories = 0;
  let invalidSubcategories = 0;

  let validationFailures = 0;

  validationResults.forEach((result) => {
    if (result.isValid) {
      successfulImports++;
    } else {
      failedImports++;
      validationFailures++;

      result.errors.forEach((error) => {
        if (error.message.includes("Duplicate SKU")) {
          duplicateSKUs++;
        }

        if (error.message.includes("Duplicate slug")) {
          duplicateSlugs++;
        }

        if (error.message.includes("required")) {
          missingFields++;
        }

        if (error.message.includes("invalid category")) {
          invalidCategories++;
        }

        if (error.message.includes("invalid subcategory")) {
          invalidSubcategories++;
        }
      });
    }
  });

  return {
    totalRows: validationResults.length,

    successfulImports,
    failedImports,

    duplicateSKUs,
    duplicateSlugs,

    missingFields,

    invalidCategories,
    invalidSubcategories,

    validationFailures,
  };
}