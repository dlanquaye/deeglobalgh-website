import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  orderFindUnique: vi.fn(),
  branchFindUnique: vi.fn(),
  productFindMany: vi.fn(),
  inventoryFindMany: vi.fn(),
  orderCreate: vi.fn(),
  orderItemCreate: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: mocks.orderFindUnique,
    },
    branch: {
      findUnique: mocks.branchFindUnique,
    },
    product: {
      findMany: mocks.productFindMany,
    },
    inventory: {
      findMany: mocks.inventoryFindMany,
    },
    $transaction: mocks.transaction,
  },
}));

import {
  POST,
} from "../../../app/api/orders/create/route";

const MAIN_BRANCH =
  "cmq4b407s0000g3jg31elgm80";

function request(overrides: Record<string, unknown> = {}) {
  return new Request(
    "http://localhost/api/orders/create",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: "DG-WEBSITE-TEST-1",
        customer: {
          fullName: "Test Customer",
          email: "test@example.com",
          phone: "0551234567",
          location: "Kasoa",
        },
        items: [
          {
            productId: "book-1",
            quantity: 2,
          },
        ],
        ...overrides,
      }),
    }
  );
}

describe("Website sales channel persistence", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mocks.orderFindUnique.mockResolvedValue(null);

    mocks.branchFindUnique.mockResolvedValue({
      id: MAIN_BRANCH,
      name: "Kasoa Main Shop",
    });

    mocks.productFindMany.mockResolvedValue([
      {
        id: "book-1",
        name: "Test Textbook",
        sku: "TEST-BOOK",
        retailPrice: 25,
        isActive: true,
        websiteVisible: true,
        imageSrc: "/test-book.jpg",
      },
    ]);

    mocks.inventoryFindMany.mockResolvedValue([
      {
        productId: "book-1",
        quantity: 10,
      },
    ]);

    mocks.orderCreate.mockResolvedValue({
      id: "internal-order-1",
      orderId: "DG-WEBSITE-TEST-1",
      amount: 80,
      amountPesewas: 8000,
      locationId: MAIN_BRANCH,
    });

    mocks.orderItemCreate.mockResolvedValue({
      id: "order-item-1",
    });

    mocks.transaction.mockImplementation(
      async (
        callback: (tx: unknown) => Promise<unknown>
      ) =>
        callback({
          order: {
            create: mocks.orderCreate,
          },
          orderItem: {
            create: mocks.orderItemCreate,
          },
        })
    );
  });

  it("saves WEBSITE and DELIVERY in the order record", async () => {
    const response = await POST(request());

    expect(response.status).toBe(200);

    expect(mocks.orderCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        salesChannel: "WEBSITE",
        fulfillmentMethod: "DELIVERY",
        marketingSource: null,
        locationId: MAIN_BRANCH,
        paymentStatus: "PENDING",
        stockReduced: false,
      }),
    });

    expect(mocks.orderItemCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: "internal-order-1",
        productId: "book-1",
        quantity: 2,
        unitPrice: 25,
        totalPrice: 50,
      }),
    });
  });

  it("ignores attempts to relabel a website order as walk-in", async () => {
    const response = await POST(
      request({
        salesChannel: "WALK_IN",
        fulfillmentMethod: "COUNTER",
        marketingSource: "Fake Source",
      })
    );

    expect(response.status).toBe(200);

    expect(mocks.orderCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        salesChannel: "WEBSITE",
        fulfillmentMethod: "DELIVERY",
        marketingSource: null,
      }),
    });
  });

  it("does not create an order when branch stock is insufficient", async () => {
    mocks.inventoryFindMany.mockResolvedValue([
      {
        productId: "book-1",
        quantity: 1,
      },
    ]);

    const response = await POST(request());

    expect(response.status).toBe(400);

    expect(mocks.orderCreate).not.toHaveBeenCalled();
    expect(mocks.orderItemCreate).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});