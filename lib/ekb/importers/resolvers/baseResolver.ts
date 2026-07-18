import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class BaseResolver {
  protected static async findByName<
    T extends {
      findFirst: Function;
    },
  >(
    model: T,
    name: string,
  ) {
    return model.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: "insensitive",
        },
      },
    });
  }

  protected static get prisma() {
    return prisma;
  }
}