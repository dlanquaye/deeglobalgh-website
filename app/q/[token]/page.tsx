import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quotation | DeeglobalGH",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

function formatMoney(
  amount: number
) {
  return new Intl.NumberFormat(
    "en-GH",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(amount);
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

export default async function PublicQuotationPage({
  params,
}: PageProps) {
  const { token } = await params;

  const estimate =
    await prisma.estimateRequest.findUnique({
      where: {
        publicToken: token,
      },
      select: {
        id: true,
        estimateNumber: true,
        status: true,

        customerName: true,
        phone: true,
        email: true,
        schoolName: true,
        className: true,
        academicYear: true,
        notes: true,

        estimatedTotal: true,

        createdAt: true,
        quotedAt: true,
        quotationDate: true,

        items: {
          orderBy: {
            lineNumber: "asc",
          },
          select: {
            id: true,
            lineNumber: true,
            quantity: true,
            description: true,
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
    estimate.estimatedTotal !=
      null
      ? Number(
          estimate.estimatedTotal
        )
      : calculatedTotal;

  const effectiveQuotationDate =
    estimate.quotationDate ??
    estimate.quotedAt ??
    estimate.createdAt;

  const whatsappMessage =
    encodeURIComponent(
      `Hello DeeglobalGH, I am contacting you about quotation ${estimate.estimateNumber}.`
    );

  return (
    <main
      style={{
        minHeight:
          "100vh",
        background:
          "#f3f4f6",
        padding:
          "24px 12px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
        color:
          "#111827",
      }}
    >
      <div
        style={{
          maxWidth:
            "850px",
          margin:
            "0 auto",
          background:
            "#ffffff",
          borderRadius:
            "16px",
          overflow:
            "hidden",
          boxShadow:
            "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        {/* ======================================
            HEADER
        ====================================== */}
        <div
          style={{
            padding:
              "28px 24px",
            borderBottom:
              "4px solid #1e3a8a",
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
              flexWrap:
                "wrap",
              gap:
                "24px",
            }}
          >
            <div>
              <img
                src="/products/deeglobalgh-logo.png"
                alt="DeeglobalGH"
                style={{
                  width:
                    "120px",
                  height:
                    "auto",
                  display:
                    "block",
                  marginBottom:
                    "12px",
                }}
              />

              <div
                style={{
                  fontSize:
                    "28px",
                  fontWeight:
                    800,
                  color:
                    "#1e3a8a",
                }}
              >
                DeeglobalGH
              </div>

              <div
                style={{
                  marginTop:
                    "5px",
                  color:
                    "#4b5563",
                  fontSize:
                    "14px",
                }}
              >
                Kasoa New Market
              </div>

              <div
                style={{
                  marginTop:
                    "5px",
                  color:
                    "#b7791f",
                  fontWeight:
                    700,
                  fontSize:
                    "13px",
                }}
              >
                Educational Books • School Supplies • Exam Essentials
              </div>
            </div>

            <div
              style={{
                textAlign:
                  "right",
                minWidth:
                  "240px",
              }}
            >
              <div
                style={{
                  fontSize:
                    "24px",
                  fontWeight:
                    800,
                  textTransform:
                    "uppercase",
                }}
              >
                Quotation
              </div>

              <div
                style={{
                  marginTop:
                    "3px",
                  color:
                    "#6b7280",
                  fontWeight:
                    700,
                }}
              >
                Proforma Invoice
              </div>

              <div
                style={{
                  marginTop:
                    "16px",
                  fontSize:
                    "14px",
                  lineHeight:
                    1.8,
                }}
              >
                <div>
                  <strong>
                    Estimate No:
                  </strong>{" "}
                  {
                    estimate.estimateNumber
                  }
                </div>

                <div>
                  <strong>
                    Date:
                  </strong>{" "}
                  {formatDate(
                    effectiveQuotationDate
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================
            CUSTOMER
        ====================================== */}
        <div
          style={{
            padding:
              "24px",
          }}
        >
          <div
            style={{
              border:
                "1px solid #e5e7eb",
              borderRadius:
                "12px",
              padding:
                "18px",
              background:
                "#f9fafb",
            }}
          >
            <div
              style={{
                color:
                  "#1e3a8a",
                fontSize:
                  "13px",
                fontWeight:
                  800,
                textTransform:
                  "uppercase",
                marginBottom:
                  "10px",
              }}
            >
              Quotation For
            </div>

            <div
              style={{
                lineHeight:
                  1.8,
                fontSize:
                  "14px",
              }}
            >
              <div>
                <strong>
                  Customer:
                </strong>{" "}
                {
                  estimate.customerName
                }
              </div>

              <div>
                <strong>
                  Phone:
                </strong>{" "}
                {estimate.phone}
              </div>

              {estimate.email && (
                <div>
                  <strong>
                    Email:
                  </strong>{" "}
                  {
                    estimate.email
                  }
                </div>
              )}

              {estimate.schoolName && (
                <div>
                  <strong>
                    School / Organisation:
                  </strong>{" "}
                  {
                    estimate.schoolName
                  }
                </div>
              )}

              {estimate.className && (
                <div>
                  <strong>
                    Class:
                  </strong>{" "}
                  {
                    estimate.className
                  }
                </div>
              )}

              {estimate.academicYear && (
                <div>
                  <strong>
                    Academic Year:
                  </strong>{" "}
                  {
                    estimate.academicYear
                  }
                </div>
              )}
            </div>
          </div>

          {/* ====================================
              ITEMS
          ==================================== */}
          <div
            style={{
              marginTop:
                "28px",
            }}
          >
            <div
              style={{
                fontSize:
                  "18px",
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
                overflowX:
                  "auto",
              }}
            >
              <table
                style={{
                  width:
                    "100%",
                  borderCollapse:
                    "collapse",
                  minWidth:
                    "620px",
                  fontSize:
                    "14px",
                }}
              >
                <thead
                  style={{
                    background:
                      "#1e3a8a",
                    color:
                      "#ffffff",
                  }}
                >
                  <tr>
                    <th
                      style={{
                        padding:
                          "12px",
                        textAlign:
                          "left",
                      }}
                    >
                      #
                    </th>

                    <th
                      style={{
                        padding:
                          "12px",
                        textAlign:
                          "left",
                      }}
                    >
                      Description
                    </th>

                    <th
                      style={{
                        padding:
                          "12px",
                        textAlign:
                          "right",
                      }}
                    >
                      Qty
                    </th>

                    <th
                      style={{
                        padding:
                          "12px",
                        textAlign:
                          "right",
                      }}
                    >
                      Unit Price
                    </th>

                    <th
                      style={{
                        padding:
                          "12px",
                        textAlign:
                          "right",
                      }}
                    >
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {estimate.items.map(
                    (
                      item
                    ) => {
                      const unitPrice =
                        Number(
                          item.unitPrice ??
                            0
                        );

                      const totalPrice =
                        Number(
                          item.totalPrice ??
                            0
                        );

                      return (
                        <tr
                          key={
                            item.id
                          }
                          style={{
                            borderTop:
                              "1px solid #e5e7eb",
                          }}
                        >
                          <td
                            style={{
                              padding:
                                "12px",
                              verticalAlign:
                                "top",
                            }}
                          >
                            {
                              item.lineNumber
                            }
                          </td>

                          <td
                            style={{
                              padding:
                                "12px",
                              verticalAlign:
                                "top",
                            }}
                          >
                            <div
                              style={{
                                fontWeight:
                                  700,
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
                                  marginTop:
                                    "4px",
                                  color:
                                    "#6b7280",
                                  fontSize:
                                    "12px",
                                }}
                              >
                                SKU:{" "}
                                {
                                  item.product
                                    .sku
                                }
                              </div>
                            )}
                          </td>

                          <td
                            style={{
                              padding:
                                "12px",
                              textAlign:
                                "right",
                              verticalAlign:
                                "top",
                            }}
                          >
                            {
                              item.quantity
                            }
                          </td>

                          <td
                            style={{
                              padding:
                                "12px",
                              textAlign:
                                "right",
                              verticalAlign:
                                "top",
                            }}
                          >
                            GHS{" "}
                            {formatMoney(
                              unitPrice
                            )}
                          </td>

                          <td
                            style={{
                              padding:
                                "12px",
                              textAlign:
                                "right",
                              fontWeight:
                                700,
                              verticalAlign:
                                "top",
                            }}
                          >
                            GHS{" "}
                            {formatMoney(
                              totalPrice
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ====================================
              TOTAL
          ==================================== */}
          <div
            style={{
              marginTop:
                "24px",
              display:
                "flex",
              justifyContent:
                "flex-end",
            }}
          >
            <div
              style={{
                width:
                  "100%",
                maxWidth:
                  "340px",
                borderBottom:
                  "3px solid #1e3a8a",
                paddingBottom:
                  "12px",
                display:
                  "flex",
                justifyContent:
                  "space-between",
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
                GHS{" "}
                {formatMoney(
                  grandTotal
                )}
              </span>
            </div>
          </div>

          {/* ====================================
              NOTES
          ==================================== */}
          {estimate.notes && (
            <div
              style={{
                marginTop:
                  "28px",
                padding:
                  "18px",
                border:
                  "1px solid #fde68a",
                borderRadius:
                  "12px",
                background:
                  "#fffbeb",
                fontSize:
                  "14px",
                lineHeight:
                  1.7,
              }}
            >
              <strong>
                Notes
              </strong>

              <div
                style={{
                  marginTop:
                    "8px",
                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {estimate.notes}
              </div>
            </div>
          )}

          {/* ====================================
              TERMS
          ==================================== */}
          <div
            style={{
              marginTop:
                "28px",
              fontSize:
                "14px",
              lineHeight:
                1.7,
              color:
                "#4b5563",
            }}
          >
            <strong
              style={{
                color:
                  "#111827",
              }}
            >
              Quotation Notes
            </strong>

            <ul
              style={{
                paddingLeft:
                  "20px",
              }}
            >
              <li>
                Prices and product availability are subject to confirmation at the time of order.
              </li>

              <li>
                This quotation does not constitute proof of payment.
              </li>

              <li>
                Delivery charges, where applicable, will be confirmed separately.
              </li>

              <li>
                Bulk and wholesale pricing may vary according to quantity and current stock.
              </li>
            </ul>
          </div>

          {/* ====================================
              ACTIONS
          ==================================== */}
          <div
            style={{
              marginTop:
                "28px",
              display:
                "flex",
              flexWrap:
                "wrap",
              gap:
                "12px",
            }}
          >
            <a
              href={`/q/${token}/pdf`}
              style={{
                display:
                  "inline-block",
                padding:
                  "12px 18px",
                borderRadius:
                  "9px",
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
              href={`/q/${token}/docx`}
              style={{
                display:
                  "inline-block",
                padding:
                  "12px 18px",
                borderRadius:
                  "9px",
                background:
                  "#374151",
                color:
                  "#ffffff",
                textDecoration:
                  "none",
                fontWeight:
                  700,
              }}
            >
              Download Word
            </a>

            <a
              href={`https://wa.me/233270030000?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display:
                  "inline-block",
                padding:
                  "12px 18px",
                borderRadius:
                  "9px",
                background:
                  "#166534",
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
        </div>

        {/* ======================================
            FOOTER
        ====================================== */}
        <footer
          style={{
            borderTop:
              "1px solid #e5e7eb",
            padding:
              "22px 24px",
            fontSize:
              "13px",
            color:
              "#4b5563",
            lineHeight:
              1.8,
          }}
        >
          <div
            style={{
              fontWeight:
                800,
              fontSize:
                "16px",
              color:
                "#1e3a8a",
            }}
          >
            DeeglobalGH
          </div>

          <div>
            WhatsApp: 027 003 0000
          </div>

          <div>
            Customer Care: 0246 011 773
          </div>

          <div>
            Shop Line: 030 398 2358
          </div>

          <div
            style={{
              marginTop:
                "8px",
              fontSize:
                "12px",
              color:
                "#6b7280",
            }}
          >
            This quotation is provided for customer reference and is not proof of payment.
          </div>
        </footer>
      </div>
    </main>
  );
}
