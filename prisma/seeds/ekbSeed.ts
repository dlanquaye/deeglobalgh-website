import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("====================================");
  console.log("Seeding Educational Knowledge Base");
  console.log("====================================");

  /*
   * Subjects
   */
  const subjects = [
    { code: "SUB_ENGLISH", name: "English Language" },
    { code: "SUB_MATHEMATICS", name: "Mathematics" },
    { code: "SUB_SCIENCE", name: "Science" },
    { code: "SUB_COMPUTING", name: "Computing" },
    { code: "SUB_RME", name: "Religious and Moral Education" },
    { code: "SUB_OWOP", name: "Our World Our People" },
    { code: "SUB_CREATIVE_ARTS", name: "Creative Arts and Design" },
    { code: "SUB_GHANAIAN_LANGUAGE", name: "Ghanaian Language" },
    { code: "SUB_FRENCH", name: "French" },
    { code: "SUB_HISTORY", name: "History" },
    { code: "SUB_CAREER_TECH", name: "Career Technology" },
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { code: subject.code },
      update: {},
      create: subject,
    });
  }

  /*
   * Resource Types
   */
  const resourceTypes = [
    {
      code: "RESOURCE_LEARNER_BOOK",
      name: "Learner Book",
    },
    {
      code: "RESOURCE_WORKBOOK",
      name: "Workbook",
    },
    {
      code: "RESOURCE_TEACHER_GUIDE",
      name: "Teacher Guide",
    },
    {
      code: "RESOURCE_ACTIVITY_BOOK",
      name: "Activity Book",
    },
  ];

  for (const item of resourceTypes) {
    await prisma.resourceType.upsert({
      where: { code: item.code },
      update: {},
      create: item,
    });
  }

  /*
   * Language
   */

  await prisma.language.upsert({
    where: {
      code: "LANGUAGE_ENGLISH",
    },
    update: {},
    create: {
      code: "LANGUAGE_ENGLISH",
      name: "English",
    },
  });

  /*
   * Curriculum
   */

  await prisma.curriculum.upsert({
    where: {
      code: "CURRICULUM_NACCA",
    },
    update: {},
    create: {
      code: "CURRICULUM_NACCA",
      name: "NaCCA Curriculum",
    },
  });

  console.log("✅ EKB seed completed");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });