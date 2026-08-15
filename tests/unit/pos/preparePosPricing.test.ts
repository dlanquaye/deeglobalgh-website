import {
  AdminRole,
  DiscountReason,
  DiscountType,
} from "@prisma/client";

import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  PosPricingPreparationError,
  preparePosPricing,
} from "@/lib/pos/preparePosPricing";

const cashier = {
  id: "staff-cashier-1",
  name: "Test Cashier",
  role: "CASHIER",
  maxDiscountPercent: 10,
};

const products = [
  {
    productId: "product-a",
    productName: "Product A",
    quantity: 1,
    retailPrice: 100,
    minimumSellingPrice: 80,
    costPrice: 70,
  },
  {
    productId: "product-b",
    productName: "Product B",
    quantity: 2,
    retailPrice: 50,
    minimumSellingPrice: 40,
    costPrice: 30,
  },
];

describe(
  "preparePosPricing",
  () => {
    it(
      "returns exact retail pricing when no discount is requested",
      async () => {
        const findAdminByEmail =
          vi.fn();

        const comparePin =
          vi.fn();

        const result =
          await preparePosPricing({
            products,
            actor: cashier,
            discount: null,
            approvalDependencies: {
              findAdminByEmail,
              comparePin,
            },
          });

        expect(
          result.originalSubtotalPesewas
        ).toBe(20000);

        expect(
          result.discountAmountPesewas
        ).toBe(0);

        expect(
          result.finalSubtotalPesewas
        ).toBe(20000);

        expect(
          result.discount
        ).toBeNull();

        expect(
          result.lines
        ).toEqual([
          {
            productId:
              "product-a",
            productName:
              "Product A",
            quantity: 1,

            originalUnitPricePesewas:
              10000,
            originalTotalPesewas:
              10000,

            discountPerUnitPesewas:
              0,
            discountTotalPesewas:
              0,

            finalUnitPricePesewas:
              10000,
            finalTotalPesewas:
              10000,
          },
          {
            productId:
              "product-b",
            productName:
              "Product B",
            quantity: 2,

            originalUnitPricePesewas:
              5000,
            originalTotalPesewas:
              10000,

            discountPerUnitPesewas:
              0,
            discountTotalPesewas:
              0,

            finalUnitPricePesewas:
              5000,
            finalTotalPesewas:
              10000,
          },
        ]);

        expect(
          findAdminByEmail
        ).not.toHaveBeenCalled();

        expect(
          comparePin
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "applies an authorised percentage discount without manager approval",
      async () => {
        const result =
          await preparePosPricing({
            products,
            actor: cashier,
            discount: {
              type:
                DiscountType.PERCENTAGE,

              value: 10,

              reason:
                DiscountReason.CUSTOMER_NEGOTIATION,
            },
          });

        expect(
          result.originalSubtotalPesewas
        ).toBe(20000);

        expect(
          result.discountAmountPesewas
        ).toBe(2000);

        expect(
          result.finalSubtotalPesewas
        ).toBe(18000);

        expect(
          result.discount
        ).toMatchObject({
          type:
            DiscountType.PERCENTAGE,

          value: 10,

          reason:
            DiscountReason.CUSTOMER_NEGOTIATION,

          originalSubtotalPesewas:
            20000,

          discountAmountPesewas:
            2000,

          finalSubtotalPesewas:
            18000,

          requestedById:
            "staff-cashier-1",

          requestedByName:
            "Test Cashier",

          requestedByRole:
            "CASHIER",

          approvalRequired:
            false,

          approval:
            null,
        });

        expect(
          result.lines.reduce(
            (
              sum,
              line
            ) =>
              sum +
              line.finalTotalPesewas,
            0
          )
        ).toBe(18000);
      }
    );

    it(
      "requires manager approval when the requested discount exceeds staff authority",
      async () => {
        await expect(
          preparePosPricing({
            products,
            actor: {
              ...cashier,
              maxDiscountPercent:
                5,
            },

            discount: {
              type:
                DiscountType.PERCENTAGE,

              value: 10,

              reason:
                DiscountReason.CUSTOMER_NEGOTIATION,
            },
          })
        ).rejects.toMatchObject({
          name:
            "PosPricingPreparationError",

          statusCode:
            403,

          message:
            "Manager approval is required for this discount.",
        });
      }
    );

    it(
      "verifies approval and returns an audit snapshot when approval is required",
      async () => {
        const approvedAt =
          new Date(
            "2026-08-15T00:00:00.000Z"
          );

        const findAdminByEmail =
          vi.fn(
            async (
              email: string
            ) => {
              expect(email).toBe(
                "manager@example.com"
              );

              return {
                id:
                  "admin-super-1",

                name:
                  "Approving Manager",

                email:
                  "manager@example.com",

                pinHash:
                  "hashed-pin",

                role:
                  AdminRole.SUPER_ADMIN,

                isActive:
                  true,

                staff:
                  null,
              };
            }
          );

        const comparePin =
          vi.fn(
            async (
              pin: string,
              pinHash: string
            ) => {
              expect(pin).toBe(
                "2468"
              );

              expect(
                pinHash
              ).toBe(
                "hashed-pin"
              );

              return true;
            }
          );

        const result =
          await preparePosPricing({
            products,

            actor: {
              ...cashier,
              maxDiscountPercent:
                5,
            },

            discount: {
              type:
                DiscountType.PERCENTAGE,

              value: 10,

              reason:
                DiscountReason.CUSTOMER_NEGOTIATION,

              approval: {
                email:
                  "  MANAGER@example.com  ",

                pin:
                  "2468",
              },
            },

            approvalDependencies: {
              findAdminByEmail,
              comparePin,
              now: () =>
                approvedAt,
            },
          });

        expect(
          result.finalSubtotalPesewas
        ).toBe(18000);

        expect(
          result.discount
            ?.approvalRequired
        ).toBe(true);

        expect(
          result.discount?.approval
        ).toEqual({
          approvedById:
            "admin-super-1",

          approvedByName:
            "Approving Manager",

          approvedByRole:
            AdminRole.SUPER_ADMIN,

          approvedAt,
        });

        expect(
          findAdminByEmail
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          comparePin
        ).toHaveBeenCalledTimes(
          1
        );

        /*
         * Credentials are input-only.
         * They must never be returned as part
         * of the prepared pricing/audit data.
         */
        const serialised =
          JSON.stringify(
            result
          );

        expect(
          serialised
        ).not.toContain(
          "2468"
        );

        expect(
          serialised
        ).not.toContain(
          "manager@example.com"
        );
      }
    );

    it(
      "blocks a discount when a product has no protected selling floor",
      async () => {
        const findAdminByEmail =
          vi.fn();

        const comparePin =
          vi.fn();

        await expect(
          preparePosPricing({
            products: [
              {
                productId:
                  "product-no-floor",

                productName:
                  "Product Without Floor",

                quantity: 1,

                retailPrice:
                  20,

                minimumSellingPrice:
                  null,

                costPrice:
                  null,
              },
            ],

            actor: cashier,

            discount: {
              type:
                DiscountType.AMOUNT,

              value: 1,

              reason:
                DiscountReason.CUSTOMER_NEGOTIATION,

              approval: {
                email:
                  "manager@example.com",

                pin:
                  "2468",
              },
            },

            approvalDependencies: {
              findAdminByEmail,
              comparePin,
            },
          })
        ).rejects.toMatchObject({
          statusCode:
            400,

          message:
            "This discount cannot be completed until every discounted product has a minimum selling price or cost price configured.",
        });

        expect(
          findAdminByEmail
        ).not.toHaveBeenCalled();

        expect(
          comparePin
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "preserves exact line totals when a discount does not divide evenly by quantity",
      async () => {
        const result =
          await preparePosPricing({
            products: [
              {
                productId:
                  "product-fraction",

                productName:
                  "Three Unit Product",

                quantity: 3,

                retailPrice:
                  10,

                minimumSellingPrice:
                  5,

                costPrice:
                  4,
              },
            ],

            actor: {
              ...cashier,

              maxDiscountPercent:
                100,
            },

            discount: {
              type:
                DiscountType.AMOUNT,

              value: 1,

              reason:
                DiscountReason.CUSTOMER_NEGOTIATION,
            },
          });

        const line =
          result.lines[0];

        expect(
          result.originalSubtotalPesewas
        ).toBe(3000);

        expect(
          result.discountAmountPesewas
        ).toBe(100);

        expect(
          result.finalSubtotalPesewas
        ).toBe(2900);

        expect(
          line.discountTotalPesewas
        ).toBe(100);

        expect(
          line.finalTotalPesewas
        ).toBe(2900);

        expect(
          line.discountPerUnitPesewas
        ).toBeCloseTo(
          100 / 3
        );

        expect(
          line.finalUnitPricePesewas
        ).toBeCloseTo(
          2900 / 3
        );
      }
    );

    it(
      "preserves discount validation errors through the shared preparation service",
      async () => {
        await expect(
          preparePosPricing({
            products,
            actor: cashier,

            discount: {
              type:
                DiscountType.AMOUNT,

              value: 1,

              reason:
                DiscountReason.OTHER,
            },
          })
        ).rejects.toBeInstanceOf(
          PosPricingPreparationError
        );

        await expect(
          preparePosPricing({
            products,
            actor: cashier,

            discount: {
              type:
                DiscountType.AMOUNT,

              value: 1,

              reason:
                DiscountReason.OTHER,
            },
          })
        ).rejects.toThrow(
          "A note is required when the discount reason is Other."
        );
      }
    );
  }
);