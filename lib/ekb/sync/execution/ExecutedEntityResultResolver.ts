import {
  ResolutionAction,
  ResolutionResult,
} from "../resolution";

import {
  ExecutedEntityResult,
  ExecutionStatus,
} from "./types";

export class ExecutedEntityResultResolver {
  getEntityId(
    result: ExecutedEntityResult,
  ): string {
    const entityId =
      result.createdId ??
      result.existingId;

    if (!entityId) {
      throw new Error(
        `Execution result for ${result.entity} did not contain an entity ID.`,
      );
    }

    return entityId;
  }

  getUniqueEntityIds(
    results: ExecutedEntityResult[],
  ): string[] {
    return [
      ...new Set(
        results.map(
          (result) =>
            this.getEntityId(
              result,
            ),
        ),
      ),
    ];
  }

  createFromResolution(
    resolution: ResolutionResult,
    entityId: string,
  ): ExecutedEntityResult {
    switch (resolution.action) {
      case ResolutionAction.CREATE:
        return {
          entity:
            resolution.entity,

          action:
            resolution.action,

          status:
            ExecutionStatus.CREATED,

          createdId:
            entityId,

          message:
            resolution.message,
        };

      case ResolutionAction.UPDATE:
        return {
          entity:
            resolution.entity,

          action:
            resolution.action,

          status:
            ExecutionStatus.UPDATED,

          existingId:
            entityId,

          message:
            resolution.message,
        };

      case ResolutionAction.KEEP:
        return {
          entity:
            resolution.entity,

          action:
            resolution.action,

          status:
            ExecutionStatus.KEPT,

          existingId:
            entityId,

          message:
            resolution.message,
        };

      case ResolutionAction.ERROR:
        throw new Error(
          `Cannot execute ${resolution.entity}: ${resolution.message}`,
        );

      default:
        throw new Error(
          `Unsupported resolution action for ${resolution.entity}.`,
        );
    }
  }

  assertExecutable(
    resolution: ResolutionResult,
  ): void {
    if (
      resolution.action ===
      ResolutionAction.ERROR
    ) {
      throw new Error(
        `Cannot execute ${resolution.entity}: ${resolution.message}`,
      );
    }

    const requiresExistingId =
      resolution.action ===
        ResolutionAction.KEEP ||
      resolution.action ===
        ResolutionAction.UPDATE;

    if (
      requiresExistingId &&
      !resolution.existingId
    ) {
      throw new Error(
        `Missing existingId for ${resolution.entity} ${resolution.action.toLowerCase()}.`,
      );
    }
  }
}