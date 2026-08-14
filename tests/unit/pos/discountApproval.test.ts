import {
  AdminRole,
  DiscountReason,
  DiscountType,
  StaffRole,
} from "@prisma/client";
import {
  describe,
  expect,
  it,
} from "vitest";

import {
  verifyPosDiscountApproval,
  PosDiscountApprovalError,
} from "@/lib/pos/discountApproval";

import {
  assessPosDiscount,
} from "@/lib/pos/discounts";

function createAssessment({
  discountPercent = 10,
  hasFloor = true,
}: {
  discountPercent?: number;
  hasFloor?: boolean;
} = {}) {
  return assessPosDiscount({
    products: [
      {
        productId: "product-1",
        productName: "Test Product",
        quantity: 1,
        retailPrice: 100,
        minimumSellingPrice:
          hasFloor ? 50 : null,
        costPrice:
          hasFloor ? 40 : null,
      },
    ],
    actor: {
      id: "cashier-1",
      name: "Test Cashier",
      role: "CASHIER",
      maxDiscountPercent: 5,
    },
    request: {
      type:
        DiscountType.PERCENTAGE,
      value: discountPercent,
      reason:
        DiscountReason.CUSTOMER_NEGOTIATION,
    },
  });
}

function createAdmin({
  adminRole = AdminRole.ADMIN,
  staffRole = StaffRole.MANAGER,
  adminActive = true,
  staffActive = true,
  maxDiscountPercent = 20,
}: {
  adminRole?: AdminRole;
  staffRole?: StaffRole | null;
  adminActive?: boolean;
  staffActive?: boolean;
  maxDiscountPercent?:
    | number
    | null;
} = {}) {
  return {
    id: "admin-1",
    name: "Test Admin",
    email: "manager@example.com",
    pinHash: "hashed-pin",
    role: adminRole,
    isActive: adminActive,

    staff:
      staffRole === null
        ? null
        : {
            id: "staff-manager-1",
            name: "Test Manager",
            role: staffRole,
            isActive: staffActive,
            maxDiscountPercent,
          },
  };
}

