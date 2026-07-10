export type SyncAction = "INSERT" | "UPDATE" | "REVIEW";

export interface SyncItem {
  action: SyncAction;
  existingId?: string;
  product: Record<string, unknown>;
}

export interface SyncReport {
  inserted: number;
  updated: number;
  review: number;
  errors: number;
  messages: string[];
}