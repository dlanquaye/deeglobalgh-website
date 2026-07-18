import { EducationalCache } from "../cache/EducationalCache";

export class ResourceTypeRepository {
  constructor(
    private readonly cache: EducationalCache,
  ) {}

  /**
   * Find the Resource Type ID from its name or alias.
   */
  findIdByName(
    name: string,
  ): string | undefined {
    return this.cache.resourceTypes.find(name);
  }

  /**
   * Determine whether a Resource Type exists.
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
    return this.cache.resourceTypes.getStats();
  }
}