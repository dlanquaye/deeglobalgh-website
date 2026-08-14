import {
  DiscountReason,
  DiscountType,
} from "@prisma/client";
import {
  describe,
  expect,
  it,
} from "vitest";

import {
  allocatePosDiscount,
  assessPosDiscount,
  PosDiscountError,
} from "@/lib/pos/discounts";

function createActor(
  maxDiscountPercent:
    | number
    | null = 10
) {
  return {
    id: "staff-1",
    name: "Test Cashier",
    role: "CASHIER",
    maxDiscountPercent,
  };
}

function createProduct({
  productId = "product-1",
  productName = "Test Product",
  quantity = 1,
  retailPrice = 100,
  minimumSellingPrice = 80,
  costPrice = 60,
}: {
  productId?: string;
  productName?: string;
  quantity?: number;
  retailPrice?: number;
  minimumSellingPrice?:
    | number
    | null;
  costPrice?: number | null;
} = {}) {
  return {
    productId,
    productName,
    quantity,
    retailPrice,
    minimumSellingPrice,
    costPrice,
  };
}

describe(
  "POS discount assessment",
  () => {
    it(
      "calculates a percentage discount in pesewas",
      () => {
        const result =
          assessPosDiscount({
            products: [
              createProduct(),
            ],
            actor: createActor(10),
            request: {
              type:
                DiscountType.PERCENTAGE,
              value: 10,
              reason:
                DiscountReason.CUSTOMER_NEGOTIATION,
            },
          });

        expect(
          result.originalSubtotalPesewas
        ).toBe(10000);

        expect(
          result.requestedDiscountPesewas
        ).toBe(1000);

        expect(
          result.finalSubtotalPesewas
        ).toBe(9000);

        expect(
          result.effectiveDiscountPercent
        ).toBe(10);

        expect(
          result.approvalRequired
        ).toBe(false);
      }
    );

    it(
      "calculates a fixed GHS discount exactly in pesewas",
      () => {
        const result =
          assessPosDiscount({
            products: [
              createProduct(),
            ],
            actor: createActor(10),
            request: {
              type:
                DiscountType.AMOUNT,
              value: 5.5,
              reason:
                DiscountReason.LOYAL_CUSTOMER,
            },
          });

        expect(
          result.requestedDiscountPesewas
        ).toBe(550);

        expect(
          result.finalSubtotalPesewas
        ).toBe(9450);

        expect(
          result.approvalRequired
        ).toBe(false);
      }
    );

    it(
      "protects an explicit minimum selling price",
      () => {
        expect(() =>
          assessPosDiscount({
            products: [
              createProduct({
                retailPrice: 100,
                minimumSellingPrice: 80,
                costPrice: 60,
              }),
            ],
            actor: createActor(100),
            request: {
              type:
                DiscountType.AMOUNT,
              value: 25,
              reason:
                DiscountReason.MANAGER_ADJUSTMENT,
            },
          })
        ).toThrow(
          PosDiscountError
        );

        expect(() =>
          assessPosDiscount({
            products: [
              createProduct({
                retailPrice: 100,
                minimumSellingPrice: 80,
                costPrice: 60,
              }),
            ],
            actor: createActor(100),
            request: {
              type:
                DiscountType.AMOUNT,
              value: 25,
              reason:
                DiscountReason.MANAGER_ADJUSTMENT,
            },
          })
        ).toThrow(
          "protected selling floor"
        );
      }
    );

    it(
      "uses cost price as the temporary floor when minimum selling price is not configured",
      () => {
        const result =
          assessPosDiscount({
            products: [
              createProduct({
                retailPrice: 100,
                minimumSellingPrice:
                  null,
                costPrice: 70,
              }),
            ],
            actor: createActor(30),
            request: {
              type:
                DiscountType.AMOUNT,
              value: 20,
              reason:
                DiscountReason.BULK_PURCHASE,
            },
          });

        expect(
          result.lines[0]
            .floorSource
        ).toBe("COST_PRICE");

        expect(
          result.lines[0]
            .floorUnitPesewas
        ).toBe(7000);

        expect(
          result
            .maximumDiscountByConfiguredFloorsPesewas
        ).toBe(3000);

        expect(
          result.approvalRequired
        ).toBe(false);
      }
    );

    it(
      "requires approval when no selling floor or cost price is configured",
      () => {
        const result =
          assessPosDiscount({
            products: [
              createProduct({
                retailPrice: 100,
                minimumSellingPrice:
                  null,
                costPrice: null,
              }),
            ],
            actor: createActor(50),
            request: {
              type:
                DiscountType.AMOUNT,
              value: 5,
              reason:
                DiscountReason.CUSTOMER_NEGOTIATION,
            },
          });

        expect(
          result.hasUnconfiguredFloor
        ).toBe(true);

        expect(
          result.approvalRequired
        ).toBe(true);

        expect(
          result.unconfiguredProductIds
        ).toEqual([
          "product-1",
        ]);
      }
    );

    it(
      "requires approval when the discount exceeds staff authority",
      () => {
        const result =
          assessPosDiscount({
            products: [
              createProduct({
                minimumSellingPrice: 50,
              }),
            ],
            actor: createActor(5),
            request: {
              type:
                DiscountType.PERCENTAGE,
              value: 10,
              reason:
                DiscountReason.SCHOOL_LIST,
            },
          });

        expect(
          result.effectiveDiscountPercent
        ).toBe(10);

        expect(
          result.staffMaximumDiscountPercent
        ).toBe(5);

        expect(
          result.approvalRequired
        ).toBe(true);
      }
    );

    it(
      "treats null staff authority as requiring approval",
      () => {
        const result =
          assessPosDiscount({
            products: [
              createProduct(),
            ],
            actor: createActor(null),
            request: {
              type:
                DiscountType.AMOUNT,
              value: 1,
              reason:
                DiscountReason.CUSTOMER_NEGOTIATION,
            },
          });

        expect(
          result.staffMaximumDiscountPercent
        ).toBeNull();

        expect(
          result.approvalRequired
        ).toBe(true);
      }
    );

    it(
      "requires a note when reason is OTHER",
      () => {
        expect(() =>
          assessPosDiscount({
            products: [
              createProduct(),
            ],
            actor: createActor(10),
            request: {
              type:
                DiscountType.AMOUNT,
              value: 5,
              reason:
                DiscountReason.OTHER,
            },
          })
        ).toThrow(
          "A note is required when the discount reason is Other."
        );
      }
    );

    it(
      "rejects a discount that would make the basket free",
      () => {
        expect(() =>
          assessPosDiscount({
            products: [
              createProduct({
                minimumSellingPrice: 0,
                costPrice: 0,
              }),
            ],
            actor: createActor(100),
            request: {
              type:
                DiscountType.PERCENTAGE,
              value: 100,
              reason:
                DiscountReason.MANAGER_ADJUSTMENT,
            },
          })
        ).toThrow(
          "cannot reduce the basket total to zero or below"
        );
      }
    );
  }
);

