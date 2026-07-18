import { EducationalCache } from "../cache/EducationalCache";

export class SubjectRepository {
  constructor(
    private readonly cache: EducationalCache,
  ) {}

  /**
   * Find the Subject ID from its name or alias.
   */
  findIdByName(
    name: string,
  ): string | undefined {
    return this.cache.subjects.find(name);
  }

  /**
   * Determine whether a Subject exists.
   */
  exists(
    name: string,
  ): boolean {
    return this.findIdByName(name) !== undefined;
  }

  /**
   * Return cache statistics.
   */
  getStats() {
    return this.cache.subjects.getStats();
  }
}