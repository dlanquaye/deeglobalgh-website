import { prisma } from "@/lib/prisma";

import { AuthorCache } from "./AuthorCache";
import { BookCache } from "./BookCache";
import { BookLineCache } from "./BookLineCache";
import { CurriculumCache } from "./CurriculumCache";
import { LanguageCache } from "./LanguageCache";
import { LevelCache } from "./LevelCache";
import { PublisherCache } from "./PublisherCache";
import { ResourceTypeCache } from "./ResourceTypeCache";
import { SubjectCache } from "./SubjectCache";

export class EducationalCache {
  readonly publishers = new PublisherCache();

  readonly subjects = new SubjectCache();

  readonly levels = new LevelCache();

  readonly languages = new LanguageCache();

  readonly curricula = new CurriculumCache();

  readonly resourceTypes = new ResourceTypeCache();

  readonly bookLines = new BookLineCache(
    prisma,
  );

  readonly authors = new AuthorCache(
    prisma,
  );

  readonly books = new BookCache(
    prisma,
  );

  async load(): Promise<void> {
    await Promise.all([
      this.publishers.load(),
      this.subjects.load(),
      this.levels.load(),
      this.languages.load(),
      this.curricula.load(),
      this.resourceTypes.load(),
      this.bookLines.load(),
      this.authors.load(),
      this.books.load(),
    ]);
  }

  getStats() {
    return {
      publishers: this.publishers.getStats(),
      subjects: this.subjects.getStats(),
      levels: this.levels.getStats(),
      languages: this.languages.getStats(),
      curricula: this.curricula.getStats(),
      resourceTypes:
        this.resourceTypes.getStats(),
      bookLines: this.bookLines.getStats(),
      authors: this.authors.getStats(),
      books: this.books.getStats(),
    };
  }
}