import { randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";

const MAX_TOKEN_ATTEMPTS = 3;

function createPublicToken() {
  return randomBytes(
    24
  ).toString("base64url");
}

export async function ensureEstimatePublicToken(
  estimateId: string
) {
  const estimate =
    await prisma.estimateRequest.findUnique({
      where: {
        id: estimateId,
      },
      select: {
        id: true,
        publicToken: true,
      },
    });

  if (!estimate) {
    throw new Error(
      "Estimate request not found."
    );
  }

  if (estimate.publicToken) {
    return estimate.publicToken;
  }

  for (
    let attempt = 1;
    attempt <= MAX_TOKEN_ATTEMPTS;
    attempt++
  ) {
    const publicToken =
      createPublicToken();

    try {
      const updated =
        await prisma.estimateRequest.update({
          where: {
            id: estimate.id,
          },
          data: {
            publicToken,
          },
          select: {
            publicToken: true,
          },
        });

      if (!updated.publicToken) {
        throw new Error(
          "Public quotation token was not created."
        );
      }

      return updated.publicToken;
    } catch (error: any) {
      const isUniqueCollision =
        error?.code === "P2002";

      if (
        !isUniqueCollision ||
        attempt ===
          MAX_TOKEN_ATTEMPTS
      ) {
        throw error;
      }
    }
  }

  throw new Error(
    "Unable to create public quotation token."
  );
}
