import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { synchronizeCatalog } from "@/lib/catalog-sync";
import { preparePriceImport } from "@/lib/product-sync/price-import";

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();

    if (!session.staffId) {
      return NextResponse.json(
        {
          success: false,
          error: "This account is not linked to a staff record.",
        },
        { status: 403 }
      );
    }

    const staff = await prisma.staff.findUnique({
      where: {
        id: session.staffId,
      },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });

    if (!staff || !staff.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Active staff account required.",
        },
        { status: 403 }
      );
    }

    const isSuperAdmin = session.role === "SUPER_ADMIN";

    const canSynchronizeCatalogue =
      isSuperAdmin || staff.role === "MANAGER";

    if (!canSynchronizeCatalogue) {
      return NextResponse.json(
        {
          success: false,
          error: "You do not have permission to synchronise the catalogue.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    const syncItems = body?.syncItems;

    if (!Array.isArray(syncItems)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid synchronisation payload.",
        },
        { status: 400 }
      );
    }

    if (body?.importType === "price") {
      if (syncItems.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Price import contains no products.",
          },
          { status: 400 }
        );
      }

      const errors: string[] = [];

      const allowedPriceFields = new Set([
        "costPrice",
        "wholesalePrice",
        "retailPrice",
      ]);

      const priceRows = syncItems.map((item, index) => {
        const rowNumber = index + 2;

        if (
          !item ||
          typeof item !== "object" ||
          Array.isArray(item)
        ) {
          errors.push(
            `Row ${rowNumber}: Invalid item.`
          );

          return {
            existingId: undefined,
            costPrice: undefined,
            wholesalePrice: undefined,
            retailPrice: undefined,
          };
        }

        if (item.action !== "UPDATE") {
          errors.push(
            `Row ${rowNumber}: Price imports must update existing products.`
          );
        }

        if (
          !item.product ||
          typeof item.product !== "object" ||
          Array.isArray(item.product)
        ) {
          errors.push(
            `Row ${rowNumber}: Invalid product payload.`
          );

          return {
            existingId: item.existingId,
            costPrice: undefined,
            wholesalePrice: undefined,
            retailPrice: undefined,
          };
        }

        const fields =
          Object.keys(item.product);

        const unsupportedFields =
          fields.filter(
            (field) =>
              !allowedPriceFields.has(field)
          );

        if (unsupportedFields.length > 0) {
          errors.push(
            `Row ${rowNumber}: Price updates contain unsupported fields: ${unsupportedFields.join(
              ", "
            )}.`
          );
        }

        const suppliedPriceFields =
          fields.filter((field) =>
            allowedPriceFields.has(field)
          );

        if (
          suppliedPriceFields.length === 0
        ) {
          errors.push(
            `Row ${rowNumber}: At least one commercial price field is required.`
          );
        }

        return {
          existingId: item.existingId,
          costPrice:
            Object.prototype.hasOwnProperty.call(
              item.product,
              "costPrice"
            )
              ? item.product.costPrice
              : undefined,

          wholesalePrice:
            Object.prototype.hasOwnProperty.call(
              item.product,
              "wholesalePrice"
            )
              ? item.product.wholesalePrice
              : undefined,

          retailPrice:
            Object.prototype.hasOwnProperty.call(
              item.product,
              "retailPrice"
            )
              ? item.product.retailPrice
              : undefined,
        };
      });

      const validation =
        preparePriceImport(priceRows);

      errors.push(...validation.errors);

      if (errors.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Price import validation failed.",
            errors,
          },
          { status: 400 }
        );
      }

      const validatedItems =
        validation.syncItems;

      const ids =
        validatedItems.map(
          (item) =>
            item.existingId as string
        );

      const report =
        await prisma.$transaction(
          async (tx) => {
            const existingProducts =
              await tx.product.findMany({
                where: {
                  id: {
                    in: ids,
                  },
                },
                select: {
                  id: true,
                },
              });

            if (
              existingProducts.length !==
              ids.length
            ) {
              throw new Error(
                "PRICE_IMPORT_PRODUCT_NOT_FOUND"
              );
            }

            for (
              const item
              of validatedItems
            ) {
              const updateData: {
                costPrice?: number;
                wholesalePrice?: number;
                retailPrice?: number;
              } = {};

              if (
                item.product.costPrice !==
                undefined
              ) {
                updateData.costPrice =
                  Number(
                    item.product.costPrice
                  );
              }

              if (
                item.product.wholesalePrice !==
                undefined
              ) {
                updateData.wholesalePrice =
                  Number(
                    item.product.wholesalePrice
                  );
              }

              if (
                item.product.retailPrice !==
                undefined
              ) {
                updateData.retailPrice =
                  Number(
                    item.product.retailPrice
                  );
              }

              await tx.product.update({
                where: {
                  id: item.existingId!,
                },
                data: updateData,
              });
            }

            return {
              inserted: 0,
              updated:
                validatedItems.length,
              review: 0,
              errors: 0,
              messages: [
                `${validatedItems.length} commercial price update${
                  validatedItems.length === 1
                    ? ""
                    : "s"
                } completed successfully.`,
              ],
            };
          }
        );

      return NextResponse.json({
        success: true,
        report,
      });
    }
    if (
      body?.importType !== undefined &&
      body.importType !== "products" &&
      body.importType !== "update" &&
      body.importType !== "stock" &&
      body.importType !== "seo" &&
      body.importType !== "images"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported catalogue import type.",
        },
        { status: 400 }
      );
    }

    const report = await synchronizeCatalog(
      syncItems,
      false
    );

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Unauthorized"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "CredentialChangeRequired"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Credential change required.",
        },
        { status: 403 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "PRICE_IMPORT_PRODUCT_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "One or more products no longer exist. Reanalyse the price spreadsheet.",
        },
        { status: 400 }
      );
    }

    console.error(
      "Catalogue synchronisation failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to synchronise catalogue.",
      },
      { status: 500 }
    );
  }
}