import { ResolutionAction } from "../resolution";

import { BaseEntityExecutor } from "./BaseEntityExecutor";
import {
  EntityExecutionInput,
  EntityExecutor,
} from "./EntityExecutor";
import { ExecutedEntityResult } from "./types";

export interface BookLineExecutionValue {
  name: string;

  publisherId: string;
}

export interface BookLineOperations {
  create(
    value: BookLineExecutionValue,
  ): Promise<string>;

  update?(
    id: string,
    value: BookLineExecutionValue,
  ): Promise<void>;
}

export class BookLineExecutor
  extends BaseEntityExecutor
  implements EntityExecutor<BookLineExecutionValue>
{
  constructor(
    private readonly operations: BookLineOperations,
  ) {
    super();
  }

  async execute(
    input: EntityExecutionInput<BookLineExecutionValue>,
  ): Promise<ExecutedEntityResult> {
    const {
      resolution,
      value,
      context,
    } = input;

    this.assertExecutable(resolution);

    switch (resolution.action) {
      case ResolutionAction.KEEP:
        if (resolution.existingId) {
          context.setEntityId(
            "bookLine",
            resolution.existingId,
          );
        }

        return this.kept(resolution);

      case ResolutionAction.CREATE: {
        const id =
          await this.operations.create(value);

        context.setEntityId(
          "bookLine",
          id,
        );

        return this.created(
          resolution,
          id,
        );
      }

      case ResolutionAction.UPDATE: {
        if (!resolution.existingId) {
          throw new Error(
            "Missing BookLine existingId.",
          );
        }

        if (this.operations.update) {
          await this.operations.update(
            resolution.existingId,
            value,
          );
        }

        context.setEntityId(
          "bookLine",
          resolution.existingId,
        );

        return this.updated(
          resolution,
          resolution.existingId,
        );
      }

      case ResolutionAction.ERROR:
        throw new Error(resolution.message);

      default:
        throw new Error(
          `Unsupported resolution action: ${resolution.action}`,
        );
    }
  }
}