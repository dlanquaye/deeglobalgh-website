import { prisma } from "@/lib/prisma";
import { ProductMatchCandidate } from "../engine/findBestMatches";

export async function getProductCatalogue(): Promise<ProductMatchCandidate[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    include: {
      fingerprint: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return products.map((product) => ({
    id: product.id,
    sku: product.sku,
    productName: product.name,
    retailPrice: product.retailPrice,
    stockQty: product.stockQty,

    fingerprint: product.fingerprint
      ? {
          totalConfidence: product.fingerprint.confidence,

          subject: product.fingerprint.subjectNodeCode
            ? {
                nodeCode: product.fingerprint.subjectNodeCode,
                confidence: product.fingerprint.confidence,
                evidence: [],
              }
            : undefined,

          publisher: product.fingerprint.publisherNodeCode
            ? {
                nodeCode: product.fingerprint.publisherNodeCode,
                confidence: product.fingerprint.confidence,
                evidence: [],
              }
            : undefined,

          curriculum: product.fingerprint.curriculumNodeCode
            ? {
                nodeCode: product.fingerprint.curriculumNodeCode,
                confidence: product.fingerprint.confidence,
                evidence: [],
              }
            : undefined,

          resource: product.fingerprint.resourceNodeCode
            ? {
                nodeCode: product.fingerprint.resourceNodeCode,
                confidence: product.fingerprint.confidence,
                evidence: [],
              }
            : undefined,

          language: product.fingerprint.languageNodeCode
            ? {
                nodeCode: product.fingerprint.languageNodeCode,
                confidence: product.fingerprint.confidence,
                evidence: [],
              }
            : undefined,

          activity: product.fingerprint.activityNodeCode
            ? {
                nodeCode: product.fingerprint.activityNodeCode,
                confidence: product.fingerprint.confidence,
                evidence: [],
              }
            : undefined,
        }
      : undefined,
  }));
}