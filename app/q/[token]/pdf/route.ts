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
const TOP_Y = PAGE_HEIGHT - 48;
const BOTTOM_MARGIN = 54;

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
      ?.replace(/[^\x20-\x7E]/g, " ")
      .replace(/\s+/g, " ")
      .trim() ?? ""
  );
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

  const pdf =
    await PDFDocument.create();

  const regular =
    await pdf.embedFont(
      StandardFonts.Helvetica
    );

  const bold =
    await pdf.embedFont(
      StandardFonts.HelveticaBold
    );

  const navy =
    rgb(
      0.12,
      0.23,
      0.54
    );

  const grey =
    rgb(
      0.35,
      0.38,
      0.43
    );

  const lightGrey =
    rgb(
      0.93,
      0.94,
      0.96
    );

  let page =
    pdf.addPage([
      PAGE_WIDTH,
      PAGE_HEIGHT,
    ]);

  let y = TOP_Y;

  function ensureSpace(
    requiredHeight: number
  ) {
    if (
      y - requiredHeight >=
      BOTTOM_MARGIN
    ) {
      return;
    }

    page =
      pdf.addPage([
        PAGE_WIDTH,
        PAGE_HEIGHT,
      ]);

    y = TOP_Y;
  }

  function drawText(
    text: string,
    x: number,
    size = 10,
    font = regular
  ) {
    page.drawText(
      safeText(text),
      {
        x,
        y,
        size,
        font,
        color:
          rgb(
            0.08,
            0.09,
            0.11
          ),
      }
    );
  }

  function drawRightText(
    text: string,
    rightX: number,
    size = 10,
    font = regular
  ) {
    const cleaned =
      safeText(text);

    const width =
      font.widthOfTextAtSize(
        cleaned,
        size
      );

    page.drawText(
      cleaned,
      {
        x:
          rightX -
          width,
        y,
        size,
        font,
        color:
          rgb(
            0.08,
            0.09,
            0.11
          ),
      }
    );
  }

  function drawWrappedText(
    text: string,
    options: {
      x: number;
      width: number;
      size?: number;
      lineHeight?: number;
      font?: typeof regular;
      colour?: ReturnType<
        typeof rgb
      >;
    }
  ) {
    const size =
      options.size ?? 10;

    const lineHeight =
      options.lineHeight ??
      14;

    const font =
      options.font ??
      regular;

    const colour =
      options.colour ??
      rgb(
        0.08,
        0.09,
        0.11
      );

    const words =
      safeText(text).split(
        " "
      );

    let line = "";

    for (
      const word of words
    ) {
      const testLine =
        line
          ? `${line} ${word}`
          : word;

      const width =
        font.widthOfTextAtSize(
          testLine,
          size
        );

      if (
        width >
          options.width &&
        line
      ) {
        ensureSpace(
          lineHeight
        );

        page.drawText(
          line,
          {
            x:
              options.x,
            y,
            size,
            font,
            color:
              colour,
          }
        );

        y -=
          lineHeight;

        line =
          word;
      } else {
        line =
          testLine;
      }
    }

    if (line) {
      ensureSpace(
        lineHeight
      );

      page.drawText(
        line,
        {
          x:
            options.x,
          y,
          size,
          font,
          color:
            colour,
        }
      );

      y -=
        lineHeight;
    }
  }

  // ==========================================
  // HEADER
  // ==========================================
  page.drawText(
    "DeeglobalGH",
    {
      x:
        MARGIN_X,
      y,
      size:
        22,
      font:
        bold,
      color:
        navy,
    }
  );

  y -= 20;

  page.drawText(
    "Kasoa New Market",
    {
      x:
        MARGIN_X,
      y,
      size:
        10,
      font:
        regular,
      color:
        grey,
    }
  );

  y -= 16;

  page.drawText(
    "Educational Books - School Supplies - Exam Essentials",
    {
      x:
        MARGIN_X,
      y,
      size:
        9,
      font:
        bold,
      color:
        rgb(
          0.72,
          0.48,
          0.10
        ),
    }
  );

  const title =
    "QUOTATION / PROFORMA INVOICE";

  const titleWidth =
    bold.widthOfTextAtSize(
      title,
      15
    );

  page.drawText(
    title,
    {
      x:
        PAGE_WIDTH -
        MARGIN_X -
        titleWidth,
      y:
        TOP_Y,
      size:
        15,
      font:
        bold,
      color:
        navy,
    }
  );

  const estimateLabel =
    `Estimate No: ${estimate.estimateNumber}`;

  const estimateWidth =
    regular.widthOfTextAtSize(
      estimateLabel,
      9
    );

  page.drawText(
    estimateLabel,
    {
      x:
        PAGE_WIDTH -
        MARGIN_X -
        estimateWidth,
      y:
        TOP_Y -
        22,
      size:
        9,
      font:
        regular,
    }
  );

  const dateLabel =
    `Date: ${formatDate(
      effectiveQuotationDate
    )}`;

  const dateWidth =
    regular.widthOfTextAtSize(
      dateLabel,
      9
    );

  page.drawText(
    dateLabel,
    {
      x:
        PAGE_WIDTH -
        MARGIN_X -
        dateWidth,
      y:
        TOP_Y -
        38,
      size:
        9,
      font:
        regular,
    }
  );

  y -= 16;

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
      1.5,

    color:
      navy,
  });

  y -= 28;

  // ==========================================
  // CUSTOMER DETAILS
  // ==========================================
  page.drawText(
    "QUOTATION FOR",
    {
      x:
        MARGIN_X,
      y,
      size:
        10,
      font:
        bold,
      color:
        navy,
    }
  );

  y -= 18;

  drawText(
    `Customer: ${estimate.customerName}`,
    MARGIN_X
  );

  y -= 14;

  drawText(
    `Phone: ${estimate.phone}`,
    MARGIN_X
  );

  if (
    estimate.email
  ) {
    y -= 14;

    drawText(
      `Email: ${estimate.email}`,
      MARGIN_X
    );
  }

  if (
    estimate.schoolName
  ) {
    y -= 14;

    drawText(
      `School / Organisation: ${estimate.schoolName}`,
      MARGIN_X
    );
  }

  if (
    estimate.className
  ) {
    y -= 14;

    drawText(
      `Class: ${estimate.className}`,
      MARGIN_X
    );
  }

  if (
    estimate.academicYear
  ) {
    y -= 14;

    drawText(
      `Academic Year: ${estimate.academicYear}`,
      MARGIN_X
    );
  }

  y -= 28;

  // ==========================================
  // ITEM HEADER
  // ==========================================
  ensureSpace(
    50
  );

  page.drawRectangle({
    x:
      MARGIN_X,
    y:
      y - 5,
    width:
      PAGE_WIDTH -
      MARGIN_X * 2,
    height:
      24,
    color:
      navy,
  });

  const headerY =
    y + 3;

  page.drawText(
    "#",
    {
      x:
        MARGIN_X +
        8,
      y:
        headerY,
      size:
        9,
      font:
        bold,
      color:
        rgb(
          1,
          1,
          1
        ),
    }
  );

  page.drawText(
    "Description",
    {
      x:
        MARGIN_X +
        30,
      y:
        headerY,
      size:
        9,
      font:
        bold,
      color:
        rgb(
          1,
          1,
          1
        ),
    }
  );

  page.drawText(
    "Qty",
    {
      x:
        390,
      y:
        headerY,
      size:
        9,
      font:
        bold,
      color:
        rgb(
          1,
          1,
          1
        ),
    }
  );

  page.drawText(
    "Unit",
    {
      x:
        435,
      y:
        headerY,
      size:
        9,
      font:
        bold,
      color:
        rgb(
          1,
          1,
          1
        ),
    }
  );

  page.drawText(
    "Amount",
    {
      x:
        500,
      y:
        headerY,
      size:
        9,
      font:
        bold,
      color:
        rgb(
          1,
          1,
          1
        ),
    }
  );

  y -= 28;

  // ==========================================
  // ITEMS
  // ==========================================
  for (
    const item of
    estimate.items
  ) {
    ensureSpace(
      46
    );

    const itemName =
      item.product
        ?.name ??
      item.description;

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

    drawText(
      String(
        item.lineNumber
      ),
      MARGIN_X +
        8,
      9
    );

    drawWrappedText(
      itemName,
      {
        x:
          MARGIN_X +
          30,
        width:
          280,
        size:
          9,
        lineHeight:
          12,
        font:
          bold,
      }
    );

    const itemBaseY =
      y + 12;

    page.drawText(
      String(
        item.quantity
      ),
      {
        x:
          390,
        y:
          itemBaseY,
        size:
          9,
        font:
          regular,
      }
    );

    const unitText =
      formatMoney(
        unitPrice
      );

    const unitWidth =
      regular.widthOfTextAtSize(
        unitText,
        9
      );

    page.drawText(
      unitText,
      {
        x:
          475 -
          unitWidth,
        y:
          itemBaseY,
        size:
          9,
        font:
          regular,
      }
    );

    const totalText =
      formatMoney(
        totalPrice
      );

    const totalWidth =
      bold.widthOfTextAtSize(
        totalText,
        9
      );

    page.drawText(
      totalText,
      {
        x:
          PAGE_WIDTH -
          MARGIN_X -
          totalWidth,
        y:
          itemBaseY,
        size:
          9,
        font:
          bold,
      }
    );

    if (
      item.product
        ?.sku
    ) {
      drawWrappedText(
        `SKU: ${item.product.sku}`,
        {
          x:
            MARGIN_X +
            30,
          width:
            280,
          size:
            7,
          lineHeight:
            10,
          colour:
            grey,
        }
      );
    }

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
        0.5,

      color:
        lightGrey,
    });

    y -= 12;
  }

  // ==========================================
  // TOTAL
  // ==========================================
  ensureSpace(
    70
  );

  y -= 6;

  page.drawLine({
    start: {
      x:
        350,
      y,
    },

    end: {
      x:
        PAGE_WIDTH -
        MARGIN_X,
      y,
    },

    thickness:
      1.5,

    color:
      navy,
  });

  y -= 22;

  page.drawText(
    "TOTAL",
    {
      x:
        350,
      y,
      size:
        13,
      font:
        bold,
      color:
        navy,
    }
  );

  drawRightText(
    `GHS ${formatMoney(
      grandTotal
    )}`,
    PAGE_WIDTH -
      MARGIN_X,
    13,
    bold
  );

  y -= 34;

  // ==========================================
  // NOTES
  // ==========================================
  if (
    estimate.notes
  ) {
    ensureSpace(
      60
    );

    page.drawText(
      "NOTES",
      {
        x:
          MARGIN_X,
        y,
        size:
          10,
        font:
          bold,
        color:
          navy,
      }
    );

    y -= 18;

    drawWrappedText(
      estimate.notes,
      {
        x:
          MARGIN_X,
        width:
          PAGE_WIDTH -
          MARGIN_X * 2,
        size:
          9,
        lineHeight:
          13,
      }
    );

    y -= 12;
  }

  // ==========================================
  // QUOTATION NOTES
  // ==========================================
  ensureSpace(
    115
  );

  page.drawText(
    "QUOTATION NOTES",
    {
      x:
        MARGIN_X,
      y,
      size:
        10,
      font:
        bold,
      color:
        navy,
    }
  );

  y -= 18;

  const quotationNotes = [
    "Prices and product availability are subject to confirmation at the time of order.",
    "This quotation does not constitute proof of payment.",
    "Delivery charges, where applicable, will be confirmed separately.",
    "Bulk and wholesale pricing may vary according to quantity and current stock.",
  ];

  for (
    const note of
    quotationNotes
  ) {
    drawWrappedText(
      `- ${note}`,
      {
        x:
          MARGIN_X +
          6,
        width:
          PAGE_WIDTH -
          MARGIN_X * 2 -
          6,
        size:
          8.5,
        lineHeight:
          12,
        colour:
          grey,
      }
    );

    y -= 2;
  }

  y -= 10;

  // ==========================================
  // CONTACTS
  // ==========================================
  ensureSpace(
    75
  );

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
      lightGrey,
  });

  y -= 20;

  page.drawText(
    "DeeglobalGH",
    {
      x:
        MARGIN_X,
      y,
      size:
        12,
      font:
        bold,
      color:
        navy,
    }
  );

  y -= 16;

  page.drawText(
    "WhatsApp: 027 003 0000 | Customer Care: 0246 011 773 | Shop Line: 030 398 2358",
    {
      x:
        MARGIN_X,
      y,
      size:
        8.5,
      font:
        regular,
      color:
        grey,
    }
  );

  y -= 14;

  page.drawText(
    "Thank you for requesting a quotation from DeeglobalGH.",
    {
      x:
        MARGIN_X,
      y,
      size:
        8.5,
      font:
        regular,
      color:
        grey,
    }
  );

  const bytes =
    await pdf.save();

  const body =
    bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset +
        bytes.byteLength
    ) as ArrayBuffer;

  const filename =
    `DeeGlobalGH-${safeText(
      estimate.estimateNumber
    )}-Quotation.pdf`;

  return new Response(
    body,
    {
      headers: {
        "Content-Type":
          "application/pdf",

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
