export interface ReferenceRecord {
  id: string;
  name: string;
}

export interface ReferenceAlias {
  alias: string;
  targetId: string;
}

export class ReferenceCache {
  private records = new Map<string, string>();
  private aliases = new Map<string, string>();

  private normalise(value: string): string {
    return value.trim().toLowerCase();
  }

  clear(): void {
    this.records.clear();
    this.aliases.clear();
  }

  loadRecords(records: ReferenceRecord[]): void {
    this.records.clear();

    for (const record of records) {
      this.records.set(
        this.normalise(record.name),
        record.id,
      );
    }
  }

  loadAliases(aliases: ReferenceAlias[]): void {
    this.aliases.clear();

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
}