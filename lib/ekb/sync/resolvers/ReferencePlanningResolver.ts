import { BasePlanningResolver } from "./BasePlanningResolver";
import { ResolutionResult } from "../resolution";

export interface ReferenceLookup {
  find(name: string): string | undefined;
}

export class ReferencePlanningResolver extends BasePlanningResolver {
  constructor(
    private readonly entity: string,
    private readonly lookup: ReferenceLookup,
  ) {
    super();
  }

  resolve(value: string): ResolutionResult {
    const normalisedValue = value.trim();

    if (!normalisedValue) {
      return this.error(
        this.entity,
        `${this.entity} value is empty`,
      );
    }

    const existingId =
      this.lookup.find(normalisedValue);

    if (existingId) {
      return this.keep(
        this.entity,
        existingId,
        `${this.entity} already exists`,
      );
    }

    return this.create(
      this.entity,
      `${this.entity} will be created`,
    );
  }
}