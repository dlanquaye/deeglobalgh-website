import { ImportReader } from "./reader";
import { NaccaBookRecord } from "../types";

export class JsonReader implements ImportReader {
  constructor(
    private readonly data: NaccaBookRecord[],
  ) {}

  async read(): Promise<NaccaBookRecord[]> {
    return this.data;
  }
}