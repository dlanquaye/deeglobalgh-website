import {
  DiscountReason,
  DiscountType,
} from "@prisma/client";

export class PosDiscountError extends Error {
  statusCode: number;

  constructor(
    message: string,
    statusCode = 400
  ) {
    super(message);
    this.name = "PosDiscountError";
    this.statusCode = statusCode;
  }
}

export type DiscountProductInput = {
  productId: string;
  productName: string;
  quantity: number;
  retailPrice: number;
  minimumSellingPrice:
    | number
    | null
    | undefined;
  costPrice:
    | number
    | null
    | undefined;
};

export type DiscountActorInput = {
  id: string;
  name: string;
  role?: string | null;
  maxDiscountPercent:
    | number
    | null
    | undefined;
};

export type DiscountRequestInput = {
  type: DiscountType;
  value: number;
  reason: DiscountReason;
  note?: string | null;
};

export type DiscountFloorSource =
  | "MINIMUM_SELLING_PRICE"
  | "COST_PRICE"
  | "UNCONFIGURED";

export type DiscountLineAssessment = {
  productId: string;
  productName: string;
  quantity: number;

  retailUnitPesewas: number;
  retailLineTotalPesewas: number;

  floorUnitPesewas: number | null;
  floorLineTotalPesewas: number | null;
  floorSource: DiscountFloorSource;

  maximumDiscountPesewas: number | null;
};

export type PosDiscountAssessment = {
  type: DiscountType;
  value: number;
  reason: DiscountReason;
  note: string | null;

  originalSubtotalPesewas: number;
  requestedDiscountPesewas: number;
  finalSubtotalPesewas: number;

  effectiveDiscountPercent: number;

  staffMaximumDiscountPercent: number | null;
  approvalRequired: boolean;

  maximumDiscountByConfiguredFloorsPesewas:
    | number
    | null;

  hasUnconfiguredFloor: boolean;
  unconfiguredProductIds: string[];

  lines: DiscountLineAssessment[];
};

export type AllocatedDiscountLine = {
  productId: string;
  productName: string;
  quantity: number;

  originalUnitPricePesewas: number;
  originalTotalPesewas: number;

  discountTotalPesewas: number;
  discountPerUnitPesewas: number;

  finalUnitPricePesewas: number;
  finalTotalPesewas: number;

  floorUnitPesewas: number;
  floorSource:
    | "MINIMUM_SELLING_PRICE"
    | "COST_PRICE";
};

export type PosDiscountAllocation = {
  originalSubtotalPesewas: number;
  discountAmountPesewas: number;
  finalSubtotalPesewas: number;
  lines: AllocatedDiscountLine[];
};

function toPesewas(
  value: number,
  label: string
): number {
  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    throw new PosDiscountError(
      `${label} must be a valid non-negative amount.`
    );
  }

  return Math.round(value * 100);
}

function normalisePercent(
  value:
    | number
    | null
    | undefined
): number | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 100
  ) {
    throw new PosDiscountError(
      "Staff discount authority must be between 0 and 100 percent."
    );
  }

  return value;
}

function resolveFloor(
  product: DiscountProductInput
): {
  floorUnitPesewas: number | null;
  floorSource: DiscountFloorSource;
} {
  if (
    product.minimumSellingPrice !==
      null &&
    product.minimumSellingPrice !==
      undefined
  ) {
    return {
      floorUnitPesewas: toPesewas(
        product.minimumSellingPrice,
        `Minimum selling price for ${product.productName}`
      ),
      floorSource:
        "MINIMUM_SELLING_PRICE",
    };
  }

  if (
    product.costPrice !== null &&
    product.costPrice !== undefined
  ) {
    return {
      floorUnitPesewas: toPesewas(
        product.costPrice,
        `Cost price for ${product.productName}`
      ),
      floorSource: "COST_PRICE",
    };
  }

  return {
    floorUnitPesewas: null,
    floorSource: "UNCONFIGURED",
  };
}

function calculateRequestedDiscountPesewas(
  request: DiscountRequestInput,
  originalSubtotalPesewas: number
): number {
  if (
    !Number.isFinite(request.value) ||
    request.value <= 0
  ) {
    throw new PosDiscountError(
      "Discount value must be greater than zero."
    );
  }

  if (
    request.type ===
    DiscountType.PERCENTAGE
  ) {
    if (request.value > 100) {
      throw new PosDiscountError(
        "Percentage discount cannot exceed 100 percent."
      );
    }

    return Math.round(
      originalSubtotalPesewas *
        (request.value / 100)
    );
  }

  if (
    request.type ===
    DiscountType.AMOUNT
  ) {
    return toPesewas(
      request.value,
      "Discount amount"
    );
  }

  throw new PosDiscountError(
    "Unsupported discount type."
  );
}

