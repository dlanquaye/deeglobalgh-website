export type SalesChannel =
  | "WALK_IN"
  | "WEBSITE"
  | "WHATSAPP"
  | "TIKTOK"
  | "FACEBOOK"
  | "PHONE"
  | "OTHER_REMOTE";

export type SalesDepartment =
  | "WALK_IN"
  | "ONLINE"
  | "PHONE"
  | "OTHER_REMOTE";

export type FulfillmentMethod =
  | "COUNTER"
  | "DELIVERY"
  | "PICKUP";

export type SalesEntryPoint =
  | "POS"
  | "WEBSITE"
  | "MANUAL_REMOTE";

export type SalesAttribution = {
  salesChannel: SalesChannel;
  salesDepartment: SalesDepartment;
  fulfillmentMethod: FulfillmentMethod;
  marketingSource: string | null;
};

export function getSalesDepartment(
  channel: SalesChannel
): SalesDepartment {
  switch (channel) {
    case "WALK_IN":
      return "WALK_IN";

    case "WEBSITE":
    case "WHATSAPP":
    case "TIKTOK":
    case "FACEBOOK":
      return "ONLINE";

    case "PHONE":
      return "PHONE";

    case "OTHER_REMOTE":
      return "OTHER_REMOTE";
  }
}

function cleanMarketingSource(value: unknown): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error("Invalid marketing source.");
  }

  const cleaned = value.trim();

  if (!cleaned) {
    return null;
  }

  if (cleaned.length > 120) {
    throw new Error("Marketing source is too long.");
  }

  return cleaned;
}

function isRemoteChannel(value: unknown): value is
  | "WHATSAPP"
  | "TIKTOK"
  | "FACEBOOK"
  | "PHONE"
  | "OTHER_REMOTE" {
  return (
    value === "WHATSAPP" ||
    value === "TIKTOK" ||
    value === "FACEBOOK" ||
    value === "PHONE" ||
    value === "OTHER_REMOTE"
  );
}

/**
 * Server-side classification of where an order originates.
 *
 * POS counter sales cannot be relabelled as online.
 * Website orders cannot be relabelled by a request payload.
 *
 * Manual remote orders require a staff-selected channel.
 * Marketing source is optional and does not determine
 * the authoritative sales channel.
 *
 * This function does not access the database.
 */
export function prepareSalesAttribution(input: {
  entryPoint: SalesEntryPoint;
  channel?: unknown;
  fulfillmentMethod?: unknown;
  marketingSource?: unknown;
}): SalesAttribution {
  const marketingSource =
    cleanMarketingSource(input.marketingSource);

  let salesChannel: SalesChannel;
  let fulfillmentMethod: FulfillmentMethod;

  if (input.entryPoint === "POS") {
    if (
      input.channel !== undefined &&
      input.channel !== "WALK_IN"
    ) {
      throw new Error("POS counter channel cannot be overridden.");
    }

    if (
      input.fulfillmentMethod !== undefined &&
      input.fulfillmentMethod !== "COUNTER"
    ) {
      throw new Error("POS counter fulfilment cannot be overridden.");
    }

    salesChannel = "WALK_IN";
    fulfillmentMethod = "COUNTER";
  } else if (input.entryPoint === "WEBSITE") {
    if (
      input.channel !== undefined &&
      input.channel !== "WEBSITE"
    ) {
      throw new Error("Website sales channel cannot be overridden.");
    }

    salesChannel = "WEBSITE";

    const requestedMethod =
      input.fulfillmentMethod ?? "DELIVERY";

    if (
      requestedMethod !== "DELIVERY" &&
      requestedMethod !== "PICKUP"
    ) {
      throw new Error("Invalid website fulfilment method.");
    }

    fulfillmentMethod = requestedMethod;
  } else if (input.entryPoint === "MANUAL_REMOTE") {
    if (!isRemoteChannel(input.channel)) {
      throw new Error("A valid remote sales channel is required.");
    }

    salesChannel = input.channel;

    if (
      input.fulfillmentMethod !== "DELIVERY" &&
      input.fulfillmentMethod !== "PICKUP"
    ) {
      throw new Error("Remote orders require delivery or pickup.");
    }

    fulfillmentMethod = input.fulfillmentMethod;
  } else {
    throw new Error("Invalid sales entry point.");
  }

  return {
    salesChannel,
    salesDepartment: getSalesDepartment(salesChannel),
    fulfillmentMethod,
    marketingSource,
  };
}