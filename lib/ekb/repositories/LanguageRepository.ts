import { EducationalCache } from "../cache/EducationalCache";

export class LanguageRepository {
  constructor(
    private readonly cache: EducationalCache,
  ) {}

  /**
   * Find the Language ID from its name or alias.
   */
  findIdByName(
    name: string,
  ): string | undefined {
    return this.cache.languages.find(name);
  }

  /**
   * Determine whether a Language exists.
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
    return this.cache.languages.getStats();
  }
}