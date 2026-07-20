import {
  ResolutionAction,
  ResolutionResult,
} from "../resolution";

import {
  ExecutedEntityResult,
  ExecutionStatus,
} from "./types";

export abstract class BaseEntityExecutor {
  protected kept(
    resolution: ResolutionResult,
    message?: string,
  ): ExecutedEntityResult {
    return {
      entity: resolution.entity,
      action: resolution.action,
      status: ExecutionStatus.KEPT,
      existingId: resolution.existingId,
      message:
        message ??
        resolution.message,
    };
  }

  protected created(
    resolution: ResolutionResult,
    createdId: string,
    message?: string,
  ): ExecutedEntityResult {
    return {
      entity: resolution.entity,
      action: resolution.action,
      status: ExecutionStatus.CREATED,
      createdId,
      message:
        message ??
        resolution.message,
    };
  }

  protected updated(
    resolution: ResolutionResult,
    existingId: string,
    message?: string,
  ): ExecutedEntityResult {
    return {
      entity: resolution.entity,
      action: resolution.action,
      status: ExecutionStatus.UPDATED,
      existingId,
      message:
        message ??
        resolution.message,
    };
  }

  protected skipped(
    resolution: ResolutionResult,
    message?: string,
  ): ExecutedEntityResult {
    return {
      entity: resolution.entity,
      action: resolution.action,
      status: ExecutionStatus.SKIPPED,
      existingId: resolution.existingId,
      message:
        message ??
        resolution.message,
    };
  }

  protected failed(
    resolution: ResolutionResult,
    message: string,
  ): ExecutedEntityResult {
    return {
      entity: resolution.entity,
      action: resolution.action,
      status: ExecutionStatus.FAILED,
      existingId: resolution.existingId,
      message,
    };
  }

  protected assertExecutable(
    resolution: ResolutionResult,
  ): void {
    if (
      resolution.action ===
      ResolutionAction.ERROR
    ) {
      throw new Error(
        resolution.message,
      );
    }
  }
}