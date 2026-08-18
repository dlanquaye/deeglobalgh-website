import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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

function safeText(
  value: string | null | undefined
) {
  return (
    value
      ?.replace(/\s+/g, " ")
      .trim() ?? ""
  );
}

function tableCell(
  text: string,
  options?: {
    bold?: boolean;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    shading?: string;
  }
) {
  return new TableCell({
    shading: options?.shading
      ? {
          type: ShadingType.CLEAR,
          fill: options.shading,
        }
      : undefined,

    margins: {
      top: 120,
      bottom: 120,
      left: 120,
      right: 120,
    },

    children: [
      new Paragraph({
        alignment:
          options?.alignment ??
          AlignmentType.LEFT,

        children: [
          new TextRun({
            text,
            bold:
              options?.bold ??
              false,
            size: 20,
          }),
        ],
      }),
    ],
  });
}

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      token: string;
    }>;
  }
) {
  const { token } =
    await context.params;

  const estimate =
    await prisma.estimateRequest.findUnique({
      where: {
        publicToken: token,
      },

      select: {
        estimateNumber: true,

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
    return new Response(
      "Quotation not found.",
      {
        status: 404,
      }
    );
  }

  const effectiveQuotationDate =
    estimate.quotationDate ??
    estimate.quotedAt ??
    estimate.createdAt;

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

  const itemRows =
    estimate.items.map(
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

        const name =
          item.product
            ?.name ??
          item.description;

        const description =
          item.product?.sku
            ? `${safeText(
                name
              )}\nSKU: ${safeText(
                item.product.sku
              )}`
            : safeText(
                name
              );

        return new TableRow({
          children: [
            tableCell(
              String(
                item.lineNumber
              )
            ),

            tableCell(
              description
            ),

            tableCell(
              String(
                item.quantity
              ),
              {
                alignment:
                  AlignmentType.RIGHT,
              }
            ),

            tableCell(
              `GHS ${formatMoney(
                unitPrice
              )}`,
              {
                alignment:
                  AlignmentType.RIGHT,
              }
            ),

            tableCell(
              `GHS ${formatMoney(
                totalPrice
              )}`,
              {
                alignment:
                  AlignmentType.RIGHT,
                bold:
                  true,
              }
            ),
          ],
        });
      }
    );

  const customerLines = [
    `Customer: ${safeText(
      estimate.customerName
    )}`,
    `Phone: ${safeText(
      estimate.phone
    )}`,
  ];

  if (
    estimate.email
  ) {
    customerLines.push(
      `Email: ${safeText(
        estimate.email
      )}`
    );
  }

  if (
    estimate.schoolName
  ) {
    customerLines.push(
      `School / Organisation: ${safeText(
        estimate.schoolName
      )}`
    );
  }

  if (
    estimate.className
  ) {
    customerLines.push(
      `Class: ${safeText(
        estimate.className
      )}`
    );
  }

  if (
    estimate.academicYear
  ) {
    customerLines.push(
      `Academic Year: ${safeText(
        estimate.academicYear
      )}`
    );
  }

  const doc =
    new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },

          children: [
            new Paragraph({
              alignment:
                AlignmentType.LEFT,
              children: [
                new TextRun({
                  text:
                    "DeeglobalGH",
                  bold: true,
                  size: 36,
                  color:
                    "1E3A8A",
                }),
              ],
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text:
                    "Kasoa New Market",
                  size: 20,
                }),
              ],
            }),

            new Paragraph({
              spacing: {
                after: 220,
              },
              children: [
                new TextRun({
                  text:
                    "Educational Books - School Supplies - Exam Essentials",
                  bold: true,
                  size: 18,
                  color:
                    "B7791F",
                }),
              ],
            }),

            new Paragraph({
              alignment:
                AlignmentType.RIGHT,
              heading:
                HeadingLevel.HEADING_1,
              children: [
                new TextRun({
                  text:
                    "QUOTATION / PROFORMA INVOICE",
                  bold: true,
                  color:
                    "1E3A8A",
                }),
              ],
            }),

            new Paragraph({
              alignment:
                AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text:
                    `Estimate No: ${estimate.estimateNumber}`,
                  bold: true,
                }),
              ],
            }),

            new Paragraph({
              alignment:
                AlignmentType.RIGHT,
              spacing: {
                after: 260,
              },
              children: [
                new TextRun({
                  text:
                    `Date: ${formatDate(
                      effectiveQuotationDate
                    )}`,
                }),
              ],
            }),

            new Paragraph({
              spacing: {
                after: 120,
              },
              children: [
                new TextRun({
                  text:
                    "QUOTATION FOR",
                  bold: true,
                  color:
                    "1E3A8A",
                }),
              ],
            }),

            ...customerLines.map(
              (
                line
              ) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text:
                        line,
                      size: 20,
                    }),
                  ],
                })
            ),

            new Paragraph({
              spacing: {
                before: 300,
                after: 140,
              },
              children: [
                new TextRun({
                  text:
                    "Quotation Items",
                  bold: true,
                  size: 26,
                }),
              ],
            }),

            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },

              borders: {
                top: {
                  style:
                    BorderStyle.SINGLE,
                  size: 1,
                  color:
                    "D1D5DB",
                },
                bottom: {
                  style:
                    BorderStyle.SINGLE,
                  size: 1,
                  color:
                    "D1D5DB",
                },
                left: {
                  style:
                    BorderStyle.SINGLE,
                  size: 1,
                  color:
                    "D1D5DB",
                },
                right: {
                  style:
                    BorderStyle.SINGLE,
                  size: 1,
                  color:
                    "D1D5DB",
                },
                insideHorizontal: {
                  style:
                    BorderStyle.SINGLE,
                  size: 1,
                  color:
                    "E5E7EB",
                },
                insideVertical: {
                  style:
                    BorderStyle.SINGLE,
                  size: 1,
                  color:
                    "E5E7EB",
                },
              },

              rows: [
                new TableRow({
                  tableHeader:
                    true,

                  children: [
                    tableCell(
                      "#",
                      {
                        bold:
                          true,
                        shading:
                          "1E3A8A",
                      }
                    ),

                    tableCell(
                      "Description",
                      {
                        bold:
                          true,
                        shading:
                          "1E3A8A",
                      }
                    ),

                    tableCell(
                      "Qty",
                      {
                        bold:
                          true,
                        alignment:
                          AlignmentType.RIGHT,
                        shading:
                          "1E3A8A",
                      }
                    ),

                    tableCell(
                      "Unit Price",
                      {
                        bold:
                          true,
                        alignment:
                          AlignmentType.RIGHT,
                        shading:
                          "1E3A8A",
                      }
                    ),

                    tableCell(
                      "Amount",
                      {
                        bold:
                          true,
                        alignment:
                          AlignmentType.RIGHT,
                        shading:
                          "1E3A8A",
                      }
                    ),
                  ],
                }),

                ...itemRows,
              ],
            }),

            new Paragraph({
              alignment:
                AlignmentType.RIGHT,
              spacing: {
                before: 260,
              },
              children: [
                new TextRun({
                  text:
                    "TOTAL",
                  bold: true,
                  size: 26,
                  color:
                    "1E3A8A",
                }),

                new TextRun({
                  text:
                    `     GHS ${formatMoney(
                      grandTotal
                    )}`,
                  bold: true,
                  size: 26,
                  color:
                    "1E3A8A",
                }),
              ],
            }),

            ...(estimate.notes
              ? [
                  new Paragraph({
                    spacing: {
                      before: 320,
                      after: 100,
                    },
                    children: [
                      new TextRun({
                        text:
                          "NOTES",
                        bold: true,
                        color:
                          "1E3A8A",
                      }),
                    ],
                  }),

                  new Paragraph({
                    children: [
                      new TextRun({
                        text:
                          safeText(
                            estimate.notes
                          ),
                      }),
                    ],
                  }),
                ]
              : []),

            new Paragraph({
              spacing: {
                before: 320,
                after: 120,
              },
              children: [
                new TextRun({
                  text:
                    "QUOTATION NOTES",
                  bold: true,
                  color:
                    "1E3A8A",
                }),
              ],
            }),

            ...[
              "Prices and product availability are subject to confirmation at the time of order.",
              "This quotation does not constitute proof of payment.",
              "Delivery charges, where applicable, will be confirmed separately.",
              "Bulk and wholesale pricing may vary according to quantity and current stock.",
            ].map(
              (
                note
              ) =>
                new Paragraph({
                  bullet: {
                    level: 0,
                  },
                  children: [
                    new TextRun({
                      text:
                        note,
                    }),
                  ],
                })
            ),

            new Paragraph({
              spacing: {
                before: 320,
              },
              children: [
                new TextRun({
                  text:
                    "DeeglobalGH",
                  bold: true,
                  size: 24,
                  color:
                    "1E3A8A",
                }),
              ],
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text:
                    "WhatsApp: 027 003 0000 | Customer Care: 0246 011 773 | Shop Line: 030 398 2358",
                  size: 18,
                }),
              ],
            }),

            new Paragraph({
              spacing: {
                before: 100,
              },
              children: [
                new TextRun({
                  text:
                    "Thank you for requesting a quotation from DeeglobalGH.",
                  italics:
                    true,
                  size: 18,
                }),
              ],
            }),
          ],
        },
      ],
    });

  const buffer =
    await Packer.toBuffer(
      doc
    );

  const body =
    buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset +
        buffer.byteLength
    ) as ArrayBuffer;

  const filename =
    `DeeGlobalGH-${safeText(
      estimate.estimateNumber
    )}-Quotation.docx`;

  return new Response(
    body,
    {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        "Content-Disposition":
          `attachment; filename="${filename}"`,

        "Cache-Control":
          "no-store, max-age=0",

        "X-Robots-Tag":
          "noindex, nofollow, noarchive",
      },
    }
  );
}
