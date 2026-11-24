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
  branchFindMany: vi.fn(),
  branchFindUnique: vi.fn(),
  warehouseFindMany: vi.fn(),
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
      findMany: mocks.branchFindMany,
      findUnique: mocks.branchFindUnique,
    },
    warehouse: {
      findMany: mocks.warehouseFindMany,
    },
  },
}));

import { GET } from "../../../app/api/inventory/adjustment/locations/route";

const mainBranch = {
  id: "branch-main",
  name: "Kasoa Main Shop",
  location: "Kasoa",
};

const textileBranch = {
  id: "branch-textiles",
  name: "DeeGlobalGH Textiles & Essentials",
  location: "Kasoa",
};

const warehouse = {
  id: "warehouse-existing",
  name: "Existing Warehouse",
  location: "Kasoa",
};

describe("Inventory adjustment location selector", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mocks.requireAdmin.mockResolvedValue({
      staffId: "staff-manager",
      role: "MANAGER",
      branchId: mainBranch.id,
    });

    mocks.staffFindUnique.mockResolvedValue({
      id: "staff-manager",
      role: "MANAGER",
      isActive: true,
      branchId: mainBranch.id,
    });

    mocks.branchFindUnique.mockResolvedValue(mainBranch);

    mocks.branchFindMany.mockResolvedValue([
      mainBranch,
      textileBranch,
    ]);

    mocks.warehouseFindMany.mockResolvedValue([
      warehouse,
    ]);
  });

  it("shows only the assigned branch to its manager", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.locations).toHaveLength(1);
    expect(data.locations[0].locationId).toBe(mainBranch.id);

    expect(mocks.branchFindMany).not.toHaveBeenCalled();
    expect(mocks.warehouseFindMany).not.toHaveBeenCalled();
  });

  it("shows all registered locations to Super Admin", async () => {
    mocks.requireAdmin.mockResolvedValue({
      staffId: "staff-super",
      role: "SUPER_ADMIN",
    });

    mocks.staffFindUnique.mockResolvedValue({
      id: "staff-super",
      role: "SUPER_ADMIN",
      isActive: true,
      branchId: mainBranch.id,
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);

    expect(
      data.locations.map(
        (item: { locationId: string }) => item.locationId
      )
    ).toEqual([
      mainBranch.id,
      textileBranch.id,
      warehouse.id,
    ]);
  });

  it("shows warehouses but not branches to warehouse managers", async () => {
    mocks.requireAdmin.mockResolvedValue({
      staffId: "staff-warehouse",
      role: "WAREHOUSE_MANAGER",
    });

    mocks.staffFindUnique.mockResolvedValue({
      id: "staff-warehouse",
      role: "WAREHOUSE_MANAGER",
      isActive: true,
      branchId: null,
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.locations).toHaveLength(1);
    expect(data.locations[0].locationId).toBe(warehouse.id);

    expect(mocks.branchFindMany).not.toHaveBeenCalled();
    expect(mocks.branchFindUnique).not.toHaveBeenCalled();
  });

  it("blocks inactive staff from viewing locations", async () => {
    mocks.staffFindUnique.mockResolvedValue({
      id: "staff-manager",
      role: "MANAGER",
      isActive: false,
      branchId: mainBranch.id,
    });

    const response = await GET();

    expect(response.status).toBe(403);
    expect(mocks.branchFindMany).not.toHaveBeenCalled();
    expect(mocks.warehouseFindMany).not.toHaveBeenCalled();
  });

  it("blocks cashiers from using the adjustment location selector", async () => {
    mocks.staffFindUnique.mockResolvedValue({
      id: "staff-cashier",
      role: "CASHIER",
      isActive: true,
      branchId: mainBranch.id,
    });

    const response = await GET();

    expect(response.status).toBe(403);
    expect(mocks.branchFindMany).not.toHaveBeenCalled();
    expect(mocks.warehouseFindMany).not.toHaveBeenCalled();
  });

  it("blocks accounts without a linked staff record", async () => {
    mocks.requireAdmin.mockResolvedValue({
      staffId: null,
      role: "MANAGER",
    });

    const response = await GET();

    expect(response.status).toBe(403);
    expect(mocks.branchFindMany).not.toHaveBeenCalled();
    expect(mocks.warehouseFindMany).not.toHaveBeenCalled();
  });
});
