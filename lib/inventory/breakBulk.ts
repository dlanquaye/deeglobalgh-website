import {
  LocationType,
  MovementType,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { applyStockMovement } from "@/lib/stock";

type BreakBulkInput = {
  ruleId: string;
  locationType: LocationType;
  locationId: string;
  sourceQuantity: number;
  createdByStaffId: string;
  note?: string;
};

const MAX_TRANSACTION_RETRIES = 3;

function isTransactionConflict(error: unknown) {
  return (
    error instanceof
      Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034"
  );
}

export async function breakBulkInventory({
  ruleId,
  locationType,
  locationId,
  sourceQuantity,
  createdByStaffId,
  note,
}: BreakBulkInput) {
  if (!ruleId) {
    throw new Error(
      "Break Bulk rule is required"
    );
  }

  if (!locationId) {
    throw new Error("Location is required");
  }

  if (!createdByStaffId) {
    throw new Error(
      "Staff or admin identity is required"
    );
  }

  if (
    !Number.isInteger(sourceQuantity) ||
    sourceQuantity <= 0
  ) {
    throw new Error(
      "Break Bulk quantity must be a positive whole number"
    );
  }

  for (
    let attempt = 1;
    attempt <= MAX_TRANSACTION_RETRIES;
    attempt++
  ) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          // ==============================
          // LOAD AND VALIDATE RULE
          // ==============================
          const rule =
            await tx.breakBulkRule.findUnique({
              where: {
                id: ruleId,
              },
              include: {
                sourceProduct: {
                  select: {
                    id: true,
                    sku: true,
                    name: true,
                    isActive: true,
                  },
                },
                destinationProduct: {
                  select: {
                    id: true,
                    sku: true,
                    name: true,
                    isActive: true,
                  },
                },
              },
            });

          if (!rule) {
            throw new Error(
              "Break Bulk rule not found"
            );
          }

          if (!rule.isActive) {
            throw new Error(
              "Break Bulk rule is inactive"
            );
          }

          if (
            !Number.isInteger(
              rule.conversionRatio
            ) ||
            rule.conversionRatio <= 0
          ) {
            throw new Error(
              "Break Bulk rule has an invalid conversion ratio"
            );
          }

          if (
            rule.sourceProductId ===
            rule.destinationProductId
          ) {
            throw new Error(
              "Break Bulk source and destination products must be different"
            );
          }

          if (
            !rule.sourceProduct.isActive
          ) {
            throw new Error(
              `Source product is inactive: ${rule.sourceProduct.name}`
            );
          }

          if (
            !rule.destinationProduct.isActive
          ) {
            throw new Error(
              `Destination product is inactive: ${rule.destinationProduct.name}`
            );
          }

          // ==============================
          // CALCULATE DESTINATION QUANTITY
          // ==============================
          const destinationQuantity =
            sourceQuantity *
            rule.conversionRatio;

          if (
            !Number.isSafeInteger(
              destinationQuantity
            ) ||
            destinationQuantity <= 0
          ) {
            throw new Error(
              "Calculated destination quantity is invalid"
            );
          }

          // ==============================
          // READ SOURCE STOCK
          // ==============================
          const sourceInventory =
            await tx.inventory.findUnique({
              where: {
                productId_locationType_locationId:
                  {
                    productId:
                      rule.sourceProductId,
                    locationType,
                    locationId,
                  },
              },
              select: {
                id: true,
                quantity: true,
              },
            });

          if (!sourceInventory) {
            throw new Error(
              `No inventory record exists for source product ${rule.sourceProduct.name}`
            );
          }

          if (
            sourceInventory.quantity <
            sourceQuantity
          ) {
            throw new Error(
              `Insufficient stock for ${rule.sourceProduct.name}. Available: ${sourceInventory.quantity}`
            );
          }

          // ==============================
          // SOURCE MOVEMENT
          // ==============================
          const sourceMovement =
            await tx.stockMovement.create({
              data: {
                productId:
                  rule.sourceProductId,
                type:
                  MovementType.BREAK_BULK_OUT,
                quantity: sourceQuantity,

                fromLocationType:
                  locationType,
                fromLocationId:
                  locationId,

                createdByStaffId,
                status: "COMPLETED",
              },
            });

          await applyStockMovement(
            tx,
            sourceMovement.id
          );

          // ==============================
          // DESTINATION MOVEMENT
          // ==============================
          const destinationMovement =
            await tx.stockMovement.create({
              data: {
                productId:
                  rule.destinationProductId,
                type:
                  MovementType.BREAK_BULK_IN,
                quantity:
                  destinationQuantity,

                toLocationType:
                  locationType,
                toLocationId:
                  locationId,

                createdByStaffId,
                status: "COMPLETED",
              },
            });

          await applyStockMovement(
            tx,
            destinationMovement.id
          );

          // ==============================
          // AUTHORITATIVE POST-CONVERSION
          // INVENTORY
          // ==============================
          const [
            updatedSourceInventory,
            updatedDestinationInventory,
          ] = await Promise.all([
            tx.inventory.findUnique({
              where: {
                productId_locationType_locationId:
                  {
                    productId:
                      rule.sourceProductId,
                    locationType,
                    locationId,
                  },
              },
              select: {
                quantity: true,
              },
            }),

            tx.inventory.findUnique({
              where: {
                productId_locationType_locationId:
                  {
                    productId:
                      rule.destinationProductId,
                    locationType,
                    locationId,
                  },
              },
              select: {
                quantity: true,
              },
            }),
          ]);

          if (!updatedSourceInventory) {
            throw new Error(
              "Source inventory record missing after conversion"
            );
          }

          if (
            !updatedDestinationInventory
          ) {
            throw new Error(
              "Destination inventory record missing after conversion"
            );
          }

          const sourceQuantityAfter =
            updatedSourceInventory.quantity;

          const sourceQuantityBefore =
            sourceQuantityAfter +
            sourceQuantity;

          const destinationQuantityAfter =
            updatedDestinationInventory.quantity;

          const destinationQuantityBefore =
            destinationQuantityAfter -
            destinationQuantity;

          // ==============================
          // SYNC BRANCH PRODUCT MIRROR
          // ==============================
          if (
            locationType ===
            LocationType.BRANCH
          ) {
            await tx.product.update({
              where: {
                id: rule.sourceProductId,
              },
              data: {
                stockQty:
                  sourceQuantityAfter,
              },
            });

            await tx.product.update({
              where: {
                id: rule.destinationProductId,
              },
              data: {
                stockQty:
                  destinationQuantityAfter,
              },
            });
          }

          // ==============================
          // AUDIT RECORD
          // ==============================
          const conversion =
            await tx.breakBulkConversion.create(
              {
                data: {
                  ruleId: rule.id,

                  sourceProductId:
                    rule.sourceProductId,

                  destinationProductId:
                    rule.destinationProductId,

                  locationType,
                  locationId,

                  sourceQuantityConverted:
                    sourceQuantity,

                  conversionRatio:
                    rule.conversionRatio,

                  destinationQuantityCreated:
                    destinationQuantity,

                  sourceQuantityBefore,
                  sourceQuantityAfter,

                  destinationQuantityBefore,
                  destinationQuantityAfter,

                  sourceMovementId:
                    sourceMovement.id,

                  destinationMovementId:
                    destinationMovement.id,

                  createdByStaffId,

                  note:
                    note?.trim() || null,
                },
              }
            );

          return {
            success: true,

            conversionId:
              conversion.id,

            rule: {
              id: rule.id,
              conversionRatio:
                rule.conversionRatio,
            },

            source: {
              productId:
                rule.sourceProduct.id,

              sku:
                rule.sourceProduct.sku,

              name:
                rule.sourceProduct.name,

              quantityConverted:
                sourceQuantity,

              quantityBefore:
                sourceQuantityBefore,

              quantityAfter:
                sourceQuantityAfter,

              movementId:
                sourceMovement.id,
            },

            destination: {
              productId:
                rule.destinationProduct.id,

              sku:
                rule.destinationProduct.sku,

              name:
                rule.destinationProduct.name,

              quantityCreated:
                destinationQuantity,

              quantityBefore:
                destinationQuantityBefore,

              quantityAfter:
                destinationQuantityAfter,

              movementId:
                destinationMovement.id,
            },

            location: {
              type: locationType,
              id: locationId,
            },
          };
        },
        {
          maxWait: 10_000,
          timeout: 30_000,
          isolationLevel:
            Prisma
              .TransactionIsolationLevel
              .Serializable,
        }
      );
    } catch (error) {
      const shouldRetry =
        isTransactionConflict(error) &&
        attempt <
          MAX_TRANSACTION_RETRIES;

      if (shouldRetry) {
        continue;
      }

      throw error;
    }
  }

  throw new Error(
    "Break Bulk transaction could not be completed"
  );
}