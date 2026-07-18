import { BOOKS } from "./books";
import { Book } from "../types";
import { buildEducationalFingerprint } from "../matcher/fingerprint";
import { compareFingerprints } from "../matcher/compare";
import {
  MatchResult,
  scoreFingerprintMatch,
} from "../matcher/scorer";

export interface BookMatch {
  book: Book;
  result: MatchResult;
}

export class BookRepository {
  /**
   * Find the best matching Book.
   */
  static findBestMatch(
    text: string,
  ): BookMatch | undefined {
    const fingerprint = buildEducationalFingerprint(text);

    let best: BookMatch | undefined;

    for (const book of BOOKS) {
      const candidateFingerprint =
        buildEducationalFingerprint(
          [
            book.title,
            book.levelCode,
            book.resourceTypeCode,
          ].join(" "),
        );

      const comparison = compareFingerprints(
        fingerprint,
        candidateFingerprint,
      );

      const result = scoreFingerprintMatch(comparison);

      if (
        !best ||
        result.score > best.result.score
      ) {
        best = {
          book,
          result,
        };
      }
    }

    return best;
  }

  /**
   * Return all matches ordered by score.
   */
  static search(
    text: string,
  ): BookMatch[] {
    const fingerprint =
      buildEducationalFingerprint(text);

    return BOOKS
      .map((book) => {
        const candidateFingerprint =
          buildEducationalFingerprint(
            [
              book.title,
              book.levelCode,
              book.resourceTypeCode,
            ].join(" "),
          );

        const comparison =
          compareFingerprints(
            fingerprint,
            candidateFingerprint,
          );

        return {
          book,
          result:
            scoreFingerprintMatch(comparison),
        };
      })
      .sort(
        (a, b) =>
          b.result.score - a.result.score,
      );
  }
}