describe(
  "POS discount approval",
  () => {
    it(
      "allows a manager whose configured authority covers the discount",
      async () => {
        const approvedAt =
          new Date(
            "2026-08-14T20:00:00.000Z"
          );

        const result =
          await verifyPosDiscountApproval({
            credentials: {
              email:
                "manager@example.com",
              pin: "1234",
            },

            assessment:
              createAssessment({
                discountPercent: 10,
              }),

            dependencies: {
              findAdminByEmail:
                async () =>
                  createAdmin({
                    maxDiscountPercent:
                      15,
                  }),

              comparePin:
                async () => true,

              now: () => approvedAt,
            },
          });

        expect(
          result.approvedById
        ).toBe(
          "staff-manager-1"
        );

        expect(
          result.approvedByName
        ).toBe(
          "Test Manager"
        );

        expect(
          result.approvedByRole
        ).toBe(
          StaffRole.MANAGER
        );

        expect(
          result.approvedAt
        ).toEqual(approvedAt);
      }
    );

    it(
      "rejects an invalid PIN",
      async () => {
        await expect(
          verifyPosDiscountApproval({
            credentials: {
              email:
                "manager@example.com",
              pin: "wrong-pin",
            },

            assessment:
              createAssessment(),

            dependencies: {
              findAdminByEmail:
                async () =>
                  createAdmin(),

              comparePin:
                async () => false,
            },
          })
        ).rejects.toThrow(
          "Invalid manager credentials."
        );
      }
    );

    it(
      "rejects an inactive admin account",
      async () => {
        await expect(
          verifyPosDiscountApproval({
            credentials: {
              email:
                "manager@example.com",
              pin: "1234",
            },

            assessment:
              createAssessment(),

            dependencies: {
              findAdminByEmail:
                async () =>
                  createAdmin({
                    adminActive:
                      false,
                  }),

              comparePin:
                async () => true,
            },
          })
        ).rejects.toThrow(
          "Invalid manager credentials."
        );
      }
    );

    it(
      "rejects an inactive linked staff account",
      async () => {
        await expect(
          verifyPosDiscountApproval({
            credentials: {
              email:
                "manager@example.com",
              pin: "1234",
            },

            assessment:
              createAssessment(),

            dependencies: {
              findAdminByEmail:
                async () =>
                  createAdmin({
                    staffActive:
                      false,
                  }),

              comparePin:
                async () => true,
            },
          })
        ).rejects.toThrow(
          "Invalid manager credentials."
        );
      }
    );

    it(
      "rejects a cashier attempting to approve a discount",
      async () => {
        await expect(
          verifyPosDiscountApproval({
            credentials: {
              email:
                "cashier@example.com",
              pin: "1234",
            },

            assessment:
              createAssessment(),

            dependencies: {
              findAdminByEmail:
                async () =>
                  createAdmin({
                    staffRole:
                      StaffRole.CASHIER,
                    maxDiscountPercent:
                      100,
                  }),

              comparePin:
                async () => true,
            },
          })
        ).rejects.toThrow(
          "not authorised to approve POS discounts"
        );
      }
    );

    it(
      "rejects a manager with no configured discount authority",
      async () => {
        await expect(
          verifyPosDiscountApproval({
            credentials: {
              email:
                "manager@example.com",
              pin: "1234",
            },

            assessment:
              createAssessment(),

            dependencies: {
              findAdminByEmail:
                async () =>
                  createAdmin({
                    maxDiscountPercent:
                      null,
                  }),

              comparePin:
                async () => true,
            },
          })
        ).rejects.toThrow(
          "no discount approval limit configured"
        );
      }
    );

    it(
      "rejects a discount above the manager's configured authority",
      async () => {
        await expect(
          verifyPosDiscountApproval({
            credentials: {
              email:
                "manager@example.com",
              pin: "1234",
            },

            assessment:
              createAssessment({
                discountPercent: 20,
              }),

            dependencies: {
              findAdminByEmail:
                async () =>
                  createAdmin({
                    maxDiscountPercent:
                      15,
                  }),

              comparePin:
                async () => true,
            },
          })
        ).rejects.toThrow(
          "exceeds the manager's configured approval limit"
        );
      }
    );

    it(
      "allows SUPER_ADMIN approval without a configured percentage limit",
      async () => {
        const result =
          await verifyPosDiscountApproval({
            credentials: {
              email:
                "owner@example.com",
              pin: "1234",
            },

            assessment:
              createAssessment({
                discountPercent: 40,
              }),

            dependencies: {
              findAdminByEmail:
                async () =>
                  createAdmin({
                    adminRole:
                      AdminRole.SUPER_ADMIN,
                    staffRole: null,
                    maxDiscountPercent:
                      null,
                  }),

              comparePin:
                async () => true,
            },
          });

        expect(
          result.approvedById
        ).toBe("admin-1");

        expect(
          result.approvedByName
        ).toBe("Test Admin");

        expect(
          result.approvedByRole
        ).toBe(
          AdminRole.SUPER_ADMIN
        );
      }
    );

    it(
      "does not allow even SUPER_ADMIN approval when a product has no protected selling floor",
      async () => {
        await expect(
          verifyPosDiscountApproval({
            credentials: {
              email:
                "owner@example.com",
              pin: "1234",
            },

            assessment:
              createAssessment({
                discountPercent: 10,
                hasFloor: false,
              }),

            dependencies: {
              findAdminByEmail:
                async () =>
                  createAdmin({
                    adminRole:
                      AdminRole.SUPER_ADMIN,
                    staffRole: null,
                  }),

              comparePin:
                async () => true,
            },
          })
        ).rejects.toThrow(
          "cannot be approved until every discounted product has a minimum selling price or cost price configured"
        );
      }
    );

    it(
      "requires both manager email and PIN",
      async () => {
        await expect(
          verifyPosDiscountApproval({
            credentials: {
              email: "",
              pin: "",
            },

            assessment:
              createAssessment(),

            dependencies: {
              findAdminByEmail:
                async () =>
                  createAdmin(),

              comparePin:
                async () => true,
            },
          })
        ).rejects.toBeInstanceOf(
          PosDiscountApprovalError
        );

        await expect(
          verifyPosDiscountApproval({
            credentials: {
              email: "",
              pin: "",
            },

            assessment:
              createAssessment(),

            dependencies: {
              findAdminByEmail:
                async () =>
                  createAdmin(),

              comparePin:
                async () => true,
            },
          })
        ).rejects.toThrow(
          "Manager email and PIN are required."
        );
      }
    );
  }
);