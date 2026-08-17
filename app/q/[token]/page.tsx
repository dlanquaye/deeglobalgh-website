import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quotation | DeeGlobalGH",
  description:
    "Secure DeeGlobalGH customer quotation.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

function formatMoney(
  value: number
) {
  return `GHS ${value.toLocaleString(
    "en-GH",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

function formatDate(
  value: Date
) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Africa/Accra",
    }
  ).format(value);
}

export default async function PublicQuotationPage(
  props: {
    params: Promise<{
      token: string;
    }>;
  }
) {
  const { token } =
    await props.params;

  if (!token) {
    notFound();
  }

  const estimate =
    await prisma.estimateRequest.findUnique({
      where: {
        publicToken:
          token,
      },

      select: {
        estimateNumber:
          true,

        status:
          true,

        customerName:
          true,

        phone:
          true,

        email:
          true,

        schoolName:
          true,

        className:
          true,

        academicYear:
          true,

        notes:
          true,

        estimatedTotal:
          true,

        createdAt:
          true,

        items: {
          orderBy: {
            lineNumber:
              "asc",
          },

          select: {
            id:
              true,

            lineNumber:
              true,

            quantity:
              true,

            description:
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

  if (!estimate) {
    notFound();
  }

  const calculatedTotal =
    estimate.items.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.totalPrice ??
            0
        ),
      0
    );

  const grandTotal =
    estimate.estimatedTotal !==
      null
      ? Number(
          estimate.estimatedTotal
        )
      : calculatedTotal;

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
          maxWidth: "780px",
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
          {/* ==================================
              HEADER
          ================================== */}
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
            <img
              src="/products/deeglobalgh-logo.png"
              alt="DeeglobalGH"
              style={{
                height:
                  "90px",
                width:
                  "auto",
                margin:
                  "0 auto 12px",
              }}
            />

            <div
              style={{
                fontSize:
                  "26px",
                fontWeight:
                  800,
                color:
                  "#1e3a8a",
              }}
            >
              DeeGlobalGH
            </div>

            <div
              style={{
                marginTop:
                  "6px",
                fontSize:
                  "20px",
                fontWeight:
                  800,
              }}
            >
              Quotation
            </div>

            <div
              style={{
                marginTop:
                  "4px",
                color:
                  "#6b7280",
                fontSize:
                  "14px",
              }}
            >
              Proforma Invoice
            </div>
          </header>

          <div
            style={{
              padding:
                "24px",
            }}
          >
            {/* ================================
                REFERENCE DETAILS
            ================================= */}
            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap:
                  "16px",
                marginBottom:
                  "26px",
              }}
            >
              <Detail
                label="Quotation"
                value={
                  estimate.estimateNumber
                }
              />

              <Detail
                label="Date"
                value={formatDate(
                  estimate.createdAt
                )}
              />

              <Detail
                label="Status"
                value={
                  estimate.status
                }
              />
            </div>

            {/* ================================
                CUSTOMER
            ================================= */}
            <div
              style={{
                padding:
                  "18px",
                background:
                  "#f9fafb",
                border:
                  "1px solid #e5e7eb",
                borderRadius:
                  "12px",
                marginBottom:
                  "26px",
              }}
            >
              <div
                style={{
                  fontSize:
                    "15px",
                  fontWeight:
                    800,
                  marginBottom:
                    "12px",
                  color:
                    "#1e3a8a",
                }}
              >
                Customer Details
              </div>

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(200px, 1fr))",
                  gap:
                    "12px",
                }}
              >
                <Detail
                  label="Customer"
                  value={
                    estimate.customerName
                  }
                />

                <Detail
                  label="Phone"
                  value={
                    estimate.phone
                  }
                />

                {estimate.email && (
                  <Detail
                    label="Email"
                    value={
                      estimate.email
                    }
                  />
                )}

                {estimate.schoolName && (
                  <Detail
                    label="School / Organisation"
                    value={
                      estimate.schoolName
                    }
                  />
                )}

                {estimate.className && (
                  <Detail
                    label="Class"
                    value={
                      estimate.className
                    }
                  />
                )}

                {estimate.academicYear && (
                  <Detail
                    label="Academic Year"
                    value={
                      estimate.academicYear
                    }
                  />
                )}
              </div>
            </div>

            {/* ================================
                ITEMS
            ================================= */}
            <div
              style={{
                fontSize:
                  "17px",
                fontWeight:
                  800,
                marginBottom:
                  "12px",
              }}
            >
              Quotation Items
            </div>

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
              {estimate.items.length ===
              0 ? (
                <div
                  style={{
                    padding:
                      "24px",
                    color:
                      "#6b7280",
                    textAlign:
                      "center",
                  }}
                >
                  No quotation items are available.
                </div>
              ) : (
                estimate.items.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={
                        item.id
                      }
                      style={{
                        padding:
                          "16px",
                        borderBottom:
                          index ===
                          estimate.items.length -
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
                          alignItems:
                            "flex-start",
                          gap:
                            "16px",
                        }}
                      >
                        <div
                          style={{
                            flex:
                              1,
                          }}
                        >
                          <div
                            style={{
                              fontWeight:
                                700,
                              marginBottom:
                                "4px",
                            }}
                          >
                            {item.product
                              ?.name ??
                              item.description}
                          </div>

                          {item.product
                            ?.sku && (
                            <div
                              style={{
                                fontSize:
                                  "12px",
                                color:
                                  "#6b7280",
                                marginBottom:
                                  "6px",
                              }}
                            >
                              SKU:{" "}
                              {
                                item.product
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
                            Qty:{" "}
                            {
                              item.quantity
                            }
                          </div>

                          <div
                            style={{
                              marginTop:
                                "4px",
                              fontSize:
                                "14px",
                              color:
                                "#4b5563",
                            }}
                          >
                            Unit Price:{" "}
                            {formatMoney(
                              Number(
                                item.unitPrice ??
                                  0
                              )
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            fontWeight:
                              800,
                            whiteSpace:
                              "nowrap",
                            textAlign:
                              "right",
                          }}
                        >
                          {formatMoney(
                            Number(
                              item.totalPrice ??
                                0
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )
              )}
            </div>

            {/* ================================
                TOTAL
            ================================= */}
            <div
              style={{
                marginTop:
                  "24px",
                borderTop:
                  "1px solid #e5e7eb",
                paddingTop:
                  "18px",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  gap:
                    "20px",
                  fontSize:
                    "20px",
                  fontWeight:
                    800,
                  color:
                    "#1e3a8a",
                }}
              >
                <span>
                  Total
                </span>

                <span>
                  {formatMoney(
                    grandTotal
                  )}
                </span>
              </div>
            </div>

            {/* ================================
                NOTES
            ================================= */}
            {estimate.notes && (
              <div
                style={{
                  marginTop:
                    "26px",
                  padding:
                    "16px",
                  border:
                    "1px solid #fde68a",
                  borderRadius:
                    "12px",
                  background:
                    "#fffbeb",
                }}
              >
                <div
                  style={{
                    fontWeight:
                      800,
                    marginBottom:
                      "6px",
                  }}
                >
                  Notes
                </div>

                <div
                  style={{
                    whiteSpace:
                      "pre-wrap",
                    lineHeight:
                      1.6,
                    color:
                      "#4b5563",
                    fontSize:
                      "14px",
                  }}
                >
                  {
                    estimate.notes
                  }
                </div>
              </div>
            )}

            {/* ================================
                TERMS
            ================================= */}
            <div
              style={{
                marginTop:
                  "26px",
                fontSize:
                  "13px",
                lineHeight:
                  1.7,
                color:
                  "#6b7280",
              }}
            >
              <div
                style={{
                  fontWeight:
                    800,
                  color:
                    "#374151",
                  marginBottom:
                    "6px",
                }}
              >
                Quotation Notes
              </div>

              <div>
                Prices and product availability are subject to confirmation at the time of order.
              </div>

              <div>
                This quotation is not proof of payment.
              </div>

              <div>
                Delivery charges, where applicable, will be confirmed separately.
              </div>

              <div>
                Bulk and wholesale pricing may vary according to quantity and current stock.
              </div>
            </div>

            {/* ================================
                ACTIONS
            ================================= */}
            <div
              className="print:hidden"
              style={{
                marginTop:
                  "30px",
                display:
                  "flex",
                flexWrap:
                  "wrap",
                gap:
                  "10px",
                justifyContent:
                  "center",
              }}
            >
              <button
                type="button"
                onClick={undefined}
                style={{
                  display:
                    "none",
                }}
              />

              <a
                href={`/q/${token}/pdf`}
                style={{
                  display:
                    "inline-block",
                  padding:
                    "11px 18px",
                  borderRadius:
                    "8px",
                  background:
                    "#1e3a8a",
                  color:
                    "#ffffff",
                  textDecoration:
                    "none",
                  fontWeight:
                    700,
                }}
              >
                Download PDF
              </a>

              <a
                href="https://wa.me/233270030000"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display:
                    "inline-block",
                  padding:
                    "11px 18px",
                  borderRadius:
                    "8px",
                  background:
                    "#111827",
                  color:
                    "#ffffff",
                  textDecoration:
                    "none",
                  fontWeight:
                    700,
                }}
              >
                Contact on WhatsApp
              </a>
            </div>

            {/* ================================
                CUSTOMER CARE
            ================================= */}
            <div
              style={{
                marginTop:
                  "30px",
                padding:
                  "20px",
                background:
                  "#f9fafb",
                border:
                  "1px solid #e5e7eb",
                borderRadius:
                  "12px",
                textAlign:
                  "center",
              }}
            >
              <div
                style={{
                  fontWeight:
                    800,
                  marginBottom:
                    "8px",
                }}
              >
                Need help with this quotation?
              </div>

              <div
                style={{
                  color:
                    "#6b7280",
                  fontSize:
                    "14px",
                  lineHeight:
                    1.6,
                }}
              >
                Contact DeeGlobalGH if you need to confirm an item, quantity, price or availability.
              </div>

              <div
                style={{
                  marginTop:
                    "14px",
                  fontWeight:
                    700,
                }}
              >
                Customer Care: 0246 011 773
              </div>

              <div
                style={{
                  marginTop:
                    "4px",
                  fontWeight:
                    700,
                }}
              >
                WhatsApp: 027 003 0000
              </div>

              <div
                style={{
                  marginTop:
                    "4px",
                  fontWeight:
                    700,
                }}
              >
                Shop Line: 030 398 2358
              </div>
            </div>
          </div>

          <footer
            style={{
              borderTop:
                "1px solid #e5e7eb",
              padding:
                "20px 24px",
              textAlign:
                "center",
              color:
                "#6b7280",
              fontSize:
                "13px",
              lineHeight:
                1.7,
            }}
          >
            <div
              style={{
                fontWeight:
                  700,
                color:
                  "#374151",
              }}
            >
              DeeGlobalGH
            </div>

            <div>
              Kasoa New Market, Ghana
            </div>

            <div>
              www.shopdeeglobalgh.com
            </div>

            <div
              style={{
                marginTop:
                  "6px",
              }}
            >
              Keep this secure link for reference to your quotation.
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}

function Detail({
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
          color:
            "#6b7280",
          fontSize:
            "12px",
          fontWeight:
            700,
          textTransform:
            "uppercase",
          letterSpacing:
            "0.04em",
          marginBottom:
            "4px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize:
            "15px",
          fontWeight:
            600,
          overflowWrap:
            "anywhere",
        }}
      >
        {value}
      </div>
    </div>
  );
}