export function assessPosDiscount({
  products,
  actor,
  request,
}: {
  products: DiscountProductInput[];
  actor: DiscountActorInput;
  request: DiscountRequestInput;
}): PosDiscountAssessment {
  if (
    !Array.isArray(products) ||
    products.length === 0
  ) {
    throw new PosDiscountError(
      "At least one product is required to calculate a discount."
    );
  }

  if (!actor.id?.trim()) {
    throw new PosDiscountError(
      "Discount requester identity is required."
    );
  }

  if (!actor.name?.trim()) {
    throw new PosDiscountError(
      "Discount requester name is required."
    );
  }

  if (!request.reason) {
    throw new PosDiscountError(
      "A discount reason is required."
    );
  }

  const cleanNote =
    typeof request.note === "string" &&
    request.note.trim()
      ? request.note.trim()
      : null;

  if (
    request.reason ===
      DiscountReason.OTHER &&
    !cleanNote
  ) {
    throw new PosDiscountError(
      "A note is required when the discount reason is Other."
    );
  }

  const lines: DiscountLineAssessment[] =
    products.map((product) => {
      if (!product.productId?.trim()) {
        throw new PosDiscountError(
          "Every discounted product must have a product ID."
        );
      }

      if (
        !Number.isInteger(
          product.quantity
        ) ||
        product.quantity <= 0
      ) {
        throw new PosDiscountError(
          `Quantity for ${product.productName} must be a positive whole number.`
        );
      }

      const retailUnitPesewas =
        toPesewas(
          product.retailPrice,
          `Retail price for ${product.productName}`
        );

      if (retailUnitPesewas <= 0) {
        throw new PosDiscountError(
          `${product.productName} has no valid selling price.`
        );
      }

      const {
        floorUnitPesewas,
        floorSource,
      } = resolveFloor(product);

      if (
        floorUnitPesewas !== null &&
        floorUnitPesewas >
          retailUnitPesewas
      ) {
        throw new PosDiscountError(
          `${product.productName} has a minimum selling price above its retail price. Correct the product pricing before applying a discount.`
        );
      }

      const retailLineTotalPesewas =
        retailUnitPesewas *
        product.quantity;

      const floorLineTotalPesewas =
        floorUnitPesewas === null
          ? null
          : floorUnitPesewas *
            product.quantity;

      const maximumDiscountPesewas =
        floorLineTotalPesewas === null
          ? null
          : retailLineTotalPesewas -
            floorLineTotalPesewas;

      return {
        productId: product.productId,
        productName:
          product.productName,
        quantity: product.quantity,

        retailUnitPesewas,
        retailLineTotalPesewas,

        floorUnitPesewas,
        floorLineTotalPesewas,
        floorSource,

        maximumDiscountPesewas,
      };
    });

  const originalSubtotalPesewas =
    lines.reduce(
      (sum, line) =>
        sum +
        line.retailLineTotalPesewas,
      0
    );

  if (
    originalSubtotalPesewas <= 0
  ) {
    throw new PosDiscountError(
      "The basket subtotal must be greater than zero."
    );
  }

  const requestedDiscountPesewas =
    calculateRequestedDiscountPesewas(
      request,
      originalSubtotalPesewas
    );

  if (
    requestedDiscountPesewas >=
    originalSubtotalPesewas
  ) {
    throw new PosDiscountError(
      "The discount cannot reduce the basket total to zero or below."
    );
  }

  const unconfiguredProductIds =
    lines
      .filter(
        (line) =>
          line.floorSource ===
          "UNCONFIGURED"
      )
      .map(
        (line) => line.productId
      );

  const hasUnconfiguredFloor =
    unconfiguredProductIds.length > 0;

  const maximumDiscountByConfiguredFloorsPesewas =
    hasUnconfiguredFloor
      ? null
      : lines.reduce(
          (sum, line) =>
            sum +
            (line.maximumDiscountPesewas ??
              0),
          0
        );

  if (
    maximumDiscountByConfiguredFloorsPesewas !==
      null &&
    requestedDiscountPesewas >
      maximumDiscountByConfiguredFloorsPesewas
  ) {
    throw new PosDiscountError(
      "This discount would reduce one or more products below their protected selling floor."
    );
  }

  const effectiveDiscountPercent =
    (requestedDiscountPesewas /
      originalSubtotalPesewas) *
    100;

  const staffMaximumDiscountPercent =
    normalisePercent(
      actor.maxDiscountPercent
    );

  const approvalRequired =
    staffMaximumDiscountPercent ===
      null ||
    effectiveDiscountPercent >
      staffMaximumDiscountPercent ||
    hasUnconfiguredFloor;

  const finalSubtotalPesewas =
    originalSubtotalPesewas -
    requestedDiscountPesewas;

  return {
    type: request.type,
    value: request.value,
    reason: request.reason,
    note: cleanNote,

    originalSubtotalPesewas,
    requestedDiscountPesewas,
    finalSubtotalPesewas,

    effectiveDiscountPercent,

    staffMaximumDiscountPercent,
    approvalRequired,

    maximumDiscountByConfiguredFloorsPesewas,

    hasUnconfiguredFloor,
    unconfiguredProductIds,

    lines,
  };
}

