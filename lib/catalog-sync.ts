import { Prisma, Product } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validateSyncItem } from "./product-sync/validator";
import {
  buildProductUpdate,
  buildProductCreate,
} from "./product-sync/mapper";
import type {
  SyncItem,
  SyncReport,
} from "./product-sync/types";








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

await prisma.$transaction(async (tx) => {
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
    `Missing existingId for UPDATE: ${item.product.sku ?? "Unknown SKU"}`
  );

  continue;
}

  await tx.product.update({
  where: {
    id: item.existingId,
  },
  data: buildProductUpdate(item),
});
}
    if (item.action === "INSERT") {
  await tx.product.create({
    data: buildProductCreate(item) as Prisma.ProductCreateInput,
  });
}
  }
});

return report;


}