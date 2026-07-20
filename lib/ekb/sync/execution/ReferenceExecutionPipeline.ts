import { ResolutionResult } from "../resolution";

import { ExecutionContext } from "./ExecutionContext";
import { ExecutedEntityResultResolver } from "./ExecutedEntityResultResolver";
import { ReferenceEntityExecutor } from "./ReferenceEntityExecutor";
import { ExecutedEntityResult } from "./types";

export interface ExecuteReferenceEntityInput<TValue> {
  resolution: ResolutionResult;

  value: TValue;

  executor: ReferenceEntityExecutor<TValue>;

  context: ExecutionContext;

  contextKey: string;

  entities: ExecutedEntityResult[];
}

export class ReferenceExecutionPipeline {
  private readonly resultResolver =
    new ExecutedEntityResultResolver();

  async execute<TValue>(
    input: ExecuteReferenceEntityInput<TValue>,
  ): Promise<string> {
    const result =
      await input.executor.execute({
        resolution:
          input.resolution,

        value:
          input.value,

        context:
          input.context,
      });

    input.entities.push(result);

    const entityId =
      this.resultResolver.getEntityId(
        result,
      );

    input.context.setEntityId(
      input.contextKey,
      entityId,
    );

    return entityId;
  }
}