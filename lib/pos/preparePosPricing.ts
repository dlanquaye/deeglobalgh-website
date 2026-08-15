import {
  DiscountReason,
  DiscountType,
} from "@prisma/client";

import {
  allocatePosDiscount,
  assessPosDiscount,
  PosDiscountError,
} from "@/lib/pos/discounts";

import type {
  DiscountActorInput,
  DiscountProductInput,
} from "@/lib/pos/discounts";

import {
  PosDiscountApprovalError,
  verifyPosDiscountApproval,
} from "@/lib/pos/discountApproval";

import type {
  DiscountApprovalDependencies,
  DiscountApprovalSnapshot,
} from "@/lib/pos/discountApproval";

export class PosPricingPreparationError extends Error {
  statusCode: number;

  constructor(
    message: string,
    statusCode = 400
  ) {
    super(message);
    this.name =
      "PosPricingPreparationError";
    this.statusCode =
      statusCode;
  }
}

export type RawPosDiscountInput = {
  type?: unknown;
  value?: unknown;
  reason?: unknown;
  note?: unknown;

  approval?: {
    email?: unknown;
    pin?: unknown;
  } | null;
};

export type PreparedPosPricingLine = {
  productId: string;
  productName: string;
  quantity: number;

  originalUnitPricePesewas: number;
  originalTotalPesewas: number;

  discountPerUnitPesewas: number;
  discountTotalPesewas: number;

  finalUnitPricePesewas: number;
  finalTotalPesewas: number;
};

export type PreparedPosDiscount = {
  type: DiscountType;
  value: number;
  reason: DiscountReason;
  note: string | null;

  originalSubtotalPesewas: number;
  discountAmountPesewas: number;
  finalSubtotalPesewas: number;

  effectiveDiscountPercent: number;

  requestedById: string;
  requestedByName: string;
  requestedByRole: string | null;

  approvalRequired: boolean;

  approval:
    | DiscountApprovalSnapshot
    | null;
};

export type PreparedPosPricing = {
  originalSubtotalPesewas: number;
  discountAmountPesewas: number;
  finalSubtotalPesewas: number;

  lines: PreparedPosPricingLine[];

  discount:
    | PreparedPosDiscount
    | null;
};

function toExactPesewas(
  value: number,
  label: string
): number {
  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    throw new PosPricingPreparationError(
      `${label} must be greater than zero.`
    );
  }

  const pesewas =
    Math.round(
      value * 100
    );

  if (
    !Number.isSafeInteger(
      pesewas
    ) ||
    pesewas <= 0
  ) {
    throw new PosPricingPreparationError(
      `${label} is invalid.`
    );
  }

  return pesewas;
}

function parseDiscountType(
  value: unknown
): DiscountType {
  if (
    typeof value === "string" &&
    (
      Object.values(
        DiscountType
      ) as string[]
    ).includes(value)
  ) {
    return value as DiscountType;
  }

  throw new PosPricingPreparationError(
    "Select a valid discount type."
  );
}

function parseDiscountReason(
  value: unknown
): DiscountReason {
  if (
    typeof value === "string" &&
    (
      Object.values(
        DiscountReason
      ) as string[]
    ).includes(value)
  ) {
    return value as DiscountReason;
  }

  throw new PosPricingPreparationError(
    "Select a valid discount reason."
  );
}

function parseDiscountValue(
  value: unknown
): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value ===
          "string" &&
        value.trim()
        ? Number(value)
        : Number.NaN;

  if (
    !Number.isFinite(
      parsed
    ) ||
    parsed <= 0
  ) {
    throw new PosPricingPreparationError(
      "Discount value must be greater than zero."
    );
  }

  return parsed;
}

function parseDiscountNote(
  value: unknown
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const clean =
    value.trim();

  return clean
    ? clean
    : null;
}

function getApprovalCredentials(
  discount:
    RawPosDiscountInput
) {
  const approval =
    discount.approval;

  const email =
    approval &&
    typeof approval.email ===
      "string"
      ? approval.email
          .trim()
      : "";

  const pin =
    approval &&
    typeof approval.pin ===
      "string"
      ? approval.pin.trim()
      : "";

  return {
    email,
    pin,
  };
}

function prepareOriginalPricing(
  products:
    DiscountProductInput[]
): PreparedPosPricing {
  if (
    !Array.isArray(products) ||
    products.length === 0
  ) {
    throw new PosPricingPreparationError(
      "At least one product is required."
    );
  }

  let originalSubtotalPesewas =
    0;

  const lines =
    products.map(
      (
        product
      ): PreparedPosPricingLine => {
        if (
          !product.productId?.trim()
        ) {
          throw new PosPricingPreparationError(
            "Every POS product must have a product ID."
          );
        }

        if (
          !Number.isInteger(
            product.quantity
          ) ||
          product.quantity <= 0
        ) {
          throw new PosPricingPreparationError(
            `Quantity for ${product.productName} must be a positive whole number.`
          );
        }

        const originalUnitPricePesewas =
          toExactPesewas(
            product.retailPrice,
            `Retail price for ${product.productName}`
          );

        const originalTotalPesewas =
          originalUnitPricePesewas *
          product.quantity;

        if (
          !Number.isSafeInteger(
            originalTotalPesewas
          ) ||
          originalTotalPesewas <=
            0
        ) {
          throw new PosPricingPreparationError(
            `Invalid total for ${product.productName}.`
          );
        }

        originalSubtotalPesewas +=
          originalTotalPesewas;

        if (
          !Number.isSafeInteger(
            originalSubtotalPesewas
          )
        ) {
          throw new PosPricingPreparationError(
            "POS basket total is too large."
          );
        }

        return {
          productId:
            product.productId,

          productName:
            product.productName,

          quantity:
            product.quantity,

          originalUnitPricePesewas,

          originalTotalPesewas,

          discountPerUnitPesewas:
            0,

          discountTotalPesewas:
            0,

          finalUnitPricePesewas:
            originalUnitPricePesewas,

          finalTotalPesewas:
            originalTotalPesewas,
        };
      }
    );

  if (
    originalSubtotalPesewas <=
    0
  ) {
    throw new PosPricingPreparationError(
      "POS basket total must be greater than zero."
    );
  }

  return {
    originalSubtotalPesewas,

    discountAmountPesewas:
      0,

    finalSubtotalPesewas:
      originalSubtotalPesewas,

    lines,

    discount:
      null,
  };
}

