import { ImportReader } from "./reader";
import { NaccaBookRecord } from "../types";

export class CsvReader implements ImportReader {
  constructor(
    private readonly filePath: string,
  ) {}

  async read(): Promise<NaccaBookRecord[]> {
    throw new Error(
      `CSV reader not yet implemented: ${this.filePath}`,
    );
  }
}