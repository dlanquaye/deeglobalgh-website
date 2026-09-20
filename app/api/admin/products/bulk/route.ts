export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

type CsvRow =
  Record<string, string>;

async function requireProductManager() {
  const session =
    await requireAdmin();

  if (!session.staffId) {
    throw new Error(
      "StaffAccountRequired"
    );
  }

  const staff =
    await prisma.staff.findUnique({
      where: {
        id: session.staffId,
      },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });

  if (
    !staff ||
    !staff.isActive
  ) {
    throw new Error(
      "InactiveStaff"
    );
  }

  const isSuperAdmin =
    session.role ===
      "SUPER_ADMIN";

  const canManageProducts =
    isSuperAdmin ||
    staff.role ===
      "SUPER_ADMIN" ||
    staff.role ===
      "MANAGER";

  if (!canManageProducts) {
    throw new Error(
      "ProductManagementForbidden"
    );
  }

  return {
    session,
    staff,
  };
}

function authErrorResponse(
  error: unknown
) {
  if (!(error instanceof Error)) {
    return null;
  }

  if (
    error.message ===
    "Unauthorized"
  ) {
    return NextResponse.json(
      {
        error:
          "Authentication required.",
      },
      {
        status: 401,
      }
    );
  }

  if (
    error.message ===
    "CredentialChangeRequired"
  ) {
    return NextResponse.json(
      {
        error:
          "Credential change required.",
      },
      {
        status: 403,
      }
    );
  }

  if (
    error.message ===
    "StaffAccountRequired" ||
    error.message ===
    "InactiveStaff"
  ) {
    return NextResponse.json(
      {
        error:
          "An active linked staff account is required.",
      },
      {
        status: 403,
      }
    );
  }

  if (
    error.message ===
    "ProductManagementForbidden"
  ) {
    return NextResponse.json(
      {
        error:
          "You do not have permission to perform bulk product imports.",
      },
      {
        status: 403,
      }
    );
  }

  return null;
}

function optionalNumber(
  value: string | undefined
) {
  const text =
    String(
      value ?? ""
    ).trim();

  if (!text) {
    return null;
  }

  const parsed =
    Number(text);

  return parsed;
}

function cleanList(
  value: string | undefined
) {
  return String(
    value ?? ""
  )
    .split(",")
    .map((item) =>
      item.trim()
    )
    .filter(Boolean);
}

