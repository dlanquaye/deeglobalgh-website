import { BaseResolver } from "./baseResolver";

export class SubjectResolver extends BaseResolver {
  static async resolve(name: string) {
    const subject = await this.findByName(
      this.prisma.subject,
      name,
    );

    if (!subject) {
      throw new Error(`Unknown subject: ${name}`);
    }

    return subject;
  }
}