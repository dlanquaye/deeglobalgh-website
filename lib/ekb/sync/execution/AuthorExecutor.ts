import {
  ResolutionAction,
  ResolutionResult,
} from "../resolution";

import { BaseEntityExecutor } from "./BaseEntityExecutor";
import { ExecutionContext } from "./ExecutionContext";
import { ExecutedEntityResult } from "./types";

export interface AuthorOperations {
  create(name: string): Promise<string>;

  update?(
    id: string,
    name: string,
  ): Promise<void>;
}

export interface AuthorExecutionInput {
  names: string[];

  resolutions: ResolutionResult[];

  context: ExecutionContext;
}

export class AuthorExecutor extends BaseEntityExecutor {
  constructor(
    private readonly operations: AuthorOperations,
  ) {
    super();
  }

  async execute(
    input: AuthorExecutionInput,
  ): Promise<ExecutedEntityResult[]> {
    const names =
      this.normaliseUniqueNames(input.names);

    if (
      names.length !==
      input.resolutions.length
    ) {
      throw new Error(
        [
          "Author execution input mismatch.",
          `Received ${names.length} unique author names`,
          `but ${input.resolutions.length} resolutions.`,
        ].join(" "),
      );
    }

    const results: ExecutedEntityResult[] = [];

    for (
      let index = 0;
      index < names.length;
      index++
    ) {
      const name = names[index];
      const resolution =
        input.resolutions[index];

      if (!name || !resolution) {
        throw new Error(
          `Missing author execution data at index ${index}.`,
        );
      }

      const result =
        await this.executeAuthor(
          name,
          resolution,
          input.context,
        );

      results.push(result);
    }

    return results;
  }

  private async executeAuthor(
    name: string,
    resolution: ResolutionResult,
    context: ExecutionContext,
  ): Promise<ExecutedEntityResult> {
    this.assertExecutable(resolution);

    const contextKey =
      this.getContextKey(name);

    switch (resolution.action) {
      case ResolutionAction.KEEP: {
        if (!resolution.existingId) {
          throw new Error(
            `Missing existingId for kept author "${name}".`,
          );
        }

        context.setEntityId(
          contextKey,
          resolution.existingId,
        );

        return this.kept(resolution);
      }

      case ResolutionAction.CREATE: {
        const id =
          await this.operations.create(name);

        context.setEntityId(
          contextKey,
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
            `Missing existingId for author "${name}" update.`,
          );
        }

        if (this.operations.update) {
          await this.operations.update(
            resolution.existingId,
            name,
          );
        }

        context.setEntityId(
          contextKey,
          resolution.existingId,
        );

        return this.updated(
          resolution,
          resolution.existingId,
        );
      }

      case ResolutionAction.ERROR:
        throw new Error(
          `Cannot execute author "${name}": ${resolution.message}`,
        );

      default:
        return this.handleUnknownAction(
          name,
          resolution,
        );
    }
  }

  private normaliseUniqueNames(
    names: string[],
  ): string[] {
    const uniqueNames =
      new Map<string, string>();

    for (const rawName of names) {
      const name = rawName.trim();

      if (!name) {
        continue;
      }

      const key =
        name.toLowerCase();

      if (!uniqueNames.has(key)) {
        uniqueNames.set(
          key,
          name,
        );
      }
    }

    return [
      ...uniqueNames.values(),
    ];
  }

  private getContextKey(
    name: string,
  ): string {
    return `author:${name
      .trim()
      .toLowerCase()}`;
  }

  private handleUnknownAction(
    name: string,
    resolution: ResolutionResult,
  ): never {
    throw new Error(
      `Unsupported resolution action for author "${name}": ${resolution.action}`,
    );
  }
}