import {
  EducationalFingerprint,
  FingerprintDimension,
} from "./types";

export interface FingerprintComparison {
  similarity: number;
  matchingDimensions: string[];
  differentDimensions: string[];
  missingDimensions: string[];
}

const dimensionWeights = {
  subject: 40,
  curriculum: 25,
  resource: 15,
  language: 10,
  publisher: 10,
  activity: 0,
} as const;

const dimensions = Object.keys(dimensionWeights) as Array<
  keyof typeof dimensionWeights
>;

export function compareFingerprints(
  first: EducationalFingerprint,
  second: EducationalFingerprint
): FingerprintComparison {
  const matchingDimensions: string[] = [];
  const differentDimensions: string[] = [];
  const missingDimensions: string[] = [];

  let matchedWeight = 0;
  let possibleWeight = 0;

  for (const dimension of dimensions) {
    const left = first[dimension] as FingerprintDimension | undefined;
    const right = second[dimension] as FingerprintDimension | undefined;

    // Ignore dimensions missing on both products
    if (!left && !right) {
      continue;
    }

    // Record dimensions that exist on only one product
    if (!left || !right) {
      missingDimensions.push(dimension);
      continue;
    }

    const weight = dimensionWeights[dimension];
    possibleWeight += weight;

    if (left.nodeCode === right.nodeCode) {
      matchedWeight += weight;
      matchingDimensions.push(dimension);
    } else {
      differentDimensions.push(dimension);
    }
  }

  return {
    similarity:
      possibleWeight === 0
        ? 0
        : Math.round((matchedWeight / possibleWeight) * 100),

    matchingDimensions,
    differentDimensions,
    missingDimensions,
  };
}