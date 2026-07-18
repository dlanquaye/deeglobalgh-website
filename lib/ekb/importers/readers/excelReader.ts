import { ImportReader } from "./reader";
import { NaccaBookRecord } from "../types";

export class ExcelReader implements ImportReader {
  constructor(
    private readonly filePath: string,
  ) {}

  async read(): Promise<NaccaBookRecord[]> {
    throw new Error(
      `Excel reader not yet implemented: ${this.filePath}`,
    );
  }
}