import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildEducationalFingerprint,
} from "@/lib/knowledge/engine/buildEducationalFingerprint";

describe(
  "knowledge engine educational fingerprint",
  () => {
    it(
      "classifies KG numeracy as Mathematics",
      () => {
        const fingerprint =
          buildEducationalFingerprint(
            "Numeracy KG1 Active Kids"
          );

        expect(
          fingerprint.subject?.nodeCode
        ).toBe(
          "SUB_MATHEMATICS"
        );
      }
    );

    it(
      "classifies KG creativity as Creative Arts",
      () => {
        const fingerprint =
          buildEducationalFingerprint(
            "Creativity Masterman Arts (KG1)"
          );

        expect(
          fingerprint.subject?.nodeCode
        ).toBe(
          "SUB_CREATIVE_ARTS"
        );
      }
    );

    it(
      "classifies KG phonics as English",
      () => {
        const fingerprint =
          buildEducationalFingerprint(
            "Phonics - Best Brain (KG1)"
          );

        expect(
          fingerprint.subject?.nodeCode
        ).toBe(
          "SUB_ENGLISH"
        );
      }
    );

    it(
      "classifies language and literacy as English",
      () => {
        const fingerprint =
          buildEducationalFingerprint(
            "Language & Literacy Masterman (KG1)"
          );

        expect(
          fingerprint.subject?.nodeCode
        ).toBe(
          "SUB_ENGLISH"
        );
      }
    );

    it(
      "continues to classify ordinary Mathematics titles",
      () => {
        const fingerprint =
          buildEducationalFingerprint(
            "Mathematics for Basic 3"
          );

        expect(
          fingerprint.subject?.nodeCode
        ).toBe(
          "SUB_MATHEMATICS"
        );
      }
    );

    it(
      "continues to classify ordinary English titles",
      () => {
        const fingerprint =
          buildEducationalFingerprint(
            "English Language for Basic 3"
          );

        expect(
          fingerprint.subject?.nodeCode
        ).toBe(
          "SUB_ENGLISH"
        );
      }
    );

    it(
      "classifies Masterman as the publisher",
      () => {
        const fingerprint =
          buildEducationalFingerprint(
            "Creativity Masterman Arts (KG1)"
          );

        expect(
          fingerprint.publisher?.nodeCode
        ).toBe(
          "PUB_MASTERMAN"
        );
      }
    );

    it(
      "classifies Active Kids as Kenmas publisher evidence",
      () => {
        const fingerprint =
          buildEducationalFingerprint(
            "Numeracy KG1 Active Kids"
          );

        expect(
          fingerprint.publisher?.nodeCode
        ).toBe(
          "PUB_KENMAS"
        );
      }
    );

        it(
      "continues to classify Best Brain correctly",
      () => {
        const fingerprint =
          buildEducationalFingerprint(
            "Phonics - Best Brain (KG1)"
          );

        expect(
          fingerprint.publisher?.nodeCode
        ).toBe(
          "PUB_BEST_BRAIN"
        );
      }
    );

    it(
      "classifies OWOP as Our World Our People",
      () => {
        const fingerprint =
          buildEducationalFingerprint(
            "OWOP Golden Series"
          );

        expect(
          fingerprint.subject?.nodeCode
        ).toBe(
          "SUB_OUR_WORLD"
        );
      }
    );
  }
);