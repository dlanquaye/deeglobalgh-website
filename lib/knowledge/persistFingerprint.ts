import { prisma } from "@/lib/prisma";
import { buildEducationalFingerprint } from "./engine/buildEducationalFingerprint";

export async function persistFingerprint(product: {
  id: string;
  productName: string;
}) {
  const fingerprint = buildEducationalFingerprint(product.productName);

  await prisma.productFingerprint.upsert({
    where: {
      productId: product.id,
    },

    create: {
      productId: product.id,

      subjectNodeCode: fingerprint.subject?.nodeCode,
      publisherNodeCode: fingerprint.publisher?.nodeCode,
      curriculumNodeCode: fingerprint.curriculum?.nodeCode,
      resourceNodeCode: fingerprint.resource?.nodeCode,
      activityNodeCode: fingerprint.activity?.nodeCode,
      languageNodeCode: fingerprint.language?.nodeCode,

      confidence: fingerprint.totalConfidence,

      engineVersion: 2,
    },

    update: {
      subjectNodeCode: fingerprint.subject?.nodeCode,
      publisherNodeCode: fingerprint.publisher?.nodeCode,
      curriculumNodeCode: fingerprint.curriculum?.nodeCode,
      resourceNodeCode: fingerprint.resource?.nodeCode,
      activityNodeCode: fingerprint.activity?.nodeCode,
      languageNodeCode: fingerprint.language?.nodeCode,

      confidence: fingerprint.totalConfidence,

      engineVersion: 2,
    },
  });

  return fingerprint;
}