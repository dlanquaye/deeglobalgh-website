import { buildEducationalFingerprint } from "../lib/knowledge/engine/buildEducationalFingerprint";
import {
  findBestMatches,
  ProductMatchCandidate,
} from "../lib/knowledge/engine/findBestMatches";

const catalogue: ProductMatchCandidate[] = [
  {
    id: "1",
    sku: "SKU-001",
    productName: "Golden English Language Textbook Book 4",
    retailPrice: 45,
    stockQty: 20,
  },
  {
    id: "2",
    sku: "SKU-002",
    productName: "Best Brain English Language Textbook Book 4",
    retailPrice: 43,
    stockQty: 15,
  },
  {
    id: "3",
    sku: "SKU-003",
    productName: "Golden English Language Workbook Book 4",
    retailPrice: 35,
    stockQty: 30,
  },
  {
    id: "4",
    sku: "SKU-004",
    productName: "Golden Mathematics Textbook Book 4",
    retailPrice: 46,
    stockQty: 18,
  },
  {
    id: "5",
    sku: "SKU-005",
    productName: "Golden English Language Textbook Book 5",
    retailPrice: 48,
    stockQty: 12,
  },
];

const requestedBook =
  "Golden English Language Textbook Book 4";

console.log("\n=== FIND BEST MATCHES TEST ===\n");

const matches = findBestMatches(
  requestedBook,
  catalogue
);

for (const match of matches) {
  console.log("--------------------------------");
  console.log("Product:", match.product.productName);
  console.log("SKU:", match.product.sku);
  console.log("Price:", match.product.retailPrice);
  console.log("Stock:", match.product.stockQty);
  console.log("Similarity:", `${match.similarity}%`);
  console.log("Matching:", match.matchingDimensions);
  console.log("Different:", match.differentDimensions);
  console.log("Missing:", match.missingDimensions);
}

console.log("--------------------------------");