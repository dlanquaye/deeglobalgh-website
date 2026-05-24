import { ProductImportRow } from "../types/product-import.types";

import { validateProductImport } from "../validators/validate-product-import";

import { generateImportReport } from "../reports/generate-import-report";

const existingProducts: ProductImportRow[] = [
  {
    sku: "TXT-AKO-0001",
    name: "Mathematics Textbook",
    slug: "mathematics-textbook",

    categorySlug: "textbooks",
    subcategorySlug: "primary-textbooks",

    retailPrice: 45,
    stockQuantity: 10,

    imageSrc: "/images/math-book.jpg",
  },
];

const importProducts: ProductImportRow[] = [
  {
    sku: "TXT-AKO-0001",
    name: "Mathematics Textbook",
    slug: "mathematics-textbook",

    categorySlug: "textbooks",
    subcategorySlug: "primary-textbooks",

    retailPrice: 45,
    stockQuantity: 10,

    imageSrc: "/images/math-book.jpg",
  },

  {
    sku: "",
    name: "",
    slug: "science-textbook",

    categorySlug: "textbooks",
    subcategorySlug: "primary-textbooks",

    retailPrice: -20,
    stockQuantity: -5,

    imageSrc: "",
  },

  {
    sku: "TXT-WIS-0002",
    name: "English Textbook",
    slug: "english-textbook",

    categorySlug: "textbooks",
    subcategorySlug: "primary-textbooks",

    retailPrice: 55,
    stockQuantity: 15,

    imageSrc: "/images/english-book.jpg",
  },
];

const validationResults = importProducts.map((product) =>
  validateProductImport(product, existingProducts)
);

const report = generateImportReport(validationResults);

console.log("\nVALIDATION RESULTS:\n");

validationResults.forEach((result, index) => {
  console.log(`Product ${index + 1}:`);

  if (result.isValid) {
    console.log("✅ VALID");
  } else {
    console.log("❌ INVALID");

    result.errors.forEach((error) => {
      console.log(
        `- ${error.field}: ${error.message}`
      );
    });
  }

  console.log("-------------------");
});

console.log("\nIMPORT REPORT:\n");
console.log(report);