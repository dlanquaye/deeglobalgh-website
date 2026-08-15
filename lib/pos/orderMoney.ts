export class PosOrderMoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PosOrderMoneyError";
  }
}

export type PosOrderAmountRecord = {
  amount: number;
  amountPesewas?: number | null;
};

/**
 * Returns the authoritative order total in integer pesewas.
 *
 * New POS orders:
 *   amountPesewas is authoritative.
 *
 * Legacy orders:
 *   fall back to Order.amount * 100.
 */
export function getRequiredOrderAmountPesewas(
  order: PosOrderAmountRecord
): number {
  if (
    order.amountPesewas !== null &&
    order.amountPesewas !== undefined
  ) {
    if (
      !Number.isSafeInteger(
        order.amountPesewas
      ) ||
      order.amountPesewas <= 0
    ) {
      throw new PosOrderMoneyError(
        "Order has an invalid exact amount."
      );
    }

    return order.amountPesewas;
  }

  if (
    !Number.isSafeInteger(order.amount) ||
    order.amount <= 0
  ) {
    throw new PosOrderMoneyError(
      "Order has an invalid legacy amount."
    );
  }

  const legacyPesewas =
    order.amount * 100;

  if (
    !Number.isSafeInteger(
      legacyPesewas
    ) ||
    legacyPesewas <= 0
  ) {
    throw new PosOrderMoneyError(
      "Order amount is too large."
    );
  }

  return legacyPesewas;
}

/**
 * Maintains the existing non-null Order.amount field.
 *
 * amountPesewas remains authoritative for new POS orders.
 * The legacy whole-GHS value preserves the historical
 * behaviour used elsewhere in the application.
 */
export function getLegacyOrderAmount(
  amountPesewas: number
): number {
  if (
    !Number.isSafeInteger(
      amountPesewas
    ) ||
    amountPesewas <= 0
  ) {
    throw new PosOrderMoneyError(
      "Exact order amount must be a positive whole number of pesewas."
    );
  }

  return Math.round(
    amountPesewas / 100
  );
}

/**
 * Converts exact integer pesewas to a GHS display number.
 *
 * This is for presentation only. Reconciliation must
 * continue to use integer pesewas.
 */
export function getOrderAmountGhs(
  order: PosOrderAmountRecord
): number {
  return (
    getRequiredOrderAmountPesewas(
      order
    ) / 100
  );
}