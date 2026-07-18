import { ImportReader } from "./reader";
import { NaccaBookRecord } from "../types";

export class NaccaReader implements ImportReader {
  constructor(
    private readonly source: string,
  ) {}

  async read(): Promise<NaccaBookRecord[]> {
    throw new Error(
      `NaCCA reader not yet implemented: ${this.source}`,
    );
  }
}