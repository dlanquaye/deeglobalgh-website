import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  MatchMethod,
  MatchStatus,
} from "@prisma/client";

import { Decimal } from "@prisma/client/runtime/library";

const mocks = vi.hoisted(() => ({
  itemFindFirst:
    vi.fn(),

  productFindFirst:
    vi.fn(),

  itemUpdate:
    vi.fn(),

  itemAggregate:
    vi.fn(),

  estimateUpdate:
    vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(
      async (
        callback: (tx: unknown) => unknown
      ) => {
        const tx = {
          estimateItem: {
            findFirst:
              mocks.itemFindFirst,

            update:
              mocks.itemUpdate,

            aggregate:
              mocks.itemAggregate,
          },

          product: {
            findFirst:
              mocks.productFindFirst,
          },

          estimateRequest: {
            update:
              mocks.estimateUpdate,
          },
        };

        return callback(tx);
      }
    ),
  },
}));

import { replaceEstimateItemProduct } from "@/lib/estimator/replaceEstimateItemProduct";

describe(
  "replaceEstimateItemProduct",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      mocks.itemFindFirst
        .mockResolvedValue({
          id:
            "item-1",

          quantity:
            3,
        });

      mocks.productFindFirst
        .mockResolvedValue({
          id:
            "product-2",

          name:
            "Replacement Book",

          retailPrice:
            42.5,
        });

      mocks.itemUpdate
        .mockImplementation(
          async ({ data }) => ({
            id:
              "item-1",

            ...data,
          })
        );

      mocks.itemAggregate
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
      "replaces the quotation product while preserving quantity and recalculating totals",
      async () => {
        const result =
          await replaceEstimateItemProduct(
            "estimate-1",
            "item-1",
            "product-2"
          );

        expect(
          mocks.itemFindFirst
        ).toHaveBeenCalledWith({
          where: {
            id:
              "item-1",

            estimateRequestId:
              "estimate-1",
          },

          select: {
            id: true,
            quantity: true,
          },
        });

        expect(
          mocks.productFindFirst
        ).toHaveBeenCalledWith({
          where: {
            id:
              "product-2",

            isActive:
              true,
          },

          select: {
            id: true,
            name: true,
            retailPrice: true,
          },
        });

        expect(
          mocks.itemUpdate
        ).toHaveBeenCalledTimes(
          1
        );

        const updateCall =
          mocks.itemUpdate
            .mock
            .calls[0][0];

        expect(
          updateCall.data
            .productId
        ).toBe(
          "product-2"
        );

        expect(
          updateCall.data
            .description
        ).toBe(
          "Replacement Book"
        );

        expect(
          updateCall.data
            .matchMethod
        ).toBe(
          MatchMethod.MANUAL
        );

        expect(
          updateCall.data
            .matchStatus
        ).toBe(
          MatchStatus.MATCHED
        );

        expect(
          updateCall.data
            .matchConfidence
        ).toBe(
          100
        );

        expect(
          updateCall.data
            .unitPrice
            .toString()
        ).toBe(
          "42.5"
        );

        expect(
          updateCall.data
            .totalPrice
            .toString()
        ).toBe(
          "127.5"
        );

        expect(
          mocks.estimateUpdate
            .mock
            .calls[0][0]
            .data
            .estimatedTotal
            .toString()
        ).toBe(
          "250"
        );

        expect(
          result.productId
        ).toBe(
          "product-2"
        );
      }
    );

    it(
      "rejects an item that does not belong to the estimate",
      async () => {
        mocks.itemFindFirst
          .mockResolvedValue(
            null
          );

        await expect(
          replaceEstimateItemProduct(
            "estimate-1",
            "item-other",
            "product-2"
          )
        ).rejects.toThrow(
          "Quotation item not found."
        );

        expect(
          mocks.productFindFirst
        ).not.toHaveBeenCalled();

        expect(
          mocks.itemUpdate
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "rejects an inactive or missing replacement catalogue product",
      async () => {
        mocks.productFindFirst
          .mockResolvedValue(
            null
          );

        await expect(
          replaceEstimateItemProduct(
            "estimate-1",
            "item-1",
            "missing-product"
          )
        ).rejects.toThrow(
          "Selected catalogue product not found."
        );

        expect(
          mocks.itemUpdate
        ).not.toHaveBeenCalled();

        expect(
          mocks.estimateUpdate
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "sets the estimate total to zero if no priced lines remain after replacement recalculation",
      async () => {
        mocks.itemAggregate
          .mockResolvedValue({
            _sum: {
              totalPrice:
                null,
            },
          });

        await replaceEstimateItemProduct(
          "estimate-1",
          "item-1",
          "product-2"
        );

        expect(
          mocks.estimateUpdate
            .mock
            .calls[0][0]
            .data
            .estimatedTotal
            .toString()
        ).toBe(
          "0"
        );
      }
    );
  }
);