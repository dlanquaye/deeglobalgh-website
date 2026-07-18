import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function findCandidateBooks() {
  return prisma.book.findMany({
    include: {
      publisher: true,
      subject: true,
      level: true,
      resourceType: true,
      language: true,
      curriculum: true,
    },
  });
}