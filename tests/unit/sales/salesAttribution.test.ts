import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getSalesDepartment,
  prepareSalesAttribution,
} from "../../../lib/sales/salesAttribution";

describe("DeeGlobalGH sales attribution", () => {
  it("classifies normal POS sales as walk-in", () => {
    expect(prepareSalesAttribution({
      entryPoint: "POS",
    })).toEqual({
      salesChannel: "WALK_IN",
      salesDepartment: "WALK_IN",
      fulfillmentMethod: "COUNTER",
      marketingSource: null,
    });
  });

  it("classifies website delivery orders as online", () => {
    expect(prepareSalesAttribution({
      entryPoint: "WEBSITE",
    })).toMatchObject({
      salesChannel: "WEBSITE",
      salesDepartment: "ONLINE",
      fulfillmentMethod: "DELIVERY",
    });
  });

  it("keeps website pickup orders as online sales", () => {
    expect(prepareSalesAttribution({
      entryPoint: "WEBSITE",
      fulfillmentMethod: "PICKUP",
    })).toMatchObject({
      salesDepartment: "ONLINE",
      fulfillmentMethod: "PICKUP",
    });
  });

  it("keeps WhatsApp pickup orders as online sales", () => {
    expect(prepareSalesAttribution({
      entryPoint: "MANUAL_REMOTE",
      channel: "WHATSAPP",
      fulfillmentMethod: "PICKUP",
    })).toMatchObject({
      salesChannel: "WHATSAPP",
      salesDepartment: "ONLINE",
      fulfillmentMethod: "PICKUP",
    });
  });

  it("distinguishes Facebook Ads from WhatsApp ordering", () => {
    expect(prepareSalesAttribution({
      entryPoint: "MANUAL_REMOTE",
      channel: "WHATSAPP",
      fulfillmentMethod: "DELIVERY",
      marketingSource: "Facebook Ads",
    })).toMatchObject({
      salesChannel: "WHATSAPP",
      marketingSource: "Facebook Ads",
    });
  });

  it("classifies TikTok orders as online", () => {
    expect(getSalesDepartment("TIKTOK")).toBe("ONLINE");
  });

  it("keeps telephone orders separately identifiable", () => {
    expect(prepareSalesAttribution({
      entryPoint: "MANUAL_REMOTE",
      channel: "PHONE",
      fulfillmentMethod: "DELIVERY",
    })).toMatchObject({
      salesDepartment: "PHONE",
    });
  });

  it("prevents website orders being relabelled as walk-in", () => {
    expect(() => prepareSalesAttribution({
      entryPoint: "WEBSITE",
      channel: "WALK_IN",
    })).toThrow("Website sales channel cannot be overridden");
  });

  it("prevents counter POS orders being relabelled as online", () => {
    expect(() => prepareSalesAttribution({
      entryPoint: "POS",
      channel: "WHATSAPP",
    })).toThrow("POS counter channel cannot be overridden");
  });

  it("requires a remote channel for staff-entered orders", () => {
    expect(() => prepareSalesAttribution({
      entryPoint: "MANUAL_REMOTE",
      fulfillmentMethod: "DELIVERY",
    })).toThrow("A valid remote sales channel is required");
  });

  it("rejects an invalid fulfilment method", () => {
    expect(() => prepareSalesAttribution({
      entryPoint: "MANUAL_REMOTE",
      channel: "WHATSAPP",
      fulfillmentMethod: "COUNTER",
    })).toThrow("Remote orders require delivery or pickup");
  });

  it("does not invent an unknown marketing source", () => {
    expect(prepareSalesAttribution({
      entryPoint: "WEBSITE",
    }).marketingSource).toBeNull();
  });
});