export function allocatePosDiscount(
  assessment: PosDiscountAssessment
): PosDiscountAllocation {
  if (
    assessment.hasUnconfiguredFloor
  ) {
    throw new PosDiscountError(
      "Discounted item pricing cannot be finalised while one or more products have no minimum selling price or cost price."
    );
  }

  const capacities =
    assessment.lines.map(
      (line) =>
        line.maximumDiscountPesewas ??
        0
    );

  const totalCapacity =
    capacities.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  if (
    assessment.requestedDiscountPesewas >
    totalCapacity
  ) {
    throw new PosDiscountError(
      "The requested discount exceeds the basket's protected selling-floor capacity."
    );
  }

  const allocations =
    assessment.lines.map(() => 0);

  let remaining =
    assessment.requestedDiscountPesewas;

  let activeIndexes =
    assessment.lines
      .map((_, index) => index)
      .filter(
        (index) =>
          capacities[index] > 0
      );

  while (
    remaining > 0 &&
    activeIndexes.length > 0
  ) {
    const totalWeight =
      activeIndexes.reduce(
        (sum, index) =>
          sum +
          assessment.lines[index]
            .retailLineTotalPesewas,
        0
      );

    let distributedThisRound = 0;

    const fractionalShares =
      activeIndexes.map(
        (index) => {
          const capacityRemaining =
            capacities[index] -
            allocations[index];

          const exactShare =
            totalWeight > 0
              ? remaining *
                (
                  assessment.lines[
                    index
                  ]
                    .retailLineTotalPesewas /
                  totalWeight
                )
              : 0;

          const wholeShare =
            Math.min(
              capacityRemaining,
              Math.floor(
                exactShare
              )
            );

          if (wholeShare > 0) {
            allocations[index] +=
              wholeShare;

            distributedThisRound +=
              wholeShare;
          }

          return {
            index,
            fractional:
              exactShare -
              Math.floor(
                exactShare
              ),
          };
        }
      );

    remaining -=
      distributedThisRound;

    if (remaining <= 0) {
      break;
    }

    fractionalShares.sort(
      (a, b) =>
        b.fractional -
          a.fractional ||
        a.index - b.index
    );

    let distributedRemainder = 0;

    for (
      const entry of
      fractionalShares
    ) {
      if (remaining <= 0) {
        break;
      }

      const capacityRemaining =
        capacities[entry.index] -
        allocations[entry.index];

      if (capacityRemaining <= 0) {
        continue;
      }

      allocations[
        entry.index
      ] += 1;

      remaining -= 1;
      distributedRemainder += 1;
    }

    activeIndexes =
      activeIndexes.filter(
        (index) =>
          allocations[index] <
          capacities[index]
      );

    if (
      distributedThisRound === 0 &&
      distributedRemainder === 0
    ) {
      break;
    }
  }

  if (remaining !== 0) {
    throw new PosDiscountError(
      "Unable to allocate the requested discount safely across the basket."
    );
  }

  const lines =
    assessment.lines.map(
      (
        line,
        index
      ): AllocatedDiscountLine => {
        if (
          line.floorUnitPesewas ===
            null ||
          line.floorSource ===
            "UNCONFIGURED"
        ) {
          throw new PosDiscountError(
            `No protected selling floor is configured for ${line.productName}.`
          );
        }

        const discountTotalPesewas =
          allocations[index];

        const finalTotalPesewas =
          line.retailLineTotalPesewas -
          discountTotalPesewas;

        if (
          finalTotalPesewas <
          line.floorUnitPesewas *
            line.quantity
        ) {
          throw new PosDiscountError(
            `Discount allocation would reduce ${line.productName} below its protected selling floor.`
          );
        }

        return {
          productId:
            line.productId,
          productName:
            line.productName,
          quantity:
            line.quantity,

          originalUnitPricePesewas:
            line.retailUnitPesewas,
          originalTotalPesewas:
            line.retailLineTotalPesewas,

          discountTotalPesewas,
          discountPerUnitPesewas:
            discountTotalPesewas /
            line.quantity,

          finalUnitPricePesewas:
            finalTotalPesewas /
            line.quantity,
          finalTotalPesewas,

          floorUnitPesewas:
            line.floorUnitPesewas,
          floorSource:
            line.floorSource,
        };
      }
    );

  const allocatedDiscount =
    lines.reduce(
      (sum, line) =>
        sum +
        line.discountTotalPesewas,
      0
    );

  const finalSubtotal =
    lines.reduce(
      (sum, line) =>
        sum +
        line.finalTotalPesewas,
      0
    );

  if (
    allocatedDiscount !==
    assessment.requestedDiscountPesewas
  ) {
    throw new PosDiscountError(
      "Allocated discount does not match the requested basket discount."
    );
  }

  if (
    finalSubtotal !==
    assessment.finalSubtotalPesewas
  ) {
    throw new PosDiscountError(
      "Allocated item totals do not match the final basket total."
    );
  }

  return {
    originalSubtotalPesewas:
      assessment.originalSubtotalPesewas,

    discountAmountPesewas:
      allocatedDiscount,

    finalSubtotalPesewas:
      finalSubtotal,

    lines,
  };
}