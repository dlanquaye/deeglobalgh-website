import { BaseResolver } from "./baseResolver";

export class PublisherResolver extends BaseResolver {
  static async resolve(name: string) {
    const trimmed = name.trim();

    const existing = await this.findByName(
      this.prisma.publisher,
      trimmed,
    );

    if (existing) {
      return existing;
    }

    return this.prisma.publisher.create({
      data: {
        code: `PUB_${trimmed
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, "_")
          .replace(/^_|_$/g, "")}`,
        name: trimmed,
      },
    });
  }
}