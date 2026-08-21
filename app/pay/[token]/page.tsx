import type {
  Metadata,
} from "next";

import {
  notFound,
} from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getRequiredOrderAmountPesewas } from "@/lib/pos/orderMoney";

import PaymentButton from "./PaymentButton";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export const metadata: Metadata = {
  title:
    "Complete Payment | DeeGlobalGH",
  description:
    "Secure DeeGlobalGH order payment.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

function formatMoney(
  amountGhs: number
) {
  return `GHS ${amountGhs.toLocaleString(
    "en-GH",
    {
      minimumFractionDigits:
        2,
      maximumFractionDigits:
        2,
    }
  )}`;
}

export default async function OrderPaymentPage(
  props: {
    params: Promise<{
      token: string;
    }>;
  }
) {
  const {
    token,
  } =
    await props.params;

  if (!token) {
    notFound();
  }

  const order =
    await prisma.order.findUnique({
      where: {
        paymentToken:
          token,
      },

      select: {
        id:
          true,

        orderId:
          true,

        customerName:
          true,

        email:
          true,

        phone:
          true,

        amount:
          true,

        amountPesewas:
          true,

        deliveryFee:
          true,

        paymentStatus:
          true,

        orderItems: {
          orderBy: {
            createdAt:
              "asc",
          },

          select: {
            id:
              true,

            quantity:
              true,

            unitPrice:
              true,

            totalPrice:
              true,

            product: {
              select: {
                name:
                  true,

                sku:
                  true,
              },
            },
          },
        },
      },
    });

  if (!order) {
    notFound();
  }

  /*
   * ==========================================
   * PAID / CLOSED ORDER
   * ==========================================
   */
  const paymentClosed =
    order.paymentStatus ===
      "PAID" ||
    order.paymentStatus ===
      "DELIVERING" ||
    order.paymentStatus ===
      "COMPLETED";

  /*
   * ==========================================
   * DELIVERY MUST BE CONFIRMED
   * ==========================================
   */
  if (
    order.deliveryFee ===
      null ||
    order.deliveryFee ===
      undefined
  ) {
    return (
      <main
        style={{
          minHeight:
            "100vh",
          background:
            "#f7f7f7",
          padding:
            "32px 16px",
        }}
      >
        <section
          style={{
            width:
              "100%",
            maxWidth:
              "620px",
            margin:
              "0 auto",
            background:
              "#ffffff",
            border:
              "1px solid #e5e7eb",
            borderRadius:
              "16px",
            padding:
              "28px",
          }}
        >
          <h1
            style={{
              fontSize:
                "24px",
              fontWeight:
                800,
              marginBottom:
                "12px",
            }}
          >
            Delivery Not Yet Confirmed
          </h1>

          <p
            style={{
              color:
                "#4b5563",
              lineHeight:
                1.6,
            }}
          >
            Your delivery charge
            has not yet been
            confirmed. Please
            contact DeeGlobalGH
            before making payment.
          </p>
        </section>
      </main>
    );
  }

  const amountPesewas =
    getRequiredOrderAmountPesewas(
      order
    );

  const finalAmountGhs =
    amountPesewas /
    100;

  const deliveryFee =
    Number(
      order.deliveryFee
    );

  const merchandiseSubtotal =
    order.orderItems.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.totalPrice
        ),
      0
    );

  return (
    <main
      style={{
        minHeight:
          "100vh",
        background:
          "#f7f7f7",
        padding:
          "32px 16px",
      }}
    >
      <div
        style={{
          width:
            "100%",
          maxWidth:
            "680px",
          margin:
            "0 auto",
        }}
      >
        <section
          style={{
            background:
              "#ffffff",
            borderRadius:
              "16px",
            border:
              "1px solid #e5e7eb",
            overflow:
              "hidden",
            boxShadow:
              "0 8px 30px rgba(0, 0, 0, 0.06)",
          }}
        >
          <header
            style={{
              padding:
                "28px 24px",
              borderBottom:
                "1px solid #e5e7eb",
              textAlign:
                "center",
            }}
          >
            <div
              style={{
                fontSize:
                  "26px",
                fontWeight:
                  800,
                marginBottom:
                  "6px",
              }}
            >
              DeeGlobalGH
            </div>

            <div
              style={{
                fontSize:
                  "20px",
                fontWeight:
                  800,
                marginBottom:
                  "8px",
              }}
            >
              Complete Your Payment
            </div>

            <div
              style={{
                color:
                  "#6b7280",
                fontSize:
                  "14px",
              }}
            >
              Your delivery charge
              has been confirmed.
            </div>
          </header>

          <div
            style={{
              padding:
                "24px",
            }}
          >
            <div
              style={{
                marginBottom:
                  "24px",
                padding:
                  "16px",
                background:
                  "#f9fafb",
                border:
                  "1px solid #e5e7eb",
                borderRadius:
                  "12px",
              }}
            >
              <div
                style={{
                  fontSize:
                    "13px",
                  color:
                    "#6b7280",
                  marginBottom:
                    "4px",
                }}
              >
                Order
              </div>

              <div
                style={{
                  fontSize:
                    "17px",
                  fontWeight:
                    800,
                }}
              >
                {
                  order.orderId
                }
              </div>

              {order.customerName && (
                <div
                  style={{
                    marginTop:
                      "10px",
                    color:
                      "#4b5563",
                  }}
                >
                  Customer:{" "}
                  {
                    order.customerName
                  }
                </div>
              )}
            </div>

            <h2
              style={{
                fontSize:
                  "17px",
                fontWeight:
                  800,
                marginBottom:
                  "10px",
              }}
            >
              Items
            </h2>

            <div
              style={{
                border:
                  "1px solid #e5e7eb",
                borderRadius:
                  "12px",
                overflow:
                  "hidden",
              }}
            >
              {order.orderItems.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      item.id
                    }
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      gap:
                        "18px",
                      padding:
                        "16px",
                      borderBottom:
                        index ===
                        order.orderItems
                          .length -
                          1
                          ? "none"
                          : "1px solid #e5e7eb",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight:
                            700,
                          marginBottom:
                            "4px",
                        }}
                      >
                        {
                          item
                            .product
                            .name
                        }
                      </div>

                      {item.product
                        .sku && (
                        <div
                          style={{
                            fontSize:
                              "12px",
                            color:
                              "#6b7280",
                            marginBottom:
                              "4px",
                          }}
                        >
                          SKU:{" "}
                          {
                            item
                              .product
                              .sku
                          }
                        </div>
                      )}

                      <div
                        style={{
                          fontSize:
                            "14px",
                          color:
                            "#4b5563",
                        }}
                      >
                        {
                          item.quantity
                        }{" "}
                        ×{" "}
                        {formatMoney(
                          Number(
                            item.unitPrice
                          )
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        fontWeight:
                          700,
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {formatMoney(
                        Number(
                          item.totalPrice
                        )
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            <div
              style={{
                marginTop:
                  "24px",
                paddingTop:
                  "18px",
                borderTop:
                  "1px solid #e5e7eb",
              }}
            >
              <SummaryRow
                label="Merchandise"
                value={formatMoney(
                  merchandiseSubtotal
                )}
              />

              <SummaryRow
                label="Confirmed delivery"
                value={formatMoney(
                  deliveryFee
                )}
              />

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  gap:
                    "20px",
                  marginTop:
                    "14px",
                  paddingTop:
                    "14px",
                  borderTop:
                    "1px solid #e5e7eb",
                  fontSize:
                    "21px",
                  fontWeight:
                    800,
                }}
              >
                <span>
                  Total Payable
                </span>

                <span>
                  {formatMoney(
                    finalAmountGhs
                  )}
                </span>
              </div>
            </div>

            <div
              style={{
                marginTop:
                  "24px",
              }}
            >
              {paymentClosed ? (
                <div
                  style={{
                    padding:
                      "16px",
                    border:
                      "1px solid #bbf7d0",
                    borderRadius:
                      "12px",
                    background:
                      "#f0fdf4",
                    color:
                      "#166534",
                    fontWeight:
                      700,
                    textAlign:
                      "center",
                  }}
                >
                  This order has
                  already been paid.
                </div>
              ) : (
                <PaymentButton
                  orderId={
                    order.orderId
                  }
                  email={
                    order.email
                  }
                  phone={
                    order.phone
                  }
                />
              )}
            </div>

            <div
              style={{
                marginTop:
                  "24px",
                padding:
                  "16px",
                background:
                  "#f9fafb",
                borderRadius:
                  "12px",
                color:
                  "#6b7280",
                fontSize:
                  "13px",
                lineHeight:
                  1.6,
                textAlign:
                  "center",
              }}
            >
              Please check the
              confirmed delivery
              charge and total
              carefully before
              continuing to
              Paystack.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display:
          "flex",
        justifyContent:
          "space-between",
        gap:
          "20px",
        marginBottom:
          "9px",
        color:
          "#4b5563",
      }}
    >
      <span>
        {label}
      </span>

      <span>
        {value}
      </span>
    </div>
  );
}
