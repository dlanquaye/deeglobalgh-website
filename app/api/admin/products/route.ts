import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

/*
 * Slug generator.
 *
 * This is used only when the caller
 * does not supply an explicit slug.
 */
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

/*
 * Product administration contains
 * commercially sensitive information
 * and can change the live catalogue.
 *
 * Only SUPER_ADMIN and MANAGER staff
 * may use these endpoints.
 */
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
          "You do not have permission to manage products.",
      },
      {
        status: 403,
      }
    );
  }

  return null;
}

export async function POST(
  req: Request
) {
  try {
    await requireProductManager();

    const body =
      await req.json();

    const {
      sku,
      name,
      slug,
      retailPrice,
      wholesalePrice,
      distributorPrice,
      stockQty,
      lowStockThreshold,
      categorySlug,
      levelSlugs,
      imageSrc,
      imageAlt,
      imageTitle,
      imageCaption,
      imageDescription,
      focusKeyphrase,
      metaTitle,
      metaDescription,
      socialTitle,
      socialDescription,
      shortSummary,
      fullDescription,
      brand,
      tags,
    } = body ?? {};

    const cleanSku =
      String(
        sku ?? ""
      ).trim();

    const cleanName =
      String(
        name ?? ""
      ).trim();

    const cleanCategorySlug =
      String(
        categorySlug ?? ""
      ).trim();

    const cleanImageSrc =
      String(
        imageSrc ?? ""
      ).trim();

    const cleanImageAlt =
      String(
        imageAlt ?? ""
      ).trim();

    if (
      !cleanSku ||
      !cleanName ||
      !cleanCategorySlug ||
      !cleanImageSrc ||
      !cleanImageAlt
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields.",
        },
        {
          status: 400,
        }
      );
    }

    const parsedRetailPrice =
      Number(retailPrice);

    const parsedWholesalePrice =
      wholesalePrice ===
        undefined ||
      wholesalePrice ===
        null ||
      wholesalePrice ===
        ""
        ? null
        : Number(
            wholesalePrice
          );

    const parsedDistributorPrice =
      distributorPrice ===
        undefined ||
      distributorPrice ===
        null ||
      distributorPrice ===
        ""
        ? null
        : Number(
            distributorPrice
          );

    const parsedStockQty =
      Number(
        stockQty ?? 0
      );

    const parsedLowStock =
      Number(
        lowStockThreshold ??
          3
      );

    if (
      !Number.isFinite(
        parsedRetailPrice
      ) ||
      parsedRetailPrice < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Retail price must be a valid non-negative number.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      parsedWholesalePrice !==
        null &&
      (
        !Number.isFinite(
          parsedWholesalePrice
        ) ||
        parsedWholesalePrice <
          0
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Wholesale price must be a valid non-negative number.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      parsedDistributorPrice !==
        null &&
      (
        !Number.isFinite(
          parsedDistributorPrice
        ) ||
        parsedDistributorPrice <
          0
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Distributor price must be a valid non-negative number.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(
        parsedStockQty
      ) ||
      parsedStockQty < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Stock quantity must be a non-negative whole number.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(
        parsedLowStock
      ) ||
      parsedLowStock < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Low-stock threshold must be a non-negative whole number.",
        },
        {
          status: 400,
        }
      );
    }

    const suppliedSlug =
      String(
        slug ?? ""
      ).trim();

    const finalSlug =
      suppliedSlug ||
      slugify(
        cleanName
      );

    if (!finalSlug) {
      return NextResponse.json(
        {
          error:
            "A valid product slug is required.",
        },
        {
          status: 400,
        }
      );
    }

    const cleanLevelSlugs =
      Array.isArray(
        levelSlugs
      )
        ? levelSlugs
            .map((value) =>
              String(
                value
              ).trim()
            )
            .filter(Boolean)
        : [];

    const cleanTags =
      Array.isArray(tags)
        ? tags
            .map((value) =>
              String(
                value
              ).trim()
            )
            .filter(Boolean)
        : [];

    /*
     * Product and opening branch
     * inventory must succeed or fail
     * together.
     *
     * This prevents an incomplete
     * product record if inventory
     * creation fails.
     */
    const product =
      await prisma.$transaction(
        async (tx) => {
          const createdProduct =
            await tx.product.create({
              data: {
                sku:
                  cleanSku,

                name:
                  cleanName,

                slug:
                  finalSlug,

                retailPrice:
                  parsedRetailPrice,

                wholesalePrice:
                  parsedWholesalePrice,

                distributorPrice:
                  parsedDistributorPrice,

                stockQty:
                  parsedStockQty,

                lowStockThreshold:
                  parsedLowStock,

                categorySlug:
                  cleanCategorySlug,

                levelSlugs:
                  cleanLevelSlugs,

                imageSrc:
                  cleanImageSrc,

                imageAlt:
                  cleanImageAlt,

                imageTitle:
                  imageTitle ??
                  null,

                imageCaption:
                  imageCaption ??
                  null,

                imageDescription:
                  imageDescription ??
                  null,

                focusKeyphrase:
                  focusKeyphrase ??
                  null,

                metaTitle:
                  metaTitle ??
                  null,

                metaDescription:
                  metaDescription ??
                  null,

                socialTitle:
                  socialTitle ??
                  null,

                socialDescription:
                  socialDescription ??
                  null,

                shortSummary:
                  shortSummary ??
                  null,

                fullDescription:
                  fullDescription ??
                  null,

                brand:
                  brand ??
                  null,

                tags:
                  cleanTags,
              },
            });

          /*
           * Preserve the existing
           * Kasoa product-creation
           * behaviour.
           */
          await tx.inventory.create({
            data: {
              productId:
                createdProduct.id,

              locationType:
                "BRANCH",

              locationId:
                "shop-kasoa",

              quantity:
                parsedStockQty,
            },
          });

          return createdProduct;
        }
      );

    return NextResponse.json(
      product
    );
  } catch (error) {
    const authResponse =
      authErrorResponse(
        error
      );

    if (authResponse) {
      return authResponse;
    }

    console.error(
      "CREATE PRODUCT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof
          Error
            ? error.message
            : "Server error",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * Administrative product overview.
 *
 * This includes cost price and
 * supplier information, so it uses
 * the same management permission as
 * product creation/editing.
 */
export async function GET() {
  try {
    await requireProductManager();

    const products =
      await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          stockQty: true,
          lowStockThreshold:
            true,
          costPrice: true,
          supplier: true,
        },
      });

    return NextResponse.json({
      products,
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
      "LOAD ADMIN PRODUCTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load products.",
      },
      {
        status: 500,
      }
    );
  }
}
