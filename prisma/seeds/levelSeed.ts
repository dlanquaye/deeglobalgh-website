import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const levels = [
  { code: "LEVEL_CRECHE", name: "Creche", sortOrder: 10 },

  { code: "LEVEL_NURSERY1", name: "Nursery 1", sortOrder: 20 },
  { code: "LEVEL_NURSERY2", name: "Nursery 2", sortOrder: 30 },

  { code: "LEVEL_KG1", name: "KG 1", sortOrder: 40 },
  { code: "LEVEL_KG2", name: "KG 2", sortOrder: 50 },

  { code: "LEVEL_B1", name: "Basic 1", sortOrder: 60 },
  { code: "LEVEL_B2", name: "Basic 2", sortOrder: 70 },
  { code: "LEVEL_B3", name: "Basic 3", sortOrder: 80 },
  { code: "LEVEL_B4", name: "Basic 4", sortOrder: 90 },
  { code: "LEVEL_B5", name: "Basic 5", sortOrder: 100 },
  { code: "LEVEL_B6", name: "Basic 6", sortOrder: 110 },

  { code: "LEVEL_JHS1", name: "JHS 1", sortOrder: 120 },
  { code: "LEVEL_JHS2", name: "JHS 2", sortOrder: 130 },
  { code: "LEVEL_JHS3", name: "JHS 3", sortOrder: 140 },

  { code: "LEVEL_SHS1", name: "SHS 1", sortOrder: 150 },
  { code: "LEVEL_SHS2", name: "SHS 2", sortOrder: 160 },
  { code: "LEVEL_SHS3", name: "SHS 3", sortOrder: 170 },
];

async function main() {
  console.log("====================================");
  console.log("Seeding Levels");
  console.log("====================================");

  for (const level of levels) {
    await prisma.level.upsert({
      where: {
        code: level.code,
      },
      update: level,
      create: level,
    });
  }

  console.log(`✅ Seeded ${levels.length} levels`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });