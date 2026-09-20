import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const ALLOWED_STAFF_ROLES =
  new Set([
    "SUPER_ADMIN",
    "MANAGER",
  ]);

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
      "StaffAccountRequired"
    );
  }

  const isSuperAdmin =
    session.role ===
    "SUPER_ADMIN";

  if (
    !isSuperAdmin &&
    !ALLOWED_STAFF_ROLES.has(
      staff.role
    )
  ) {
    throw new Error(
      "Forbidden"
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
  if (
    error instanceof Error &&
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
    error instanceof Error &&
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
    error instanceof Error &&
    (
      error.message ===
        "StaffAccountRequired" ||
      error.message ===
        "Forbidden"
    )
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

/* ===============================
   GET SINGLE PRODUCT
=============================== */
export async function GET(
  _req: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await requireProductManager();

    const { id } =
      await context.params;

    const product =
      await prisma.product.findUnique({
        where: {
          id,
        },
      });

    if (!product) {
      return NextResponse.json(
        {
          error:
            "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      product
    );
  } catch (error) {
    const authResponse =
      authErrorResponse(error);

    if (authResponse) {
      return authResponse;
    }

    console.error(
      "GET product error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch product",
      },
      {
        status: 500,
      }
    );
  }
}

/* ===============================
   UPDATE PRODUCT
=============================== */
export async function PATCH(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await requireProductManager();

    const { id } =
      await context.params;

    const body =
      await req.json();

    const existing =
      await prisma.product.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    const data: Prisma.ProductUpdateInput = {};

    if (
      typeof body?.name ===
      "string"
    ) {
      data.name =
        body.name.trim();
    }

    if (
      typeof body?.slug ===
      "string"
    ) {
      data.slug =
        body.slug.trim();
    }

    if (
      body?.retailPrice !==
      undefined
    ) {
      data.retailPrice =
        Number(
          body.retailPrice
        );
    }

    if (
      body?.wholesalePrice !==
      undefined
    ) {
      data.wholesalePrice =
        Number(
          body.wholesalePrice
        );
    }

    if (
      body?.distributorPrice !==
      undefined
    ) {
      data.distributorPrice =
        Number(
          body.distributorPrice
        );
    }

    if (
      body?.minimumSellingPrice !==
      undefined
    ) {
      data.minimumSellingPrice =
        body.minimumSellingPrice ===
          null ||
        body.minimumSellingPrice ===
          ""
          ? null
          : Number(
              body.minimumSellingPrice
            );
    }

    if (
      body?.costPrice !==
      undefined
    ) {
      data.costPrice =
        body.costPrice ===
          null ||
        body.costPrice ===
          ""
          ? null
          : Number(
              body.costPrice
            );
    }

    if (
      body?.lowStockThreshold !==
      undefined
    ) {
      data.lowStockThreshold =
        Number(
          body.lowStockThreshold
        );
    }

    if (
      typeof body?.categorySlug ===
      "string"
    ) {
      const categorySlug =
        body.categorySlug.trim();

      if (categorySlug) {
        data.categorySlug =
          categorySlug;
      }
    }

    if (
      typeof body
        ?.subCategorySlug ===
      "string"
    ) {
      const subCategorySlug =
        body.subCategorySlug.trim();

      if (subCategorySlug) {
        data.subCategorySlug =
          subCategorySlug;
      }
    }

    if (
      Array.isArray(
        body?.levelSlugs
      )
    ) {
      data.levelSlugs =
        body.levelSlugs.filter(
          (
            value: unknown
          ): value is string =>
            typeof value ===
            "string"
        );
    }

    if (
      typeof body?.imageSrc ===
        "string" ||
      body?.imageSrc === null
    ) {
      data.imageSrc =
        body.imageSrc;
    }

    if (
      typeof body?.imageAlt ===
        "string" ||
      body?.imageAlt === null
    ) {
      data.imageAlt =
        body.imageAlt;
    }

    if (
      typeof body?.imageTitle ===
        "string" ||
      body?.imageTitle === null
    ) {
      data.imageTitle =
        body.imageTitle;
    }

    if (
      typeof body
        ?.imageCaption ===
        "string" ||
      body?.imageCaption ===
        null
    ) {
      data.imageCaption =
        body.imageCaption;
    }

    if (
      typeof body
        ?.imageDescription ===
        "string" ||
      body?.imageDescription ===
        null
    ) {
      data.imageDescription =
        body.imageDescription;
    }

    if (
      typeof body
        ?.focusKeyphrase ===
        "string" ||
      body?.focusKeyphrase ===
        null
    ) {
      data.focusKeyphrase =
        body.focusKeyphrase;
    }

    if (
      typeof body?.metaTitle ===
        "string" ||
      body?.metaTitle === null
    ) {
      data.metaTitle =
        body.metaTitle;
    }

    if (
      typeof body
        ?.metaDescription ===
        "string" ||
      body?.metaDescription ===
        null
    ) {
      data.metaDescription =
        body.metaDescription;
    }

    if (
      typeof body
        ?.socialTitle ===
        "string" ||
      body?.socialTitle ===
        null
    ) {
      data.socialTitle =
        body.socialTitle;
    }

    if (
      typeof body
        ?.socialDescription ===
        "string" ||
      body?.socialDescription ===
        null
    ) {
      data.socialDescription =
        body.socialDescription;
    }

    if (
      typeof body
        ?.shortSummary ===
        "string" ||
      body?.shortSummary ===
        null
    ) {
      data.shortSummary =
        body.shortSummary;
    }

    if (
      typeof body
        ?.fullDescription ===
        "string" ||
      body?.fullDescription ===
        null
    ) {
      data.fullDescription =
        body.fullDescription;
    }

    if (
      typeof body?.brand ===
        "string" ||
      body?.brand === null
    ) {
      data.brand =
        body.brand;
    }

    if (
      Array.isArray(
        body?.tags
      )
    ) {
      data.tags =
        body.tags.filter(
          (
            value: unknown
          ): value is string =>
            typeof value ===
            "string"
        );
    }

    if (
      typeof body
        ?.websiteVisible ===
      "boolean"
    ) {
      data.websiteVisible =
        body.websiteVisible;
    }

    if (
      typeof body?.author ===
        "string" ||
      body?.author === null
    ) {
      data.author =
        body.author;
    }

    if (
      typeof body
        ?.publisher ===
        "string" ||
      body?.publisher ===
        null
    ) {
      data.publisher =
        body.publisher;
    }

    if (
      typeof body?.supplier ===
        "string" ||
      body?.supplier === null
    ) {
      data.supplier =
        body.supplier;
    }

    /*
     * Deliberately excluded:
     * - stock
     * - stockQty
     * - inventory relations
     * - SKU
     * - activation state
     *
     * Stock must be changed through
     * inventory workflows so stock
     * movements and mirrors remain
     * consistent.
     */

    if (
      Object.keys(data)
        .length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "No permitted product fields were supplied.",
        },
        {
          status: 400,
        }
      );
    }

    const updated =
      await prisma.product.update({
        where: {
          id,
        },
        data,
      });

    return NextResponse.json(
      updated
    );
  } catch (error) {
    const authResponse =
      authErrorResponse(error);

    if (authResponse) {
      return authResponse;
    }

    console.error(
      "PATCH product error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update product",
      },
      {
        status: 500,
      }
    );
  }
}

/* ===============================
   SOFT DELETE / TOGGLE ACTIVE
=============================== */
export async function DELETE(
  _req: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await requireProductManager();

    const { id } =
      await context.params;

    const existing =
      await prisma.product.findUnique({
        where: {
          id,
        },
        select: {
          isActive: true,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    const updated =
      await prisma.product.update({
        where: {
          id,
        },
        data: {
          isActive:
            !existing.isActive,
        },
      });

    return NextResponse.json({
      success: true,
      isActive:
        updated.isActive,
    });
  } catch (error) {
    const authResponse =
      authErrorResponse(error);

    if (authResponse) {
      return authResponse;
    }

    console.error(
      "SOFT DELETE product error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update product status",
      },
      {
        status: 500,
      }
    );
  }
}
