import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getLegacyOrderAmount,
  getOrderAmountGhs,
  getRequiredOrderAmountPesewas,
  PosOrderMoneyError,
} from "@/lib/pos/orderMoney";

describe(
  "POS order money",
  () => {
    it(
      "uses exact amountPesewas as authoritative when present",
      () => {
        expect(
          getRequiredOrderAmountPesewas({
            amount: 95,
            amountPesewas: 9450,
          })
        ).toBe(9450);
      }
    );

    it(
      "falls back to legacy whole-GHS amount for older orders",
      () => {
        expect(
          getRequiredOrderAmountPesewas({
            amount: 95,
            amountPesewas: null,
          })
        ).toBe(9500);
      }
    );

    it(
      "also supports legacy orders where amountPesewas is undefined",
      () => {
        expect(
          getRequiredOrderAmountPesewas({
            amount: 5,
          })
        ).toBe(500);
      }
    );

    it(
      "rejects an invalid exact amount instead of silently falling back",
      () => {
        expect(() =>
          getRequiredOrderAmountPesewas({
            amount: 95,
            amountPesewas: 0,
          })
        ).toThrow(
          PosOrderMoneyError
        );

        expect(() =>
          getRequiredOrderAmountPesewas({
            amount: 95,
            amountPesewas: 0,
          })
        ).toThrow(
          "Order has an invalid exact amount."
        );
      }
    );

    it(
      "rejects an invalid legacy amount",
      () => {
        expect(() =>
          getRequiredOrderAmountPesewas({
            amount: 0,
            amountPesewas: null,
          })
        ).toThrow(
          "Order has an invalid legacy amount."
        );
      }
    );

    it(
      "preserves the existing whole-GHS legacy amount field for new exact totals",
      () => {
        expect(
          getLegacyOrderAmount(9450)
        ).toBe(95);

        expect(
          getLegacyOrderAmount(9449)
        ).toBe(94);

        expect(
          getLegacyOrderAmount(9500)
        ).toBe(95);
      }
    );

    it(
      "returns the exact GHS display value from pesewas",
      () => {
        expect(
          getOrderAmountGhs({
            amount: 95,
            amountPesewas: 9450,
          })
        ).toBe(94.5);

        expect(
          getOrderAmountGhs({
            amount: 5,
            amountPesewas: 555,
          })
        ).toBe(5.55);
      }
    );
  }
);