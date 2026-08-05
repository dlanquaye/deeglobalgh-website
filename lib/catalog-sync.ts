import {
  LocationType,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validateSyncItem } from "./product-sync/validator";
import {
  buildProductCreate,
  buildProductUpdate,
} from "./product-sync/mapper";
import type {
  SyncItem,
  SyncReport,
} from "./product-sync/types";

const BRANCH_ID = "cmq4b407s0000g3jg31elgm80";
const WAREHOUSE_ID = "cmq4b5g1j0001g3jgy501zz76";

const CATALOG_TRANSACTION_MAX_WAIT_MS = 10_000;
const CATALOG_TRANSACTION_TIMEOUT_MS = 60_000;

export async function synchronizeCatalog(
  items: SyncItem[],
  dryRun = true
): Promise<SyncReport> {
  const report: SyncReport = {
    inserted: 0,
    updated: 0,
    review: 0,
    errors: 0,
    messages: [],
  };

  for (const item of items) {
    switch (item.action) {
      case "UPDATE":
        report.updated++;
        break;

      case "INSERT":
        report.inserted++;
        break;

      case "REVIEW":
        report.review++;
        break;
    }
  }

  if (dryRun) {
    return report;
  }

  await prisma.$transaction(
    async (tx) => {
      for (const item of items) {
        const validation = validateSyncItem(item);

        if (!validation.valid) {
          report.errors += validation.errors.length;
          report.messages.push(...validation.errors);
          continue;
        }

        if (item.action === "UPDATE") {
          if (!item.existingId) {
            report.errors++;

            report.messages.push(
              `Missing existingId for UPDATE: ${
                item.product.sku ?? "Unknown SKU"
              }`
            );

            continue;
          }

          await tx.product.update({
            where: {
              id: item.existingId,
            },
            data: buildProductUpdate(item),
          });

          continue;
        }

        if (item.action === "INSERT") {
          const createdProduct = await tx.product.create({
            data: buildProductCreate(
              item
            ) as Prisma.ProductCreateInput,
          });

          await tx.inventory.createMany({
            data: [
              {
                productId: createdProduct.id,
                locationType: LocationType.BRANCH,
                locationId: BRANCH_ID,
                quantity: createdProduct.stockQty,
              },
              {
                productId: createdProduct.id,
                locationType: LocationType.WAREHOUSE,
                locationId: WAREHOUSE_ID,
                quantity: 0,
              },
            ],
          });
        }
      }
    },
    {
      maxWait: CATALOG_TRANSACTION_MAX_WAIT_MS,
      timeout: CATALOG_TRANSACTION_TIMEOUT_MS,
    }
  );

  return report;
}