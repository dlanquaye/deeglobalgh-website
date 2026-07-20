/**
 * ============================================================
 * Educational Knowledge Base (EKB)
 * Educational Source Registry
 * ============================================================
 */

import {
  EducationalSource,
  SourceDocument,
} from "./Source";

export class SourceRegistry {
  private readonly sources =
    new Map<
      string,
      EducationalSource
    >();

  register(
    authority: string,
    source: EducationalSource,
  ): void {
    const normalisedAuthority =
      this.normaliseAuthority(
        authority,
      );

    if (
      this.sources.has(
        normalisedAuthority,
      )
    ) {
      throw new Error(
        `Educational source already registered: ${authority}`,
      );
    }

    this.sources.set(
      normalisedAuthority,
      source,
    );
  }

  replace(
    authority: string,
    source: EducationalSource,
  ): void {
    const normalisedAuthority =
      this.normaliseAuthority(
        authority,
      );

    this.sources.set(
      normalisedAuthority,
      source,
    );
  }

  get(
    authority: string,
  ): EducationalSource {
    const normalisedAuthority =
      this.normaliseAuthority(
        authority,
      );

    const source =
      this.sources.get(
        normalisedAuthority,
      );

    if (!source) {
      throw new Error(
        `Educational source is not registered: ${authority}`,
      );
    }

    return source;
  }

  has(
    authority: string,
  ): boolean {
    const normalisedAuthority =
      this.normaliseAuthority(
        authority,
      );

    return this.sources.has(
      normalisedAuthority,
    );
  }

  listAuthorities(): string[] {
    return [
      ...this.sources.keys(),
    ].sort();
  }

  async fetchLatest(
    authority: string,
  ): Promise<SourceDocument> {
    const source =
      this.get(authority);

    return source.fetchLatest();
  }

  private normaliseAuthority(
    authority: string,
  ): string {
    const normalisedAuthority =
      authority
        .trim()
        .toLowerCase();

    if (!normalisedAuthority) {
      throw new Error(
        "Educational source authority is required.",
      );
    }

    return normalisedAuthority;
  }
}