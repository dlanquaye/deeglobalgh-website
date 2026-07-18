import { EducationalCache } from "../cache/EducationalCache";

export class LevelRepository {
  constructor(
    private readonly cache: EducationalCache,
  ) {}

  /**
   * Find the Level ID from its name or alias.
   */
  findIdByName(
    name: string,
  ): string | undefined {
    return this.cache.levels.find(name);
  }

  /**
   * Determine whether a Level exists.
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
    return this.cache.levels.getStats();
  }
}