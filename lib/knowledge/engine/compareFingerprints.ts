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
  level: 35,
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
  second: EducationalFingerprint,
): FingerprintComparison {
  const matchingDimensions: string[] = [];
  const differentDimensions: string[] = [];
  const missingDimensions: string[] = [];

  let matchedWeight = 0;
  let possibleWeight = 0;

  for (const dimension of dimensions) {
    const left = first[dimension] as FingerprintDimension | undefined;
    const right = second[dimension] as FingerprintDimension | undefined;

    // A dimension missing from both fingerprints provides no evidence.
    if (!left && !right) {
      continue;
    }

    const weight = dimensionWeights[dimension];

    // Any dimension present on either side contributes to the possible score.
    possibleWeight += weight;

    // A dimension present on only one side lowers the similarity.
    if (!left || !right) {
      missingDimensions.push(dimension);
      continue;
    }

    if (left.nodeCode === right.nodeCode) {
      matchedWeight += weight;
      matchingDimensions.push(dimension);
    } else {
      differentDimensions.push(dimension);
    }
  }

  const similarity =
    possibleWeight === 0
      ? 0
      : Math.round((matchedWeight / possibleWeight) * 100);

  return {
    similarity,
    matchingDimensions,
    differentDimensions,
    missingDimensions,
  };
}