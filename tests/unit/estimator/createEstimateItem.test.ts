import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { Decimal } from "@prisma/client/runtime/library";

const mocks = vi.hoisted(() => ({
  productFindUnique: vi.fn(),
  estimateFindUnique: vi.fn(),
  estimateItemCount: vi.fn(),
  estimateItemCreate: vi.fn(),
  estimateItemAggregate: vi.fn(),
  estimateUpdate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findUnique:
        mocks.productFindUnique,
    },

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
        };

        return callback(tx);
      }
    ),
  },
}));

import { createEstimateItem } from "@/lib/estimator/createEstimateItem";

describe("createEstimateItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.productFindUnique.mockResolvedValue({
      id: "product-1",
      sku: "TEST-001",
      name: "Test Exercise Book",
      retailPrice: 50,
    });

    mocks.estimateFindUnique.mockResolvedValue({
      id: "estimate-1",
    });

    mocks.estimateItemCount.mockResolvedValue(
      1
    );

    mocks.estimateItemCreate.mockImplementation(
      async ({ data }) => ({
        id: "item-2",
        ...data,
      })
    );

    mocks.estimateItemAggregate.mockResolvedValue({
      _sum: {
        totalPrice:
          new Decimal(150),
      },
    });

    mocks.estimateUpdate.mockResolvedValue({
      id: "estimate-1",
      estimatedTotal:
        new Decimal(150),
    });
  });

  it("creates the item and updates the estimate total", async () => {
    const result =
      await createEstimateItem(
        "estimate-1",
        "Test Exercise Book",
        2,
        "product-1"
      );

    expect(
      mocks.productFindUnique
    ).toHaveBeenCalledWith({
      where: {
        id: "product-1",
      },
    });

    expect(
      mocks.estimateItemCreate
    ).toHaveBeenCalledTimes(1);

    const createCall =
      mocks.estimateItemCreate.mock
        .calls[0][0];

    expect(
      createCall.data.lineNumber
    ).toBe(2);

    expect(
      createCall.data.quantity
    ).toBe(2);

    expect(
      createCall.data.unitPrice.toString()
    ).toBe("50");

    expect(
      createCall.data.totalPrice.toString()
    ).toBe("100");

    expect(
      mocks.estimateItemAggregate
    ).toHaveBeenCalledWith({
      where: {
        estimateRequestId:
          "estimate-1",
      },
      _sum: {
        totalPrice: true,
      },
    });

    expect(
      mocks.estimateUpdate
    ).toHaveBeenCalledTimes(1);

    const updateCall =
      mocks.estimateUpdate.mock
        .calls[0][0];

    expect(
      updateCall.data.estimatedTotal.toString()
    ).toBe("150");

    expect(result.id).toBe(
      "item-2"
    );
  });

  it("rejects invalid quantities before creating an item", async () => {
    await expect(
      createEstimateItem(
        "estimate-1",
        "Test Exercise Book",
        0,
        "product-1"
      )
    ).rejects.toThrow(
      "Quantity must be a whole number greater than 0."
    );

    expect(
      mocks.productFindUnique
    ).not.toHaveBeenCalled();

    expect(
      mocks.estimateItemCreate
    ).not.toHaveBeenCalled();
  });
});
