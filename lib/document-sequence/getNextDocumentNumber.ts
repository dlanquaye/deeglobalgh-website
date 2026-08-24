import { prisma } from "@/lib/prisma";

export async function getNextDocumentNumber(
  document: string
): Promise<string> {
  const now = new Date();

  const year = now.getFullYear();
  const month =
    now.getMonth() + 1;

  const sequence =
    await prisma.$transaction(
      async (tx) => {
        let record =
          await tx.documentSequence.findUnique({
            where: {
              document_year_month: {
                document,
                year,
                month,
              },
            },
          });

        if (!record) {
          record =
            await tx.documentSequence.create({
              data: {
                document,
                year,
                month,
                lastNumber:
                  1,
              },
            });

          return record;
        }

        record =
          await tx.documentSequence.update({
            where: {
              id:
                record.id,
            },

            data: {
              lastNumber: {
                increment:
                  1,
              },
            },
          });

        return record;
      },

      /*
       * Neon may need longer than Prisma's
       * default interactive-transaction wait
       * during a cold connection or brief
       * database latency.
       *
       * Keep the sequence allocation atomic,
       * but allow enough time for the
       * transaction to start and complete.
       */
      {
        maxWait:
          10000,

        timeout:
          30000,
      }
    );

  const runningNumber =
    sequence.lastNumber
      .toString()
      .padStart(
        6,
        "0"
      );

  const monthString =
    month
      .toString()
      .padStart(
        2,
        "0"
      );

  return `${document}-${year}-${monthString}-${runningNumber}`;
}