import { describe, expect, it } from "vitest";

import {
  canonicalizeBrand,
  normalizeProductCatalogue,
} from "@/lib/product-sync/normalizer";

describe("product catalogue normalisation", () => {
  describe("canonicalizeBrand", () => {
    it("normalises known series aliases", () => {
      expect(canonicalizeBrand("Excellence Series")).toBe("Excellence");
      expect(canonicalizeBrand("Don Series")).toBe("Don");
      expect(canonicalizeBrand("Akrong Series")).toBe("Akrong");
    });

    it("keeps canonical identities canonical", () => {
      expect(canonicalizeBrand("Best Brain")).toBe("Best Brain");
      expect(canonicalizeBrand("Golden")).toBe("Golden");
      expect(canonicalizeBrand("Wise Ant")).toBe("Wise Ant");
      expect(canonicalizeBrand("Excellence")).toBe("Excellence");
      expect(canonicalizeBrand("Don")).toBe("Don");
      expect(canonicalizeBrand("Essential")).toBe("Essential");
      expect(canonicalizeBrand("Aki Ola")).toBe("Aki Ola");
      expect(canonicalizeBrand("Akrong")).toBe("Akrong");
      expect(canonicalizeBrand("A Plus (A+)")).toBe("A Plus (A+)");
      expect(canonicalizeBrand("Right Hour")).toBe("Right Hour");
      expect(canonicalizeBrand("Deli")).toBe("Deli");
      expect(canonicalizeBrand("Generic")).toBe("Generic");
    });

    it("normalises harmless casing and whitespace differences", () => {
      expect(canonicalizeBrand("  EXCELLENCE   SERIES  ")).toBe("Excellence");
      expect(canonicalizeBrand(" don   series ")).toBe("Don");
      expect(canonicalizeBrand(" best   brain ")).toBe("Best Brain");
    });

    it("preserves unknown identities instead of guessing", () => {
      expect(canonicalizeBrand("Future Books")).toBe("Future Books");
      expect(canonicalizeBrand("  New Publisher Brand  ")).toBe(
        "New Publisher Brand"
      );
    });

    it("preserves Generic as an intentional catalogue identity", () => {
      expect(canonicalizeBrand("Generic")).toBe("Generic");
      expect(canonicalizeBrand(" generic ")).toBe("Generic");
    });

    it("does not invent values for blank or non-string input", () => {
      expect(canonicalizeBrand("   ")).toBe("");
      expect(canonicalizeBrand(null)).toBeNull();
      expect(canonicalizeBrand(undefined)).toBeUndefined();
    });
  });

  describe("normalizeProductCatalogue", () => {
    it("returns a new product object with canonical brand", () => {
      const original = {
        name: "Don Mathematics Textbook",
        brand: "Don Series",
        retailPrice: 50,
      };

      const normalized = normalizeProductCatalogue(original);

      expect(normalized).not.toBe(original);
      expect(normalized.brand).toBe("Don");
      expect(normalized.name).toBe("Don Mathematics Textbook");
      expect(normalized.retailPrice).toBe(50);

      expect(original.brand).toBe("Don Series");
    });

    it("leaves a product without brand unchanged", () => {
      const original = {
        name: "Unbranded Product",
        retailPrice: 10,
      };

      expect(normalizeProductCatalogue(original)).toEqual(original);
    });
  });
});
