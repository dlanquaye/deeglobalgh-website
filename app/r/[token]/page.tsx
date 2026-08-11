import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Digital Receipt | DeeGlobalGH",
  description:
    "Secure DeeGlobalGH digital purchase receipt.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

function formatMoney(value: number) {
  return `GHS ${value.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Accra",
  }).format(value);
}

function formatPaymentMethod(
  value: string | null
) {
  switch (value) {
    case "MOMO":
      return "Mobile Money";

    case "BANK_TRANSFER":
      return "Bank Transfer";

    case "ONLINE_CARD":
      return "Card";

    case "CASH":
      return "Cash";

    default:
      return value || "Not specified";
  }
}

export default async function DigitalReceiptPage(
  props: {
    params: Promise<{
      token: string;
    }>;
  }
) {
  const { token } = await props.params;

  if (!token) {
    notFound();
  }

  const order =
    await prisma.order.findUnique({
      where: {
        receiptToken: token,
      },
      select: {
        orderId: true,
        createdAt: true,
        amount: true,
        deliveryFee: true,
        paymentStatus: true,
        paymentMethod: true,
        orderItems: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            product: {
              select: {
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });

  if (!order) {
    notFound();
  }

  const totalUnits =
    order.orderItems.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f7f7",
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          margin: "0 auto",
        }}
      >
        <section
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            border:
              "1px solid #e5e7eb",
            overflow: "hidden",
            boxShadow:
              "0 8px 30px rgba(0, 0, 0, 0.06)",
          }}
        >
          <header
            style={{
              padding: "28px 24px",
              borderBottom:
                "1px solid #e5e7eb",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "26px",
                fontWeight: 800,
                marginBottom: "6px",
              }}
            >
              DeeGlobalGH
            </div>

            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              Digital Receipt
            </div>

            <div
              style={{
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Thank you for shopping
              with us.
            </div>
          </header>

          <div
            style={{
              padding: "24px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
                marginBottom: "28px",
              }}
            >
              <ReceiptDetail
                label="Order"
                value={order.orderId}
              />

              <ReceiptDetail
                label="Date"
                value={formatDate(
                  order.createdAt
                )}
              />

              <ReceiptDetail
                label="Payment"
                value={formatPaymentMethod(
                  order.paymentMethod
                )}
              />

              <ReceiptDetail
                label="Payment Status"
                value={
                  order.paymentStatus
                }
              />
            </div>

            <div
              style={{
                marginBottom: "10px",
                fontSize: "17px",
                fontWeight: 700,
              }}
            >
              Items
            </div>

            <div
              style={{
                border:
                  "1px solid #e5e7eb",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              {order.orderItems.map(
                (item, index) => (
                  <div
                    key={item.id}
                    style={{
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
                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        gap: "16px",
                        alignItems:
                          "flex-start",
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
                              color:
                                "#6b7280",
                              fontSize:
                                "13px",
                              marginBottom:
                                "6px",
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
                            color:
                              "#4b5563",
                            fontSize:
                              "14px",
                          }}
                        >
                          {
                            item.quantity
                          }{" "}
                          ×{" "}
                          {formatMoney(
                            item.unitPrice
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          fontWeight:
                            700,
                          textAlign:
                            "right",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {formatMoney(
                          item.totalPrice
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            <div
              style={{
                marginTop: "24px",
                borderTop:
                  "1px solid #e5e7eb",
                paddingTop: "18px",
              }}
            >
              <SummaryRow
                label="Total items"
                value={String(
                  totalUnits
                )}
              />

              {typeof order.deliveryFee ===
                "number" &&
                order.deliveryFee >
                  0 && (
                  <SummaryRow
                    label="Delivery"
                    value={formatMoney(
                      order.deliveryFee
                    )}
                  />
                )}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  gap: "20px",
                  marginTop: "14px",
                  paddingTop:
                    "14px",
                  borderTop:
                    "1px solid #e5e7eb",
                  fontSize: "20px",
                  fontWeight: 800,
                }}
              >
                <span>Total Paid</span>

                <span>
                  {formatMoney(
                    order.amount
                  )}
                </span>
              </div>
            </div>

            <div
              style={{
                marginTop: "30px",
                padding: "20px",
                background:
                  "#f9fafb",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                How was your experience?
              </div>

              <div
                style={{
                  color: "#6b7280",
                  fontSize: "14px",
                  lineHeight: 1.5,
                  marginBottom: "14px",
                }}
              >
                Your feedback helps
                other customers find
                DeeGlobalGH.
              </div>

              <Link
                href="/review"
                style={{
                  display:
                    "inline-block",
                  padding:
                    "11px 18px",
                  borderRadius:
                    "8px",
                  background:
                    "#111827",
                  color: "#ffffff",
                  textDecoration:
                    "none",
                  fontWeight: 700,
                }}
              >
                Leave a Google Review
              </Link>
            </div>
          </div>

          <footer
            style={{
              borderTop:
                "1px solid #e5e7eb",
              padding: "20px 24px",
              textAlign: "center",
              color: "#6b7280",
              fontSize: "13px",
              lineHeight: 1.6,
            }}
          >
            <div>
              DeeGlobalGH
            </div>

            <div>
              Kasoa New Market, Ghana
            </div>

            <div>
              Keep this link as your
              digital proof of purchase.
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}

function ReceiptDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div
        style={{
          color: "#6b7280",
          fontSize: "12px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "15px",
          fontWeight: 600,
          overflowWrap:
            "anywhere",
        }}
      >
        {value}
      </div>
    </div>
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
        display: "flex",
        justifyContent:
          "space-between",
        gap: "20px",
        marginBottom: "9px",
        color: "#4b5563",
      }}
    >
      <span>{label}</span>

      <span>{value}</span>
    </div>
  );
}