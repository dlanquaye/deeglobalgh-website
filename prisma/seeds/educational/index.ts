import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Educational Knowledge Platform Seed Runner
 *
 * Every reference-data seed module will be registered here.
 *
 * Rules:
 *  - Safe to run multiple times.
 *  - Uses upsert only.
 *  - Never deletes production data.
 *  - Executes modules in dependency order.
 */

export interface SeedModule {
  name: string;
  run(prisma: PrismaClient): Promise<void>;
}

const modules: SeedModule[] = [
  // Will be enabled one-by-one.
  // languages,
  // approvalBodies,
  // curriculum,
  // stages,
  // levels,
  // subjects,
  // publishers,
  // bookLines,
  // resourceTypes,
];

async function main() {
  console.log("");
  console.log("==========================================");
  console.log("Educational Knowledge Platform Seeder");
  console.log("==========================================");
  console.log("");

  const started = Date.now();

  for (const module of modules) {
    console.log(`▶ Seeding ${module.name}...`);

    const moduleStarted = Date.now();

    await module.run(prisma);

    const duration = Date.now() - moduleStarted;

    console.log(`✓ ${module.name} completed (${duration} ms)`);
    console.log("");
  }

  const total = Date.now() - started;

  console.log("==========================================");
  console.log("Educational seed completed successfully.");
  console.log(`Total time: ${total} ms`);
  console.log("==========================================");
}

main()
  .catch((error) => {
    console.error("");
    console.error("Educational seed failed.");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });