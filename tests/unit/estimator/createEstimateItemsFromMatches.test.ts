import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { Decimal } from "@prisma/client/runtime/library";

const mocks = vi.hoisted(() => ({
  estimateFindUnique: vi.fn(),
  estimateItemCount: vi.fn(),
  productFindUnique: vi.fn(),
  estimateItemCreate: vi.fn(),
  estimateItemAggregate: vi.fn(),
  estimateUpdate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(
      async (
        callback: (tx: unknown) => unknown
      ) => {
        const tx = {
          estimateRequest: {
            findUnique:
              mocks.estimateFindUnique,
            update:
              mocks.estimateUpdate,
          },

          estimateItem: {
            count:
              mocks.estimateItemCount,
            create:
              mocks.estimateItemCreate,
            aggregate:
              mocks.estimateItemAggregate,
          },

          product: {
            findUnique:
              mocks.productFindUnique,
          },
        };

        return callback(tx);
      }
    ),
  },
}));

import { createEstimateItemsFromMatches } from "@/lib/estimator/createEstimateItemsFromMatches";

describe(
  "createEstimateItemsFromMatches",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      mocks.estimateFindUnique
        .mockResolvedValue({
          id:
            "estimate-1",
        });

      mocks.estimateItemCount
        .mockResolvedValue(
          2
        );

      mocks.productFindUnique
        .mockResolvedValue({
          id:
            "product-1",

          retailPrice:
            50,
        });

      mocks.estimateItemCreate
        .mockImplementation(
          async ({ data }) => ({
            id:
              "item-new",

            ...data,
          })
        );

      mocks.estimateItemAggregate
        .mockResolvedValue({
          _sum: {
            totalPrice:
              new Decimal(
                250
              ),
          },
        });

      mocks.estimateUpdate
        .mockResolvedValue({
          id:
            "estimate-1",

          estimatedTotal:
            new Decimal(
              250
            ),
        });
    });

    it(
      "creates a matched OCR item and updates the estimate total",
      async () => {
        const result =
          await createEstimateItemsFromMatches(
            "estimate-1",
            [
              {
                originalLine:
                  "Test Exercise Book",

                matchedProductId:
                  "product-1",

                similarity:
                  95,
              } as any,
            ]
          );

        expect(
          mocks.estimateItemCreate
        ).toHaveBeenCalledTimes(
          1
        );

        const createCall =
          mocks.estimateItemCreate
            .mock
            .calls[0][0];

        expect(
          createCall.data
            .lineNumber
        ).toBe(
          3
        );

        expect(
          createCall.data
            .quantity
        ).toBe(
          1
        );

        expect(
          createCall.data
            .unitPrice
            .toString()
        ).toBe(
          "50"
        );

        expect(
          createCall.data
            .totalPrice
            .toString()
        ).toBe(
          "50"
        );

        expect(
          mocks.estimateUpdate
        ).toHaveBeenCalledTimes(
          1
        );

        const updateCall =
          mocks.estimateUpdate
            .mock
            .calls[0][0];

        expect(
          updateCall.data
            .estimatedTotal
            .toString()
        ).toBe(
          "250"
        );

        expect(
          result
        ).toEqual({
          booksFound:
            1,

          matchedBooks:
            1,
        });
      }
    );

    it(
      "extracts a parenthesised quantity from an unmatched school-list line",
      async () => {
        await createEstimateItemsFromMatches(
          "estimate-1",
          [
            {
              originalLine:
                "Note One (5)",

              similarity:
                0,
            } as any,
          ]
        );

        expect(
          mocks.estimateItemCreate
        ).toHaveBeenCalledTimes(
          1
        );

        const createCall =
          mocks.estimateItemCreate
            .mock
            .calls[0][0];

        expect(
          createCall.data
            .description
        ).toBe(
          "Note One (5)"
        );

        expect(
          createCall.data
            .quantity
        ).toBe(
          5
        );

        expect(
          createCall.data
            .productId
        ).toBeNull();

        expect(
          createCall.data
            .matchMethod
        ).toBe(
          "NONE"
        );

        expect(
          createCall.data
            .matchStatus
        ).toBe(
          "NOT_FOUND"
        );
      }
    );

    it(
      "extracts quantity units and multiplies matched item totals",
      async () => {
        await createEstimateItemsFromMatches(
          "estimate-1",
          [
            {
              originalLine:
                "Test Exercise Book 3 pieces",

              matchedProductId:
                "product-1",

              similarity:
                90,
            } as any,
          ]
        );

        const createCall =
          mocks.estimateItemCreate
            .mock
            .calls[0][0];

        expect(
          createCall.data
            .quantity
        ).toBe(
          3
        );

        expect(
          createCall.data
            .unitPrice
            .toString()
        ).toBe(
          "50"
        );

        expect(
          createCall.data
            .totalPrice
            .toString()
        ).toBe(
          "150"
        );
      }
    );

    it(
      "recognises common stationery quantity formats",
      async () => {
        await createEstimateItemsFromMatches(
          "estimate-1",
          [
            {
              originalLine:
                "Nataraj Pencil 2 packs",

              similarity:
                0,
            },

            {
              originalLine:
                "Eraser 10 pieces",

              similarity:
                0,
            },

            {
              originalLine:
                "Poster Colour 1 box",

              similarity:
                0,
            },

            {
              originalLine:
                "Crayon 2 packs (big)",

              similarity:
                0,
            },

            {
              originalLine:
                "Ruler 3 pieces",

              similarity:
                0,
            },

            {
              originalLine:
                "Blue Pen 5 pieces",

              similarity:
                0,
            },
          ] as any
        );

        const quantities =
          mocks.estimateItemCreate
            .mock
            .calls
            .map(
              (call) =>
                call[0]
                  .data
                  .quantity
            );

        expect(
          quantities
        ).toEqual([
          2,
          10,
          1,
          2,
          3,
          5,
        ]);
      }
    );

    it(
      "defaults to quantity one when no safe quantity is present",
      async () => {
        await createEstimateItemsFromMatches(
          "estimate-1",
          [
            {
              originalLine:
                "OWOP Golden Series",

              similarity:
                0,
            } as any,
          ]
        );

        const createCall =
          mocks.estimateItemCreate
            .mock
            .calls[0][0];

        expect(
          createCall.data
            .quantity
        ).toBe(
          1
        );
      }
    );
  }
);