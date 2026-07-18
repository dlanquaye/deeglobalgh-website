import { EducationalCache } from "../cache/EducationalCache";

export class PublisherRepository {
  constructor(
    private readonly cache: EducationalCache,
  ) {}

  /**
   * Find the Publisher ID from its name or alias.
   */
  findIdByName(
    name: string,
  ): string | undefined {
    return this.cache.publishers.find(name);
  }

  /**
   * Determine whether a Publisher exists.
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
    return this.cache.publishers.getStats();
  }
}