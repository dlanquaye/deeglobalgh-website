import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { Decimal } from "@prisma/client/runtime/library";

const mocks = vi.hoisted(() => ({
  itemFindFirst:
    vi.fn(),

  itemDelete:
    vi.fn(),

  itemFindMany:
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

            delete:
              mocks.itemDelete,

            findMany:
              mocks.itemFindMany,

            update:
              mocks.itemUpdate,

            aggregate:
              mocks.itemAggregate,
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

import { deleteEstimateItem } from "@/lib/estimator/deleteEstimateItem";

describe(
  "deleteEstimateItem",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      mocks.itemFindFirst
        .mockResolvedValue({
          id:
            "item-3",

          lineNumber:
            3,
        });

      mocks.itemDelete
        .mockResolvedValue({
          id:
            "item-3",
        });

      mocks.itemFindMany
        .mockResolvedValue([
          {
            id:
              "item-4",

            lineNumber:
              4,
          },
          {
            id:
              "item-5",

            lineNumber:
              5,
          },
        ]);

      mocks.itemUpdate
        .mockResolvedValue({});

      mocks.itemAggregate
        .mockResolvedValue({
          _sum: {
            totalPrice:
              new Decimal(
                175
              ),
          },
        });

      mocks.estimateUpdate
        .mockResolvedValue({
          id:
            "estimate-1",

          estimatedTotal:
            new Decimal(
              175
            ),
        });
    });

    it(
      "deletes the item, resequences following rows and recalculates the estimate total",
      async () => {
        const result =
          await deleteEstimateItem(
            "estimate-1",
            "item-3"
          );

        expect(
          mocks.itemFindFirst
        ).toHaveBeenCalledWith({
          where: {
            id:
              "item-3",

            estimateRequestId:
              "estimate-1",
          },

          select: {
            id: true,
            lineNumber: true,
          },
        });

        expect(
          mocks.itemDelete
        ).toHaveBeenCalledWith({
          where: {
            id:
              "item-3",
          },
        });

        expect(
          mocks.itemFindMany
        ).toHaveBeenCalledWith({
          where: {
            estimateRequestId:
              "estimate-1",

            lineNumber: {
              gt:
                3,
            },
          },

          orderBy: {
            lineNumber:
              "asc",
          },

          select: {
            id: true,
            lineNumber: true,
          },
        });

        expect(
          mocks.itemUpdate
        ).toHaveBeenNthCalledWith(
          1,
          {
            where: {
              id:
                "item-4",
            },

            data: {
              lineNumber:
                3,
            },
          }
        );

        expect(
          mocks.itemUpdate
        ).toHaveBeenNthCalledWith(
          2,
          {
            where: {
              id:
                "item-5",
            },

            data: {
              lineNumber:
                4,
            },
          }
        );

        expect(
          mocks.estimateUpdate
        ).toHaveBeenCalledWith({
          where: {
            id:
              "estimate-1",
          },

          data: {
            estimatedTotal:
              expect.any(
                Decimal
              ),
          },
        });

        expect(
          mocks.estimateUpdate
            .mock
            .calls[0][0]
            .data
            .estimatedTotal
            .toString()
        ).toBe(
          "175"
        );

        expect(result).toEqual({
          deletedItemId:
            "item-3",
        });
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
          deleteEstimateItem(
            "estimate-1",
            "item-other"
          )
        ).rejects.toThrow(
          "Quotation item not found."
        );

        expect(
          mocks.itemDelete
        ).not.toHaveBeenCalled();

        expect(
          mocks.estimateUpdate
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "sets the estimate total to zero when no priced items remain",
      async () => {
        mocks.itemFindMany
          .mockResolvedValue(
            []
          );

        mocks.itemAggregate
          .mockResolvedValue({
            _sum: {
              totalPrice:
                null,
            },
          });

        await deleteEstimateItem(
          "estimate-1",
          "item-3"
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