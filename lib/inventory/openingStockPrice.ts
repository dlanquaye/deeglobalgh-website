import {
  LocationType,
  MovementType,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { applyStockMovement } from "@/lib/stock";

export type OpeningStockPriceItem = {
  productId: string;
  sku: string;

  target: {
    costPrice?: number;
    retailPrice?: number;
    wholesalePrice?: number;
    distributorPrice?: number;
    stockQty?: number;
  };
};

type ApplyOpeningStockPriceInput = {
  items: OpeningStockPriceItem[];
  branchId: string;
  createdByStaffId: string;
};

type ItemResult = {
  productId: string;
  sku: string;
  productName: string;

  pricesUpdated: boolean;

  stock: {
    changed: boolean;
    before: number;
    after: number;
    delta: number;
    movementId: string | null;
  };
};

const MAX_TRANSACTION_RETRIES = 3;

const TRANSACTION_MAX_WAIT_MS = 10_000;
const TRANSACTION_TIMEOUT_MS = 60_000;

function isTransactionConflict(
  error: unknown
) {
  return (
    error instanceof
      Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034"
  );
}

function validateOptionalPrice(
  value: number | undefined,
  label: string
) {
  if (value === undefined) {
    return;
  }

  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    throw new Error(
      `${label} must be a valid number greater than or equal to 0`
    );
  }
}

function validateItem(
  item: OpeningStockPriceItem
) {
  if (!item.productId?.trim()) {
    throw new Error(
      "Product ID is required"
    );
  }

  if (!item.sku?.trim()) {
    throw new Error(
      "SKU is required"
    );
  }

  validateOptionalPrice(
    item.target.costPrice,
    "Cost Price"
  );

  validateOptionalPrice(
    item.target.retailPrice,
    "Retail Price"
  );

  validateOptionalPrice(
    item.target.wholesalePrice,
    "Wholesale Price"
  );

  validateOptionalPrice(
    item.target.distributorPrice,
    "Distributor Price"
  );

  if (
    item.target.stockQty !== undefined &&
    (
      !Number.isInteger(
        item.target.stockQty
      ) ||
      item.target.stockQty < 0
    )
  ) {
    throw new Error(
      "Opening Stock must be a whole number greater than or equal to 0"
    );
  }

  const hasAtLeastOneTarget =
    item.target.costPrice !== undefined ||
    item.target.retailPrice !== undefined ||
    item.target.wholesalePrice !==
      undefined ||
    item.target.distributorPrice !==
      undefined ||
    item.target.stockQty !== undefined;

  if (!hasAtLeastOneTarget) {
    throw new Error(
      `No Opening Stock or Price values supplied for SKU ${item.sku}`
    );
  }
}