function convertKnownError(
  error: unknown
): never {
  if (
    error instanceof
    PosPricingPreparationError
  ) {
    throw error;
  }

  if (
    error instanceof
    PosDiscountError
  ) {
    throw new PosPricingPreparationError(
      error.message,
      error.statusCode
    );
  }

  if (
    error instanceof
    PosDiscountApprovalError
  ) {
    throw new PosPricingPreparationError(
      error.message,
      error.statusCode
    );
  }

  throw error;
}

export async function preparePosPricing({
  products,
  actor,
  discount,
  approvalDependencies,
}: {
  products: DiscountProductInput[];
  actor: DiscountActorInput;

  discount?:
    | RawPosDiscountInput
    | null;

  approvalDependencies?:
    DiscountApprovalDependencies;
}): Promise<PreparedPosPricing> {
  try {
    /*
     * No discount requested:
     *
     * return exact retail pricing in
     * integer pesewas and do not touch
     * manager approval at all.
     */
    if (
      discount === null ||
      discount === undefined
    ) {
      return prepareOriginalPricing(
        products
      );
    }

    if (!actor.id?.trim()) {
      throw new PosPricingPreparationError(
        "Discount requester identity is required."
      );
    }

    if (!actor.name?.trim()) {
      throw new PosPricingPreparationError(
        "Discount requester name is required."
      );
    }

    const request = {
      type:
        parseDiscountType(
          discount.type
        ),

      value:
        parseDiscountValue(
          discount.value
        ),

      reason:
        parseDiscountReason(
          discount.reason
        ),

      note:
        parseDiscountNote(
          discount.note
        ),
    };

    const assessment =
      assessPosDiscount({
        products,
        actor,
        request,
      });

    /*
     * A missing protected selling floor
     * is a product configuration problem,
     * not something even SUPER_ADMIN
     * approval may override.
     */
    if (
      assessment.hasUnconfiguredFloor
    ) {
      throw new PosPricingPreparationError(
        "This discount cannot be completed until every discounted product has a minimum selling price or cost price configured.",
        400
      );
    }

    let approval:
      | DiscountApprovalSnapshot
      | null =
      null;

    if (
      assessment.approvalRequired
    ) {
      const credentials =
        getApprovalCredentials(
          discount
        );

      if (
        !credentials.email ||
        !credentials.pin
      ) {
        throw new PosPricingPreparationError(
          "Manager approval is required for this discount.",
          403
        );
      }

      approval =
        await verifyPosDiscountApproval({
          credentials,
          assessment,
          dependencies:
            approvalDependencies,
        });
    }

    const allocation =
      allocatePosDiscount(
        assessment
      );

    const lines:
      PreparedPosPricingLine[] =
      allocation.lines.map(
        (line) => ({
          productId:
            line.productId,

          productName:
            line.productName,

          quantity:
            line.quantity,

          originalUnitPricePesewas:
            line.originalUnitPricePesewas,

          originalTotalPesewas:
            line.originalTotalPesewas,

          discountPerUnitPesewas:
            line.discountPerUnitPesewas,

          discountTotalPesewas:
            line.discountTotalPesewas,

          finalUnitPricePesewas:
            line.finalUnitPricePesewas,

          finalTotalPesewas:
            line.finalTotalPesewas,
        })
      );

    return {
      originalSubtotalPesewas:
        allocation.originalSubtotalPesewas,

      discountAmountPesewas:
        allocation.discountAmountPesewas,

      finalSubtotalPesewas:
        allocation.finalSubtotalPesewas,

      lines,

      discount: {
        type:
          assessment.type,

        value:
          assessment.value,

        reason:
          assessment.reason,

        note:
          assessment.note,

        originalSubtotalPesewas:
          allocation.originalSubtotalPesewas,

        discountAmountPesewas:
          allocation.discountAmountPesewas,

        finalSubtotalPesewas:
          allocation.finalSubtotalPesewas,

        effectiveDiscountPercent:
          assessment.effectiveDiscountPercent,

        requestedById:
          actor.id,

        requestedByName:
          actor.name,

        requestedByRole:
          actor.role ??
          null,

        approvalRequired:
          assessment.approvalRequired,

        approval,
      },
    };
  } catch (error) {
    convertKnownError(
      error
    );
  }
}