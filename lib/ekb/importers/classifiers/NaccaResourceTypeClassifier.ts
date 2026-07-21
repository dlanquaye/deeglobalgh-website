/**
 * ============================================================
 * DeeglobalGH Educational Knowledge Platform
 * NaCCA Resource-Type Classifier
 * ============================================================
 *
 * Determines the educational publication form of a NaCCA
 * resource from its title.
 *
 * The official NaCCA document does not consistently group
 * resources under publication-form headings. Instead, terms
 * such as:
 *
 * - Learner's Book;
 * - Pupil's Course Book;
 * - Activity Book;
 * - Workbook;
 * - Teacher's Guide;
 *
 * appear inside individual resource titles.
 *
 * This classifier therefore evaluates every parsed title
 * independently.
 *
 * Classification precedence is important:
 *
 * 1. Teacher's Guide
 * 2. Workbook
 * 3. Learner Book
 * 4. Textbook
 *
 * A title may contain more than one publication-form term.
 * For example:
 *
 * "Coding Textbook for Children - Teachers Guide"
 *
 * must be classified as "Teacher's Guide", not "Textbook".
 *
 * This class performs no database writes and has no dependency
 * on Prisma or the synchronisation engine.
 * ============================================================
 */

export type NaccaClassifiedResourceType =
  | "Textbook"
  | "Learner Book"
  | "Workbook"
  | "Teacher's Guide";

interface ResourceTypeRule {
  resourceType:
    NaccaClassifiedResourceType;

  patterns:
    readonly RegExp[];
}

const DEFAULT_RESOURCE_TYPE:
  NaccaClassifiedResourceType =
  "Textbook";

const RESOURCE_TYPE_RULES:
  readonly ResourceTypeRule[] = [
    {
      resourceType:
        "Teacher's Guide",

      patterns: [
        /\bteacher(?:'s|s)?\s+guides?\b/i,
        /\bteachers?\s+guides?\b/i,
        /\bteacher(?:'s|s)?\s+manuals?\b/i,
        /\binstructor(?:'s|s)?\s+manuals?\b/i,
        /\bteaching\s+guides?\b/i,
        /\bfacilitator(?:'s|s)?\s+guides?\b/i,
      ],
    },
    {
      resourceType:
        "Workbook",

      patterns: [
        /\bwork\s*books?\b/i,
        /\bactivity\s+books?\b/i,
        /\bexercise\s+books?\b/i,
        /\bpractice\s+books?\b/i,
        /\bstudent\s+work\s*books?\b/i,
        /\bpupil(?:'s|s)?\s+work\s*books?\b/i,
        /\blearner(?:'s|s)?\s+work\s*books?\b/i,
      ],
    },
    {
      resourceType:
        "Learner Book",

      patterns: [
        /\blearner(?:'s|s)?\s+books?\b/i,
        /\bpupil(?:'s|s)?\s+books?\b/i,
        /\bpupil(?:'s|s)?\s+course\s+books?\b/i,
        /\bstudent(?:'s|s)?\s+books?\b/i,
        /\bstudent(?:'s|s)?\s+course\s+books?\b/i,
        /\blearner(?:'s|s)?\s+course\s+books?\b/i,
        /\bcourse\s+books?\b/i,
      ],
    },
    {
      resourceType:
        "Textbook",

      patterns: [
        /\btext\s*books?\b/i,
      ],
    },
  ];

export class NaccaResourceTypeClassifier {
  classify(
    title:
      string,
  ): NaccaClassifiedResourceType {
    const normalisedTitle =
      this.normalise(
        title,
      );

    if (!normalisedTitle) {
      return DEFAULT_RESOURCE_TYPE;
    }

    for (
      const rule
      of RESOURCE_TYPE_RULES
    ) {
      const matches =
        rule.patterns.some(
          (
            pattern,
          ) =>
            pattern.test(
              normalisedTitle,
            ),
        );

      if (matches) {
        return rule.resourceType;
      }
    }

    return DEFAULT_RESOURCE_TYPE;
  }

  private normalise(
    value:
      string,
  ): string {
    return value
      .replace(
        /\u00a0/g,
        " ",
      )
      .replace(
        /\u200b/g,
        "",
      )
      .replace(
        /\ufeff/g,
        "",
      )
      .replace(
        /[’‘]/g,
        "'",
      )
      .replace(
        /[‐-‒–—]/g,
        "-",
      )
      .replace(
        /\s+/g,
        " ",
      )
      .trim();
  }
}