import { BOOK_LINES } from "../catalogue/bookLines";
import { BookLine } from "../types";
import { findByAliases } from "./findByAliases";

export function findBookLine(text: string): BookLine | undefined {
  return findByAliases(text, BOOK_LINES);
}