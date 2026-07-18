import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const publishers = [
  {
    code: "PUB_NEW_GOLDEN",
    name: "New Golden Publications",
  },
  {
    code: "PUB_BEST_BRAIN",
    name: "Best Brain Publications",
  },
  {
    code: "PUB_MASTERMAN",
    name: "Masterman Publications",
  },
  {
    code: "PUB_EXCELLENCE",
    name: "Excellence Publications",
  },
  {
    code: "PUB_WISE_ANT",
    name: "Wise Ant Publications",
  },
  {
    code: "PUB_DON",
    name: "Don Publications",
  },
  {
    code: "PUB_CASSAVA",
    name: "Cassava Network",
  },
  {
    code: "PUB_SEDCO",
    name: "SEDCO Publishing",
  },
  {
    code: "PUB_MACMILLAN",
    name: "Macmillan Education Ghana",
  },
];

async function main() {
  console.log("====================================");
  console.log("Seeding Publishers");
  console.log("====================================");

  for (const publisher of publishers) {
    await prisma.publisher.upsert({
      where: {
        code: publisher.code,
      },
      update: publisher,
      create: publisher,
    });
  }

  console.log(`✅ Seeded ${publishers.length} publishers`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });