import { prisma } from "../lib/prisma";

async function main() {
  console.log("\n==========================================");
  console.log("DEEGLOBALGH KNOWLEDGE BASE AUDIT");
  console.log("==========================================\n");

  const fingerprints = await prisma.productFingerprint.findMany({
    include: {
      product: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      product: {
        name: "asc",
      },
    },
  });

  console.log(`Products Analysed : ${fingerprints.length}\n`);

  const dimensions = [
    {
      title: "Subject",
      field: "subjectNodeCode",
    },
    {
      title: "Publisher",
      field: "publisherNodeCode",
    },
    {
      title: "Curriculum",
      field: "curriculumNodeCode",
    },
    {
      title: "Resource",
      field: "resourceNodeCode",
    },
    {
      title: "Activity",
      field: "activityNodeCode",
    },
    {
      title: "Language",
      field: "languageNodeCode",
    },
  ] as const;

  for (const dimension of dimensions) {
    const classified = fingerprints.filter(
      (fp) => fp[dimension.field] !== null
    ).length;

    const missing = fingerprints.length - classified;

    const coverage =
      fingerprints.length === 0
        ? 0
        : Math.round((classified / fingerprints.length) * 100);

    console.log("------------------------------------------");
    console.log(dimension.title);
    console.log("------------------------------------------");
    console.log(`Classified : ${classified}`);
    console.log(`Missing    : ${missing}`);
    console.log(`Coverage   : ${coverage}%\n`);
  }

  console.log("==========================================");
  console.log("PRODUCTS REQUIRING REVIEW");
  console.log("==========================================\n");

  const needsReview = fingerprints.filter(
    (fp) =>
      !fp.subjectNodeCode ||
      !fp.publisherNodeCode ||
      !fp.curriculumNodeCode ||
      !fp.resourceNodeCode
  );

  if (needsReview.length === 0) {
    console.log("None\n");
  } else {
    for (const fp of needsReview) {
      console.log(fp.product.name);

      const missing: string[] = [];

      if (!fp.subjectNodeCode) missing.push("Subject");
      if (!fp.publisherNodeCode) missing.push("Publisher");
      if (!fp.curriculumNodeCode) missing.push("Curriculum");
      if (!fp.resourceNodeCode) missing.push("Resource");

      console.log("Missing:", missing.join(", "));
      console.log("------------------------------------------");
    }
  }

  console.log("\nAudit Complete.\n");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });