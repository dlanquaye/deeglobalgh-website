import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

console.log("SCRIPT DB:", process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function run() {
  const email = "admin@deeglobalgh.com";
  const pin = "1234";

  const pinHash = await bcrypt.hash(pin, 10);

  // 🔥 DELETE FIRST (clean state)
  await prisma.admin.deleteMany({
    where: { email },
  });

  // 🔥 CREATE FRESH
  const admin = await prisma.admin.create({
    data: {
      name: "Super Admin",
      email,
      pinHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log("Admin RESET:", admin.email);
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });