export type InventoryLocationType =
  | "BRANCH"
  | "WAREHOUSE";

export type AdjustmentStaffRole =
  | "SUPER_ADMIN"
  | "MANAGER"
  | "WAREHOUSE_MANAGER"
  | string;

export type AdjustmentLocationInput = {
  locationType: unknown;
  locationId: unknown;
};

export type AdjustmentAuthorizationInput = {
  role: AdjustmentStaffRole;
  isActive: boolean;
  staffBranchId: string | null;
  locationType: InventoryLocationType;
  locationId: string;
};

export type LocationValidationResult =
  | {
      valid: true;
      locationType: InventoryLocationType;
      locationId: string;
    }
  | {
      valid: false;
      message: string;
    };

export function validateAdjustmentLocation(
  input: AdjustmentLocationInput
): LocationValidationResult {
  if (
    input.locationType !== "BRANCH" &&
    input.locationType !== "WAREHOUSE"
  ) {
    return {
      valid: false,
      message: "Invalid inventory location type.",
    };
  }

  if (
    typeof input.locationId !== "string" ||
    input.locationId.trim().length === 0
  ) {
    return {
      valid: false,
      message: "A specific stock location is required.",
    };
  }

  return {
    valid: true,
    locationType: input.locationType,
    locationId: input.locationId.trim(),
  };
}

export function canAdjustInventoryAtLocation(
  input: AdjustmentAuthorizationInput
): boolean {
  if (!input.isActive) {
    return false;
  }

  if (!input.locationId.trim()) {
    return false;
  }

  if (input.role === "SUPER_ADMIN") {
    return true;
  }

  if (input.locationType === "WAREHOUSE") {
    return input.role === "WAREHOUSE_MANAGER";
  }

  if (input.locationType === "BRANCH") {
    return (
      input.role === "MANAGER" &&
      input.staffBranchId === input.locationId
    );
  }

  return false;
}
