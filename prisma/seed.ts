import { seedKnowledge } from "./seeders/knowledge.seed";

async function main() {
  console.log("🌱 Starting database seed...");

  await seedKnowledge();

  console.log("✅ Database seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });