import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function run() {
  const email = "admin@deeglobalgh.com";
  const inputPin = "1234";

  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    console.log("❌ Admin not found");
    return;
  }

  console.log("Stored hash:", admin.pinHash);

  const match = await bcrypt.compare(inputPin, admin.pinHash);

  console.log("PIN match result:", match);
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });