import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  attachmentFindUnique:
    vi.fn(),

  attachmentUpdateMany:
    vi.fn(),

  extractText:
    vi.fn(),

  splitSchoolListWithSections:
    vi.fn(),

  cleanSchoolList:
    vi.fn(),

  matchSchoolList:
    vi.fn(),

  createEstimateItemsFromMatches:
    vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    estimateAttachment: {
      findUnique:
        mocks.attachmentFindUnique,

      updateMany:
        mocks.attachmentUpdateMany,
    },
  },
}));

vi.mock("@/lib/ocr/extractText", () => ({
  extractText:
    mocks.extractText,
}));

vi.mock("@/lib/ocr/splitSchoolList", () => ({
  splitSchoolListWithSections:
    mocks.splitSchoolListWithSections,
}));

vi.mock("@/lib/ocr/cleanSchoolList", () => ({
  cleanSchoolList:
    mocks.cleanSchoolList,
}));

vi.mock("@/lib/ocr/matchSchoolList", () => ({
  matchSchoolList:
    mocks.matchSchoolList,
}));

vi.mock(
  "@/lib/estimator/createEstimateItemsFromMatches",
  () => ({
    createEstimateItemsFromMatches:
      mocks.createEstimateItemsFromMatches,
  })
);

import { processSchoolList } from "@/lib/estimator/processSchoolList";

describe(
  "processSchoolList",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      mocks.extractText
        .mockResolvedValue(
          "KG1 BOOKS\n1. OWOP Golden Series"
        );

      mocks.splitSchoolListWithSections
        .mockReturnValue([
          {
            text:
              "OWOP Golden Series",

            section:
              "TEXTBOOKS",
          },
        ]);

      mocks.cleanSchoolList
        .mockImplementation(
          (lines: string[]) =>
            lines
        );

      mocks.matchSchoolList
        .mockResolvedValue([
          {
            originalLine:
              "OWOP Golden Series",

            matchedProductId:
              "product-1",

            similarity:
              88,
          },
        ]);

      mocks.createEstimateItemsFromMatches
        .mockResolvedValue({
          booksFound:
            1,

          matchedBooks:
            1,
        });
    });

    it(
      "rejects an attachment that has already been completed without running OCR or creating items",
      async () => {
        mocks.attachmentFindUnique
          .mockResolvedValueOnce({
            id:
              "attachment-1",

            estimateRequestId:
              "estimate-1",

            filePath:
              "/uploads/kg1.jpg",

            ocrStatus:
              "COMPLETED",
          })
          .mockResolvedValueOnce({
            ocrStatus:
              "COMPLETED",
          });

        /*
         * The atomic PROCESSING claim fails because
         * the attachment is already COMPLETED.
         */
        mocks.attachmentUpdateMany
          .mockResolvedValue({
            count:
              0,
          });

        await expect(
          processSchoolList(
            "attachment-1"
          )
        ).rejects.toThrow(
          "This school list has already been processed."
        );

        expect(
          mocks.attachmentUpdateMany
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          mocks.extractText
        ).not.toHaveBeenCalled();

        expect(
          mocks.splitSchoolListWithSections
        ).not.toHaveBeenCalled();

        expect(
          mocks.matchSchoolList
        ).not.toHaveBeenCalled();

        expect(
          mocks.createEstimateItemsFromMatches
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "allows one pending attachment to be claimed and processed",
      async () => {
        mocks.attachmentFindUnique
          .mockResolvedValue({
            id:
              "attachment-1",

            estimateRequestId:
              "estimate-1",

            filePath:
              "/uploads/kg1.jpg",

            ocrStatus:
              "PENDING",
          });

        mocks.attachmentUpdateMany
          .mockResolvedValue({
            count:
              1,
          });

        const result =
          await processSchoolList(
            "attachment-1"
          );

        expect(
          mocks.extractText
        ).toHaveBeenCalledWith(
          "/uploads/kg1.jpg"
        );

        expect(
          mocks.matchSchoolList
        ).toHaveBeenCalledWith(
          [
            "OWOP Golden Series",
          ],
          "KG1"
        );

        expect(
          mocks.createEstimateItemsFromMatches
        ).toHaveBeenCalledWith(
          "estimate-1",
          [
            {
              originalLine:
                "OWOP Golden Series",

              matchedProductId:
                "product-1",

              similarity:
                88,
            },
          ],
          {
            attachmentId:
              "attachment-1",

            ocrText:
              "KG1 BOOKS\n1. OWOP Golden Series",
          }
        );

        expect(
          result
        ).toEqual({
          booksFound:
            1,

          matchedBooks:
            1,
        });
      }
    );

    it(
      "rejects a second concurrent processing attempt while the attachment is already processing",
      async () => {
        mocks.attachmentFindUnique
          .mockResolvedValueOnce({
            id:
              "attachment-1",

            estimateRequestId:
              "estimate-1",

            filePath:
              "/uploads/kg1.jpg",

            ocrStatus:
              "PROCESSING",
          })
          .mockResolvedValueOnce({
            ocrStatus:
              "PROCESSING",
          });

        mocks.attachmentUpdateMany
          .mockResolvedValue({
            count:
              0,
          });

        await expect(
          processSchoolList(
            "attachment-1"
          )
        ).rejects.toThrow(
          "This school list is already being processed."
        );

        expect(
          mocks.extractText
        ).not.toHaveBeenCalled();

        expect(
          mocks.createEstimateItemsFromMatches
        ).not.toHaveBeenCalled();
      }
    );
  }
);