export async function POST(
  req: Request
) {
  try {
    await requireProductManager();

    const formData =
      await req.formData();

    const file =
      formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            "No file uploaded.",
        },
        {
          status: 400,
        }
      );
    }

    const text =
      await file.text();

    const records =
      parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as CsvRow[];

    if (
      !Array.isArray(records) ||
      records.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "The uploaded CSV contains no product rows.",
        },
        {
          status: 400,
        }
      );
    }

    const preparedRows =
      records.map(
        (row, index) => {
          const rowNumber =
            index + 2;

          const sku =
            String(
              row["SKU"] ?? ""
            ).trim();

          const name =
            String(
              row[
                "Product Name"
              ] ?? ""
            ).trim();

          const slug =
            String(
              row["Slug"] ?? ""
            ).trim();

          const categorySlug =
            String(
              row[
                "Category Slug"
              ] ?? ""
            ).trim();

          const imageSrc =
            String(
              row[
                "Image Src"
              ] ?? ""
            ).trim();

          const imageAlt =
            String(
              row[
                "Image Alt"
              ] ?? ""
            ).trim();

          if (
            !sku ||
            !name ||
            !slug ||
            !categorySlug
          ) {
            throw new Error(
              `CSV row ${rowNumber}: SKU, Product Name, Slug and Category Slug are required.`
            );
          }

          const retailPrice =
            Number(
              row[
                "Retail Price"
              ]
            );

          const wholesalePrice =
            optionalNumber(
              row[
                "Wholesale Price"
              ]
            );

          const distributorPrice =
            optionalNumber(
              row[
                "Distributor Price"
              ]
            );

          const stockQty =
            Number(
              row[
                "Stock Qty"
              ] || 0
            );

          const lowStockThreshold =
            Number(
              row[
                "Low Stock Threshold"
              ] || 3
            );

          if (
            !Number.isFinite(
              retailPrice
            ) ||
            retailPrice < 0
          ) {
            throw new Error(
              `CSV row ${rowNumber}: Retail Price must be a valid non-negative number.`
            );
          }

          if (
            wholesalePrice !==
              null &&
            (
              !Number.isFinite(
                wholesalePrice
              ) ||
              wholesalePrice < 0
            )
          ) {
            throw new Error(
              `CSV row ${rowNumber}: Wholesale Price must be a valid non-negative number.`
            );
          }

          if (
            distributorPrice !==
              null &&
            (
              !Number.isFinite(
                distributorPrice
              ) ||
              distributorPrice < 0
            )
          ) {
            throw new Error(
              `CSV row ${rowNumber}: Distributor Price must be a valid non-negative number.`
            );
          }

          if (
            !Number.isInteger(
              stockQty
            ) ||
            stockQty < 0
          ) {
            throw new Error(
              `CSV row ${rowNumber}: Stock Qty must be a non-negative whole number.`
            );
          }

          if (
            !Number.isInteger(
              lowStockThreshold
            ) ||
            lowStockThreshold < 0
          ) {
            throw new Error(
              `CSV row ${rowNumber}: Low Stock Threshold must be a non-negative whole number.`
            );
          }

          return {
            sku,
            name,
            slug,

            brand:
              String(
                row["Brand"] ?? ""
              ).trim() ||
              null,

            retailPrice,
            wholesalePrice,
            distributorPrice,

            stockQty,
            lowStockThreshold,

            categorySlug,

            levelSlugs:
              cleanList(
                row[
                  "Level Slugs"
                ]
              ),

            imageSrc:
              imageSrc,

            imageAlt:
              imageAlt,

            imageTitle:
              String(
                row[
                  "Image Title"
                ] ?? ""
              ).trim() ||
              null,

            imageCaption:
              String(
                row[
                  "Image Caption"
                ] ?? ""
              ).trim() ||
              null,

            imageDescription:
              String(
                row[
                  "Image Description"
                ] ?? ""
              ).trim() ||
              null,

            focusKeyphrase:
              String(
                row[
                  "Focus Keyphrase"
                ] ?? ""
              ).trim() ||
              null,

            metaTitle:
              String(
                row[
                  "Meta Title"
                ] ?? ""
              ).trim() ||
              null,

            metaDescription:
              String(
                row[
                  "Meta Description"
                ] ?? ""
              ).trim() ||
              null,

            socialTitle:
              String(
                row[
                  "Social Title"
                ] ?? ""
              ).trim() ||
              null,

            socialDescription:
              String(
                row[
                  "Social Description"
                ] ?? ""
              ).trim() ||
              null,

            shortSummary:
              String(
                row[
                  "Short Summary"
                ] ?? ""
              ).trim() ||
              null,

            fullDescription:
              String(
                row[
                  "Full Description"
                ] ?? ""
              ).trim() ||
              null,

            tags:
              cleanList(
                row["Tags"]
              ),
          };
        }
      );

    /*
     * Detect duplicate identifiers
     * inside the uploaded CSV before
     * touching the database.
     */
    const seenSkus =
      new Set<string>();

    const seenSlugs =
      new Set<string>();

    for (
      const item
      of preparedRows
    ) {
      const skuKey =
        item.sku.toLowerCase();

      const slugKey =
        item.slug.toLowerCase();

      if (
        seenSkus.has(
          skuKey
        )
      ) {
        return NextResponse.json(
          {
            error:
              `Duplicate SKU in uploaded CSV: ${item.sku}`,
          },
          {
            status: 400,
          }
        );
      }

      if (
        seenSlugs.has(
          slugKey
        )
      ) {
        return NextResponse.json(
          {
            error:
              `Duplicate slug in uploaded CSV: ${item.slug}`,
          },
          {
            status: 400,
          }
        );
      }

      seenSkus.add(
        skuKey
      );

      seenSlugs.add(
        slugKey
      );
    }

    /*
     * Reject SKU/slug collisions with
     * existing products before writing.
     */
    const existingProducts =
      await prisma.product.findMany({
        where: {
          OR: [
            {
              sku: {
                in:
                  preparedRows.map(
                    (item) =>
                      item.sku
                  ),
              },
            },
            {
              slug: {
                in:
                  preparedRows.map(
                    (item) =>
                      item.slug
                  ),
              },
            },
          ],
        },
        select: {
          sku: true,
          slug: true,
        },
      });

    if (
      existingProducts.length >
      0
    ) {
      const collisions =
        existingProducts
          .map(
            (product) =>
              product.sku ||
              product.slug
          )
          .filter(Boolean)
          .join(", ");

      return NextResponse.json(
        {
          error:
            `Bulk import contains product identifiers that already exist: ${collisions}`,
        },
        {
          status: 409,
        }
      );
    }

    /*
     * The entire batch is atomic.
     *
     * If any product or inventory row
     * fails, the whole CSV import rolls
     * back. This prevents partial bulk
     * uploads.
     */
    const createdCount =
      await prisma.$transaction(
        async (tx) => {
          let count = 0;

          for (
            const item
            of preparedRows
          ) {
            const product =
              await tx.product.create({
                data: {
                  sku:
                    item.sku,

                  name:
                    item.name,

                  slug:
                    item.slug,

                  brand:
                    item.brand,

                  retailPrice:
                    item.retailPrice,

                  wholesalePrice:
                    item.wholesalePrice,

                  distributorPrice:
                    item.distributorPrice,

                  stockQty:
                    item.stockQty,

                  lowStockThreshold:
                    item.lowStockThreshold,

                  categorySlug:
                    item.categorySlug,

                  levelSlugs:
                    item.levelSlugs,

                  imageSrc:
                    item.imageSrc,

                  imageAlt:
                    item.imageAlt,

                  imageTitle:
                    item.imageTitle,

                  imageCaption:
                    item.imageCaption,

                  imageDescription:
                    item.imageDescription,

                  focusKeyphrase:
                    item.focusKeyphrase,

                  metaTitle:
                    item.metaTitle,

                  metaDescription:
                    item.metaDescription,

                  socialTitle:
                    item.socialTitle,

                  socialDescription:
                    item.socialDescription,

                  shortSummary:
                    item.shortSummary,

                  fullDescription:
                    item.fullDescription,

                  tags:
                    item.tags,
                },
              });

            /*
             * Preserve existing Kasoa
             * branch inventory behaviour.
             */
            await tx.inventory.create({
              data: {
                productId:
                  product.id,

                locationType:
                  "BRANCH",

                locationId:
                  "shop-kasoa",

                quantity:
                  item.stockQty,
              },
            });

            count++;
          }

          return count;
        }
      );

    return NextResponse.json({
      success: true,
      count:
        createdCount,
    });
  } catch (error) {
    const authResponse =
      authErrorResponse(
        error
      );

    if (authResponse) {
      return authResponse;
    }

    console.error(
      "BULK PRODUCT IMPORT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof
          Error
            ? error.message
            : "Bulk product import failed.",
      },
      {
        status: 500,
      }
    );
  }
}
