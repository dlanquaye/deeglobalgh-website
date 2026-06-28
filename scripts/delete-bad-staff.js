const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.staff.delete({
    where: {
      id: "cmqplmp8o0000g3okwucqcwqa",
    },
  });

  console.log("Deleted:", deleted.id);

  const count = await prisma.staff.count();

  console.log("Remaining Staff:", count);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });