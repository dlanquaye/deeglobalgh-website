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
    inventory: { findUnique: mocks.inventoryFindUnique },
    $transaction: mocks.transaction,
  },
}));

import { POST } from "../../../app/api/inventory/adjustment/route";

const mainBranch = "cmq4b407s0000g3jg31elgm80";
const textileBranch = "test-textile-branch";

function createRequest(locationId: string) {
  return new Request(
    "http://localhost/api/inventory/adjustment",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: "test-product",
        locationType: "BRANCH",
        locationId,
        quantity: -2,
        reason: "Test adjustment",
      }),
    }
  );
}

describe("Adjustment stock mirror protection", () => {
  beforeEach(() => {
    vi.resetAllMocks();

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

    mocks.branchFindUnique.mockImplementation(
      async ({ where }: { where: { id: string } }) => ({
        id: where.id,
      })
    );

    mocks.inventoryFindUnique.mockImplementation(
      async ({
        where,
      }: {
        where: {
          productId_locationType_locationId: {
            locationId: string;
          };
        };
      }) => ({
        id: "inventory-test",
        productId: "test-product",
        locationType: "BRANCH",
        locationId:
          where.productId_locationType_locationId.locationId,
        quantity: 10,
      })
    );

    mocks.inventoryUpdateMany.mockResolvedValue({
      count: 1,
    });

    mocks.productUpdate.mockResolvedValue({});
    mocks.movementCreate.mockResolvedValue({
      id: "movement-test",
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

  it("preserves legacy stock mirroring for the main shop", async () => {
    const response = await POST(createRequest(mainBranch));

    expect(response.status).toBe(200);

    expect(mocks.productUpdate).toHaveBeenCalledWith({
      where: { id: "test-product" },
      data: { stockQty: 8 },
    });
  });

  it("does not overwrite main-shop stock from the textile branch", async () => {
    const response = await POST(createRequest(textileBranch));

    expect(response.status).toBe(200);

    expect(mocks.inventoryUpdateMany).toHaveBeenCalledWith({
      where: {
        id: "inventory-test",
        quantity: 10,
      },
      data: { quantity: 8 },
    });

    expect(mocks.productUpdate).not.toHaveBeenCalled();

    expect(mocks.movementCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        fromLocationId: textileBranch,
      }),
    });
  });
});