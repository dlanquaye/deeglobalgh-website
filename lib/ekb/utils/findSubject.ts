import { SUBJECTS } from "../core/subjects";
import { Subject } from "../types";
import { findByAliases } from "./findByAliases";

export function findSubject(text: string): Subject | undefined {
  return findByAliases(text, SUBJECTS);
}