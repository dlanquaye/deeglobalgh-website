import { ResolutionResult } from "../resolution";
import { BasePlanningResolver } from "./BasePlanningResolver";

export interface BookLinePlanningInput {
  name: string;
  publisherId?: string;
}

export interface BookLinePlanningLookup {
  find(
    name: string,
    publisherId?: string,
  ): string | undefined;
}

export class BookLinePlanningResolver
  extends BasePlanningResolver
{
  constructor(
    private readonly lookup: BookLinePlanningLookup,
  ) {
    super();
  }

  resolve(
    input: BookLinePlanningInput,
  ): ResolutionResult {
    const name = input.name.trim();
    const publisherId =
      input.publisherId?.trim() || undefined;

    if (!name) {
      return this.error(
        "BookLine",
        "Book line name is empty",
      );
    }

    const existingId = this.lookup.find(
      name,
      publisherId,
    );

    if (existingId) {
      return this.keep(
        "BookLine",
        existingId,
        "Book line already exists",
      );
    }

    return this.create(
      "BookLine",
      publisherId
        ? "Book line will be created for the resolved publisher"
        : "Book line will be created",
    );
  }
}