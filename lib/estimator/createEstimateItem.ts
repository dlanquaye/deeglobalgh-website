import { prisma } from "@/lib/prisma";

import { getProductCatalogue } from "@/lib/knowledge/repository/getProductCatalogue";
import { findBestMatches } from "@/lib/knowledge/engine/findBestMatches";
import { Decimal } from "@prisma/client/runtime/library";

import {
  MatchMethod,
  MatchStatus,
} from "@prisma/client";

export async function createEstimateItem(
  estimateId: string,
  productName: string,
  quantity: number,
  productId?: string
)

{
  const existingItems = await prisma.estimateItem.count({
    where: {
      estimateRequestId: estimateId,
    },
  });

  const nextLineNumber = existingItems + 1;

  if (productId) {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    console.log("FAST PATH - Product selected from autocomplete");
    throw new Error("Selected product not found.");
  }

  const totalPrice =
    product.retailPrice * quantity;

  return prisma.estimateItem.create({
    data: {
      estimateRequestId: estimateId,
      lineNumber: nextLineNumber,

      description: productName,

      quantity,

      productId: product.id,

      matchMethod: "MANUAL",

      matchStatus: "MATCHED",

      matchConfidence: 100,

      unitPrice: new Decimal(product.retailPrice),

      totalPrice: new Decimal(totalPrice),
    },
  });
}

  const catalogue = await getProductCatalogue();

  const matches = findBestMatches(
    productName,
    catalogue,
    5
  );
  console.log("KNOWLEDGE ENGINE PATH - Free text matching");

  const bestMatch = matches[0];

  const matchedProduct = bestMatch?.product;

  const matchConfidence = bestMatch?.similarity ?? null;

  const matchStatus =
    matchedProduct != null
      ? MatchStatus.MATCHED
      : MatchStatus.NOT_FOUND;

  const matchMethod =
    matchedProduct != null
      ? MatchMethod.AUTO
      : MatchMethod.NONE;

  const unitPrice = matchedProduct?.retailPrice ?? null;

  const totalPrice =
    unitPrice != null
      ? unitPrice * quantity
      : null;

  const item = await prisma.estimateItem.create({
    data: {
      estimateRequestId: estimateId,
      lineNumber: nextLineNumber,

      description: productName,
      quantity,

      productId: matchedProduct?.id,

      matchMethod,
      matchStatus,
      matchConfidence,

      unitPrice,
      totalPrice,
    },
  });

  return item;
}