import { NextResponse } from "next/server";
import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

const MARGIN_X = 48;
const MARGIN_TOP = 54;
const MARGIN_BOTTOM = 54;

const FONT_SIZE_BODY = 10;
const FONT_SIZE_SMALL = 8.5;
const FONT_SIZE_HEADING = 13;
const FONT_SIZE_TITLE = 20;

const LINE_HEIGHT = 15;

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

function safeText(
  value:
    | string
    | null
    | undefined
) {
  return value?.trim() || "-";
}

function wrapText(
  text: string,
  maxWidth: number,
  font: any,
  fontSize: number
) {
  const words =
    text.split(/\s+/);

  const lines:
    string[] = [];

  let current = "";

  for (const word of words) {
    const test =
      current
        ? `${current} ${word}`
        : word;

    const width =
      font.widthOfTextAtSize(
        test,
        fontSize
      );

    if (
      width <= maxWidth
    ) {
      current = test;
    } else {
      if (current) {
        lines.push(
          current
        );
      }

      current = word;
    }
  }

  if (current) {
    lines.push(
      current
    );
  }

  return lines.length
    ? lines
    : [""];
}

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      token: string;
    }>;
  }
) {
  try {
    const { token } =
      await context.params;

    if (!token?.trim()) {
      return NextResponse.json(
        {
          error:
            "Quotation token is required.",
        },
        {
          status: 400,
        }
      );
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
      return NextResponse.json(
        {
          error:
            "Quotation not found.",
        },
        {
          status: 404,
        }
      );
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

    const pdf =
      await PDFDocument.create();

    const font =
      await pdf.embedFont(
        StandardFonts.Helvetica
      );

    const bold =
      await pdf.embedFont(
        StandardFonts.HelveticaBold
      );

    let page =
      pdf.addPage([
        PAGE_WIDTH,
        PAGE_HEIGHT,
      ]);

    let y =
      PAGE_HEIGHT -
      MARGIN_TOP;

    function ensureSpace(
      requiredHeight: number
    ) {
      if (
        y -
          requiredHeight <
        MARGIN_BOTTOM
      ) {
        page =
          pdf.addPage([
            PAGE_WIDTH,
            PAGE_HEIGHT,
          ]);

        y =
          PAGE_HEIGHT -
          MARGIN_TOP;
      }
    }

    function drawText(
      text: string,
      options?: {
        x?: number;
        size?: number;
        bold?: boolean;
        colour?: {
          r: number;
          g: number;
          b: number;
        };
      }
    ) {
      const size =
        options?.size ??
        FONT_SIZE_BODY;

      const selectedFont =
        options?.bold
          ? bold
          : font;

      const colour =
        options?.colour
          ? rgb(
              options.colour.r,
              options.colour.g,
              options.colour.b
            )
          : rgb(
              0.16,
              0.16,
              0.18
            );

      page.drawText(
        text,
        {
          x:
            options?.x ??
            MARGIN_X,

          y,

          size,

          font:
            selectedFont,

          color:
            colour,
        }
      );
    }

    function drawWrapped(
      text: string,
      maxWidth: number,
      options?: {
        x?: number;
        size?: number;
        bold?: boolean;
      }
    ) {
      const size =
        options?.size ??
        FONT_SIZE_BODY;

      const selectedFont =
        options?.bold
          ? bold
          : font;

      const lines =
        wrapText(
          text,
          maxWidth,
          selectedFont,
          size
        );

      for (
        const line of lines
      ) {
        ensureSpace(
          LINE_HEIGHT
        );

        page.drawText(
          line,
          {
            x:
              options?.x ??
              MARGIN_X,

            y,

            size,

            font:
              selectedFont,

            color:
              rgb(
                0.16,
                0.16,
                0.18
              ),
          }
        );

        y -=
          LINE_HEIGHT;
      }
    }

    // ======================================
    // HEADER
    // ======================================
    drawText(
      "DeeGlobalGH",
      {
        size:
          FONT_SIZE_TITLE,
        bold:
          true,
        colour: {
          r: 0.12,
          g: 0.23,
          b: 0.54,
        },
      }
    );

    y -= 20;

    drawText(
      "Kasoa New Market, Ghana",
      {
        size:
          FONT_SIZE_SMALL,
      }
    );

    y -= 14;

    drawText(
      "Educational Books • School Supplies • Exam Essentials",
      {
        size:
          FONT_SIZE_SMALL,
      }
    );

    y -= 28;

    drawText(
      "QUOTATION / PROFORMA INVOICE",
      {
        size:
          FONT_SIZE_HEADING,
        bold:
          true,
      }
    );

    y -= 22;

    page.drawLine({
      start: {
        x:
          MARGIN_X,
        y,
      },

      end: {
        x:
          PAGE_WIDTH -
          MARGIN_X,
        y,
      },

      thickness:
        1,

      color:
        rgb(
          0.82,
          0.84,
          0.87
        ),
    });

    y -= 22;

    // ======================================
    // REFERENCE
    // ======================================
    drawText(
      `Quotation: ${estimate.estimateNumber}`,
      {
        bold:
          true,
      }
    );

    y -= 16;

    drawText(
      `Date: ${formatDate(
        estimate.createdAt
      )}`
    );

    y -= 16;

    drawText(
      `Status: ${estimate.status}`
    );

    y -= 26;

    // ======================================
    // CUSTOMER
    // ======================================
    drawText(
      "CUSTOMER DETAILS",
      {
        bold:
          true,
        size:
          FONT_SIZE_HEADING,
      }
    );

    y -= 18;

    drawText(
      `Customer: ${safeText(
        estimate.customerName
      )}`
    );

    y -= 15;

    drawText(
      `Phone: ${safeText(
        estimate.phone
      )}`
    );

    y -= 15;

    if (
      estimate.email
    ) {
      drawText(
        `Email: ${estimate.email}`
      );

      y -= 15;
    }

    if (
      estimate.schoolName
    ) {
      drawWrapped(
        `School / Organisation: ${estimate.schoolName}`,
        PAGE_WIDTH -
          MARGIN_X * 2
      );
    }

    if (
      estimate.className
    ) {
      drawText(
        `Class: ${estimate.className}`
      );

      y -= 15;
    }

    if (
      estimate.academicYear
    ) {
      drawText(
        `Academic Year: ${estimate.academicYear}`
      );

      y -= 15;
    }

    y -= 14;

    // ======================================
    // ITEMS
    // ======================================
    drawText(
      "QUOTATION ITEMS",
      {
        bold:
          true,
        size:
          FONT_SIZE_HEADING,
      }
    );

    y -= 20;

    if (
      estimate.items.length ===
      0
    ) {
      drawText(
        "No quotation items are available."
      );

      y -= 18;
    } else {
      for (
        const item of
        estimate.items
      ) {
        ensureSpace(
          70
        );

        const itemName =
          item.product?.name ??
          item.description;

        drawWrapped(
          `${item.lineNumber}. ${itemName}`,
          330,
          {
            bold:
              true,
          }
        );

        if (
          item.product?.sku
        ) {
          drawText(
            `SKU: ${item.product.sku}`,
            {
              x:
                MARGIN_X +
                14,
              size:
                FONT_SIZE_SMALL,
            }
          );

          y -= 13;
        }

        drawText(
          `Qty: ${item.quantity}`,
          {
            x:
              MARGIN_X +
              14,
            size:
              FONT_SIZE_SMALL,
          }
        );

        y -= 13;

        drawText(
          `Unit Price: ${formatMoney(
            Number(
              item.unitPrice ??
                0
            )
          )}`,
          {
            x:
              MARGIN_X +
              14,
            size:
              FONT_SIZE_SMALL,
          }
        );

        const lineTotal =
          formatMoney(
            Number(
              item.totalPrice ??
                0
            )
          );

        const width =
          bold.widthOfTextAtSize(
            lineTotal,
            FONT_SIZE_BODY
          );

        page.drawText(
          lineTotal,
          {
            x:
              PAGE_WIDTH -
              MARGIN_X -
              width,

            y:
              y +
              13,

            size:
              FONT_SIZE_BODY,

            font:
              bold,

            color:
              rgb(
                0.16,
                0.16,
                0.18
              ),
          }
        );

        y -= 20;

        page.drawLine({
          start: {
            x:
              MARGIN_X,
            y,
          },

          end: {
            x:
              PAGE_WIDTH -
              MARGIN_X,
            y,
          },

          thickness:
            0.5,

          color:
            rgb(
              0.88,
              0.89,
              0.91
            ),
        });

        y -= 14;
      }
    }

    ensureSpace(
      80
    );

    // ======================================
    // TOTAL
    // ======================================
    y -= 6;

    const totalText =
      `TOTAL: ${formatMoney(
        grandTotal
      )}`;

    const totalWidth =
      bold.widthOfTextAtSize(
        totalText,
        15
      );

    page.drawText(
      totalText,
      {
        x:
          PAGE_WIDTH -
          MARGIN_X -
          totalWidth,

        y,

        size:
          15,

        font:
          bold,

        color:
          rgb(
            0.12,
            0.23,
            0.54
          ),
      }
    );

    y -= 32;

    // ======================================
    // NOTES
    // ======================================
    if (
      estimate.notes
    ) {
      ensureSpace(
        80
      );

      drawText(
        "NOTES",
        {
          bold:
            true,
          size:
            FONT_SIZE_HEADING,
        }
      );

      y -= 18;

      drawWrapped(
        estimate.notes,
        PAGE_WIDTH -
          MARGIN_X * 2
      );

      y -= 10;
    }

    // ======================================
    // TERMS
    // ======================================
    ensureSpace(
      120
    );

    drawText(
      "QUOTATION NOTES",
      {
        bold:
          true,
        size:
          FONT_SIZE_HEADING,
      }
    );

    y -= 18;

    const notes = [
      "Prices and product availability are subject to confirmation at the time of order.",
      "This quotation is not proof of payment.",
      "Delivery charges, where applicable, will be confirmed separately.",
      "Bulk and wholesale pricing may vary according to quantity and current stock.",
    ];

    for (
      const note of notes
    ) {
      drawWrapped(
        `• ${note}`,
        PAGE_WIDTH -
          MARGIN_X * 2,
        {
          size:
            FONT_SIZE_SMALL,
        }
      );

      y -= 3;
    }

    ensureSpace(
      90
    );

    y -= 8;

    page.drawLine({
      start: {
        x:
          MARGIN_X,
        y,
      },

      end: {
        x:
          PAGE_WIDTH -
          MARGIN_X,
        y,
      },

      thickness:
        1,

      color:
        rgb(
          0.82,
          0.84,
          0.87
        ),
    });

    y -= 20;

    drawText(
      "DeeGlobalGH",
      {
        bold:
          true,
        colour: {
          r: 0.12,
          g: 0.23,
          b: 0.54,
        },
      }
    );

    y -= 15;

    drawText(
      "WhatsApp: 027 003 0000",
      {
        size:
          FONT_SIZE_SMALL,
      }
    );

    y -= 13;

    drawText(
      "Customer Care: 0246 011 773",
      {
        size:
          FONT_SIZE_SMALL,
      }
    );

    y -= 13;

    drawText(
      "Shop Line: 030 398 2358",
      {
        size:
          FONT_SIZE_SMALL,
      }
    );

    y -= 13;

    drawText(
      "www.shopdeeglobalgh.com",
      {
        size:
          FONT_SIZE_SMALL,
      }
    );

    const bytes =
      await pdf.save();

    const filename =
      `DeeGlobalGH-${estimate.estimateNumber}-Quotation.pdf`;

    return new NextResponse(
      Buffer.from(bytes),
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `attachment; filename="${filename}"`,

          "Cache-Control":
            "private, no-store, max-age=0",

          "X-Robots-Tag":
            "noindex, nofollow, noarchive",
        },
      }
    );
  } catch (error) {
    console.error(
      "Quotation PDF generation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to generate quotation PDF.",
      },
      {
        status: 500,
      }
    );
  }
}
