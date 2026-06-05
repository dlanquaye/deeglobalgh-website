import { PrismaClient } from "@prisma/client";

console.log("CHECK DB:", process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function run() {
  const admins = await prisma.admin.findMany();
  console.log(admins);
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });