import { EducationalCache } from "../cache/EducationalCache";

export class CurriculumRepository {
  constructor(
    private readonly cache: EducationalCache,
  ) {}

  /**
   * Find the Curriculum ID from its name or alias.
   */
  findIdByName(
    name: string,
  ): string | undefined {
    return this.cache.curricula.find(name);
  }

  /**
   * Determine whether a Curriculum exists.
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
    return this.cache.curricula.getStats();
  }
}