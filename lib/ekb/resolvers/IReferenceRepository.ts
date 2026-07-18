import { CacheRecord } from "../cache/BaseReferenceCache";

export interface IReferenceRepository {
  /**
   * Resolve a reference name or alias.
   */
  findIdByName(
    name: string,
  ): string | undefined;

  /**
   * Determine whether a reference exists.
   */
  exists(
    name: string,
  ): boolean;

  /**
   * Return cache statistics.
   */
  getStats(): {
    records: number;
    aliases: number;
  };
}