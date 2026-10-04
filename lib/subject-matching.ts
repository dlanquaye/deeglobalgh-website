import { getPublicSubject, type PublicSubject } from "./subjects";

/**
 * Subject Discovery matching utilities.
 *
 * This module is intentionally independent from Prisma, EKB and the
 * educational classification system. It supports the public Subject
 * Discovery layer only.
 */

/**
 * Normalises general catalogue/search text for subject comparison.
 *
 * Examples:
 *   "Religious & Moral Education"
 *     -> "religious and moral education"
 *
 *   "  English   Language "
 *     -> "english language"
 */
export function normalizeSubjectText(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .replace(/[–—-]/g, " ")
    .replace(/[.,/#!$%^*;:{}=\-_`~()?[\]\\"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalises abbreviations so punctuation and spacing do not prevent
 * recognition.
 *
 * Examples:
 *   "RME"    -> "rme"
 *   "R.M.E." -> "rme"
 *   "R M E"  -> "rme"
 *   "I.C.T." -> "ict"
 *
 * Normal words and phrases continue to use the general text
 * normalisation rules.
 */
export function normalizeSubjectAlias(value: string): string {
  const normalized = normalizeSubjectText(value);

  const compact = normalized.replace(/\s+/g, "");

  if (/^[a-z]{2,5}$/.test(compact) && normalized.includes(" ")) {
    return compact;
  }

  return normalized;
}

/**
 * Compares two subject terms after normalisation.
 *
 * This is intentionally exact. Substring/phrase matching belongs in
 * the later product-classification layer where precedence and level
 * context can be applied safely.
 */
export function subjectTermsEqual(left: string, right: string): boolean {
  return normalizeSubjectAlias(left) === normalizeSubjectAlias(right);
}

/**
 * Matching precedence for catalogue subject recognition.
 *
 * More specific subject identities must be evaluated before broader
 * subjects whose names may also occur inside them.
 *
 * This order does not change subject-family relationships and does not
 * rename catalogue products.
 */
export const SUBJECT_MATCHING_PRECEDENCE = [
  "additional-mathematics",
  "computer-science",
  "creative-arts-and-design",
  "general-science",
  "integrated-science",
  "biology",
  "chemistry",
  "physics",
  "literature",
  "literacy",
  "numeracy",
  "english",
  "mathematics",
  "science",
  "computing",
  "rme",
  "history",
  "creative-arts",
  "owop",
  "social-studies",
  "career-technology",
  "economics",
] as const;

export type SubjectMatchingSlug =
  (typeof SUBJECT_MATCHING_PRECEDENCE)[number];

/**
 * Returns subjects in catalogue-matching precedence order.
 *
 * Subject names and aliases remain owned by lib/subjects.ts.
 * This matcher only controls the order in which those configured
 * subjects will eventually be evaluated against catalogue evidence.
 */
export function getSubjectsInMatchingOrder(): PublicSubject[] {
  return SUBJECT_MATCHING_PRECEDENCE.map((slug) => {
    const subject = getPublicSubject(slug);

    if (!subject) {
      throw new Error(
        `Subject matching configuration references unknown subject: ${slug}`
      );
    }

    return subject;
  });
}

/**
 * Minimal catalogue evidence required for subject recognition.
 *
 * This deliberately excludes SKU, brand, publisher and all EKB fields.
 * Additional evidence should only be introduced later if catalogue
 * validation proves it is necessary.
 */
export type SubjectProductEvidence = {
  name: string;
  categorySlug?: string | null;
  subCategorySlug?: string | null;
  levelSlugs?: string[] | null;
  tags?: string[] | null;
};

/**
 * Describes where the winning subject evidence came from.
 */
export type SubjectMatchSource =
  | "name"
  | "subcategory"
  | "tags"
  | "exception";

/**
 * Result returned by the eventual product subject classifier.
 *
 * A product receives one primary subject identity. Broader family
 * relationships remain defined by the subject taxonomy and are not
 * returned as additional competing matches.
 */
export type SubjectMatch = {
  subject: PublicSubject;
  source: SubjectMatchSource;
  matchedTerm: string;
};

/**
 * Tests whether a normalised subject term appears as a complete phrase
 * within normalised catalogue text.
 *
 * Both values must already have passed through the subject
 * normalisation functions.
 */
function containsSubjectPhrase(text: string, phrase: string): boolean {
  if (!text || !phrase) {
    return false;
  }

  return ` ${text} `.includes(` ${phrase} `);
}

/**
 * Attempts to recognise a subject using the product name only.
 *
 * Product-name evidence is deliberately evaluated before subcategory
 * or tag evidence because the printed/catalogued product identity is
 * our strongest current source of subject truth.
 */
export function matchSubjectFromProductName(
  product: SubjectProductEvidence
): SubjectMatch | null {
  const normalizedName = normalizeSubjectText(product.name);

  if (!normalizedName) {
    return null;
  }

  for (const subject of getSubjectsInMatchingOrder()) {
    const candidateTerms = [subject.name, ...subject.aliases];

    for (const term of candidateTerms) {
      const normalizedTerm = normalizeSubjectText(term);

      if (containsSubjectPhrase(normalizedName, normalizedTerm)) {
        return {
          subject,
          source: "name",
          matchedTerm: term,
        };
      }
    }
  }

  return null;
}

/**
 * Existing catalogue subcategories that are sufficiently specific to
 * act as fallback subject evidence.
 *
 * Generic level/bucket subcategories such as basic-1-3, basic-4-6,
 * pre-school, jhs, jhs-combined, shs and shs-combined are deliberately
 * excluded.
 *
 * Keep this whitelist conservative. A new mapping should only be added
 * after catalogue evidence proves that the subcategory represents one
 * subject consistently.
 */
export const TRUSTED_SUBCATEGORY_SUBJECTS = {
  "rme-textbooks": "rme",
} as const satisfies Partial<Record<string, SubjectMatchingSlug>>;

/**
 * Attempts subject recognition from a trusted subject-specific
 * subcategory.
 *
 * This is fallback evidence only. Product-name matching must always be
 * attempted first by the final classifier.
 */
export function matchSubjectFromSubcategory(
  product: SubjectProductEvidence
): SubjectMatch | null {
  const subcategory = product.subCategorySlug?.trim().toLowerCase();

  if (!subcategory) {
    return null;
  }

  const subjectSlug =
    TRUSTED_SUBCATEGORY_SUBJECTS[
      subcategory as keyof typeof TRUSTED_SUBCATEGORY_SUBJECTS
    ];

  if (!subjectSlug) {
    return null;
  }

  const subject = getPublicSubject(subjectSlug);

  if (!subject) {
    throw new Error(
      `Trusted subject subcategory references unknown subject: ${subjectSlug}`
    );
  }

  return {
    subject,
    source: "subcategory",
    matchedTerm: product.subCategorySlug ?? subcategory,
  };
}

/**
 * Small, explicit catalogue exceptions for products whose subject
 * identity cannot be established reliably from their product name or
 * trusted subject-specific subcategory.
 *
 * Exceptions use exact normalised product names. They must remain
 * evidence-based and deliberately rare; this is not a general alias
 * or fuzzy-matching mechanism.
 */
export const SUBJECT_PRODUCT_NAME_EXCEPTIONS = {
  "the beacon of light": "literature",
  "the beacon of light commentary": "literature",
  "the beacon of light workbook": "literature",
} as const satisfies Partial<Record<string, SubjectMatchingSlug>>;

/**
 * Attempts subject recognition from an explicitly documented catalogue
 * exception.
 */
export function matchSubjectFromException(
  product: SubjectProductEvidence
): SubjectMatch | null {
  const normalizedName = normalizeSubjectText(product.name);

  if (!normalizedName) {
    return null;
  }

  const subjectSlug =
    SUBJECT_PRODUCT_NAME_EXCEPTIONS[
      normalizedName as keyof typeof SUBJECT_PRODUCT_NAME_EXCEPTIONS
    ];

  if (!subjectSlug) {
    return null;
  }

  const subject = getPublicSubject(subjectSlug);

  if (!subject) {
    throw new Error(
      `Subject product exception references unknown subject: ${subjectSlug}`
    );
  }

  return {
    subject,
    source: "exception",
    matchedTerm: product.name,
  };
}

/**
 * Classifies one catalogue product into one primary Subject Discovery
 * identity.
 *
 * Evidence precedence:
 *   1. Product name
 *   2. Trusted subject-specific subcategory
 *   3. Explicit catalogue exception
 *
 * Tags are intentionally not used by the production classifier.
 * Current public-catalogue validation showed that product-name evidence
 * recognises essentially the entire catalogue, while tags can contain
 * related or conflicting search terminology.
 */
export function matchProductSubject(
  product: SubjectProductEvidence
): SubjectMatch | null {
  return (
    matchSubjectFromProductName(product) ??
    matchSubjectFromSubcategory(product) ??
    matchSubjectFromException(product)
  );
}
