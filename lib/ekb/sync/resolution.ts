export enum ResolutionAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  KEEP = "KEEP",
  ERROR = "ERROR",
}

export interface ResolutionResult {
  entity: string;

  action: ResolutionAction;

  existingId?: string;

  message: string;
}