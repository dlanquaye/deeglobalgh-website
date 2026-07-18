import { PUBLISHERS } from "../core/publishers";
import { Publisher } from "../types";
import { findByAliases } from "./findByAliases";

export function findPublisher(text: string): Publisher | undefined {
  return findByAliases(text, PUBLISHERS);
}