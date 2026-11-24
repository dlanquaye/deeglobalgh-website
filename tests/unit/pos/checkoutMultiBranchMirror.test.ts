import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { LocationType } from "@prisma/client";

import {
  DEEGLOBALGH_MAIN_BRANCH_ID,
} from "../../../lib/inventory/mainBranchStockMirror";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  transaction: vi.fn(),
  applyStockMovement: vi.fn(),
  sendOrderSMS: vi.fn(),
  preparePosPricing: vi.fn(),
}));

vi.mock("@/app/lib/adminAuth", () => ({
  requireAdmin: mocks.requireAdmin,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: mocks.transaction,
  },
}));

vi.mock("@/lib/stock", () => ({
  applyStockMovement: mocks.applyStockMovement,
}));

vi.mock("@/app/lib/hubtelSms", () => ({
  sendOrderSMS: mocks.sendOrderSMS,
}));

vi.mock(
  "@/lib/pos/preparePosPricing",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("@/lib/pos/preparePosPricing")
    >()),
    preparePosPricing: mocks.preparePosPricing,
  })
);

import { POST } from "../../../app/api/pos/checkout/route";

const MAIN = DEEGLOBALGH_MAIN_BRANCH_ID;
const SECOND = "second-branch-test";

function setupCheckout(branchId: string) {
  const product = {
    id: "product-1",
    name: "Test Textbook",
    isActive: true,
    retailPrice: 20,
    minimumSellingPrice: 10,
    costPrice: 8,
    stockQty: 50,
  };

  const tx = {
    product: {
      findMany: vi.fn().mockResolvedValue([product]),
      update: vi.fn().mockResolvedValue({}),
    },

    inventory: {
      findMany: vi.fn().mockResolvedValue([
        {
          productId: product.id,
          locationType: LocationType.BRANCH,
          locationId: branchId,
          quantity: 12,
        },
      ]),
      findUnique: vi.fn().mockResolvedValue({
        quantity: 11,
      }),
    },

    order: {
      create: vi.fn().mockImplementation(
        async ({ data }) => ({
          id: "order-1",
          ...data,
        })
      ),
    },

    orderItem: {
      create: vi.fn().mockResolvedValue({
        id: "order-item-1",
      }),
    },

    orderDiscount: {
      create: vi.fn(),
    },

    stockMovement: {
      create: vi.fn().mockResolvedValue({
        id: "movement-1",
      }),
    },

    posHeldSale: {
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },

    staff: {
      findUnique: vi.fn(),
    },

    admin: {
      findUnique: vi.fn(),
    },
  };

  mocks.requireAdmin.mockResolvedValue({
    adminId: "admin-1",
    staffId: "staff-1",
    staffName: "Test Cashier",
    role: "ADMIN",
    branchId,
  });

  mocks.transaction.mockImplementation(
    async (callback) => callback(tx)
  );

  mocks.applyStockMovement.mockResolvedValue(
    undefined
  );

  mocks.preparePosPricing.mockResolvedValue({
    finalSubtotalPesewas: 2000,
    discount: null,
    lines: [
      {
        productId: product.id,
        finalUnitPricePesewas: 2000,
        finalTotalPesewas: 2000,
        originalUnitPricePesewas: 2000,
        originalTotalPesewas: 2000,
        discountPerUnitPesewas: 0,
        discountTotalPesewas: 0,
      },
    ],
  });

  return tx;
}

async function checkout() {
  const request = new Request(
    "http://localhost/api/pos/checkout",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            id: "product-1",
            quantity: 1,
          },
        ],
        customerName: "Test Customer",
        customerPhone: "",
        paymentMethod: "CASH",
      }),
    }
  );

  return POST(request);
}

describe("POS checkout multi-branch stock mirror", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(
    "updates Product.stockQty for main-branch checkout",
    async () => {
      const tx = setupCheckout(MAIN);

      const response = await checkout();

      expect(response.status).toBe(200);

      expect(tx.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            locationId: MAIN,
            salesChannel: "WALK_IN",
            fulfillmentMethod: "COUNTER",
          }),
        })
      );

      expect(
        tx.product.update
      ).toHaveBeenCalledWith({
        where: {
          id: "product-1",
        },
        data: {
          stockQty: 11,
        },
      });

      expect(
        tx.stockMovement.create
      ).toHaveBeenCalledWith({
        data: expect.objectContaining({
          productId: "product-1",
          fromLocationType: LocationType.BRANCH,
          fromLocationId: MAIN,
        }),
      });

      expect(
        mocks.applyStockMovement
      ).toHaveBeenCalledWith(
        tx,
        "movement-1"
      );

      expect(
        tx.orderItem.create
      ).toHaveBeenCalledTimes(1);
    }
  );

  it(
    "preserves main-branch stock mirror during second-branch checkout",
    async () => {
      const tx = setupCheckout(SECOND);

      const response = await checkout();

      expect(response.status).toBe(200);

      expect(
        tx.inventory.findMany
      ).toHaveBeenCalledWith({
        where: expect.objectContaining({
          locationType: LocationType.BRANCH,
          locationId: SECOND,
        }),
      });

      expect(
        tx.stockMovement.create
      ).toHaveBeenCalledWith({
        data: expect.objectContaining({
          fromLocationType: LocationType.BRANCH,
          fromLocationId: SECOND,
        }),
      });

      expect(
        mocks.applyStockMovement
      ).toHaveBeenCalledWith(
        tx,
        "movement-1"
      );

      expect(
        tx.product.update
      ).not.toHaveBeenCalled();

      expect(
        tx.order.create
      ).toHaveBeenCalledTimes(1);

      expect(
        tx.orderItem.create
      ).toHaveBeenCalledTimes(1);
    }
  );
});