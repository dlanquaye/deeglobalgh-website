import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  findStaff: vi.fn(),
  findProducts: vi.fn(),
  updateProduct: vi.fn(),
  transaction: vi.fn(),
  synchronizeCatalog: vi.fn(),
}));

vi.mock("@/app/lib/adminAuth", () => ({
  requireAdmin: mocks.requireAdmin,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    staff: {
      findUnique: mocks.findStaff,
    },
    $transaction: mocks.transaction,
  },
}));

vi.mock("@/lib/catalog-sync", () => ({
  synchronizeCatalog: mocks.synchronizeCatalog,
}));

import { POST } from "@/app/api/admin/catalog/synchronize/route";

const validItem = (
  existingId: string,
  retailPrice: number
) => ({
  action: "UPDATE",
  existingId,
  product: {
    retailPrice,
  },
});

const request = (body: unknown) =>
  new Request("http://localhost/api/admin/catalog/synchronize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

describe("catalogue synchronisation API", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.requireAdmin.mockResolvedValue({
      staffId: "staff-1",
      role: "SUPER_ADMIN",
    });

    mocks.findStaff.mockResolvedValue({
      id: "staff-1",
      role: "MANAGER",
      isActive: true,
    });

    mocks.findProducts.mockResolvedValue([
      { id: "biology" },
      { id: "chemistry" },
    ]);

    mocks.updateProduct.mockResolvedValue({});

    mocks.transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          product: {
            findMany: mocks.findProducts,
            update: mocks.updateProduct,
          },
        })
    );

    mocks.synchronizeCatalog.mockResolvedValue({
      inserted: 0,
      updated: 1,
      review: 0,
      errors: 0,
      messages: [],
    });
  });

  it("updates only retail prices for a valid batch", async () => {
    const response = await POST(
      request({
        importType: "price",
        syncItems: [
          validItem("biology", 250),
          validItem("chemistry", 250),
        ],
      })
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.report.updated).toBe(2);

    expect(mocks.updateProduct).toHaveBeenCalledTimes(2);

    expect(mocks.updateProduct).toHaveBeenNthCalledWith(1, {
      where: { id: "biology" },
      data: { retailPrice: 250 },
    });

    expect(mocks.updateProduct).toHaveBeenNthCalledWith(2, {
      where: { id: "chemistry" },
      data: { retailPrice: 250 },
    });

    expect(mocks.synchronizeCatalog).not.toHaveBeenCalled();
  });

  it("rejects INSERT actions in price mode", async () => {
    const response = await POST(
      request({
        importType: "price",
        syncItems: [
          {
            action: "INSERT",
            existingId: "biology",
            product: { retailPrice: 250 },
          },
        ],
      })
    );

    expect(response.status).toBe(400);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects additional product fields", async () => {
    const response = await POST(
      request({
        importType: "price",
        syncItems: [
          {
            action: "UPDATE",
            existingId: "biology",
            product: {
              retailPrice: 250,
              stockQty: 100,
            },
          },
        ],
      })
    );

    expect(response.status).toBe(400);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects invalid prices", async () => {
    const response = await POST(
      request({
        importType: "price",
        syncItems: [
          validItem("biology", -250),
        ],
      })
    );

    expect(response.status).toBe(400);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects duplicate products", async () => {
    const response = await POST(
      request({
        importType: "price",
        syncItems: [
          validItem("biology", 250),
          validItem("biology", 260),
        ],
      })
    );

    expect(response.status).toBe(400);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects an empty price batch", async () => {
    const response = await POST(
      request({
        importType: "price",
        syncItems: [],
      })
    );

    expect(response.status).toBe(400);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects missing database products", async () => {
    mocks.findProducts.mockResolvedValue([
      { id: "biology" },
    ]);

    const response = await POST(
      request({
        importType: "price",
        syncItems: [
          validItem("biology", 250),
          validItem("missing", 250),
        ],
      })
    );

    expect(response.status).toBe(400);
    expect(mocks.updateProduct).not.toHaveBeenCalled();
  });

  it("does not report success when a transaction fails", async () => {
    mocks.findProducts.mockResolvedValue([
  { id: "biology" },
]);
    mocks.updateProduct.mockRejectedValue(
      new Error("Simulated database failure")
    );

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      const response = await POST(
        request({
          importType: "price",
          syncItems: [
            validItem("biology", 250),
          ],
        })
      );

      expect(response.status).toBe(500);
      expect(mocks.synchronizeCatalog).not.toHaveBeenCalled();
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it("preserves the existing general catalogue workflow", async () => {
    const items = [
      validItem("biology", 250),
    ];

    const response = await POST(
      request({
        importType: "update",
        syncItems: items,
      })
    );

    expect(response.status).toBe(200);
    expect(mocks.synchronizeCatalog).toHaveBeenCalledWith(
      items,
      false
    );
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects unauthorised staff", async () => {
    mocks.findStaff.mockResolvedValue({
      id: "staff-1",
      role: "CASHIER",
      isActive: true,
    });

    mocks.requireAdmin.mockResolvedValue({
      staffId: "staff-1",
      role: "CASHIER",
    });

    const response = await POST(
      request({
        importType: "price",
        syncItems: [
          validItem("biology", 250),
        ],
      })
    );

    expect(response.status).toBe(403);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("accepts a cost-price-only update", async () => {
    mocks.findProducts.mockResolvedValue([
      { id: "biology" },
    ]);

    const response = await POST(
      request({
        importType: "price",
        syncItems: [
          {
            action: "UPDATE",
            existingId: "biology",
            product: {
              costPrice: 180,
            },
          },
        ],
      })
    );

    expect(response.status).toBe(200);

    expect(mocks.updateProduct).toHaveBeenCalledWith({
      where: { id: "biology" },
      data: { costPrice: 180 },
    });
  });

  it("accepts a wholesale-price-only update", async () => {
    mocks.findProducts.mockResolvedValue([
      { id: "biology" },
    ]);

    const response = await POST(
      request({
        importType: "price",
        syncItems: [
          {
            action: "UPDATE",
            existingId: "biology",
            product: {
              wholesalePrice: 225,
            },
          },
        ],
      })
    );

    expect(response.status).toBe(200);

    expect(mocks.updateProduct).toHaveBeenCalledWith({
      where: { id: "biology" },
      data: { wholesalePrice: 225 },
    });
  });

  it("updates cost and wholesale without rewriting retail price", async () => {
    mocks.findProducts.mockResolvedValue([
      { id: "biology" },
    ]);

    const response = await POST(
      request({
        importType: "price",
        syncItems: [
          {
            action: "UPDATE",
            existingId: "biology",
            product: {
              costPrice: 100,
              wholesalePrice: 117,
            },
          },
        ],
      })
    );

    expect(response.status).toBe(200);

    expect(mocks.updateProduct).toHaveBeenCalledWith({
      where: { id: "biology" },
      data: {
        costPrice: 100,
        wholesalePrice: 117,
      },
    });

    expect(
      mocks.updateProduct.mock.calls[0][0].data
    ).not.toHaveProperty("retailPrice");
  });

  it("accepts all three commercial price fields", async () => {
    mocks.findProducts.mockResolvedValue([
      { id: "biology" },
    ]);

    const response = await POST(
      request({
        importType: "price",
        syncItems: [
          {
            action: "UPDATE",
            existingId: "biology",
            product: {
              costPrice: 180,
              wholesalePrice: 225,
              retailPrice: 250,
            },
          },
        ],
      })
    );

    expect(response.status).toBe(200);

    expect(mocks.updateProduct).toHaveBeenCalledWith({
      where: { id: "biology" },
      data: {
        costPrice: 180,
        wholesalePrice: 225,
        retailPrice: 250,
      },
    });
  });

  it("rejects a price payload with no commercial fields", async () => {
    const response = await POST(
      request({
        importType: "price",
        syncItems: [
          {
            action: "UPDATE",
            existingId: "biology",
            product: {},
          },
        ],
      })
    );

    expect(response.status).toBe(400);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
