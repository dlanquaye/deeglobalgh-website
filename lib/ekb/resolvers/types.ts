export enum ReferenceMatchMethod {
  EXACT = "EXACT",
  ALIAS = "ALIAS",
  NONE = "NONE",
}

export interface ReferenceResolution {
  id?: string;

  input: string;

  matched: boolean;

  confidence: number;

  method: ReferenceMatchMethod;
}