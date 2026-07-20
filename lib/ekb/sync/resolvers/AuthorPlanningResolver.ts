import { ResolutionResult } from "../resolution";
import { BasePlanningResolver } from "./BasePlanningResolver";

export interface AuthorPlanningLookup {
  find(name: string): string | undefined;
}

export class AuthorPlanningResolver
  extends BasePlanningResolver
{
  constructor(
    private readonly lookup: AuthorPlanningLookup,
  ) {
    super();
  }

  resolve(names: string[]): ResolutionResult[] {
    const results: ResolutionResult[] = [];

    const uniqueNames = new Map<string, string>();

    for (const rawName of names) {
      const name = rawName.trim();

      if (!name) {
        continue;
      }

      const key = name.toLowerCase();

      if (!uniqueNames.has(key)) {
        uniqueNames.set(key, name);
      }
    }

    for (const name of uniqueNames.values()) {
      const existingId = this.lookup.find(name);

      if (existingId) {
        results.push(
          this.keep(
            "Author",
            existingId,
            `Author "${name}" already exists`,
          ),
        );

        continue;
      }

      results.push(
        this.create(
          "Author",
          `Author "${name}" will be created`,
        ),
      );
    }

    return results;
  }
}