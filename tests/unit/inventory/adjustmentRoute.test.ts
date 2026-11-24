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
  transaction: vi.fn(),
  inventoryUpdateMany: vi.fn(),
  productUpdate: vi.fn(),
  movementCreate: vi.fn(),
}));

vi.mock("@/app/lib/adminAuth", () => ({
  requireAdmin: mocks.requireAdmin,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    staff: {
      findUnique: mocks.staffFindUnique,
    },
    branch: {
      findUnique: mocks.branchFindUnique,
    },
    warehouse: {
      findUnique: mocks.warehouseFindUnique,
    },
    inventory: {
      findUnique: mocks.inventoryFindUnique,
      updateMany: mocks.inventoryUpdateMany,
    },
    product: {
      update: mocks.productUpdate,
    },
    stockMovement: {
      create: mocks.movementCreate,
    },
    $transaction: mocks.transaction,
  },
}));

import { POST } from "../../../app/api/inventory/adjustment/route";

function request(body: unknown) {
  return new Request(
    "http://localhost/api/inventory/adjustment",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
}

const mainBranch = "branch-main";
const textileBranch = "branch-textiles";
const warehouse = "warehouse-existing";

const validBody = {
  productId: "product-blanket",
  locationType: "BRANCH",
  locationId: mainBranch,
  quantity: -2,
  reason: "Damaged items",
};

describe("Inventory adjustment API security", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mocks.requireAdmin.mockResolvedValue({
      staffId: "staff-manager",
      role: "MANAGER",
      branchId: mainBranch,
    });

    mocks.staffFindUnique.mockResolvedValue({
      id: "staff-manager",
      role: "MANAGER",
      isActive: true,
      branchId: mainBranch,
    });
  });

  it("rejects adjustment requests without a location ID", async () => {
    const { locationId: _unused, ...body } = validBody;
    void _unused;

    const response = await POST(request(body));

    expect(response.status).toBe(400);
    expect(mocks.inventoryFindUnique).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("prevents a main-shop manager adjusting textile-branch stock", async () => {
    const response = await POST(
      request({
        ...validBody,
        locationId: textileBranch,
      })
    );

    expect(response.status).toBe(403);
    expect(mocks.inventoryFindUnique).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("prevents a branch manager adjusting warehouse stock", async () => {
    const response = await POST(
      request({
        ...validBody,
        locationType: "WAREHOUSE",
        locationId: warehouse,
      })
    );

    expect(response.status).toBe(403);
    expect(mocks.warehouseFindUnique).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects an inactive staff account", async () => {
    mocks.staffFindUnique.mockResolvedValue({
      id: "staff-manager",
      role: "MANAGER",
      isActive: false,
      branchId: mainBranch,
    });

    const response = await POST(request(validBody));

    expect(response.status).toBe(403);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects nonexistent branch locations", async () => {
    mocks.branchFindUnique.mockResolvedValue(null);

    const response = await POST(request(validBody));

    expect(response.status).toBe(404);
    expect(mocks.inventoryFindUnique).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("looks up inventory using the complete unique location key", async () => {
    mocks.branchFindUnique.mockResolvedValue({
      id: mainBranch,
    });

    mocks.inventoryFindUnique.mockResolvedValue(null);

    const response = await POST(request(validBody));

    expect(response.status).toBe(404);

    expect(mocks.inventoryFindUnique).toHaveBeenCalledWith({
      where: {
        productId_locationType_locationId: {
          productId: "product-blanket",
          locationType: "BRANCH",
          locationId: mainBranch,
        },
      },
      select: {
        id: true,
        productId: true,
        locationType: true,
        locationId: true,
        quantity: true,
      },
    });

    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
