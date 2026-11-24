import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  staffFindUnique: vi.fn(),
  branchFindUnique: vi.fn(),
  warehouseFindUnique: vi.fn(),
  inventoryFindUnique: vi.fn(),
  inventoryUpdateMany: vi.fn(),
  productUpdate: vi.fn(),
  movementCreate: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/app/lib/adminAuth", () => ({
  requireAdmin: mocks.requireAdmin,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    staff: { findUnique: mocks.staffFindUnique },
    branch: { findUnique: mocks.branchFindUnique },
    warehouse: { findUnique: mocks.warehouseFindUnique },
    inventory: { findUnique: mocks.inventoryFindUnique },
    $transaction: mocks.transaction,
  },
}));

import { POST } from "../../../app/api/inventory/adjustment/route";

const mainBranch = "branch-main";
const textileBranch = "branch-textiles";
const warehouseId = "warehouse-existing";

const inventory = {
  id: "inventory-1",
  productId: "product-blanket",
  locationType: "BRANCH",
  locationId: mainBranch,
  quantity: 10,
};

function request(overrides: Record<string, unknown> = {}) {
  return new Request(
    "http://localhost/api/inventory/adjustment",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: "product-blanket",
        locationType: "BRANCH",
        locationId: mainBranch,
        quantity: -2,
        reason: "Damaged stock",
        ...overrides,
      }),
    }
  );
}

describe("Inventory adjustment integrity", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mocks.requireAdmin.mockResolvedValue({
      staffId: "staff-1",
      role: "MANAGER",
      branchId: mainBranch,
    });

    mocks.staffFindUnique.mockResolvedValue({
      id: "staff-1",
      role: "MANAGER",
      isActive: true,
      branchId: mainBranch,
    });

    mocks.branchFindUnique.mockResolvedValue({
      id: mainBranch,
    });

    mocks.warehouseFindUnique.mockResolvedValue({
      id: warehouseId,
    });

    mocks.inventoryFindUnique.mockResolvedValue({
      ...inventory,
    });

    mocks.inventoryUpdateMany.mockResolvedValue({
      count: 1,
    });

    mocks.productUpdate.mockResolvedValue({});

    mocks.movementCreate.mockResolvedValue({
      id: "movement-1",
    });

    mocks.transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          inventory: {
            updateMany: mocks.inventoryUpdateMany,
          },
          product: {
            update: mocks.productUpdate,
          },
          stockMovement: {
            create: mocks.movementCreate,
          },
        })
    );
  });

  it("adjusts only the exact inventory record", async () => {
    const response = await POST(request());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.previousQuantity).toBe(10);
    expect(data.newQuantity).toBe(8);

    expect(mocks.inventoryUpdateMany).toHaveBeenCalledWith({
      where: {
        id: "inventory-1",
        quantity: 10,
      },
      data: {
        quantity: 8,
      },
    });

    expect(mocks.movementCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        productId: "product-blanket",
        type: "ADJUSTMENT",
        quantity: -2,
        fromLocationType: "BRANCH",
        fromLocationId: mainBranch,
        createdByStaffId: "staff-1",
        status: "COMPLETED",
      }),
    });
  });

  it("rejects adjustments that would create negative stock", async () => {
    const response = await POST(
      request({ quantity: -11 })
    );

    expect(response.status).toBe(400);
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.inventoryUpdateMany).not.toHaveBeenCalled();
  });

  it("rejects a concurrent stock change without writing a movement", async () => {
    mocks.inventoryUpdateMany.mockResolvedValue({
      count: 0,
    });

    const response = await POST(request());

    expect(response.status).toBe(409);
    expect(mocks.productUpdate).not.toHaveBeenCalled();
    expect(mocks.movementCreate).not.toHaveBeenCalled();
  });

  it("does not update the product stock mirror for a warehouse adjustment", async () => {
    mocks.requireAdmin.mockResolvedValue({
      staffId: "staff-warehouse",
      role: "WAREHOUSE_MANAGER",
      branchId: null,
    });

    mocks.staffFindUnique.mockResolvedValue({
      id: "staff-warehouse",
      role: "WAREHOUSE_MANAGER",
      isActive: true,
      branchId: null,
    });

    mocks.inventoryFindUnique.mockResolvedValue({
      ...inventory,
      locationType: "WAREHOUSE",
      locationId: warehouseId,
    });

    const response = await POST(
      request({
        locationType: "WAREHOUSE",
        locationId: warehouseId,
      })
    );

    expect(response.status).toBe(200);
    expect(mocks.productUpdate).not.toHaveBeenCalled();

    expect(mocks.movementCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        fromLocationType: "WAREHOUSE",
        fromLocationId: warehouseId,
      }),
    });
  });

  it("allows Super Admin to target an existing different branch", async () => {
    mocks.requireAdmin.mockResolvedValue({
      staffId: "staff-super",
      role: "SUPER_ADMIN",
      branchId: mainBranch,
    });

    mocks.staffFindUnique.mockResolvedValue({
      id: "staff-super",
      role: "SUPER_ADMIN",
      isActive: true,
      branchId: mainBranch,
    });

    mocks.branchFindUnique.mockResolvedValue({
      id: textileBranch,
    });

    mocks.inventoryFindUnique.mockResolvedValue({
      ...inventory,
      locationId: textileBranch,
    });

    const response = await POST(
      request({ locationId: textileBranch })
    );

    expect(response.status).toBe(200);

    expect(mocks.inventoryFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          productId_locationType_locationId: {
            productId: "product-blanket",
            locationType: "BRANCH",
            locationId: textileBranch,
          },
        },
      })
    );
  });
});
