import {
  ResolutionAction,
  ResolutionResult,
} from "../resolution";

import { BaseEntityExecutor } from "./BaseEntityExecutor";
import {
  EntityExecutionInput,
  EntityExecutor,
} from "./EntityExecutor";
import { ExecutedEntityResult } from "./types";

export interface ReferenceEntityOperations<TValue> {
  create(value: TValue): Promise<string>;

  update?(
    id: string,
    value: TValue,
  ): Promise<void>;
}

export class ReferenceEntityExecutor<TValue>
  extends BaseEntityExecutor
  implements EntityExecutor<TValue>
{
  constructor(
    private readonly operations: ReferenceEntityOperations<TValue>,
  ) {
    super();
  }

  async execute(
    input: EntityExecutionInput<TValue>,
  ): Promise<ExecutedEntityResult> {
    const {
      resolution,
      value,
    } = input;

    this.assertExecutable(resolution);

    switch (resolution.action) {
      case ResolutionAction.KEEP:
        return this.kept(resolution);

      case ResolutionAction.CREATE: {
        const id =
          await this.operations.create(value);

        return this.created(
          resolution,
          id,
        );
      }

      case ResolutionAction.UPDATE: {
        if (!resolution.existingId) {
          throw new Error(
            `Missing existingId for ${resolution.entity} update.`,
          );
        }

        if (this.operations.update) {
          await this.operations.update(
            resolution.existingId,
            value,
          );
        }

        return this.updated(
          resolution,
          resolution.existingId,
        );
      }

      case ResolutionAction.ERROR:
        return this.handleUnexpectedErrorResolution(
          resolution,
        );

      default:
        return this.handleUnknownResolutionAction(
          resolution,
        );
    }
  }

  private handleUnexpectedErrorResolution(
    resolution: ResolutionResult,
  ): never {
    throw new Error(
      `Cannot execute ${resolution.entity}: ${resolution.message}`,
    );
  }

  private handleUnknownResolutionAction(
    resolution: ResolutionResult,
  ): never {
    throw new Error(
      `Unsupported resolution action for ${resolution.entity}.`,
    );
  }
}