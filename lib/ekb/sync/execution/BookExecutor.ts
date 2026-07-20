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

export interface BookExecutionValue {
  title: string;

  bookLineId?: string;

  isbn?: string;
}

export interface ResolvedBookExecutionValue {
  title: string;

  bookLineId: string;

  isbn?: string;
}

export interface BookOperations {
  create(
    value: ResolvedBookExecutionValue,
  ): Promise<string>;

  update?(
    id: string,
    value: ResolvedBookExecutionValue,
  ): Promise<void>;
}

export class BookExecutor
  extends BaseEntityExecutor
  implements EntityExecutor<BookExecutionValue>
{
  constructor(
    private readonly operations: BookOperations,
  ) {
    super();
  }

  async execute(
    input: EntityExecutionInput<BookExecutionValue>,
  ): Promise<ExecutedEntityResult> {
    const {
      resolution,
      context,
    } = input;

    this.assertExecutable(resolution);

    const value =
      this.resolveExecutionValue(
        input.value,
        resolution,
        context.getEntityId("bookLine"),
      );

    switch (resolution.action) {
      case ResolutionAction.KEEP: {
        if (!resolution.existingId) {
          throw new Error(
            `Missing existingId for kept book "${value.title}".`,
          );
        }

        context.setEntityId(
          "book",
          resolution.existingId,
        );

        return this.kept(resolution);
      }

      case ResolutionAction.CREATE: {
        const id =
          await this.operations.create(value);

        context.setEntityId(
          "book",
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
            `Missing existingId for book "${value.title}" update.`,
          );
        }

        if (this.operations.update) {
          await this.operations.update(
            resolution.existingId,
            value,
          );
        }

        context.setEntityId(
          "book",
          resolution.existingId,
        );

        return this.updated(
          resolution,
          resolution.existingId,
        );
      }

      case ResolutionAction.ERROR:
        return this.handleErrorResolution(
          resolution,
          value.title,
        );

      default:
        return this.handleUnknownAction(
          resolution,
          value.title,
        );
    }
  }

  private resolveExecutionValue(
    value: BookExecutionValue,
    resolution: ResolutionResult,
    contextBookLineId?: string,
  ): ResolvedBookExecutionValue {
    const title =
      value.title.trim();

    if (!title) {
      throw new Error(
        "Book title is required for execution.",
      );
    }

    const bookLineId =
      value.bookLineId ??
      contextBookLineId;

    if (!bookLineId) {
      throw new Error(
        `BookLine ID is required before executing book "${title}".`,
      );
    }

    const isbn =
      value.isbn?.trim() ||
      undefined;

    return {
      title,
      bookLineId,
      isbn,
    };
  }

  private handleErrorResolution(
    resolution: ResolutionResult,
    title: string,
  ): never {
    throw new Error(
      `Cannot execute book "${title}": ${resolution.message}`,
    );
  }

  private handleUnknownAction(
    resolution: ResolutionResult,
    title: string,
  ): never {
    throw new Error(
      `Unsupported resolution action for book "${title}": ${resolution.action}`,
    );
  }
}