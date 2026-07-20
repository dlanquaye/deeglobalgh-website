export function generateEntityCode(
  prefix: string,
  value: string,
): string {
  const normalisedPrefix =
    prefix
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  const normalisedValue =
    value
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  if (!normalisedPrefix) {
    throw new Error(
      "Entity code prefix is required.",
    );
  }

  if (!normalisedValue) {
    throw new Error(
      "Entity code value is required.",
    );
  }

  return `${normalisedPrefix}_${normalisedValue}`;
}