export async function applyOpeningStockPrice({
  items,
  branchId,
  createdByStaffId,
}: ApplyOpeningStockPriceInput) {
  if (!branchId?.trim()) {
    throw new Error(
      "Branch is required"
    );
  }

  if (!createdByStaffId?.trim()) {
    throw new Error(
      "Staff or admin identity is required"
    );
  }

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new Error(
      "At least one Opening Stock & Price item is required"
    );
  }

  const seenProductIds =
    new Set<string>();

  const seenSkus =
    new Set<string>();

  for (const item of items) {
    validateItem(item);

    const normalisedProductId =
      item.productId.trim();

    const normalisedSku =
      item.sku.trim().toLowerCase();

    if (
      seenProductIds.has(
        normalisedProductId
      )
    ) {
      throw new Error(
        `Duplicate product in batch: ${item.sku}`
      );
    }

    if (
      seenSkus.has(normalisedSku)
    ) {
      throw new Error(
        `Duplicate SKU in batch: ${item.sku}`
      );
    }

    seenProductIds.add(
      normalisedProductId
    );

    seenSkus.add(normalisedSku);
  }

  for (
    let attempt = 1;
    attempt <= MAX_TRANSACTION_RETRIES;
    attempt++
  ) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const results:
            ItemResult[] = [];

          for (const item of items) {
            // ==============================
            // RELOAD AUTHORITATIVE PRODUCT
            // ==============================
            const product =
              await tx.product.findUnique({
                where: {
                  id: item.productId,
                },
                select: {
                  id: true,
                  sku: true,
                  name: true,

                  costPrice: true,
                  retailPrice: true,
                  wholesalePrice: true,
                  distributorPrice: true,
                },
              });

            if (!product) {
              throw new Error(
                `Product not found for SKU ${item.sku}`
              );
            }

            const databaseSku =
              product.sku
                ?.trim()
                .toLowerCase();

            const submittedSku =
              item.sku
                .trim()
                .toLowerCase();

            if (
              !databaseSku ||
              databaseSku !==
                submittedSku
            ) {
              throw new Error(
                `SKU does not match product record: ${item.sku}`
              );
            }

            // ==============================
            // LOAD AUTHORITATIVE BRANCH STOCK
            // ==============================
            const inventory =
              await tx.inventory.findUnique({
                where: {
                  productId_locationType_locationId:
                    {
                      productId:
                        product.id,
                      locationType:
                        LocationType.BRANCH,
                      locationId:
                        branchId,
                    },
                },
                select: {
                  id: true,
                  quantity: true,
                },
              });

            if (!inventory) {
              throw new Error(
                `Branch inventory record not found for ${product.name}`
              );
            }

            const stockBefore =
              inventory.quantity;

            const targetStock =
              item.target.stockQty;

            const stockDelta =
              targetStock !== undefined
                ? targetStock -
                  stockBefore
                : 0;

            // ==============================
            // BUILD PRICE UPDATE
            // ==============================
            const priceUpdate:
              Prisma.ProductUpdateInput =
              {};

            let pricesUpdated =
              false;

            if (
              item.target.costPrice !==
                undefined &&
              item.target.costPrice !==
                product.costPrice
            ) {
              priceUpdate.costPrice =
                item.target.costPrice;

              pricesUpdated = true;
            }

            if (
              item.target.retailPrice !==
                undefined &&
              item.target.retailPrice !==
                product.retailPrice
            ) {
              priceUpdate.retailPrice =
                item.target.retailPrice;

              pricesUpdated = true;
            }

            if (
              item.target.wholesalePrice !==
                undefined &&
              item.target.wholesalePrice !==
                product.wholesalePrice
            ) {
              priceUpdate.wholesalePrice =
                item.target.wholesalePrice;

              pricesUpdated = true;
            }

            if (
              item.target.distributorPrice !==
                undefined &&
              item.target.distributorPrice !==
                product.distributorPrice
            ) {
              priceUpdate.distributorPrice =
                item.target.distributorPrice;

              pricesUpdated = true;
            }

            // ==============================
            // AUDITED STOCK ADJUSTMENT
            // ==============================
            let movementId:
              | string
              | null = null;

            let stockAfter =
              stockBefore;

            if (stockDelta !== 0) {
              const movement =
                await tx.stockMovement.create({
                  data: {
                    productId:
                      product.id,

                    type:
                      MovementType.ADJUSTMENT,

                    quantity:
                      Math.abs(
                        stockDelta
                      ),

                    ...(stockDelta < 0
                      ? {
                          fromLocationType:
                            LocationType.BRANCH,

                          fromLocationId:
                            branchId,
                        }
                      : {
                          toLocationType:
                            LocationType.BRANCH,

                          toLocationId:
                            branchId,
                        }),

                    createdByStaffId,

                    status:
                      "COMPLETED",
                  },
                });

              movementId =
                movement.id;

              await applyStockMovement(
                tx,
                movement.id
              );

              const updatedInventory =
                await tx.inventory.findUnique({
                  where: {
                    productId_locationType_locationId:
                      {
                        productId:
                          product.id,

                        locationType:
                          LocationType.BRANCH,

                        locationId:
                          branchId,
                      },
                  },
                  select: {
                    quantity: true,
                  },
                });

              if (
                !updatedInventory
              ) {
                throw new Error(
                  `Branch inventory record missing after stock adjustment for ${product.name}`
                );
              }

              stockAfter =
                updatedInventory.quantity;

              if (
                targetStock ===
                  undefined ||
                stockAfter !==
                  targetStock
              ) {
                throw new Error(
                  `Stock adjustment verification failed for ${product.name}`
                );
              }

              // Branch Inventory is authoritative.
              // Product.stockQty mirrors branch stock.
              priceUpdate.stockQty =
                stockAfter;
            }

            // ==============================
            // PRODUCT UPDATE
            // ==============================
            const shouldUpdateProduct =
              pricesUpdated ||
              stockDelta !== 0;

            if (
              shouldUpdateProduct
            ) {
              await tx.product.update({
                where: {
                  id: product.id,
                },
                data: priceUpdate,
              });
            }

            results.push({
              productId:
                product.id,

              sku:
                product.sku ??
                item.sku,

              productName:
                product.name,

              pricesUpdated,

              stock: {
                changed:
                  stockDelta !== 0,

                before:
                  stockBefore,

                after:
                  stockAfter,

                delta:
                  stockDelta,

                movementId,
              },
            });
          }

          return {
            success: true,

            processed:
              results.length,

            priceUpdates:
              results.filter(
                (result) =>
                  result.pricesUpdated
              ).length,

            stockUpdates:
              results.filter(
                (result) =>
                  result.stock.changed
              ).length,

            results,
          };
        },
        {
          maxWait:
            TRANSACTION_MAX_WAIT_MS,

          timeout:
            TRANSACTION_TIMEOUT_MS,

          isolationLevel:
            Prisma
              .TransactionIsolationLevel
              .Serializable,
        }
      );
    } catch (error) {
      const shouldRetry =
        isTransactionConflict(
          error
        ) &&
        attempt <
          MAX_TRANSACTION_RETRIES;

      if (shouldRetry) {
        continue;
      }

      throw error;
    }
  }

  throw new Error(
    "Opening Stock & Price transaction could not be completed"
  );
}