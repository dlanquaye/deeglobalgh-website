import { PublisherCache } from "./PublisherCache";

export class EducationalCache {
  readonly publishers = new PublisherCache();

  async load(): Promise<void> {
    await Promise.all([
      this.publishers.load(),
    ]);
  }

  getStats() {
    return {
      publishers: this.publishers.getStats(),
    };
  }
}