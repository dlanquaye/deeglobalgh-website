import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function printDivider(): void {
  console.log(
    "============================================================",
  );
}

async function main(): Promise<void> {
  console.log("");
  printDivider();
  console.log("Educational Resource Type Inspection");
  printDivider();
  console.log("");

  const resourceTypes =
    await prisma.educationalResourceType.findMany();

  const bookResourceTypeRelationships =
    await prisma.educationalBookResourceType.findMany();

  console.log("Stored EducationalResourceType records");
  console.log("--------------------------------------");

  if (resourceTypes.length === 0) {
    console.log("No educational resource types were found.");
  } else {
    console.dir(resourceTypes, {
      depth: null,
      colours: true,
    });
  }

  console.log("");
  console.log("EducationalBookResourceType relationships");
  console.log("-----------------------------------------");
  console.log(
    `Total relationships: ${bookResourceTypeRelationships.length.toLocaleString()}`,
  );

  const relationshipCounts = new Map<string, number>();

  for (const relationship of bookResourceTypeRelationships) {
    const values = Object.entries(relationship);

    const resourceTypeEntry = values.find(([key]) =>
      key.toLowerCase().includes("resourcetypeid"),
    );

    const resourceTypeIdentifier =
      resourceTypeEntry?.[1] === undefined
        ? "UNKNOWN"
        : String(resourceTypeEntry[1]);

    relationshipCounts.set(
      resourceTypeIdentifier,
      (relationshipCounts.get(resourceTypeIdentifier) ?? 0) + 1,
    );
  }

  console.log("");
  console.log("Relationship distribution");
  console.log("-------------------------");

  if (relationshipCounts.size === 0) {
    console.log("No resource-type relationships were found.");
  } else {
    for (const [resourceTypeIdentifier, count] of relationshipCounts) {
      console.log(
        `${resourceTypeIdentifier.padEnd(40, ".")} ${count.toLocaleString()}`,
      );
    }
  }

  console.log("");
  console.log("Sample relationship records");
  console.log("---------------------------");

  console.dir(bookResourceTypeRelationships.slice(0, 10), {
    depth: null,
    colours: true,
  });

  console.log("");
  printDivider();
  console.log("Resource-type inspection completed.");
  printDivider();
  console.log("");
}

main()
  .catch((error: unknown) => {
    console.error("");
    console.error(
      "Educational resource-type inspection failed.",
    );
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });