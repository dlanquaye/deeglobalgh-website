import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type AuditClassification = "CORE" | "RELATIONSHIP" | "OPTIONAL";

type AuditRow = {
  name: string;
  count: number;
  classification: AuditClassification;
  minimumExpected?: number;
  note?: string;
};

type AuditStatus = "PASS" | "WARNING" | "INFORMATION";

function formatCount(count: number): string {
  return count.toLocaleString();
}

function formatRow(row: AuditRow): string {
  return `${row.name.padEnd(42, ".")} ${formatCount(row.count)}`;
}

async function collectAuditRows(): Promise<AuditRow[]> {
  return [
    {
      name: "EducationalEntity",
      count: await prisma.educationalEntity.count(),
      classification: "CORE",
      minimumExpected: 1,
    },
    {
      name: "EducationalPublisher",
      count: await prisma.educationalPublisher.count(),
      classification: "CORE",
      minimumExpected: 1,
    },
    {
      name: "EducationalBookLine",
      count: await prisma.educationalBookLine.count(),
      classification: "CORE",
      minimumExpected: 1,
    },
    {
      name: "EducationalBook",
      count: await prisma.educationalBook.count(),
      classification: "CORE",
      minimumExpected: 1,
    },
    {
      name: "EducationalCurriculum",
      count: await prisma.educationalCurriculum.count(),
      classification: "CORE",
      minimumExpected: 1,
    },
    {
      name: "EducationalCurriculumVersion",
      count: await prisma.educationalCurriculumVersion.count(),
      classification: "CORE",
      minimumExpected: 1,
    },
    {
      name: "EducationalLearningArea",
      count: await prisma.educationalLearningArea.count(),
      classification: "CORE",
      minimumExpected: 1,
    },
    {
      name: "EducationalLevel",
      count: await prisma.educationalLevel.count(),
      classification: "CORE",
      minimumExpected: 1,
    },
    {
      name: "EducationalSubject",
      count: await prisma.educationalSubject.count(),
      classification: "CORE",
      minimumExpected: 1,
    },
    {
      name: "EducationalLanguage",
      count: await prisma.educationalLanguage.count(),
      classification: "CORE",
      minimumExpected: 1,
    },
    {
      name: "EducationalResourceType",
      count: await prisma.educationalResourceType.count(),
      classification: "CORE",
      minimumExpected: 1,
      note:
        "The official source previously exposed multiple publication forms. " +
        "A count of one requires review.",
    },
    {
      name: "EducationalBookSubject",
      count: await prisma.educationalBookSubject.count(),
      classification: "RELATIONSHIP",
      minimumExpected: 1,
    },
    {
      name: "EducationalBookLevel",
      count: await prisma.educationalBookLevel.count(),
      classification: "RELATIONSHIP",
      minimumExpected: 1,
    },
    {
      name: "EducationalBookLanguage",
      count: await prisma.educationalBookLanguage.count(),
      classification: "RELATIONSHIP",
      minimumExpected: 1,
    },
    {
      name: "EducationalBookResourceType",
      count: await prisma.educationalBookResourceType.count(),
      classification: "RELATIONSHIP",
      minimumExpected: 1,
    },
    {
      name: "EducationalBookCurriculumVersion",
      count: await prisma.educationalBookCurriculumVersion.count(),
      classification: "RELATIONSHIP",
      minimumExpected: 1,
    },
    {
      name: "EducationalEdition",
      count: await prisma.educationalEdition.count(),
      classification: "OPTIONAL",
      note: "The source did not reliably provide edition data.",
    },
    {
      name: "EducationalISBN",
      count: await prisma.educationalISBN.count(),
      classification: "OPTIONAL",
      note: "The source did not reliably provide ISBN data.",
    },
    {
      name: "EducationalAuthor",
      count: await prisma.educationalAuthor.count(),
      classification: "OPTIONAL",
      note: "The imported source records did not provide reliable authors.",
    },
    {
      name: "EducationalSeries",
      count: await prisma.educationalSeries.count(),
      classification: "OPTIONAL",
      note:
        "Book-line data is currently used for the series-like publication grouping.",
    },
    {
      name: "EducationalBookAuthor",
      count: await prisma.educationalBookAuthor.count(),
      classification: "OPTIONAL",
      note: "This remains empty while author data is unavailable.",
    },
    {
      name: "EducationalBookConcept",
      count: await prisma.educationalBookConcept.count(),
      classification: "OPTIONAL",
      note: "Concept enrichment has not started.",
    },
    {
      name: "EducationalIndicator",
      count: await prisma.educationalIndicator.count(),
      classification: "OPTIONAL",
      note: "Curriculum indicator enrichment has not started.",
    },
    {
      name: "EducationalIndicatorConcept",
      count: await prisma.educationalIndicatorConcept.count(),
      classification: "OPTIONAL",
      note: "Indicator-to-concept enrichment has not started.",
    },
  ];
}

function determineStatus(row: AuditRow): AuditStatus {
  if (
    row.minimumExpected !== undefined &&
    row.count < row.minimumExpected
  ) {
    return "WARNING";
  }

  if (
    row.name === "EducationalResourceType" &&
    row.count === 1
  ) {
    return "WARNING";
  }

  if (row.classification === "OPTIONAL" && row.count === 0) {
    return "INFORMATION";
  }

  return "PASS";
}

function printSection(
  title: string,
  rows: AuditRow[],
): {
  warnings: number;
  information: number;
} {
  console.log("");
  console.log(title);
  console.log("-".repeat(title.length));

  let warnings = 0;
  let information = 0;

  for (const row of rows) {
    const status = determineStatus(row);

    console.log(`${formatRow(row)}  [${status}]`);

    if (status === "WARNING") {
      warnings += 1;
    }

    if (status === "INFORMATION") {
      information += 1;
    }

    if (row.note && status !== "PASS") {
      console.log(`  Note: ${row.note}`);
    }
  }

  return {
    warnings,
    information,
  };
}

async function main(): Promise<void> {
  console.log("");
  console.log("============================================================");
  console.log("DeeglobalGH Educational Knowledge Base Audit");
  console.log("============================================================");

  const rows = await collectAuditRows();

  const coreRows = rows.filter(
    (row) => row.classification === "CORE",
  );

  const relationshipRows = rows.filter(
    (row) => row.classification === "RELATIONSHIP",
  );

  const optionalRows = rows.filter(
    (row) => row.classification === "OPTIONAL",
  );

  const coreResult = printSection("Core entities", coreRows);

  const relationshipResult = printSection(
    "Book relationships",
    relationshipRows,
  );

  const optionalResult = printSection(
    "Optional and future enrichment entities",
    optionalRows,
  );

  const totalWarnings =
    coreResult.warnings +
    relationshipResult.warnings +
    optionalResult.warnings;

  const totalInformation =
    coreResult.information +
    relationshipResult.information +
    optionalResult.information;

  console.log("");
  console.log("Audit summary");
  console.log("-------------");
  console.log(`Tables inspected: ${rows.length}`);
  console.log(`Warnings: ${totalWarnings}`);
  console.log(`Informational empty tables: ${totalInformation}`);

  console.log("");
  console.log("============================================================");

  if (totalWarnings > 0) {
    console.log(
      "Audit completed with warnings requiring investigation.",
    );
  } else {
    console.log(
      "Educational Knowledge Base audit completed successfully.",
    );
  }

  console.log("============================================================");
  console.log("");
}

main()
  .catch((error: unknown) => {
    console.error("");
    console.error("Educational Knowledge Base audit failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });