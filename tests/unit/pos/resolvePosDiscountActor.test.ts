import {
  StaffRole,
} from "@prisma/client";

import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  PosDiscountActorError,
  resolvePosDiscountActor,
} from "@/lib/pos/resolvePosDiscountActor";

describe(
  "resolvePosDiscountActor",
  () => {
    it(
      "returns the active branch staff member and current discount authority",
      async () => {
        const findStaffById =
          vi.fn(
            async (
              staffId: string
            ) => {
              expect(
                staffId
              ).toBe(
                "staff-1"
              );

              return {
                id:
                  "staff-1",

                name:
                  "Test Cashier",

                role:
                  StaffRole.CASHIER,

                isActive:
                  true,

                branchId:
                  "branch-1",

                maxDiscountPercent:
                  7.5,
              };
            }
          );

        const result =
          await resolvePosDiscountActor({
            staffId:
              "staff-1",

            branchId:
              "branch-1",

            dependencies: {
              findStaffById,
            },
          });

        expect(
          result
        ).toEqual({
          id:
            "staff-1",

          name:
            "Test Cashier",

          role:
            StaffRole.CASHIER,

          maxDiscountPercent:
            7.5,
        });

        expect(
          findStaffById
        ).toHaveBeenCalledTimes(
          1
        );
      }
    );

    it(
      "preserves null authority so the pricing engine can require manager approval",
      async () => {
        const result =
          await resolvePosDiscountActor({
            staffId:
              "staff-2",

            branchId:
              "branch-1",

            dependencies: {
              findStaffById:
                async () => ({
                  id:
                    "staff-2",

                  name:
                    "Cashier Without Limit",

                  role:
                    StaffRole.CASHIER,

                  isActive:
                    true,

                  branchId:
                    "branch-1",

                  maxDiscountPercent:
                    null,
                }),
            },
          });

        expect(
          result.maxDiscountPercent
        ).toBeNull();
      }
    );

    it(
      "rejects a discount request without a linked staff account",
      async () => {
        const findStaffById =
          vi.fn();

        await expect(
          resolvePosDiscountActor({
            staffId:
              null,

            branchId:
              "branch-1",

            dependencies: {
              findStaffById,
            },
          })
        ).rejects.toMatchObject({
          name:
            "PosDiscountActorError",

          statusCode:
            403,

          message:
            "Discounts require an active staff account linked to this login.",
        });

        expect(
          findStaffById
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "rejects an inactive staff account",
      async () => {
        await expect(
          resolvePosDiscountActor({
            staffId:
              "staff-inactive",

            branchId:
              "branch-1",

            dependencies: {
              findStaffById:
                async () => ({
                  id:
                    "staff-inactive",

                  name:
                    "Inactive Cashier",

                  role:
                    StaffRole.CASHIER,

                  isActive:
                    false,

                  branchId:
                    "branch-1",

                  maxDiscountPercent:
                    5,
                }),
            },
          })
        ).rejects.toBeInstanceOf(
          PosDiscountActorError
        );

        await expect(
          resolvePosDiscountActor({
            staffId:
              "staff-inactive",

            branchId:
              "branch-1",

            dependencies: {
              findStaffById:
                async () => ({
                  id:
                    "staff-inactive",

                  name:
                    "Inactive Cashier",

                  role:
                    StaffRole.CASHIER,

                  isActive:
                    false,

                  branchId:
                    "branch-1",

                  maxDiscountPercent:
                    5,
                }),
            },
          })
        ).rejects.toThrow(
          "The staff account requesting this discount is not active."
        );
      }
    );

    it(
      "rejects a staff account from another branch",
      async () => {
        await expect(
          resolvePosDiscountActor({
            staffId:
              "staff-other-branch",

            branchId:
              "branch-1",

            dependencies: {
              findStaffById:
                async () => ({
                  id:
                    "staff-other-branch",

                  name:
                    "Other Branch Cashier",

                  role:
                    StaffRole.CASHIER,

                  isActive:
                    true,

                  branchId:
                    "branch-2",

                  maxDiscountPercent:
                    10,
                }),
            },
          })
        ).rejects.toMatchObject({
          statusCode:
            403,

          message:
            "The staff account does not belong to the active POS branch.",
        });
      }
    );

    it(
      "rejects a discount request when no active branch is available",
      async () => {
        const findStaffById =
          vi.fn();

        await expect(
          resolvePosDiscountActor({
            staffId:
              "staff-1",

            branchId:
              null,

            dependencies: {
              findStaffById,
            },
          })
        ).rejects.toMatchObject({
          statusCode:
            400,

          message:
            "No branch is assigned to this account.",
        });

        expect(
          findStaffById
        ).not.toHaveBeenCalled();
      }
    );
  }
);