describe(
  "POS discount allocation",
  () => {
    it(
      "allocates discount only to products that have discount capacity",
      () => {
        const assessment =
          assessPosDiscount({
            products: [
              createProduct({
                productId:
                  "protected-product",
                productName:
                  "Protected Product",
                retailPrice: 20,
                minimumSellingPrice: 20,
                costPrice: 15,
              }),
              createProduct({
                productId:
                  "discountable-product",
                productName:
                  "Discountable Product",
                retailPrice: 80,
                minimumSellingPrice: 50,
                costPrice: 40,
              }),
            ],
            actor:
              createActor(100),
            request: {
              type:
                DiscountType.AMOUNT,
              value: 20,
              reason:
                DiscountReason.MANAGER_ADJUSTMENT,
            },
          });

        const allocation =
          allocatePosDiscount(
            assessment
          );

        expect(
          allocation
            .discountAmountPesewas
        ).toBe(2000);

        expect(
          allocation
            .finalSubtotalPesewas
        ).toBe(8000);

        const protectedLine =
          allocation.lines.find(
            (line) =>
              line.productId ===
              "protected-product"
          );

        const discountableLine =
          allocation.lines.find(
            (line) =>
              line.productId ===
              "discountable-product"
          );

        expect(
          protectedLine
            ?.discountTotalPesewas
        ).toBe(0);

        expect(
          protectedLine
            ?.finalTotalPesewas
        ).toBe(2000);

        expect(
          discountableLine
            ?.discountTotalPesewas
        ).toBe(2000);

        expect(
          discountableLine
            ?.finalTotalPesewas
        ).toBe(6000);
      }
    );

    it(
      "redistributes discount when one product reaches its selling floor",
      () => {
        const assessment =
          assessPosDiscount({
            products: [
              createProduct({
                productId:
                  "limited-product",
                productName:
                  "Limited Product",
                retailPrice: 100,
                minimumSellingPrice: 95,
                costPrice: 80,
              }),
              createProduct({
                productId:
                  "flexible-product",
                productName:
                  "Flexible Product",
                retailPrice: 100,
                minimumSellingPrice: 50,
                costPrice: 40,
              }),
            ],
            actor:
              createActor(100),
            request: {
              type:
                DiscountType.AMOUNT,
              value: 20,
              reason:
                DiscountReason.MANAGER_ADJUSTMENT,
            },
          });

        const allocation =
          allocatePosDiscount(
            assessment
          );

        const limitedLine =
          allocation.lines.find(
            (line) =>
              line.productId ===
              "limited-product"
          );

        const flexibleLine =
          allocation.lines.find(
            (line) =>
              line.productId ===
              "flexible-product"
          );

        expect(
          limitedLine
            ?.discountTotalPesewas
        ).toBe(500);

        expect(
          limitedLine
            ?.finalTotalPesewas
        ).toBe(9500);

        expect(
          flexibleLine
            ?.discountTotalPesewas
        ).toBe(1500);

        expect(
          flexibleLine
            ?.finalTotalPesewas
        ).toBe(8500);

        expect(
          allocation
            .discountAmountPesewas
        ).toBe(2000);

        expect(
          allocation
            .finalSubtotalPesewas
        ).toBe(18000);
      }
    );

    it(
      "preserves an exact pesewa-level basket discount",
      () => {
        const assessment =
          assessPosDiscount({
            products: [
              createProduct({
                productId:
                  "product-a",
                productName:
                  "Product A",
                retailPrice: 50,
                minimumSellingPrice: 30,
                costPrice: 20,
              }),
              createProduct({
                productId:
                  "product-b",
                productName:
                  "Product B",
                retailPrice: 50,
                minimumSellingPrice: 30,
                costPrice: 20,
              }),
            ],
            actor:
              createActor(100),
            request: {
              type:
                DiscountType.AMOUNT,
              value: 5.55,
              reason:
                DiscountReason.CUSTOMER_NEGOTIATION,
            },
          });

        const allocation =
          allocatePosDiscount(
            assessment
          );

        expect(
          allocation
            .originalSubtotalPesewas
        ).toBe(10000);

        expect(
          allocation
            .discountAmountPesewas
        ).toBe(555);

        expect(
          allocation
            .finalSubtotalPesewas
        ).toBe(9445);

        expect(
          allocation.lines.reduce(
            (sum, line) =>
              sum +
              line.discountTotalPesewas,
            0
          )
        ).toBe(555);

        expect(
          allocation.lines.reduce(
            (sum, line) =>
              sum +
              line.finalTotalPesewas,
            0
          )
        ).toBe(9445);
      }
    );

    it(
      "handles quantities while preserving the exact line and basket totals",
      () => {
        const assessment =
          assessPosDiscount({
            products: [
              createProduct({
                productId:
                  "multi-product",
                productName:
                  "Multi Product",
                quantity: 3,
                retailPrice: 10,
                minimumSellingPrice: 8,
                costPrice: 7,
              }),
              createProduct({
                productId:
                  "single-product",
                productName:
                  "Single Product",
                quantity: 1,
                retailPrice: 20,
                minimumSellingPrice: 10,
                costPrice: 8,
              }),
            ],
            actor:
              createActor(100),
            request: {
              type:
                DiscountType.AMOUNT,
              value: 5.55,
              reason:
                DiscountReason.BULK_PURCHASE,
            },
          });

        const allocation =
          allocatePosDiscount(
            assessment
          );

        expect(
          allocation
            .originalSubtotalPesewas
        ).toBe(5000);

        expect(
          allocation
            .discountAmountPesewas
        ).toBe(555);

        expect(
          allocation
            .finalSubtotalPesewas
        ).toBe(4445);

        for (
          const line of
          allocation.lines
        ) {
          expect(
            line.finalTotalPesewas
          ).toBeGreaterThanOrEqual(
            line.floorUnitPesewas *
              line.quantity
          );
        }
      }
    );

    it(
      "refuses to finalise allocation when a product has no protected floor",
      () => {
        const assessment =
          assessPosDiscount({
            products: [
              createProduct({
                minimumSellingPrice:
                  null,
                costPrice: null,
              }),
            ],
            actor:
              createActor(100),
            request: {
              type:
                DiscountType.AMOUNT,
              value: 5,
              reason:
                DiscountReason.MANAGER_ADJUSTMENT,
            },
          });

        expect(() =>
          allocatePosDiscount(
            assessment
          )
        ).toThrow(
          "cannot be finalised while one or more products have no minimum selling price or cost price"
        );
      }
    );
  }
);