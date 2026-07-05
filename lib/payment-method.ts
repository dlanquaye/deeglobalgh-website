import { PaymentMethod } from "@prisma/client";

export function getPaymentMethodLabel(
  paymentMethod?: PaymentMethod | string | null
): string {
  if (!paymentMethod) {
    return "Unknown";
  }

  switch (paymentMethod) {
    case "CASH":
    case "Cash":
      return "Cash";

    case "MOMO":
    case "Mobile Money":
      return "Mobile Money";

    case "BANK_TRANSFER":
    case "Bank Transfer":
      return "Bank Transfer";

    case "ONLINE_CARD":
    case "Online Card":
      return "Online Card";

    case "OTHER":
    case "Other":
      return "Other";

    default:
      return "Unknown";
  }
}

export function formatPaymentMethod(
  paymentMethod?: PaymentMethod | string | null
): string {
  return getPaymentMethodLabel(paymentMethod);
}