import { ResolutionResult } from "../resolution";

import { ExecutionContext } from "./ExecutionContext";
import { ExecutedEntityResult } from "./types";

export interface EntityExecutionInput<TValue> {
  resolution: ResolutionResult;

  value: TValue;

  context: ExecutionContext;
}

export interface EntityExecutor<TValue> {
  execute(
    input: EntityExecutionInput<TValue>,
  ): Promise<ExecutedEntityResult>;
}