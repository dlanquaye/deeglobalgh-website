import {
  ResolutionAction,
  ResolutionResult,
} from "../resolution";

export abstract class BasePlanningResolver {
  protected keep(
    entity: string,
    id: string,
    message = "Existing record found",
  ): ResolutionResult {
    return {
      entity,
      action: ResolutionAction.KEEP,
      existingId: id,
      message,
    };
  }

  protected create(
    entity: string,
    message = "Record will be created",
  ): ResolutionResult {
    return {
      entity,
      action: ResolutionAction.CREATE,
      message,
    };
  }

  protected error(
    entity: string,
    message: string,
  ): ResolutionResult {
    return {
      entity,
      action: ResolutionAction.ERROR,
      message,
    };
  }
}