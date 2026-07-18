import { LEVELS } from "../core/levels";
import { Level } from "../types";
import { findByAliases } from "./findByAliases";

export function findLevel(text: string): Level | undefined {
  return findByAliases(text, LEVELS);
}