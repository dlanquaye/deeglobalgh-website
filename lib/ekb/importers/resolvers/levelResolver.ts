import { BaseResolver } from "./baseResolver";

export class LevelResolver extends BaseResolver {
  static async resolve(name: string) {
    const level = await this.findByName(
      this.prisma.level,
      name,
    );

    if (!level) {
      throw new Error(`Unknown level: ${name}`);
    }

    return level;
  }
}