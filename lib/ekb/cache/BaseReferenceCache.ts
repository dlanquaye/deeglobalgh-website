export interface CacheRecord {
  id: string;
  name: string;
}

export interface CacheAlias {
  alias: string;
  targetId: string;
}

export abstract class BaseReferenceCache {
  protected records = new Map<string, string>();

  protected aliases = new Map<string, string>();

  protected normalise(value: string): string {
    return value.trim().toLowerCase();
  }

  protected clear(): void {
    this.records.clear();
    this.aliases.clear();
  }

  protected loadRecords(records: CacheRecord[]): void {
    for (const record of records) {
      this.records.set(
        this.normalise(record.name),
        record.id,
      );
    }
  }

  protected loadAliases(aliases: CacheAlias[]): void {
    for (const alias of aliases) {
      this.aliases.set(
        this.normalise(alias.alias),
        alias.targetId,
      );
    }
  }

  find(name: string): string | undefined {
    const key = this.normalise(name);

    return (
      this.records.get(key) ??
      this.aliases.get(key)
    );
  }

  getStats() {
    return {
      records: this.records.size,
      aliases: this.aliases.size,
    };
  }

  abstract load(): Promise<void>;
}